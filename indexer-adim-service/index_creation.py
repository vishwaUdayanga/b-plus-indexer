import os
import sys
import requests
from dotenv import load_dotenv
from schemas import LoginRequest, LoginResponse, CreateIndexRequest

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


def create_index(tc_query_id: int):
    access_token = get_access_token()
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.post(
        f"{END_POINT}/adim/create_index",
        json=CreateIndexRequest(tc_query_id=tc_query_id).model_dump(),
        headers=headers
    )
    response.raise_for_status()
    print(f"Index creation triggered for query ID {tc_query_id}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("tc_query_id argument is missing")
        sys.exit(1)
    create_index(int(sys.argv[1]))
