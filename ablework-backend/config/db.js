const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.PORT || 3306, // Tells it to look for Aiven's port
    ssl: {
        rejectUnauthorized: false // Required by Aiven to encrypt the cloud connection
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection so we can see the result in Render's logs
pool.getConnection()
    .then(connection => {
        console.log('✅ Successfully connected to Aiven database!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

module.exports = pool;
