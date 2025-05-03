from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
from mysql.connector import Error

app = FastAPI()

origins = ["http://localhost:3000"]  # Adjust to your frontend origin

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DBInfo(BaseModel):
    username: str
    password: str
    host: str
    database: str

class QueryRequest(DBInfo):
    query: str

@app.post("/connect")
async def connect_db(creds: DBInfo):
    try:
        conn = mysql.connector.connect(
            host=creds.host,
            user=creds.username,
            password=creds.password,
            database=creds.database
        )
        if conn.is_connected():
            conn.close()
            return {"message": "Connection successful!"}
    except Error as e:
        return {"message": f"Connection failed: {e}"}


@app.post("/query")
async def run_query(data: QueryRequest):
    try:
        conn = mysql.connector.connect(
            host=data.host,
            user=data.username,
            password=data.password,
            database=data.database
        )
        cursor = conn.cursor(dictionary=True)
        cursor.execute(data.query)

        if data.query.strip().lower().startswith("select"):
            result = cursor.fetchall()
        else:
            conn.commit()
            result = {"rows_affected": cursor.rowcount}

        cursor.close()
        conn.close()
        return {"result": result}
    except Error as e:
        return {"error": str(e)}
