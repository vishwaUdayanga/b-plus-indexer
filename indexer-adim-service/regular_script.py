import os
import requests
from dotenv import load_dotenv
from schemas import LoginRequest, LoginResponse, ADIMScheduleResponse

load_dotenv()

END_POINT = os.getenv("END_POINT")
USER_NAME = os.getenv("USER_NAME")
PASSWORD = os.getenv("PASSWORD")

def get_access_token() -> str:
    response = requests.post(
        f"{END_POINT}/dba/login",
        json=LoginRequest(username=USER_NAME, password=PASSWORD).model_dump()
    )
    response.raise_for_status()
    return LoginResponse(**response.json()).access_token


def schedule_cron_jobs():
    access_token = get_access_token()
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{END_POINT}/adim/schedules", headers=headers)
    response.raise_for_status()

    schedules = ADIMScheduleResponse(**response.json()).schedules
    cron_lines = []

    for schedule in schedules:
        dt = schedule.next_execution_time
        minute = dt.minute
        hour = dt.hour
        day = dt.day
        month = dt.month
        command = f"/app/run_and_clean.sh {schedule.tc_query_id}"
        cron_line = f"{minute} {hour} {day} {month} * root {command}\n"
        cron_lines.append(cron_line)

    cron_file = "/etc/cron.d/adim_dynamic_jobs"
    with open(cron_file, "w") as f:
        f.writelines(cron_lines)

    os.chmod(cron_file, 0o644)


if __name__ == "__main__":
    schedule_cron_jobs()
