import html
import json
import lib.shopify
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

                if homepages["shopifyHomepage"]:
                    lib.shopify.upload(
                        business_id,
                        next_product_id,
                        homepages["shopifyHomepage"],
                        latitude,
                        longitude,
                        business_name,
                        upload_settings["shopify"],
                    )

@sched.scheduled_job('cron', day_of_week='mon', hour=20)
def scheduled_job():
    print("Starting upload process...")
    upload()

sched.start()
