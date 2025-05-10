from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import mysql.connector
from datetime import datetime

monitor_router = APIRouter()

class AuthRequest(BaseModel):
    username: str
    password: str

@monitor_router.post("/monitor/inventory")
def get_inventory(req: AuthRequest):
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user=req.username,
            password=req.password,
            database="relief_sync"
        )
        cursor = conn.cursor()
        cursor.execute("""
            SELECT r.resource_id, r.resource_type, r.amount_remaining,
                   r.expiration_date, ST_X(w.location), ST_Y(w.location)
            FROM rs_resource r
            JOIN warehouse w ON r.warehouse_id = w.warehouse_id
        """)
        rows = cursor.fetchall()
        result = []
        for row in rows:
            result.append({
                "resource_id": row[0],
                "resource_type": row[1],
                "amount_remaining": row[2],
                "expiration_date": row[3].strftime("%Y-%m-%d") if row[3] else None,
                "latitude": row[4],
                "longitude": row[5],
            })
        cursor.close()
        conn.close()
        return result
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))


@monitor_router.post("/monitor/aid-distribution")
def get_distribution(req: AuthRequest):
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user=req.username,
            password=req.password,
            database="relief_sync"
        )
        cursor = conn.cursor()
        cursor.execute("""
            SELECT d.volunteer_id, d.shelter_id, d.resource_type,
                   d.resource_amount, d.date_and_time
            FROM distributes_to d
        """)
        rows = cursor.fetchall()
        result = []
        for row in rows:
            result.append({
                "volunteer_id": row[0],
                "shelter_id": row[1],
                "resource_type": row[2],
                "resource_amount": row[3],
                "date_and_time": row[4] if isinstance(row[4], str) else str(row[4]),
            })
        cursor.close()
        conn.close()
        return result
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
