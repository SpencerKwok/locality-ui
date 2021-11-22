import cloudinary.api
import cloudinary.uploader
import html
import json
import random
import requests
import time
import os
import re
from lib.postgresql import get_connection
from lib.algoliasearch import get_index
from typing import Any


def upload(
    business_id: int,
    next_product_id: int,
    homepage: str,
    latitude: str,
    longitude: str,
    business_name: str,
    upload_settings: dict[str, Any],
):
    print(f"Etsy upload from {homepage}")
    print("Deleting old products...")

    index = get_index()
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id FROM products WHERE business_id=(%s)", (str(business_id),)
            )
            oldProductIds = [f"{business_id}_{x['id']}" for x in cursor.fetchall()]

            print("Removing from Algolia...")
            index.delete_objects(oldProductIds)

            print("Removing from Cloudinary...")
            cloudinary.api.delete_resources_by_prefix(f"{business_id}/")

            print("Removing from Postgres...")
            cursor.execute(
                "DELETE FROM products WHERE business_id=(%s)", (str(business_id),)
            )

    print("Retrieve new products...")
    include_tags = [
        html.unescape(x).lower().strip() for x in upload_settings["includeTags"]
    ]
    exclude_tags = [
        html.unescape(x).lower().strip() for x in upload_settings["excludeTags"]
    ]

    latitudes = [float(x.strip()) for x in latitude.split(",")]
    longitudes = [float(x.strip()) for x in longitude.split(",")]
    geolocation = [{"lat": x[0], "lng": x[1]} for x in zip(latitudes, longitudes)]

    homepageSections = homepage.split("/")
    shopId = homepageSections[-1]

    page = 1
    products = []
    done = False
    while not done:
        # Throttle requests to at most 20 per minute
        time.sleep(random.uniform(3.0, 5.0))

        r = requests.get(
            f"https://openapi.etsy.com/v2/shops/{shopId}/listings/active",
            {"api_key": os.environ["ETSY_API_KEY"], "page": page},
        )
        if r.status_code != 200:
            print(f"Failed to retrieve page {page}")
            done = True
            continue

        data_1 = json.loads(r.content)
        raw_products = data_1["results"]
        if len(raw_products) == 0:
            done = True
            continue

        for product_listing in raw_products:
            should_include = True
            should_exclude = False
            product_tags = list(
                filter(
                    None,
                    [html.unescape(x).lower().strip() for x in product_listing["tags"]],
                )
            )
            if len(include_tags) > 0:
                should_include = (
                    len([tag for tag in product_tags if tag in include_tags]) > 0
                )
            if len(exclude_tags) > 0:
                should_exclude = (
                    len([tag for tag in product_tags if tag in exclude_tags]) > 0
                )
            if should_exclude or not should_include:
                continue

            r = requests.get(
                f"http://openapi.etsy.com/v2/listings/{product_listing['listing_id']}",
                {
                    "api_key": os.environ["ETSY_API_KEY"],
                    "includes": "MainImage,Variations",
                },
            )
            data_2 = json.loads(r.content)

            product = data_2["results"][0]
            product_name = html.unescape(product["title"].strip())
            product_description = html.unescape(
                html.unescape(
                    re.sub(r"\s+", " ", re.sub(r"<[^>]*>", " ", product["description"]))
                ).strip()
            )
            product_departments = list(
                filter(
                    None,
                    map(lambda x: html.unescape(x.strip()), product["taxonomy_path"]),
                )
            )
            product_link = product["url"].strip()
            product_price = float(product["price"])
            product_price_range = [product_price, product_price]
            product_variant_tags = [
                html.unescape(y["formatted_value"].strip())
                for x in product["Variations"]
                for y in x["options"]
            ]
            if len(product_variant_tags) == 0:
                product_variant_tags = [""]
            if product["MainImage"]["url_570xN"]:
                product_variant_images = [product["MainImage"]["url_570xN"]] * len(
                    product_variant_tags
                )
            else:
                product_variant_images = [product["MainImage"]["url_fullxfull"]] * len(
                    product_variant_tags
                )

            r = requests.get(
                f"http://openapi.etsy.com/v2/listings/{product_listing['listing_id']}/inventory",
                {"api_key": os.environ["ETSY_API_KEY"]},
            )
            if r.status_code != 200:
                print(f"Failed to retrieve page {page}")
                done = True
                continue

            data_3 = json.loads(r.content)

            variant_prices = [
                y["price"]
                for x in data_3["results"]["products"]
                for y in x["offerings"]
            ]
            for variant_price in variant_prices:
                before_conversion = variant_price["before_conversion"]
                currency_formatted_raw = variant_price["currency_formatted_raw"]
                original_currency_code = variant_price["original_currency_code"]
                if original_currency_code == "USD":
                    product_price_range[0] = min(
                        product_price_range[0], float(currency_formatted_raw)
                    )
                    product_price_range[1] = max(
                        product_price_range[1], float(currency_formatted_raw)
                    )
                else:
                    currency_formatted_raw = before_conversion["currency_formatted_raw"]
                    product_price_range[0] = min(
                        product_price_range[0], float(currency_formatted_raw)
                    )
                    product_price_range[1] = max(
                        product_price_range[1], float(currency_formatted_raw)
                    )

            products.append(
                {
                    "departments": product_departments,
                    "description": product_description,
                    "id": str(next_product_id),
                    "geolocation": geolocation,
                    "link": product_link,
                    "name": product_name,
                    "price_range": product_price_range,
                    "tags": product_tags,
                    "variant_images": product_variant_images,
                    "variant_tags": product_variant_tags,
                }
            )

            next_product_id += 1
        print(f"Successfully retrieved page {page}")
        page += 1

    print("Done fetching new products!")
    print("Uploading products...")

    with get_connection() as conn:
        with conn.cursor() as cursor:
            for product in products:
                # Throttle requests to at most 20 per minute
                time.sleep(random.uniform(3.0, 5.0))

                variant_images = []
                variant_map = {}
                for i, variant_image in enumerate(product["variant_images"]):
                    if variant_image in variant_map:
                        variant_images.append(variant_map[variant_image])
                        continue

                    url_data = cloudinary.uploader.upload(
                        variant_image,
                        format="webp",
                        public_id=f"{business_id}/{product['id']}/{i}",
                        unique_filename=False,
                        overwrite=True,
                        exif=False,
                    )

                    variant_images.append(url_data["secure_url"])
                    variant_map[variant_image] = url_data["secure_url"]

                cursor.execute(
                    "INSERT INTO products (business_id, id, name, preview) VALUES (%s, %s, %s, %s)",
                    (
                        str(business_id),
                        product["id"],
                        product["name"],
                        variant_images[0],
                    ),
                )

                index.save_object(
                    {
                        "objectID": f"{business_id}_{product['id']}",
                        "_geoloc": geolocation,
                        "name": product["name"],
                        "business": html.unescape(business_name),
                        "description": html.unescape(product["description"]),
                        "description_length": len(
                            html.unescape(product["description"]).replace(
                                r"/\s+/gs", ""
                            )
                        ),
                        "departments": product["departments"],
                        "link": product["link"],
                        "price_range": product["price_range"],
                        "tags": product["tags"],
                        "tags_length": len(
                            html.unescape("".join(product["tags"])).replace(
                                r"/s+/gs", ""
                            )
                        ),
                        "variant_images": variant_images,
                        "variant_tags": list(
                            map(lambda x: html.unescape(x), product["variant_tags"])
                        ),
                    },
                    {"autoGenerateObjectIDIfNotExist": False},
                )

                print(f"Successfully uploaded product: {product['name']}")

            cursor.execute(
                "UPDATE businesses SET next_product_id=(%s) WHERE id=(%s)",
                (str(next_product_id), str(business_id)),
            )

    print(f"Finished uploading products from {homepage}")
