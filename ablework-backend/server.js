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
// ROUTE: Fetch Active Jobs
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
// ROUTE: User Login 
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

        // --- DETERMINE USER ROLE & FETCH PROFILE ---
        const [employerCheck] = await db.execute('SELECT user_id FROM employer_profiles WHERE user_id = ?', [user.id]);
        
        let userRole = 'applicant';
        if (employerCheck.length > 0) {
            userRole = 'employer';
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                verification_status: user.verification_status,
                role: userRole 
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ error: "Server error during login." });
    }
});

// ---------------------------------------------------------
// ROUTE: Fetch Applicant Profile Data
// ---------------------------------------------------------
app.get('/api/applicant/:id/profile', async (req, res) => {
    const userId = req.params.id;

    try {
        // Use a JOIN to grab data from both the users table and applicant_profiles table
        const [rows] = await db.execute(`
            SELECT 
                u.email, u.phone, u.verification_status, 
                a.firstname, a.middlename, a.lastname, a.birthdate, a.disability_type, 
                a.residential_address, a.latitude, a.longitude, a.travel_radius_km, 
                a.workplace_independence, a.accommodations_needed, a.skills, a.pwd_document_path
            FROM users u
            JOIN applicant_profiles a ON u.id = a.user_id
            WHERE u.id = ?
        `, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Applicant profile not found." });
        }

        const profile = rows[0];

        // Safely parse the JSON arrays for the frontend UI chips
        // (If they are already valid JSON strings in DB, we parse them back to arrays for React)
        let parsedSkills = [];
        let parsedAccommodations = [];
        
        try { parsedSkills = JSON.parse(profile.skills); } catch (e) {}
        try { parsedAccommodations = JSON.parse(profile.accommodations_needed); } catch (e) {}

        // Send the packaged data to the frontend
        res.status(200).json({
            ...profile,
            skills: parsedSkills,
            accommodations: parsedAccommodations
        });

    } catch (error) {
        console.error("Error fetching applicant profile:", error.message);
        res.status(500).json({ message: "Server error fetching profile." });
    }
});

// ---------------------------------------------------------
// ROUTE: FULL APPLICANT REGISTRATION 
// ---------------------------------------------------------
app.post('/api/auth/register/applicant', upload.single('pwdDocument'), async (req, res) => {
    console.log("--- INCOMING APPLICANT REGISTRATION ---");
    
    // Safety check
    if (!req.body) {
        return res.status(400).json({ message: "No data received. Ensure you are sending FormData." });
    }

    // 1. Destructure using the EXACT variable names you used in your React FormData
    const { 
        firstName, middleName, lastName, email, phone, password, birthdate, 
        address, latitude, longitude, radius, 
        independence, disabilities, accommodations, skills 
    } = req.body;

    // Grab the file path if multer successfully saved the uploaded document
    const pwdDocumentPath = req.file ? req.file.path : null;

    try {
        // 2. Check if the email is already in use
        const [existingUser] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        // 3. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 4. Start database transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // STEP A: Insert core authentication data into `users`
            const [userResult] = await connection.execute(
                `INSERT INTO users (email, phone, password_hash, ui_preference, verification_status) 
                 VALUES (?, ?, ?, ?, ?)`,
                [email, phone, hashedPassword, 'default', 'Pending']
            );

            const newUserId = userResult.insertId;

            // Clean up the disabilities JSON array into a comma-separated string for the DB
            const parsedDisabilities = JSON.parse(disabilities || '[]');
            const disabilityString = parsedDisabilities.join(', ');

            // STEP B: Insert into `applicant_profiles` (mapping React names to Database column names)
            await connection.execute(
                `INSERT INTO applicant_profiles 
                (user_id, firstname, middlename, lastname, birthdate, disability_type, residential_address, latitude, longitude, travel_radius_km, workplace_independence, accommodations_needed, skills, pwd_document_path) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    newUserId, 
                    firstName, 
                    middleName || null, 
                    lastName, 
                    birthdate, 
                    disabilityString || 'None specified', 
                    address, 
                    latitude || null, 
                    longitude || null, 
                    radius || 5, 
                    independence, 
                    accommodations || '[]', // This is already a stringified JSON array from frontend
                    skills || '[]',         // This is already a stringified JSON array from frontend
                    pwdDocumentPath         // The file path saved by Multer
                ]
            );

            await connection.commit();
            connection.release();

            res.status(201).json({ message: "Applicant registration successful.", userId: newUserId });

        } catch (dbError) {
            await connection.rollback();
            connection.release();
            throw dbError;
        }

    } catch (error) {
        console.error("Applicant Registration Error:", error.message);
        res.status(500).json({ message: "Database error during registration." });
    }
});

// ---------------------------------------------------------
// ROUTE: FULL EMPLOYER REGISTRATION 
// ---------------------------------------------------------
app.post('/api/auth/register/employer', async (req, res) => {
    console.log("--- INCOMING EMPLOYER REGISTRATION ---");
    
    const { 
        companyName, email, phone, password, industry, 
        jobRole, address, latitude, longitude
    } = req.body;

    try {
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // STEP A: Insert ONLY core data into `users` (Fixed: Removed firstname/lastname)
            const [userResult] = await connection.execute(
                `INSERT INTO users (email, phone, password_hash, ui_preference, verification_status) 
                 VALUES (?, ?, ?, ?, ?)`,
                [email, phone, hashedPassword, 'default', 'Pending']
            );

            const newUserId = userResult.insertId;

            // STEP B: Insert into `employer_profiles`
            await connection.execute(
                `INSERT INTO employer_profiles 
                (user_id, company_name, industry, job_role, workplace_address, latitude, longitude) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [newUserId, companyName, industry, jobRole, address, latitude || null, longitude || null]
            );

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

// ---------------------------------------------------------
// --- START THE SERVER ---
// ---------------------------------------------------------
const PORT = process.env.PORT || 5001;

// ---------------------------------------------------------
// HELPER: Haversine Formula (Calculates exact distance in KM)
// ---------------------------------------------------------
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c;
}

// ---------------------------------------------------------
// ROUTE: SMART MATCHING ENGINE (Rule-Based Algorithm)
// ---------------------------------------------------------
app.get('/api/applicant/:id/matches', async (req, res) => {
    const userId = req.params.id;

    try {
        // 1. Fetch the Applicant's exact needs and location
        const [applicantRows] = await db.execute(`
            SELECT latitude, longitude, travel_radius_km, accommodations_needed, skills 
            FROM applicant_profiles 
            WHERE user_id = ?
        `, [userId]);

        if (applicantRows.length === 0) return res.status(404).json({ message: "Applicant not found." });
        const applicant = applicantRows[0];

        // Parse their JSON arrays safely
        const appSkills = JSON.parse(applicant.skills || '[]');
        const appAccommodations = JSON.parse(applicant.accommodations_needed || '[]');

        // 2. Fetch all active job postings
        const [jobs] = await db.execute(`
            SELECT id, employer_id, job_title, company_name, job_description, required_skills, provided_accommodations, latitude, longitude 
            FROM job_postings 
            WHERE status = 'Active'
        `);

        let matchedJobs = [];

        // 3. RUN THE RULE-BASED ALGORITHM
        for (let job of jobs) {
            // A. Geofencing Check
            let distance = 0;
            if (applicant.latitude && applicant.longitude && job.latitude && job.longitude) {
                distance = getDistanceFromLatLonInKm(
                    applicant.latitude, applicant.longitude, 
                    job.latitude, job.longitude
                );
                
                // Rule: If job is further than their travel radius, discard it
                if (distance > applicant.travel_radius_km) continue;
            }

            // B. Accommodation Strict Match Check
            const jobAccommodations = JSON.parse(job.provided_accommodations || '[]');
            
            // Rule: Every accommodation the applicant NEEDS must be provided by the job
            const meetsAllNeeds = appAccommodations.every(need => jobAccommodations.includes(need));
            if (!meetsAllNeeds) continue; // Discard job if it's not accessible for this specific user

            // C. Skill Scoring
            const jobSkills = JSON.parse(job.required_skills || '[]');
            let matchingSkillsCount = 0;
            
            appSkills.forEach(skill => {
                if (jobSkills.includes(skill)) matchingSkillsCount++;
            });

            // Calculate a percentage (e.g., 100% Match)
            const matchPercentage = jobSkills.length > 0 
                ? Math.round((matchingSkillsCount / jobSkills.length) * 100) 
                : 100;

            // D. Push successful match to the array
            matchedJobs.push({
                ...job,
                distance_km: distance.toFixed(1),
                matching_skills_count: matchingSkillsCount,
                match_percentage: matchPercentage,
                total_required_skills: jobSkills.length
            });
        }

        // 4. Sort matches by highest percentage first, then by closest distance
        matchedJobs.sort((a, b) => {
            if (b.match_percentage !== a.match_percentage) {
                return b.match_percentage - a.match_percentage; 
            }
            return a.distance_km - b.distance_km;
        });

        res.status(200).json(matchedJobs);

    } catch (error) {
        console.error("Smart Engine Error:", error.message);
        res.status(500).json({ message: "Error running matching algorithm." });
    }
});


// ---------------------------------------------------------
// ROUTE: SUBMIT A JOB APPLICATION
// ---------------------------------------------------------
app.post('/api/applications/apply', async (req, res) => {
    const { applicant_id, job_id } = req.body;

    if (!applicant_id || !job_id) {
        return res.status(400).json({ message: "Missing applicant or job ID." });
    }

    try {
        // Prevent double-applying
        const [existing] = await db.execute(
            'SELECT id FROM applications WHERE applicant_id = ? AND job_id = ?', 
            [applicant_id, job_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: "You have already applied for this job." });
        }

        // Insert the application
        await db.execute(
            'INSERT INTO applications (applicant_id, job_id, status) VALUES (?, ?, ?)',
            [applicant_id, job_id, 'Under Review']
        );

        res.status(201).json({ message: "Application submitted successfully!" });
    } catch (error) {
        console.error("Application Submission Error:", error.message);
        res.status(500).json({ message: "Failed to submit application." });
    }
});

// ---------------------------------------------------------
// ROUTE: FETCH APPLICANT'S TRACKER DATA
// ---------------------------------------------------------
app.get('/api/applicant/:id/applications', async (req, res) => {
    const userId = req.params.id;

    try {
        // Use a JOIN to get the job title and company name alongside the application status
        const [applications] = await db.execute(`
            SELECT 
                a.id as application_id, a.status, a.applied_at,
                j.job_title, j.company_name
            FROM applications a
            JOIN job_postings j ON a.job_id = j.id
            WHERE a.applicant_id = ?
            ORDER BY a.applied_at DESC
        `, [userId]);

        res.status(200).json(applications);
    } catch (error) {
        console.error("Tracker Fetch Error:", error.message);
        res.status(500).json({ message: "Failed to fetch applications." });
    }
});

// ---------------------------------------------------------
// ROUTE: FETCH EMPLOYER PROFILE
// ---------------------------------------------------------
app.get('/api/employer/:id/profile', async (req, res) => {
    const userId = req.params.id;

    try {
        const [rows] = await db.execute(`
            SELECT u.email, u.phone, u.verification_status, 
                   e.company_name, e.industry, e.job_role, e.workplace_address
            FROM users u
            JOIN employer_profiles e ON u.id = e.user_id
            WHERE u.id = ?
        `, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Employer profile not found." });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Employer Profile Error:", error.message);
        res.status(500).json({ message: "Server error fetching profile." });
    }
});

// ---------------------------------------------------------
// ROUTE: FETCH EMPLOYER'S JOB POSTINGS
// ---------------------------------------------------------
app.get('/api/employer/:id/jobs', async (req, res) => {
    const userId = req.params.id;

    try {
        const [jobs] = await db.execute(`
            SELECT * FROM job_postings WHERE employer_id = ? ORDER BY created_at DESC
        `, [userId]);

        res.status(200).json(jobs);
    } catch (error) {
        console.error("Fetch Jobs Error:", error.message);
        res.status(500).json({ message: "Failed to fetch jobs." });
    }
});

// ---------------------------------------------------------
// ROUTE: CREATE A NEW JOB POSTING
// ---------------------------------------------------------
app.post('/api/jobs/create', async (req, res) => {
    const { employer_id, job_title, company_name, job_description, required_skills, provided_accommodations, latitude, longitude } = req.body;

    try {
        await db.execute(`
            INSERT INTO job_postings 
            (employer_id, job_title, company_name, job_description, required_skills, provided_accommodations, latitude, longitude, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')
        `, [
            employer_id, job_title, company_name, job_description, 
            JSON.stringify(required_skills || []), 
            JSON.stringify(provided_accommodations || []), 
            latitude || null, longitude || null
        ]);

        res.status(201).json({ message: "Job posted successfully!" });
    } catch (error) {
        console.error("Job Creation Error:", error.message);
        res.status(500).json({ message: "Failed to create job posting." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is officially running on http://localhost:${PORT}`);
});