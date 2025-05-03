drop database if exists relief_sync;
create database relief_sync;
use relief_sync;

CREATE TABLE volunteer (
    volunteer_id int NOT NULL,
    volunteer_first_name TEXT(64) NOT NULL,
    volunteer_last_name TEXT(64) NOT NULL,
    UNIQUE (volunteer_id),
    PRIMARY KEY (volunteer_id)
);

CREATE TABLE shelter (
    shelter_id int NOT NULL,
    shelter_location POINT,
    UNIQUE (shelter_id),
    PRIMARY KEY (shelter_id)
);

CREATE TABLE disaster_zone (
    zone_id int NOT NULL,
    zone_coverage TEXT(16383),
    -- JSON formatted string
    zone_vertices TEXT(16383),
    UNIQUE (zone_id),
    PRIMARY KEY (zone_id)
);

CREATE TABLE warehouse (
    warehouse_id int NOT NULL,
    capacity int,
    location POINT,
    UNIQUE (warehouse_id),
    PRIMARY KEY (warehouse_id)
);

CREATE TABLE rs_resource (
    resource_id int NOT NULL,
    amount_remaining int,
    expiration_date datetime,
    warehouse_id int,
    food_type TEXT(256),
    medicine_type TEXT(256),
    resource_type ENUM('Food', 'Water', 'Medicine'),
    UNIQUE (resource_id),
    PRIMARY KEY (resource_id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id)
);

CREATE TABLE delivery_drone (
    drone_id int NOT NULL,
    -- JSON Formatted string
    last_delivery date,
    resource_amount int NOT NULL,
    UNIQUE (drone_id),
    PRIMARY KEY (drone_id)
);

CREATE TABLE charging_bay (
    bay_id int NOT NULL,
    location POINT,
    spots_avaiable int NOT NULL,
    UNIQUE (bay_id),
    PRIMARY KEY (bay_id)
);

CREATE TABLE supplier (
    supplier_id int NOT NULL,
    address TEXT(16383),
    -- JSON Formatted String
    last_donation date,
    UNIQUE (supplier_id),
    PRIMARY KEY (supplier_id)
);

CREATE TABLE inventory_manager (
    employee_id int NOT NULL,
    hire_date DATE,
    salary int,
    currently_employed bool,
    UNIQUE (employee_id),
    PRIMARY KEY (employee_id)
);

CREATE TABLE audit_report (
	employee_id int NOT NULL,
    report_content LONGTEXT,
    report_datetime DATETIME,
    FOREIGN KEY (employee_id) REFERENCES inventory_manager(employee_id)
);

CREATE TABLE assigned_to (
    zone_id int NOT NULL,
    volunteer_id int NOT NULL,
    duration int NOT NULL,
    FOREIGN KEY (zone_id) REFERENCES disaster_zone(zone_id),
    FOREIGN KEY (volunteer_id) REFERENCES volunteer(volunteer_id)
);

CREATE TABLE supplies (
    supplier_id int NOT NULL,
    resource_id int NOT NULL,
    supply_date DATETIME NOT NULL,
    supply_amount int NOT NULL,
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id),
    FOREIGN KEY (resource_id) REFERENCES rs_resource(resource_id)
);

CREATE TABLE stored_in (
    resource_id int NOT NULL,
    warehouse_id int NOT NULL,
    FOREIGN KEY (resource_id) REFERENCES rs_resource(resource_id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id)
);

CREATE TABLE alerts (
    warehouse_id int NOT NULL,
    employee_id int NOT NULL,
    severity_level ENUM('Low', 'Medium', 'High', 'Extreme') NOT NULL,
    alert_type bool NOT NULL,
    message TEXT(16383) NOT NULL,
    FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id),
    FOREIGN KEY (employee_id) REFERENCES inventory_manager(employee_id)
);

CREATE TABLE sends_out (
    employee_id int NOT NULL,
    drone_id int NOT NULL,
    send_time DATETIME NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES inventory_manager(employee_id),
    FOREIGN KEY (drone_id) REFERENCES delivery_drone(drone_id)
);

CREATE TABLE charges_in (
    bay_id int NOT NULL,
    drone_id int NOT NULL,
    FOREIGN KEY (bay_id) REFERENCES charging_bay(bay_id),
    FOREIGN KEY (drone_id) REFERENCES delivery_drone(drone_id)
);

CREATE TABLE delivers_to (
    volunteer_id int NOT NULL,
    drone_id int NOT NULL,
    delivery_location POINT NOT NULL,
    delivery_time DATETIME NOT NULL,
    FOREIGN KEY (volunteer_id) REFERENCES volunteer(volunteer_id),
    FOREIGN KEY (drone_id) REFERENCES delivery_drone(drone_id)
);

CREATE TABLE requests (
    volunteer_id int NOT NULL,
    resource_id int NOT NULL,
    request_datetime DATETIME NOT NULL,
    request_amount int NOT NULL,
    FOREIGN KEY (volunteer_id) REFERENCES volunteer(volunteer_id),
    FOREIGN KEY (resource_id) REFERENCES rs_resource(resource_id)
);

CREATE TABLE distributes_to (
    volunteer_id int NOT NULL,
    shelter_id int NOT NULL,
    resource_type ENUM('Food', 'Water', 'Medicine') NOT NULL,
    resource_amount int NOT NULL,
    date_and_time DATETIME,
    FOREIGN KEY (volunteer_id) REFERENCES volunteer(volunteer_id),
    FOREIGN KEY (shelter_id) REFERENCES shelter(shelter_id)
);

CREATE TABLE located_in (
    zone_id int NOT NULL,
    shelter_id int NOT NULL,
    FOREIGN KEY (zone_id) REFERENCES disaster_zone(zone_id),
    FOREIGN KEY (shelter_id) REFERENCES shelter(shelter_id)
);

INSERT INTO volunteer VALUES 
(101, 'Wilt', 'Thomas'),
(102, 'Justin', 'Hayes'),
(103, 'Joe', 'Billings'),
(104, 'Connor', 'Robertson'),
(105, 'Jason' , 'Hintz'),
(106, 'Michael', 'Johnson'),
(107, 'David', 'Perkins'),
(108, 'Emily', 'Turner'),
(109, 'Samantha', 'Lee'),
(110, 'Carlos', 'Mendez'),
(111, 'Tina', 'Walker'),
(112, 'Ethan', 'Green'),
(113, 'Lara', 'Nguyen'),
(114, 'Brian', 'Davis'),
(115, 'Olivia', 'Martinez');

INSERT INTO shelter VALUES 
(201, ST_PointFromText('POINT(30.2672 -97.7431)')),
(202, ST_PointFromText('POINT(30.3783 -97.4713)')),
(203, ST_PointFromText('POINT(30.1852 -97.3174)')),
(204, ST_PointFromText('POINT(30.7275 -97.8743)')),
(205, ST_PointFromText('POINT(30.1235 -97.1234)')),
(206, ST_PointFromText('POINT(30.2950 -97.7401)')),
(207, ST_PointFromText('POINT(30.3821 -97.4903)')),
(208, ST_PointFromText('POINT(30.2000 -97.3300)')),
(209, ST_PointFromText('POINT(30.7500 -97.8800)')),
(210, ST_PointFromText('POINT(30.1100 -97.1100)'));


INSERT INTO disaster_zone VALUES 
(301, '{type: Triangle, "description": "Zone A coverage"}', '[{"lat": 30.27, "lng": -97.74}, {"lat": 30.28, "lng": -97.75}, {"lat": 30.26, "lng": -97.76}]'),
(302, '{type: Triangle, "description": "Zone B coverage"}', '[{"lat": 30.89, "lng": -97.64}, {"lat": 30.90, "lng": -97.65}, {"lat": 30.88, "lng": -97.63}]'),
(303, '{type: Square, "description": "Zone C coverage"}', '[{"lat": 30.55, "lng": -97.34}, {"lat": 30.56, "lng": -97.35}, {"lat": 30.57, "lng": -97.36}], {"lat": 30.54, "lng": -97.33}]'),
(304, '{type: Square, "description": "Zone D coverage"}', '[{"lat": 30.42, "lng": -97.19}, {"lat": 30.43, "lng": -97.20}, {"lat": 30.44, "lng": -97.21}], {"lat": 30.41, "lng": -97.18}]'),
(305, '{type: Circle, "description": "Zone E coverage"}', '[{"lat": 30.65, "lng": -97.45}]'),
(306, '{type: Triangle, "description": "Zone F coverage"}', '[{"lat": 30.31, "lng": -97.61}, {"lat": 30.32, "lng": -97.62}, {"lat": 30.30, "lng": -97.60}]'),
(307, '{type: Square, "description": "Zone G coverage"}', '[{"lat": 30.75, "lng": -97.88}, {"lat": 30.76, "lng": -97.89}, {"lat": 30.77, "lng": -97.90}, {"lat": 30.78, "lng": -97.91}]');

INSERT INTO warehouse VALUES 
(401, 1000, ST_PointFromText('POINT(30.2500 -97.7500)')),
(402, 800, ST_PointFromText('POINT(30.2400 -97.7600)')),
(403, 1200, ST_PointFromText('POINT(30.2600 -97.7700)')),
(404, 900, ST_PointFromText('POINT(30.2700 -97.7800)'));

INSERT INTO rs_resource VALUES 
(501, 500, '2025-12-31 00:00:00', 401, 'Rice', NULL, 'Food'),
(502, 300, '2025-12-01 00:00:00', 402, NULL, 'Paracetamol', 'Medicine'),
(503, 200, '2025-10-01 00:00:00', 403, NULL, NULL, 'Water'),
(504, 100, '2025-11-15 00:00:00', 404, 'Beans', NULL, 'Food'),
(505, 150, '2026-01-01 00:00:00', 401, NULL, 'Insulin', 'Medicine');

INSERT INTO delivery_drone VALUES 
(601, '2025-03-31', 50),
(602, '2025-04-10', 60),
(603, '2025-04-12', 55),
(604, '2025-04-14', 40),
(605, '2025-04-15', 75);

INSERT INTO charging_bay VALUES 
(701, ST_PointFromText('POINT(30.2600 -97.7400)'), 4),
(702, ST_PointFromText('POINT(30.2550 -97.7350)'), 3),
(703, ST_PointFromText('POINT(30.2650 -97.7450)'), 5);

INSERT INTO supplier VALUES 
(801, '123 Relief Way, Austin, TX', '2025-04-01'),
(802, '456 Relief Lane, Austin, TX', '2025-04-02'),
(803, '789 Care Blvd, Austin, TX', '2025-04-03'),
(804, '321 Aid Rd, Austin, TX', '2025-04-04');

INSERT INTO inventory_manager VALUES 
(901, '2023-06-15', 60000, TRUE),
(902, '2022-01-10', 55000, TRUE),
(903, '2021-03-22', 58000, FALSE),
(904, '2020-08-17', 62000, TRUE);

INSERT INTO audit_report VALUES 
(901, 'All inventory levels checked and verified.', '2025-04-15 10:00:00'),
(902, 'Quarterly audit shows no discrepancies.', '2025-03-01 09:00:00'),
(904, 'Resource levels are consistent with expected values.', '2025-04-10 12:00:00');

INSERT INTO assigned_to VALUES 
(301, 101, 7),
(302, 102, 10),
(303, 103, 8),
(304, 104, 12),
(305, 105, 6),
(306, 106, 14),
(307, 107, 7);

INSERT INTO supplies VALUES 
(801, 501, '2025-04-10 08:30:00', 500),
(802, 502, '2025-04-12 10:15:00', 300),
(803, 503, '2025-04-13 11:00:00', 200),
(804, 504, '2025-04-14 14:45:00', 100),
(801, 505, '2025-04-15 09:30:00', 150);

INSERT INTO stored_in VALUES 
(501, 401),
(502, 402),
(503, 403),
(504, 404),
(505, 401);

INSERT INTO alerts VALUES 
(401, 901, 'Medium', TRUE, 'Stock of water below threshold.'),
(402, 902, 'High', TRUE, 'Critical medicine stock is running low.'),
(403, 903, 'Low', FALSE, 'Non-critical stock variation detected.'),
(404, 904, 'Extreme', TRUE, 'No power detected at the warehouse.'),
(401, 902, 'Medium', FALSE, 'Temperature deviation in storage unit.');

INSERT INTO sends_out VALUES 
(901, 601, '2025-04-16 09:00:00'),
(902, 602, '2025-04-16 08:00:00'),
(903, 603, '2025-04-16 09:00:00'),
(904, 604, '2025-04-16 10:00:00'),
(901, 605, '2025-04-16 11:00:00');

INSERT INTO charges_in VALUES 
(701, 601),
(702, 602),
(703, 603),
(702, 604),
(701, 605);

INSERT INTO delivers_to VALUES 
(101, 601, ST_PointFromText('POINT(30.2700 -97.7450)'), '2025-04-16 11:00:00'),
(102, 602, ST_PointFromText('POINT(30.2800 -97.7400)'), '2025-04-16 12:30:00'),
(103, 603, ST_PointFromText('POINT(30.2850 -97.7450)'), '2025-04-16 13:00:00'),
(104, 604, ST_PointFromText('POINT(30.2900 -97.7500)'), '2025-04-16 13:30:00'),
(105, 605, ST_PointFromText('POINT(30.2950 -97.7550)'), '2025-04-16 14:00:00');

INSERT INTO requests VALUES 
(101, 501, '2025-04-15 15:00:00', 25),
(102, 502, '2025-04-14 10:00:00', 30),
(103, 503, '2025-04-14 11:00:00', 20),
(104, 504, '2025-04-14 12:00:00', 15),
(105, 505, '2025-04-14 13:00:00', 25);

INSERT INTO distributes_to VALUES 
(101, 201, 'Food', 25, '2025-04-16 13:00:00'),
(102, 202, 'Medicine', 30, '2025-04-16 14:30:00'),
(103, 203, 'Water', 20, '2025-04-16 15:00:00'),
(104, 204, 'Food', 15, '2025-04-16 15:30:00'),
(105, 205, 'Medicine', 25, '2025-04-16 16:00:00');

INSERT INTO located_in VALUES 
(301, 201),
(302, 202),
(303, 203),
(304, 204),
(305, 205),
(306, 206);

SELECT * FROM VOLUNTEER;
SELECT * FROM SHELTER;
SELECT * FROM DISASTER_ZONE;
SELECT * FROM WAREHOUSE;
SELECT * FROM RS_RESOURCE;
SELECT * FROM DELIVERY_DRONE;
SELECT * FROM CHARGING_BAY;
SELECT * FROM SUPPLIER;
SELECT * FROM INVENTORY_MANAGER;
SELECT * FROM AUDIT_REPORT;
SELECT * FROM ASSIGNED_TO;
SELECT * FROM SUPPLIES;
SELECT * FROM STORED_IN;
SELECT * FROM ALERTS;
SELECT * FROM SENDS_OUT;
SELECT * FROM CHARGES_IN;
SELECT * FROM DELIVERS_TO;
SELECT * FROM REQUESTS;
SELECT * FROM DISTRIBUTES_TO;
SELECT * FROM LOCATED_IN;