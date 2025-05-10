from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from mysql.connector import Error

from .backend.database import db_router
from .backend.auth import auth_router
from .backend.donate import donate_router
from .backend.coordinator import coordinator_router
from .backend.inventory import inventory_router
from .backend.monitor import monitor_router
from .backend.drones import drones_router

app = FastAPI()

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(db_router)
app.include_router(auth_router)
app.include_router(donate_router)
app.include_router(coordinator_router)
app.include_router(inventory_router)
app.include_router(monitor_router)
app.include_router(drones_router)

@app.get("/dummy-needed-resources")
def dummy_needed_resources():
    return [
        {"resource_id": 1, "resource_type": "Water", "amount_remaining": 50, "expiration_date": "2025-06-01"},
        {"resource_id": 2, "resource_type": "Food", "amount_remaining": 30, "expiration_date": "2025-05-20"},
    ]

@app.get("/dummy-donation-history")
def dummy_donation_history():
    return [
        {"resource_id": 1, "supply_date": "2025-05-01", "supply_amount": 100},
        {"resource_id": 2, "supply_date": "2025-04-15", "supply_amount": 75},
    ]

@app.get("/dummy-available-resources")
def dummy_available_resources():
    return [
        {"resource_id": 1, "type": "Food", "amount_remaining": 120},
        {"resource_id": 2, "type": "Water", "amount_remaining": 200},
    ]

@app.get("/dummy-pending-deliveries")
def dummy_pending_deliveries():
    return [
        {"delivery_id": 1, "resource": "Food", "amount": 50, "status": "Pending", "location": "Zone A"},
        {"delivery_id": 2, "resource": "Water", "amount": 30, "status": "Pending", "location": "Zone B"},
    ]

@app.get("/dummy-distribution-metrics")
def dummy_distribution_metrics():
    return {
        "total_deliveries": 12,
        "successful_deliveries": 10,
        "failed_deliveries": 2,
        "avg_delivery_time_minutes": 37
    }

@app.get("/dummy-inventory")
def dummy_inventory():
    return [
        {"resource_id": 1, "type": "Water", "amount_remaining": 150, "warehouse": "North Hub"},
        {"resource_id": 2, "type": "Food", "amount_remaining": 75, "warehouse": "East Hub"},
    ]

@app.get("/dummy-inventory-report")
def dummy_inventory_report():
    return {
        "total_resources": 2,
        "average_stock": 112.5,
        "shortages": [
            {"resource_id": 2, "type": "Food", "amount_remaining": 75, "threshold": 100}
        ]
    }

@app.get("/dummy-monitoring-inventory")
def dummy_monitoring_inventory():
    return [
        {"resource_type": "Water", "warehouse": "North Hub", "amount_remaining": 200},
        {"resource_type": "Food", "warehouse": "East Hub", "amount_remaining": 125},
    ]

@app.get("/dummy-aid-distribution-summary")
def dummy_distribution_summary():
    return {
        "total_deliveries": 48,
        "total_zones_reached": 9,
        "avg_delivery_time_min": 42,
        "most_served_zone": "Zone 3"
    }

@app.get("/dummy-drones-status")
def dummy_drones_status():
    return {
        "en_route": [
            {"drone_id": 1, "destination": "Zone A", "eta_min": 12},
            {"drone_id": 2, "destination": "Zone B", "eta_min": 20},
        ],
        "charging": [
            {"drone_id": 3, "location": "North Hub", "charge_level": 80},
            {"drone_id": 4, "location": "East Hub", "charge_level": 45},
        ]
    }

@app.get("/dummy-drones-inbound")
def dummy_drones_inbound():
    return [
        {"drone_id": 1, "resource": "Food", "eta_min": 12},
        {"drone_id": 5, "resource": "Water", "eta_min": 22},
    ]
