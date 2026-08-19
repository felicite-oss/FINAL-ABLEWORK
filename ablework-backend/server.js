const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./config/db');
const multer = require('multer'); 
const path = require('path'); 
const helmet = require('helmet');
require('dotenv').config();

const { OpenAI } = require('openai');

// Initialize OpenAI using your secret key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const app = express();

// Add this line to allow images to be loaded cross-origin
app.use(
  helmet.crossOriginResourcePolicy({ policy: "cross-origin" })
);

// 1. Open CORS for development
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Configure Multer to save uploaded files WITH their file extensions (.jpg, .png)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 3. Tell Express to serve the 'uploads' folder publicly so React can display the images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------------------------------------
// ROUTE: Abby AI Chatbot Engine
// ---------------------------------------------------------
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    console.log("Received message for Abby:", message);

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { 
                    role: "system", 
                    content: "You are Abby, a helpful, empathetic, and professional AI career assistant specialized in supporting Persons with Disabilities (PWD) in finding accessible employment opportunities." 
                },
                { role: "user", content: message }
            ],
        });

        const reply = completion.choices[0].message.content;
        res.status(200).json({ reply });
    } catch (error) {
        console.error("OpenAI Error:", error.message);
        res.status(500).json({ error: "Server error connecting to Abby AI." });
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
// ROUTE: LOGIN ALL USERS (Strict Role-Based)
// ---------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Find the user in the main table
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ error: "Invalid credentials." });
        const user = users[0];

        // 2. Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials." });

        // 3. Send the successful response WITH the strict DB role
        res.status(200).json({ 
            message: "Login successful", 
            user: { 
                id: user.id, 
                email: user.email, 
                ui_preference: user.ui_preference,
                verification_status: user.verification_status,
                role: user.role // Directly from the new database column!
            } 
        });

    } catch (error) {
        console.error("Login Error:", error.message);
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
            // STEP A: Insert core data into `users`
            const [userResult] = await connection.execute(
                `INSERT INTO users (email, phone, password_hash, ui_preference, verification_status, role) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [email, phone, hashedPassword, uiPreference || 'default', 'Pending', 'applicant']
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
    
    // Notice we added documentName here!
    const { 
        companyName, companyDescription, email, phone, password, industry, 
        jobRole, address, latitude, longitude, documentName 
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
            // STEP A: Insert core data into `users` 
            const [userResult] = await connection.execute(
                `INSERT INTO users (email, phone, password_hash, ui_preference, verification_status, role) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [email, phone, hashedPassword, 'default', 'Pending', 'employer']
            );

            const newUserId = userResult.insertId;

            // STEP B: Insert into `employer_profiles` including the document column
            await connection.execute(
                `INSERT INTO employer_profiles 
                (user_id, company_name, company_description, industry, job_role, workplace_address, latitude, longitude, verification_document) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    newUserId, companyName, companyDescription, industry, jobRole, 
                    address, latitude || null, longitude || null, documentName || null
                ]
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
        // Look at the SELECT below. We MUST include e.latitude and e.longitude!
        const [rows] = await db.execute(`
            SELECT u.email, u.phone, u.verification_status, 
                   e.company_name, e.industry, e.job_role, e.workplace_address,
                   e.company_description, e.latitude, e.longitude, e.company_logo 
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
// ROUTE: FETCH EMPLOYER DASHBOARD STATS
// ---------------------------------------------------------
app.get('/api/employer/:id/dashboard-stats', async (req, res) => {
    const employerId = req.params.id;

    try {
        // 1. Get Active Jobs (Strictly 'Active' so archived jobs disappear from UI)
        const [activeJobs] = await db.execute(
            `SELECT COUNT(*) as count FROM job_postings WHERE employer_id = ? AND status = 'Active'`, 
            [employerId]
        );

        // 2. Get Application Stats (Checking for both 'Pending' and 'Under Review')
        const [appStats] = await db.execute(
            `SELECT 
                SUM(CASE WHEN a.status IN ('Pending', 'Under Review') THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN a.status = 'Shortlisted' THEN 1 ELSE 0 END) as shortlisted_count
             FROM applications a
             JOIN job_postings j ON a.job_id = j.id
             WHERE j.employer_id = ?`,
             [employerId]
        );

        // 3. Get Recent Activity 
        // We use ap.firstname and ap.lastname to match your database!
        const [recentActivity] = await db.execute(
            `SELECT a.id, a.applied_at AS created_at, a.status, j.job_title, 
                    ap.firstname AS first_name, ap.lastname AS last_name
             FROM applications a
             JOIN job_postings j ON a.job_id = j.id
             JOIN applicant_profiles ap ON a.applicant_id = ap.user_id
             WHERE j.employer_id = ?
             ORDER BY a.applied_at DESC
             LIMIT 5`,
             [employerId]
        );

        res.status(200).json({
            activeJobs: activeJobs[0].count || 0,
            pendingApps: appStats[0].pending_count || 0,
            shortlistedApps: appStats[0].shortlisted_count || 0,
            recentActivity: recentActivity
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error.message);
        res.status(500).json({ message: "Server error fetching stats." });
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
// ROUTE: CREATE A JOB (Secured & Restricted)
// ---------------------------------------------------------
app.post('/api/jobs/create', async (req, res) => {
    // 1. We added salary_range and benefits to the req.body destructuring here
    const { 
        employer_id, job_title, company_name, job_description, 
        required_skills, provided_accommodations, salary_range, benefits, 
        latitude, longitude 
    } = req.body;

    try {
        // SECURITY CHECK: Ensure employer is Verified/Approved
        const [users] = await db.execute('SELECT verification_status FROM users WHERE id = ?', [employer_id]);
        
        if (users.length === 0 || users[0].verification_status !== 'Approved') {
            return res.status(403).json({ message: "You must be an approved employer to post jobs." });
        }

        // 2. INSERT JOB: Added the new columns to the query and the array below
        await db.execute(
            `INSERT INTO job_postings 
             (employer_id, job_title, company_name, job_description, required_skills, provided_accommodations, salary_range, benefits, latitude, longitude, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
            [
                employer_id ?? null, 
                job_title ?? null, 
                company_name ?? null, 
                job_description ?? null, 
                required_skills ? JSON.stringify(required_skills) : null, 
                provided_accommodations ? JSON.stringify(provided_accommodations) : null, 
                salary_range ?? null,                       // <-- NEW: Salary
                benefits ? JSON.stringify(benefits) : null, // <-- NEW: Benefits
                latitude ?? null, 
                longitude ?? null
            ]
        );
        res.status(201).json({ message: "Job posted successfully." });
    } catch (error) {
        console.error("Job Creation Error:", error.message);
        res.status(500).json({ message: "Server error posting job." });
    }
});

// ---------------------------------------------------------
// ROUTE: EDIT A JOB
// ---------------------------------------------------------
app.put('/api/jobs/:id', async (req, res) => {
    const jobId = req.params.id;
    // 1. Added salary_range and benefits here
    const { job_title, job_description, required_skills, provided_accommodations, salary_range, benefits } = req.body;

    try {
        // 2. Updated the SQL query to save the new fields
        await db.execute(
            `UPDATE job_postings 
             SET job_title = ?, job_description = ?, required_skills = ?, provided_accommodations = ?, salary_range = ?, benefits = ? 
             WHERE id = ?`,
            [
                job_title, 
                job_description, 
                JSON.stringify(required_skills), 
                JSON.stringify(provided_accommodations), 
                salary_range ?? null,
                benefits ? JSON.stringify(benefits) : null,
                jobId
            ]
        );
        res.status(200).json({ message: "Job updated successfully." });
    } catch (error) {
        console.error("Job Update Error:", error.message);
        res.status(500).json({ message: "Server error updating job." });
    }
});

// ---------------------------------------------------------
// ROUTE: ARCHIVE A JOB (Soft Delete)
// ---------------------------------------------------------
app.put('/api/jobs/:id/archive', async (req, res) => {
    const jobId = req.params.id;
    try {
        await db.execute(`UPDATE job_postings SET status = 'Archived' WHERE id = ?`, [jobId]);
        res.status(200).json({ message: "Job archived successfully." });
    } catch (error) {
        console.error("Archive Error:", error.message);
        res.status(500).json({ message: "Server error archiving job." });
    }
});

// ---------------------------------------------------------
// ROUTE: FETCH ALL APPLICATIONS FOR AN EMPLOYER
// ---------------------------------------------------------
app.get('/api/employer/:id/applications', async (req, res) => {
    const employerId = req.params.id;

    try {
        const [applications] = await db.execute(`
            SELECT a.id as application_id, a.status as application_status, a.applied_at,
                   j.job_title, j.id as job_id,
                   ap.firstname, ap.lastname, ap.skills, ap.accommodations_needed, ap.disability_type,
                   u.email, u.phone
            FROM applications a
            JOIN job_postings j ON a.job_id = j.id
            JOIN applicant_profiles ap ON a.applicant_id = ap.user_id
            JOIN users u ON ap.user_id = u.id
            WHERE j.employer_id = ?
            ORDER BY a.applied_at DESC
        `, [employerId]);

        res.status(200).json(applications);
    } catch (error) {
        console.error("Fetch Applications Error:", error.message);
        res.status(500).json({ message: "Server error fetching applications." });
    }
});

// ---------------------------------------------------------
// ROUTE: UPDATE APPLICATION STATUS
// ---------------------------------------------------------
app.put('/api/applications/:id/status', async (req, res) => {
    const applicationId = req.params.id;
    const { status } = req.body;

    try {
        await db.execute(
            `UPDATE applications SET status = ? WHERE id = ?`,
            [status, applicationId]
        );
        res.status(200).json({ message: `Applicant marked as ${status}.` });
    } catch (error) {
        console.error("Update Status Error:", error.message);
        res.status(500).json({ message: "Server error updating status." });
    }
});

// ---------------------------------------------------------
// ROUTE: UPDATE EMPLOYER PROFILE & LOGO
// ---------------------------------------------------------
app.put('/api/employer/:id/settings', upload.single('company_logo'), async (req, res) => {
    const userId = req.params.id;
    const { company_name, company_description, industry, email, latitude, longitude } = req.body;
    
    // If a new image was uploaded, we save its new path. Otherwise, we keep it undefined to ignore it in the SQL.
    const company_logo = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        // 1. Update the users table (for email)
        await db.execute(`UPDATE users SET email = ? WHERE id = ?`, [email, userId]);

        // 2. Update the employer_profiles table
        if (company_logo) {
            await db.execute(
                `UPDATE employer_profiles 
                 SET company_name = ?, company_description = ?, industry = ?, latitude = ?, longitude = ?, company_logo = ? 
                 WHERE user_id = ?`,
                [company_name, company_description, industry, latitude, longitude, company_logo, userId]
            );
        } else {
            await db.execute(
                `UPDATE employer_profiles 
                 SET company_name = ?, company_description = ?, industry = ?, latitude = ?, longitude = ? 
                 WHERE user_id = ?`,
                [company_name, company_description, industry, latitude, longitude, userId]
            );
        }

        res.status(200).json({ message: "Profile updated successfully", logo_url: company_logo });
    } catch (error) {
        console.error("Settings Update Error:", error.message);
        res.status(500).json({ message: "Server error updating profile." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is officially running on http://localhost:${PORT}`);
});