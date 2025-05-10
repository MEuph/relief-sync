from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import mysql.connector
import re

inventory_router = APIRouter()

class GetInventoryRequest(BaseModel):
    username: str
    password: str

class DeleteResourceRequest(BaseModel):
    username: str
    password: str
    resource_id: int

class AddResourceRequest(BaseModel):
    username: str
    password: str
    type: str
    amount: int
    resource_id: int
    warehouse_id: int
    food_type: str | None = None
    medicine_type: str | None = None

@inventory_router.post("/add-resource")
def add_resource(req: AddResourceRequest):
    if req.amount < 1 or req.amount > 1000:
        raise HTTPException(status_code=400, detail="Amount must be between 1 and 1000.")

    try:
        conn = mysql.connector.connect(
            host="localhost",
            user=req.username,
            password=req.password,
            database="relief_sync"
        )
        cursor = conn.cursor()

        # Confirm warehouse exists
        cursor.execute("SELECT 1 FROM warehouse WHERE warehouse_id = %s", (req.warehouse_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=400, detail="Warehouse ID does not exist.")

        # Insert resource with appropriate subfields
        if req.type == "Food":
            cursor.execute(
                "INSERT INTO rs_resource (resource_id, resource_type, amount_remaining, warehouse_id, food_type) VALUES (%s, %s, %s, %s, %s)",
                (req.resource_id, req.type, req.amount, req.warehouse_id, req.food_type)
            )
            cursor.execute(
                "INSERT INTO stored_in (resource_id, warehouse_id) VALUES (%s, %s)",
                (req.resource_id, req.warehouse_id)
            )
        elif req.type == "Medicine":
            cursor.execute(
                "INSERT INTO rs_resource (resource_id, resource_type, amount_remaining, warehouse_id, medicine_type) VALUES (%s, %s, %s, %s, %s)",
                (req.resource_id, req.type, req.amount, req.warehouse_id, req.medicine_type)
            )
            cursor.execute(
                "INSERT INTO stored_in (resource_id, warehouse_id) VALUES (%s, %s)",
                (req.resource_id, req.warehouse_id)
            )
        else:
            cursor.execute(
                "INSERT INTO rs_resource (resource_id, resource_type, amount_remaining, warehouse_id) VALUES (%s, %s, %s, %s)",
                (req.resource_id, req.type, req.amount, req.warehouse_id)
            )
            cursor.execute(
                "INSERT INTO stored_in (resource_id, warehouse_id) VALUES (%s, %s)",
                (req.resource_id, req.warehouse_id)
            )

        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "Resource added successfully."}

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))

@inventory_router.post("/get-warehouses")
def get_warehouses(req: GetInventoryRequest):
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user=req.username,
            password=req.password,
            database="relief_sync"
        )
        cursor = conn.cursor()
        cursor.execute("""
            SELECT warehouse_id, capacity, ST_X(location) AS lat, ST_Y(location) AS lng
            FROM warehouse
        """)
        result = [
            {
                "warehouse_id": row[0],
                "capacity": row[1],
                "lat": row[2],
                "lng": row[3]
            }
            for row in cursor.fetchall()
        ]
        cursor.close()
        conn.close()
        return result
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))

@inventory_router.post("/get-inventory")
def get_inventory(req: GetInventoryRequest):
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user=req.username,
            password=req.password,
            database="relief_sync"
        )
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                r.resource_id,
                r.resource_type,
                r.amount_remaining,
                r.food_type,
                r.medicine_type,
                ST_X(w.location) AS latitude,
                ST_Y(w.location) AS longitude
            FROM rs_resource r
            JOIN warehouse w ON r.warehouse_id = w.warehouse_id
        """)
        
        rows = cursor.fetchall()
        result = []
        for row in rows:
            resource_id, resource_type, amount, food_type, medicine_type, latitude, longitude = row
            if resource_type == "Food":
                label = food_type
            elif resource_type == "Medicine":
                label = medicine_type
            else:
                label = "Water"

            result.append({
                "resource_id": resource_id,
                "resource_type": label,
                "amount_remaining": amount,
                "latitude": latitude,
                "longitude": longitude
            })
        
        cursor.close()
        conn.close()
        return result

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))


