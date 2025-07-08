const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3091;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
    user: 'postgres',
    host: 'postgres',
    database: 'claims_db',
    password: 'admin123',
    port: 5432,
});

// Initialize DB connection
async function initializeDatabase() {
    try {
        await pool.query('SELECT 1');
        console.log('✅ Database connection successful');
    } catch (error) {
        console.error('❌ Error connecting to database:', error);
    }
}

// Create a new claim
app.post('/api/claims', async (req, res) => {
    console.log('📥 Received claim data:', req.body);

    const {
        id,
        employeeId,
        claimType,
        fromDate,
        toDate,
        fromLocation,
        toLocation,
        hospitalName,
        amount,
        description,
        status = 'Pending',
        submittedDate
    } = req.body;

    // Basic validation
    if (!id || !employeeId || !claimType || !fromDate || !toDate || !amount || !description || !submittedDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await pool.query(`
            INSERT INTO claims (
                id, employee_id, claim_type, from_date, to_date,
                from_location, to_location, hospital_name, amount,
                description, status, submitted_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `, [
            id, employeeId, claimType, fromDate, toDate,
            fromLocation, toLocation, hospitalName, amount,
            description, status, submittedDate
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('❌ Error submitting claim:', error);
        res.status(500).json({ error: 'Failed to submit claim' });
    }
});

// Get all claims
app.get('/api/claims', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM claims ORDER BY submitted_date DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error fetching claims:', error);
        res.status(500).json({ error: 'Failed to fetch claims' });
    }
});

// Update claim status
app.put('/api/claims/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const result = await pool.query(
            'UPDATE claims SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('❌ Error updating claim status:', error);
        res.status(500).json({ error: 'Failed to update claim status' });
    }
});

// Delete selected claims
app.delete('/api/claims', async (req, res) => {
    const { claimIds } = req.body;

    if (!claimIds || !Array.isArray(claimIds) || claimIds.length === 0) {
        return res.status(400).json({ error: 'No claim IDs provided' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM claims WHERE id = ANY($1) RETURNING *',
            [claimIds]
        );

        res.json({
            message: `${result.rowCount} claim(s) deleted successfully`,
            deletedClaims: result.rows
        });
    } catch (error) {
        console.error('❌ Error deleting claims:', error);
        res.status(500).json({ error: 'Failed to delete claims' });
    }
});

// Start server
app.listen(port, async () => {
    await initializeDatabase();

    console.log(`🚀 Server running at http://13.61.3.24:${port}`);
});
