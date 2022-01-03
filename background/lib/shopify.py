import cloudinary.api
import cloudinary.uploader
import html
import json
import random
import re
import requests
import time
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
    print(f"Shopify upload from {homepage}")
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
    department_mappings = {
        html.unescape(x["key"])
        .lower()
        .strip(): map(lambda x: x.lower().strip(), html.unescape(x["departments"]))
        for x in upload_settings["departmentMapping"]
    }

    latitudes = [float(x.strip()) for x in latitude.split(",")]
    longitudes = [float(x.strip()) for x in longitude.split(",")]
    geolocation = [{"lat": x[0], "lng": x[1]} for x in zip(latitudes, longitudes)]

    page = 1
    products = []
    done = False
    while not done:
        # Throttle requests to at most 12 per minute
        time.sleep(random.uniform(5.0, 15.0))

        r = requests.get(
            re.sub(r"(?<!https:)//+", "/", f"{homepage}/collections/all/products.json"),
            {"page": page},
        )
        if r.status_code != 200:
            print(f"Failed to retrieve page {page}")
            done = True
            continue

        data = json.loads(r.content)
        raw_products = data["products"]
        if len(raw_products) == 0:
            done = True
            continue

        for product in raw_products:
            should_include = True
            should_exclude = False
            tags = [html.unescape(x).lower().strip() for x in product["tags"]]
            if len(include_tags) > 0:
                should_include = len([tag for tag in tags if tag in include_tags]) > 0
            if len(exclude_tags) > 0:
                should_exclude = len([tag for tag in tags if tag in exclude_tags]) > 0
            if should_exclude or not should_include:
                continue

            if len(product["images"]) == 0 or len(product["variants"]) == 0:
                continue

            product_types = list(
                map(
                    lambda x: html.escape(x.lower().strip()),
                    product["product_type"].split(","),
                )
            )
            product_name = html.unescape(product["title"].strip())
            product_departments = [
                x
                for y in [
                    department_mappings[x]
                    for x in product_types
                    if x in department_mappings
                ]
                for x in y
            ]
            product_tags = [*[html.unescape(x) for x in product_types], *tags]
            product_description = html.unescape(
                re.sub(r"\s+", " ", re.sub(r"<[^>]*>", " ", product["body_html"] or ""))
            ).strip()
            product_link = re.sub(
                r"(?<!https:)//+", "/", f"{homepage}/products/{product['handle']}"
            )
            product_price = float(product["variants"][0]["price"])
            product_price_range = [product_price, product_price]
            for variant in product["variants"]:
                variant_price = float(variant["price"])
                product_price_range[0] = min(product_price_range[0], variant_price)
                product_price_range[1] = max(product_price_range[1], variant_price)
            product_variant_images = [
                product["images"][0]["src"].replace(".jpg", "_400x.jpg")
            ] * len(product["variants"])
            product_variant_tags = [
                html.unescape(x["title"]).lower().strip() for x in product["variants"]
            ]
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
