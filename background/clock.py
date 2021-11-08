import html
import json
import lib.etsy
import lib.shopify
import lib.sumologic
from lib.postgresql import get_connection
from apscheduler.schedulers.blocking import BlockingScheduler

sched = BlockingScheduler()


def upload():
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, name, next_product_id, homepages, latitude, longitude, upload_settings FROM businesses"
            )
            for record in cursor:
                business_id = record["id"]
                business_name = record["name"]
                next_product_id = record["next_product_id"]
                latitude = record["latitude"]
                longitude = record["longitude"]
                upload_settings = json.loads(html.unescape(record["upload_settings"]))
                homepages = json.loads(html.unescape(record["homepages"]))

                if "shopifyHomepage" in homepages and homepages["shopifyHomepage"]:
                    if "shopify" in upload_settings:
                        upload_settings = upload_settings["shopify"]
                    else:
                        upload_settings = {}
                    if "includeTags" not in upload_settings:
                        upload_settings["includeTags"] = []
                    if "excludeTags" not in upload_settings:
                        upload_settings["excludeTags"] = []
                    if "departmentMapping" not in upload_settings:
                        upload_settings["departmentMapping"] = []

                    try:
                        lib.shopify.upload(
                            business_id,
                            next_product_id,
                            homepages["shopifyHomepage"],
                            latitude,
                            longitude,
                            business_name,
                            upload_settings,
                        )
                        raise Exception("WTF ERROR TERRIBLE")
                    except Exception as e:
                        lib.sumologic.post(
                            "error", str(e), "Shopify", {"name": business_name}
                        )

                elif "etsyHomepage" in homepages and homepages["etsyHomepage"]:
                    if "etsy" in upload_settings:
                        upload_settings = upload_settings["etsy"]
                    else:
                        upload_settings = {}
                    if "includeTags" not in upload_settings:
                        upload_settings["includeTags"] = []
                    if "excludeTags" not in upload_settings:
                        upload_settings["excludeTags"] = []
                    if "departmentMapping" not in upload_settings:
                        upload_settings["departmentMapping"] = []

                    try:
                        lib.etsy.upload(
                            business_id,
                            next_product_id,
                            homepages["etsyHomepage"],
                            latitude,
                            longitude,
                            business_name,
                            upload_settings,
                        )
                    except Exception as e:
                        lib.sumologic.post(
                            "error", str(e), "Etsy", {"name": business_name}
                        )


@sched.scheduled_job("cron", day_of_week="mon", hour=20)
def scheduled_job():
    print("Starting upload process...")
    upload()


sched.start()
