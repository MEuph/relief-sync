from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import mysql.connector
from datetime import datetime

donate_router = APIRouter()

class AuthRequest(BaseModel):
    username: str
    password: str

class DonationRequest(BaseModel):
    username: str
    password: str
    supplier_id: int
    resource_id: int
    supply_amount: int

@donate_router.post("/get-needed-resources")
def get_needed_resources(req: AuthRequest):
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user=req.username,
            password=req.password,
            database="relief_sync"
        )
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT resource_id, resource_type, amount_remaining
            FROM rs_resource
            WHERE amount_remaining < 500
        """)
        resources = cursor.fetchall()
        cursor.close()
        conn.close()
        return resources
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))

@donate_router.post("/submit-donation")
def submit_donation(req: DonationRequest):
    try:
        now = datetime.now().isoformat()
        conn = mysql.connector.connect(
            host="localhost",
            user=req.username,
            password=req.password,
            database="relief_sync"
        )
        cursor = conn.cursor()

        # Insert donation into supplies
        cursor.execute("""
            INSERT INTO supplies (supplier_id, resource_id, supply_date, supply_amount)
            VALUES (%s, %s, %s, %s)
        """, (req.supplier_id, req.resource_id, now, req.supply_amount))

        # Update resource table
        cursor.execute("""
            UPDATE rs_resource
            SET amount_remaining = amount_remaining + %s
            WHERE resource_id = %s
        """, (req.supply_amount, req.resource_id))

        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "Donation submitted."}
    except mysql.connector.Error as err:
        print(f'error: {err}')
        raise HTTPException(status_code=500, detail=str(err))

@donate_router.post("/get-donation-history")
def get_donation_history(req: DonationRequest):
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user=req.username,
            password=req.password,
            database="relief_sync"
        )
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT s.resource_id, r.resource_type, s.supply_date, s.supply_amount
            FROM supplies s
            JOIN rs_resource r ON s.resource_id = r.resource_id
            WHERE s.supplier_id = %s
            ORDER BY s.supply_date DESC
        """, (req.supplier_id,))
        history = cursor.fetchall()
        cursor.close()
        conn.close()
        return history
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
