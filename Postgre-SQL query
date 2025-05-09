CREATE DATABASE claims_db;

CREATE TABLE IF NOT EXISTS claims (
    id VARCHAR(10) PRIMARY KEY,
    employee_id VARCHAR(7) NOT NULL,
    claim_type VARCHAR(50) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    from_location VARCHAR(30),
    to_location VARCHAR(30),
    hospital_name VARCHAR(30),
    amount NUMERIC(10,2) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    submitted_date DATE NOT NULL
);
