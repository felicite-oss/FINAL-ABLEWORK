const mysql = require('mysql2/promise');
require('dotenv').config();

console.log("=== RENDER DATABASE DEBUG ===");
console.log("Host:", process.env.DB_HOST);
console.log("Port:", process.env.DB_PORT);
console.log("SSL Required:", process.env.DB_REQUIRES_SSL);
console.log("=============================");

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

if (process.env.DB_REQUIRES_SSL === 'true') {
    dbConfig.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(dbConfig);

pool.getConnection()
    .then(connection => {
        console.log(`✅ Successfully connected to the database at ${process.env.DB_HOST}!`);
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

module.exports = pool;
