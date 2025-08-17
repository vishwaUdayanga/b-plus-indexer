import os
import sys
import requests
from dotenv import load_dotenv
from schemas import WorkLoadSimulatorRequest, LoginRequest, LoginResponse

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

def execute_query(sql_query: str):
    access_token = get_access_token()
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.post(
        f"{END_POINT}/workload-simulation",
        json=WorkLoadSimulatorRequest(sql_query=sql_query).model_dump(),
        headers=headers
    )
    response.raise_for_status()
    print(f"Query executed successfully")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("sql_query argument is missing")
        sys.exit(1)
    execute_query(sys.argv[1])