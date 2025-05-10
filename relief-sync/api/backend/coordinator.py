from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import mysql.connector
from datetime import datetime

coordinator_router = APIRouter()

class AuthRequest(BaseModel):
    username: str
    password: str

class ResourceRequest(BaseModel):
    username: str
    password: str
    volunteer_id: int
    resource_id: int
    request_datetime: str
    request_amount: int

@coordinator_router.post("/get-pending-deliveries")
def get_pending_deliveries(req: AuthRequest):
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user=req.username,
            password=req.password,
            database="relief_sync"
        )
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT d.drone_id, d.delivery_location, d.delivery_time, r.resource_type
            FROM delivers_to d
            JOIN rs_resource r ON d.drone_id = r.resource_id
        """)
        deliveries = cursor.fetchall()
        cursor.close()
        conn.close()
        return deliveries
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))


@coordinator_router.post("/submit-resource-request")
def submit_request(req: ResourceRequest):
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user=req.username,
            password=req.password,
            database="relief_sync"
        )
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO requests (volunteer_id, resource_id, request_datetime, request_amount)
            VALUES (%s, %s, %s, %s)
        """, (req.volunteer_id, req.resource_id, req.request_datetime, req.request_amount))
        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "Request submitted."}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))


@coordinator_router.post("/get-distribution-metrics")
def get_distribution_metrics(req: AuthRequest):
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user=req.username,
            password=req.password,
            database="relief_sync"
        )
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT resource_type, COUNT(*) as deliveries
            FROM distributes_to
            GROUP BY resource_type
        """)
        metrics = cursor.fetchall()
        cursor.close()
        conn.close()
        return metrics
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
