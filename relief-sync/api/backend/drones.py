from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import mysql.connector
from datetime import datetime

drones_router = APIRouter()

class GetDronesRequest(BaseModel):
    username: str
    password: str

class SendDroneRequest(GetDronesRequest):
    drone_id: int
    warehouse_id: int
    resource_id: int

@drones_router.post('/get-deliveries')
def get_deliveries(req: GetDronesRequest):
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user=req.username,
            password=req.password,
            database="relief_sync"
        )
        cursor = conn.cursor()
        cursor.execute("""
            SELECT volunteer_id, drone_id, ST_X(delivery_location) as lat, ST_Y(delivery_location) as lon, delivery_time
            FROM delivers_to
        """)
        result = [
            {
                "drone_id": row[1],
                "destination": f"{row[2]}, {row[3]}",
                "eta_min": str(row[4])
            }
            for row in cursor.fetchall()
        ]
        cursor.close()
        conn.close()
        return {
            "en_route": result,
            "charging": []
        }
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))

@drones_router.post('/get-available-drones')
def get_available_drones(req: GetDronesRequest):
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user=req.username,
            password=req.password,
            database="relief_sync"
        )
        cursor = conn.cursor()
        cursor.execute("""
            SELECT drone_id
            FROM delivery_drone
        """)
        result = [
            {
                "drone_id": row[0],
            }
            for row in cursor.fetchall()
        ]
        cursor.close()
        conn.close()
        return result
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    
@drones_router.post('/send-drone')
def send_drone(req: SendDroneRequest):
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user=req.username,
            password=req.password,
            database="relief_sync"
        )
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO sends_out (employee_id, drone_id, send_time) VALUES (%s, %s, %s)",
            (901, req.drone_id, datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        )
        cursor.execute(
            "INSERT INTO delivers_to (volunteer_id, drone_id, delivery_location, delivery_time) VALUES (%s, %s, %s, %s)",
            (101, req.drone_id, f'ST_PointFromText(\'POINT({0} {0})\')', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        )

        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "Drone sent successfully."}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))