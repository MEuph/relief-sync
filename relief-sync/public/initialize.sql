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
(301, ST_PointFromText('POINT(29.760427 -95.369803)')),
(302, ST_PointFromText('POINT(32.776475 -79.931051)')),
(303, ST_PointFromText('POINT(30.695366 -88.039891)')),
(304, ST_PointFromText('POINT(33.520661 -86.802490)')),
(305, ST_PointFromText('POINT(32.461000 -93.785000)')),
(306, ST_PointFromText('POINT(29.951065 -90.071533)')),
(307, ST_PointFromText('POINT(31.968599 -99.901810)')),
(308, ST_PointFromText('POINT(30.438255 -84.280733)')),
(309, ST_PointFromText('POINT(34.000710 -81.034814)')), 
(310, ST_PointFromText('POINT(35.467560 -97.516428)')); 


INSERT INTO disaster_zone VALUES 
(301, '{ "type": "Triangle", "description": "Zone A coverage" }', '[{"lat": 29.760427, "lng": -95.369803}, {"lat": 29.770427, "lng": -95.359803}, {"lat": 29.750427, "lng": -95.379803}]'),
(302, '{ "type": "Triangle", "description": "Zone B coverage" }', '[{"lat": 32.460976, "lng": -93.745001}, {"lat": 32.470976, "lng": -93.735001}, {"lat": 32.450976, "lng": -93.755001}]'),
(303, '{ "type": "Square", "description": "Zone C coverage" }', '[{"lat": 30.695366, "lng": -88.039891}, {"lat": 30.705366, "lng": -88.039891}, {"lat": 30.705366, "lng": -88.029891}, {"lat": 30.695366, "lng": -88.029891}]'),
(304, '{ "type": "Square", "description": "Zone D coverage" }', '[{"lat": 33.520661, "lng": -86.802490}, {"lat": 33.530661, "lng": -86.802490}, {"lat": 33.530661, "lng": -86.792490}, {"lat": 33.520661, "lng": -86.792490}]'),
(305, '{ "type": "Circle", "description": "Zone E coverage" }', '[{"lat": 30.438255, "lng": -84.280733}]'),
(306, '{ "type": "Triangle", "description": "Zone F coverage" }', '[{"lat": 29.951065, "lng": -90.071533}, {"lat": 29.961065, "lng": -90.061533}, {"lat": 29.941065, "lng": -90.081533}]'),
(307, '{ "type": "Square", "description": "Zone G coverage" }', '[{"lat": 32.776475, "lng": -79.931051}, {"lat": 32.786475, "lng": -79.931051}, {"lat": 32.786475, "lng": -79.921051}, {"lat": 32.776475, "lng": -79.921051}]');

INSERT INTO warehouse VALUES 
(401, 1000, ST_PointFromText('POINT(29.760427 -95.369803)')),
(402, 800,  ST_PointFromText('POINT(32.509310 -92.119301)')),
(403, 1200, ST_PointFromText('POINT(34.364730 -89.519562)')),
(404, 950,  ST_PointFromText('POINT(33.520661 -86.802490)')),
(405, 1100, ST_PointFromText('POINT(32.840694 -83.632402)')),
(406, 875,  ST_PointFromText('POINT(30.332184 -81.655647)')),
(407, 980,  ST_PointFromText('POINT(32.776475 -79.931051)'));

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
(701, ST_PointFromText('POINT(29.951065 -90.071533)'), 4),
(702, ST_PointFromText('POINT(31.463772 -100.437037)'), 3),
(703, ST_PointFromText('POINT(33.836082 -81.163727)'), 5),
(704, ST_PointFromText('POINT(30.695366 -88.039891)'), 4),
(705, ST_PointFromText('POINT(35.149532 -90.048981)'), 6),
(706, ST_PointFromText('POINT(27.800583 -97.396378)'), 3),
(707, ST_PointFromText('POINT(32.735687 -97.108070)'), 5);

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
(101, 601, ST_PointFromText('POINT(29.760427 -95.369804)'), '2025-04-16 15:00:00'),
(102, 602, ST_PointFromText('POINT(32.776665 -96.796989)'), '2025-04-16 15:30:00'),
(103, 603, ST_PointFromText('POINT(36.162664 -86.781602)'), '2025-04-16 16:00:00'),
(104, 604, ST_PointFromText('POINT(30.332184 -81.655647)'), '2025-04-16 16:30:00'),
(105, 605, ST_PointFromText('POINT(35.467560 -97.516426)'), '2025-04-16 17:00:00');

INSERT INTO requests VALUES 
(101, 501, '2025-04-15 15:00:00', 25),
(102, 502, '2025-04-14 10:00:00', 30),
(103, 503, '2025-04-14 11:00:00', 20),
(104, 504, '2025-04-14 12:00:00', 15),
(105, 505, '2025-04-14 13:00:00', 25);

INSERT INTO distributes_to VALUES 
(101, 301, 'Food', 25, '2025-04-16 13:00:00'),
(102, 302, 'Medicine', 30, '2025-04-16 14:30:00'),
(103, 303, 'Water', 20, '2025-04-16 15:00:00'),
(104, 304, 'Food', 15, '2025-04-16 15:30:00'),
(105, 305, 'Medicine', 25, '2025-04-16 16:00:00');

INSERT INTO located_in VALUES 
(301, 301),
(302, 302),
(303, 303),
(304, 304),
(305, 305),
(306, 306);

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