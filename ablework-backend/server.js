const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./config/db');
const multer = require('multer'); 
require('dotenv').config();

const { OpenAI } = require('openai');

// Initialize OpenAI using your secret key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const app = express();

// 1. Open CORS for development
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Configure Multer to save uploaded files into the 'uploads' folder
const upload = multer({ dest: 'uploads/' });


// ---------------------------------------------------------
// ROUTE: Abby AI Chatbot Engine
// ---------------------------------------------------------
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    console.log("Received message for Abby:", message);

    try {
        // Simulating network delay so it feels real
        setTimeout(() => {
            res.status(200).json({ 
                reply: "I am currently in testing mode and not connected to OpenAI yet, but your message went through perfectly!" 
            });
        }, 1500);

    } catch (error) {
        res.status(500).json({ error: "Server error." });
    }
});

// ---------------------------------------------------------
// ROUTE 1: Original Basic Registration
// ---------------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
    console.log("--- INCOMING REGISTRATION REQUEST ---");
    
    const { firstname, middlename, lastname, email, password, birthdate } = req.body;

    // Calculate Age
    const birthDateObj = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDifference = today.getMonth() - birthDateObj.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }

    if (age < 18) {
        return res.status(403).json({ error: "You must be 18 or older to register." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (firstname, middlename, lastname, email, password_hash, birthdate) VALUES (?, ?, ?, ?, ?, ?)',
            [firstname, middlename || null, lastname, email, hashedPassword, birthdate]
        );
        res.status(201).json({ message: "Registration successful. Status pending.", userId: result.insertId });
    } catch (error) {
        console.error("Database error occurred:", error.message);
        res.status(500).json({ error: "Database error or email already exists." });
    }
});

// ---------------------------------------------------------
// ROUTE 2: Fetch Active Jobs
// ---------------------------------------------------------
app.get('/api/jobs', async (req, res) => {
    try {
        const [jobs] = await db.execute("SELECT * FROM jobs WHERE status = 'Active'");
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch jobs." });
    }
});

// ---------------------------------------------------------
// ROUTE 3: User Login 
// ---------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                // ui_preference is removed from here!
                verification_status: user.verification_status
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ error: "Server error during login." });
    }
});

// ---------------------------------------------------------
// ROUTE 4: FULL APPLICANT REGISTRATION 
// ---------------------------------------------------------
app.post('/api/auth/register/applicant', upload.single('pwdDocument'), async (req, res) => {
    console.log("--- INCOMING APPLICANT REGISTRATION ---");
    
    // 1. Extract all text fields
    const { 
        firstName, middleName, lastName, 
        email, phone, password, birthdate, 
        address, latitude, longitude, radius, independence 
    } = req.body;

    // 2. Parse the stringified arrays back into real arrays, then convert to comma-separated strings for DB
    const disabilitiesArray = JSON.parse(req.body.disabilities || "[]");
    const accommodationsArray = JSON.parse(req.body.accommodations || "[]");
    const skillsArray = JSON.parse(req.body.skills || "[]");

    const disabilityTypeString = disabilitiesArray.join(', ');
    const accommodationsString = accommodationsArray.join(', ');
    const skillsString = skillsArray.join(', ');

    // 3. Get the file path of the uploaded document
    const documentPath = req.file ? req.file.path : null;

    try {
        // Check if email already exists
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // --- DATABASE TRANSACTION START ---
        // We use a transaction so if the second insert fails, the first one is undone.
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // STEP A: Insert core data into `users` table
            const [userResult] = await connection.execute(
                `INSERT INTO users 
                (firstname, middlename, lastname, email, phone, password_hash, birthdate, disability_type) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [firstName, middleName || null, lastName, email, phone, hashedPassword, birthdate, disabilityTypeString]
            );

            const newUserId = userResult.insertId;

            // STEP B: Insert the extended data into `applicant_profiles` table
            await connection.execute(
                `INSERT INTO applicant_profiles 
                (user_id, residential_address, latitude, longitude, travel_radius_km, workplace_independence, accommodations_needed, skills, pwd_document_path) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [newUserId, address, latitude || null, longitude || null, radius, independence, accommodationsString, skillsString, documentPath]
            );

            // Commit the transaction
            await connection.commit();
            connection.release();

            res.status(201).json({ 
                message: "Applicant registration successful. Pending admin verification.",
                userId: newUserId
            });

        } catch (dbError) {
            await connection.rollback(); // Undo changes if something breaks
            connection.release();
            throw dbError;
        }
        // --- DATABASE TRANSACTION END ---

    } catch (error) {
        console.error("Applicant Registration Error:", error.message);
        res.status(500).json({ message: "Database error during registration." });
    }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    try {
        const connection = await db.getConnection();
        console.log("Successfully connected to MySQL database: ablework02_db");
        connection.release();
    } catch (err) {
        console.error("Database connection failed:", err.message);
    }
});

// ---------------------------------------------------------
// ROUTE 5: FULL EMPLOYER REGISTRATION 
// ---------------------------------------------------------
app.post('/api/auth/register/employer', async (req, res) => {
    console.log("--- INCOMING EMPLOYER REGISTRATION ---");
    
    const { 
        companyName, email, phone, password, industry, 
        jobRole, address, latitude, longitude
    } = req.body;

    try {
        // 1. Check if email exists
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Start Transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // STEP A: Insert core data into `users` (Bypass NOT NULL errors)
            const [userResult] = await connection.execute(
                `INSERT INTO users (firstname, lastname, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)`,
                [companyName, 'Employer', email, phone, hashedPassword]
            );

            const newUserId = userResult.insertId;

            // STEP B: Insert into `employer_profiles`
            await connection.execute(
                `INSERT INTO employer_profiles 
                (user_id, company_name, industry, job_role, workplace_address, latitude, longitude) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [newUserId, companyName, industry, jobRole, address, latitude || null, longitude || null]
            );

            // Commit transaction
            await connection.commit();
            connection.release();

            res.status(201).json({ message: "Employer registration successful.", userId: newUserId });

        } catch (dbError) {
            await connection.rollback();
            connection.release();
            throw dbError;
        }

    } catch (error) {
        console.error("Employer Registration Error:", error.message);
        res.status(500).json({ message: "Database error during registration." });
    }
});