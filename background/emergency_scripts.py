import os
from lib.postgresql import get_connection
from lib.algoliasearch import get_index

"""
RESTORES PRODUCTS FOR A BUSINESS USING ALGOLIA SEARCH INDEX
"""

"""
SET ENV VARIABLES BEFORE EXECUTING THE SCRIPT
"""
os.environ["ALGOLIASEARCH_API_KEY"] = ""
os.environ["ALGOLIASEARCH_API_KEY_SEARCH"] = ""
os.environ["ALGOLIASEARCH_APPLICATION_ID"] = ""
os.environ["ALGOLIASEARCH_INDEX"] = ""
os.environ["DATABASE_URL"] = ""


def restore_products(business_id: int, low_id: int):
    index = get_index()
    with get_connection() as conn:
        with conn.cursor() as cursor:
            product_ids = [f"{business_id}_{x}" for x in range(low_id, low_id + 1000)]
            products = index.get_objects(product_ids)
            for product in filter(None, products["results"]):
                id = product["objectID"].split("_")[1]
                try:
                    cursor.execute(
                        "INSERT INTO products (id, name, business_id, preview) VALUES (%s, %s, %s, %s)",
                        [
                            id,
                            product["name"],
                            str(business_id),
                            product["variant_images"][0],
                        ],
                    )
                except:
                    print("")
