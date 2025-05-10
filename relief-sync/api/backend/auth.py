from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import mysql.connector

auth_router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@auth_router.post("/login")
def login(req: LoginRequest):
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user=req.username,
            password=req.password,
            database="relief_sync"
        )
        cursor = conn.cursor()
        cursor.execute(f"SHOW GRANTS FOR '{req.username}'@'%'")
        grants = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()

        role = determine_role(grants)

        if role == "Unknown":
            raise HTTPException(status_code=403, detail="Unable to determine role")

        return {
            "success": True,
            "role": role,
            "message": f"Login successful — detected role: {role}"
        }

    except mysql.connector.Error as err:
        print(err)
        raise HTTPException(status_code=401, detail=f"Login failed: {str(err)}")
    

def determine_role(grants: list[str]) -> str:
    joined = " ".join(grants).upper()

    if "ALL PRIVILEGES" in joined:
        return "Administrator"
    elif "INSERT" in joined and "UPDATE" in joined and "DELETE" in joined:
        return "Inventory Manager"
    elif "INSERT" in joined and "UPDATE" in joined and "DELETE" not in joined:
        return "Field Coordinator"
    elif "INSERT" in joined and "UPDATE" not in joined:
        return "Donor or Supplier"
    elif "SELECT" in joined and "INSERT" not in joined:
        return "Government or NGO"
    else:
        return "Unknown"