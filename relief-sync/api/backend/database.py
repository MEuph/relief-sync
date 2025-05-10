from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import mysql.connector

db_router = APIRouter()

class DBInfo(BaseModel):
    username: str
    password: str

class QueryRequest(DBInfo):
    query: str

@db_router.post("/connect")
async def connect_db(creds: DBInfo):
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user=creds.username,
            password=creds.password,
            database="relief_sync"
        )
        if conn.is_connected():
            return {"message": "Connection successful!"}
    except Exception as e:
        return {"message": f"Connection failed: {e}"}


@db_router.post("/query")
async def run_query(data: QueryRequest):
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user=data.username,
            password=data.password,
            database='relief_sync'
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
    except Exception as e:
        return {"error": str(e)}

class AddUserRequest(BaseModel):
    username: str           # admin's login
    password: str           # admin's password
    new_user: dict          # {username, password, role}

@db_router.post("/add-user")
def add_user(req: AddUserRequest):
    new_user = req.new_user
    new_user_sql = new_user['username']
    new_user_pw = new_user['password']
    role = new_user['role']
    
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user=req.username,
            password=req.password
        )
        cursor = conn.cursor()

        cursor.execute(f"CREATE USER IF NOT EXISTS '{new_user_sql}'@'%' IDENTIFIED BY %s;", (new_user_pw,))

        # Role-based grants
        if role == "Administrator":
            cursor.execute(f"GRANT ALL PRIVILEGES ON *.* TO '{new_user_sql}'@'%' WITH GRANT OPTION;")
        elif role == "Inventory Manager":
            cursor.execute(f"GRANT SELECT, INSERT, UPDATE, DELETE ON *.* TO '{new_user_sql}'@'%';")
        elif role == "Field Coordinator":
            cursor.execute(f"GRANT SELECT, INSERT, UPDATE ON *.* TO '{new_user_sql}'@'%';")
        elif role == "Donor or Supplier":
            cursor.execute(f"GRANT SELECT, INSERT, UPDATE ON *.* TO '{new_user_sql}'@'%';")
        elif role == "Government or NGO":
            cursor.execute(f"GRANT SELECT ON *.* TO '{new_user_sql}'@'%';")
        else:
            raise HTTPException(status_code=400, detail="Invalid role provided")

        cursor.execute("FLUSH PRIVILEGES;")
        conn.commit()
        cursor.close()
        conn.close()

        return {
            "success": True,
            "message": f"MySQL user '{new_user_sql}' created with role '{role}'."
        }

    except mysql.connector.Error as err:
        print(err)
        raise HTTPException(status_code=500, detail=f"MySQL error: {str(err)}")