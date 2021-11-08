import json
import os
from datetime import datetime
from sumologic import SumoLogic

sumo = SumoLogic(os.environ["SUMOLOGIC_ACCESS_ID"], os.environ["SUMOLOGIC_ACCESS_KEY"], endpoint=os.environ["SUMOLOGIC_URL"])
def post(level: str, message: str, method: str = None, params: dict[str, str] = None):
    sumo.post("", { 
        "date": datetime.now().strftime("%m/%d/%Y, %H:%M:%S"),
        "level": level,
        "message": message,
        "method": method,
        "params": params
    })
