const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./config/db');
const multer = require('multer'); 
const path = require('path'); 
const helmet = require('helmet');
require('dotenv').config();

const nodemailer = require('nodemailer');

// 1. Configure the Email Transporter
// NOTE: If using Gmail, you MUST use an "App Password", not your normal password!
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ableworksys5i@gmail.com',
    pass: 'dans ixce pffc cykq'    
  }
});


async function sendNotification(userId, title, message, type) {
  try {
    // A. Clean up message for the in-app bell feed (removes the login prompt)
    let inAppMessage = message.replace(/Please log in to your AbleWork dashboard for more details\./gi, '').trim();
    if (inAppMessage.endsWith('.')) {
      inAppMessage = inAppMessage.slice(0, -1); // Remove trailing dot temporarily to append context cleanly
    }
    
    // Customize the in-app text based on notification type
    if (type === 'match') {
      inAppMessage += '. Check your Smart Matches tab for details.';
    } else {
      inAppMessage += '. Check your Job Tracker for details.';
    }

    // Insert the clean message into the database for the bell feed
    await db.execute(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
      [userId ?? null, title ?? null, inAppMessage ?? null, type ?? 'general']
    );

    // B. Fetch the User's Email from the users table
    const [users] = await db.execute("SELECT email FROM users WHERE id = ?", [userId ?? null]);
    
    if (users.length > 0 && users[0].email) {
      // C. Send the actual email safely inside its own try/catch block
      try {
        await transporter.sendMail({
          from: '"AbleWork Notifications" <ableworksys5i@gmail.com>',
          to: users[0].email,
          subject: title,
          text: message
        });
      } catch (mailError) {
        console.error("Nodemailer Email Dispatch Error:", mailError.message);
      }
    }
  } catch (error) {
    console.error("Failed to send notification:", error.message);
  }
}

const { OpenAI } = require('openai');

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini using your secret key from Google AI Studio
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
// HELPER: Fetch Live User Context for ABBY
// ---------------------------------------------------------
async function getUserLiveContext(userId, role) {
    let contextSummary = { role };

    try {
        if (role === 'employer') {
            // 1. Fetch Employer Profile & Job Stats
            const [profile] = await db.execute(
                `SELECT company_name, industry FROM employer_profiles WHERE user_id = ?`,
                [userId]
            );
            const [jobs] = await db.execute(
                `SELECT id, job_title, status, created_at FROM job_postings WHERE employer_id = ?`,
                [userId]
            );
            // Note: Your table is named `applications`
            const [apps] = await db.execute(
                `SELECT a.status, COUNT(*) as count 
                 FROM applications a 
                 JOIN job_postings j ON a.job_id = j.id 
                 WHERE j.employer_id = ? 
                 GROUP BY a.status`,
                [userId]
            );

            const activeJobs = jobs.filter(j => j.status === 'Active');
            contextSummary.company = profile[0]?.company_name || 'Your Company';
            contextSummary.totalJobs = jobs.length;
            contextSummary.activeJobsCount = activeJobs.length;
            contextSummary.activeJobTitles = activeJobs.map(j => j.job_title);
            contextSummary.applicationPipeline = apps;

        } else if (role === 'applicant') {
            // 2. Fetch Applicant Profile & Application History
            const [profile] = await db.execute(
                `SELECT a.firstname, a.lastname, a.skills, a.accommodations_needed, u.verification_status, u.rejection_reason 
                 FROM applicant_profiles a 
                 JOIN users u ON a.user_id = u.id 
                 WHERE a.user_id = ?`,
                [userId]
            );
            const [apps] = await db.execute(
                `SELECT j.job_title, j.company_name, a.status, a.applied_at 
                 FROM applications a 
                 JOIN job_postings j ON a.job_id = j.id 
                 WHERE a.applicant_id = ? 
                 ORDER BY a.applied_at DESC LIMIT 5`,
                [userId]
            );

            contextSummary.name = profile[0]?.firstname || 'Job Seeker';
            contextSummary.skills = JSON.parse(profile[0]?.skills || '[]');
            contextSummary.accommodations = JSON.parse(profile[0]?.accommodations_needed || '[]');
            contextSummary.verificationStatus = profile[0]?.verification_status;
            contextSummary.rejectionReason = profile[0]?.rejection_reason;
            contextSummary.recentApplications = apps;
        }
    } catch (err) {
        console.error("Error fetching live context for ABBY:", err.message);
    }

    return contextSummary;
}


// ---------------------------------------------------------
// ROUTE: Abby AI Chatbot Engine (Powered by Gemini + RAG)
// ---------------------------------------------------------
app.post('/api/chat', async (req, res) => {
    // We now expect the frontend to send the user's ID, role, and chat history!
    const { message, userId, role, conversationHistory = [] } = req.body;
    console.log(`Received message for Abby from ${role || 'Guest'} ${userId || ''}:`, message);

    try {
        // 1. Retrieve real-time database state if the user is logged in
        let liveContext = {};
        if (userId && role) {
            liveContext = await getUserLiveContext(userId, role);
        }

        // 2. Inject this live data directly into ABBY's brain
        const systemInstruction = `
        You are Abby, the official AI assistant for AbleWork, a job application platform connecting Persons with Disabilities (PWD) to inclusive employers. 
        
        TONE: Your tone must be highly encouraging and warm. Always offer words of affirmation to boost the user's confidence. Keep answers direct, concise, and to the point. Do not ramble.
        
        CURRENT LIVE DATABASE STATE FOR THIS USER:
        ${JSON.stringify(liveContext, null, 2)}
        
        CRITICAL INSTRUCTIONS ON PLATFORM PROCESSES (Use this to explain how the app works):

        1. REGISTRATION & VERIFICATION:
        - Applicants must upload a valid PWD ID. Employers must upload Business Registration (DTI/SEC/Permit).
        - After registration, accounts are 'Pending'. An Admin must review and approve the documents.
        - Users cannot apply for jobs or post jobs until their account is 'Approved'.

        2. VERIFICATION REJECTIONS & SECURITY COOLDOWNS:
        - If an Admin rejects a verification document (e.g., blurry ID, expired permit), the user's account is locked.
        - A strict 7-day security cooldown is enforced. The user cannot resubmit a new document until the 7 days expire.
        - Once the countdown reaches 0, they can upload a new document from their profile, returning their status to 'Pending'.

        3. THE SMART MATCHING ENGINE (How Jobs are Matched):
        - Distance (Geofencing): Applicants set a max travel radius. If an employer's office is outside this radius, the job is completely hidden from the applicant.
        - Accommodations (Dealbreaker): Employers must guarantee ALL the accommodations an applicant requires (e.g., Wheelchair Access, Screen Reader). If even one is missing, the job is not matched.
        - Accepted Disabilities (Dealbreaker): Employers explicitly select which disabilities they are equipped to support (e.g., Deafness, Amputation, Wheelchair User). The applicant's disability must be on this list to match.
        - Skills (Scoring): The system calculates a match percentage based on how many of the applicant's skills match the employer's required skills.

        4. JOB POSTING (For Employers):
        - Employers type required skills, input guaranteed accommodations (comma-separated), and select specific disability categories they can support.
        - If an employer archives a job, it completely disappears from the active UI for applicants.

        5. APPLYING & TRACKING (For Applicants):
        - To apply, the applicant must click on a job from their 'Smart Matches' or 'Explore Jobs' tab, upload their resume, and submit.
        - Applications start as 'Under Review'. Employers can change the status to 'Shortlisted' or 'Rejected' and leave custom feedback messages for the applicant to read in their Job Tracker.

        6. PLATFORM ACCESSIBILITY FEATURES:
        - If a user struggles to read the screen, tell them to use the Accessibility Toolbar (the floating blue icon at the bottom left).
        - They can switch the Display Theme to 'High Contrast' mode and adjust the Font Size up to 'A++' for maximum readability.

        RULES FOR ANSWERING:
        1. Use the LIVE DATABASE STATE above to accurately answer questions about their account, active jobs, applications, or profile.
        2. If they ask about an active count or specific status (e.g. "How many active jobs do I have?"), give the exact numbers from the data immediately in the first sentence.
        3. If they ask about something not present in their data, state that clearly without guessing.
        4. Applying & Uploading Resumes: To upload a resume, the user MUST click on the specific job they want to apply for.
        5. Archived Jobs: If an employer archives a job, it completely disappears from the active UI.`;

        // 3. Initialize the model 
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3-flash-preview", 
            systemInstruction 
        });

        // 4. Format previous conversation history so ABBY remembers context
        const formattedHistory = conversationHistory.map(turn => ({
            role: turn.sender === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }]
        }));

        // 5. Start the chat with history and send the new message
        const chat = model.startChat({
            history: formattedHistory,
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        res.status(200).json({ reply: responseText });
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        res.status(500).json({ reply: "I'm having trouble connecting right now. Please check my API connection." });
    }
});

// ---------------------------------------------------------
// ROUTE: Fetch Active Jobs (Explore Tab)
// ---------------------------------------------------------
app.get('/api/jobs', async (req, res) => {
    try {
        const [jobs] = await db.execute(`
            SELECT jp.*, u.email AS contact_email, u.phone AS contact_number 
            FROM job_postings jp
            LEFT JOIN users u ON jp.employer_id = u.id
            WHERE jp.status = 'Active' 
            ORDER BY jp.created_at DESC
        `);
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Fetch All Jobs Error:", error.message);
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
                u.email, 
                u.phone, 
                u.verification_status, 
                u.rejection_reason,
                u.rejection_timestamp,
                a.firstname, 
                a.middlename, 
                a.lastname, 
                a.birthdate, 
                a.disability_type, 
                a.residential_address,
                a.latitude, 
                a.longitude, 
                a.travel_radius_km, 
                a.workplace_independence, 
                a.accommodations_needed, 
                a.skills, 
                a.pwd_document_path
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
                [
                    email, 
                    phone, 
                    hashedPassword, 
                    'default', // <-- FIXED: Removed 'uiPreference' and just hardcoded 'default'
                    'Pending', 
                    'applicant'
                ]
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
                    accommodations || '[]', 
                    skills || '[]',         
                    pwdDocumentPath         
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
// 1. ADDED: upload.single('verificationDocument')
app.post('/api/auth/register/employer', upload.single('verificationDocument'), async (req, res) => {
    console.log("--- INCOMING EMPLOYER REGISTRATION ---");
    
    // 2. REMOVED: documentName (we don't need the string, we need the actual file)
    const { 
        companyName, companyDescription, email, phone, password, industry, 
        jobRole, address, latitude, longitude 
    } = req.body;

    // 3. ADDED: Grab the newly saved file's name from Multer
    const documentFilename = req.file ? req.file.filename : null;

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

            // STEP B: Insert into `employer_profiles` using the real filename
            await connection.execute(
                `INSERT INTO employer_profiles 
                (user_id, company_name, company_description, industry, job_role, workplace_address, latitude, longitude, verification_document) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    newUserId, companyName, companyDescription, industry, jobRole, 
                    address, latitude || null, longitude || null, documentFilename 
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
// ROUTE: SMART MATCHING ENGINE (Case-Insensitive & Bulletproof)
// ---------------------------------------------------------
app.get('/api/applicant/:id/matches', async (req, res) => {
    const userId = req.params.id;

    try {
        const [applicantRows] = await db.execute(`
            SELECT latitude, longitude, travel_radius_km, accommodations_needed, skills, disability_type 
            FROM applicant_profiles 
            WHERE user_id = ?
        `, [userId]);

        if (applicantRows.length === 0) return res.status(404).json({ message: "Applicant not found." });
        const applicant = applicantRows[0];

        // --- BULLETPROOF PARSER ---
        const safeParse = (data) => {
            if (!data) return [];
            if (Array.isArray(data)) return data;
            let parsed = data;
            while (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('"'))) {
                try { parsed = JSON.parse(parsed); } catch (e) { break; }
            }
            if (Array.isArray(parsed)) return parsed;
            if (typeof parsed === 'string') {
                const cleaned = parsed.replace(/[\[\]"\\]/g, ''); 
                return cleaned.split(',').map(item => item.trim()).filter(item => item);
            }
            return [];
        };

        // Convert everything to Lowercase for strict, format-free comparison!
        const appSkills = safeParse(applicant.skills).map(s => s.toLowerCase());
        const appAccommodations = safeParse(applicant.accommodations_needed).map(a => a.toLowerCase());
        const appDisabilities = safeParse(applicant.disability_type).map(d => d.toLowerCase()); 
        const maxRadius = Number(applicant.travel_radius_km) || 5; 

        const [jobs] = await db.execute(`
            SELECT jp.id, jp.employer_id, jp.job_title, jp.company_name, jp.job_description, 
                   jp.required_skills, jp.provided_accommodations, jp.accepted_disabilities, 
                   jp.salary_range, jp.benefits, jp.latitude, jp.longitude, 
                   u.email AS contact_email, u.phone AS contact_number 
            FROM job_postings jp
            LEFT JOIN users u ON jp.employer_id = u.id
            WHERE jp.status = 'Active'
        `);

        let matchedJobs = [];

        for (let job of jobs) {
            
            // A. Geofencing & Distance Score
            let distance = 0;
            let distanceScore = 40; 

            if (applicant.latitude && applicant.longitude && job.latitude && job.longitude) {
                const R = 6371; 
                const dLat = (job.latitude - applicant.latitude) * (Math.PI / 180);
                const dLon = (job.longitude - applicant.longitude) * (Math.PI / 180);
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                          Math.cos(applicant.latitude * (Math.PI / 180)) * Math.cos(job.latitude * (Math.PI / 180)) * 
                          Math.sin(dLon / 2) * Math.sin(dLon / 2); 
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
                distance = R * c;
                
                if (distance > maxRadius) continue; 

                distanceScore = Math.max(0, 40 - ((distance / maxRadius) * 40));
            }

            // B. Accommodation Strict Dealbreaker (Aligns with Notification Engine)
            const jobAccommodations = safeParse(job.provided_accommodations).map(a => a.toLowerCase());
            const meetsAllNeeds = appAccommodations.every(need => jobAccommodations.includes(need));
            if (!meetsAllNeeds) continue; // If the job doesn't provide all required accommodations, skip it!

            // C. Disability Match Check (Case-Insensitive Dealbreaker)
            const jobAcceptedDisabilities = safeParse(job.accepted_disabilities).map(d => d.toLowerCase());
            const isDisabilitySupported = appDisabilities.some(disability => 
                jobAcceptedDisabilities.includes(disability)
            );
            if (jobAcceptedDisabilities.length > 0 && !isDisabilitySupported) continue;

            // D. Skill Scoring
            const jobSkills = safeParse(job.required_skills).map(s => s.toLowerCase());
            let matchingSkillsCount = 0;
            
            appSkills.forEach(skill => {
                if (jobSkills.includes(skill)) matchingSkillsCount++;
            });

            const skillScore = jobSkills.length > 0 ? (matchingSkillsCount / jobSkills.length) * 60 : 60; 
            const overallMatchPercentage = Math.round(skillScore + distanceScore);

            if (overallMatchPercentage < 50) continue;
            
            matchedJobs.push({
                ...job,
                distance_km: distance ? distance.toFixed(1) : null,
                matching_skills_count: matchingSkillsCount,
                match_percentage: overallMatchPercentage,
                total_required_skills: jobSkills.length
            });
        }

        matchedJobs.sort((a, b) => {
            if (b.match_percentage !== a.match_percentage) return b.match_percentage - a.match_percentage; 
            return a.distance_km - b.distance_km;
        });

        res.status(200).json(matchedJobs);

    } catch (error) {
        console.error("Smart Engine Error:", error.message);
        res.status(500).json({ message: "Error running matching algorithm." });
    }
});

// ---------------------------------------------------------
// ROUTE: SUBMIT A JOB APPLICATION (With Resume Upload)
// ---------------------------------------------------------
// Note: We added upload.single('resume') here!
app.post('/api/applications/apply', upload.single('resume'), async (req, res) => {
    // Because we use FormData on the frontend, data is in req.body
    const { applicant_id, job_id, cover_letter } = req.body;
    
    // Multer saves the file and provides the path
    const resumePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!applicant_id || !job_id) {
        return res.status(400).json({ message: "Missing applicant or job ID." });
    }

    if (!resumePath) {
        return res.status(400).json({ message: "A resume file is required to apply." });
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

        // Insert the application with the resume path and cover letter
        await db.execute(
            'INSERT INTO applications (applicant_id, job_id, status, resume_path, cover_letter) VALUES (?, ?, ?, ?, ?)',
            [applicant_id, job_id, 'Under Review', resumePath, cover_letter || null]
        );
        // 1. Get the Job Title and Employer ID
        const [jobRows] = await db.execute(
            "SELECT employer_id, job_title FROM job_postings WHERE id = ?", 
            [job_id] 
        );
        
        if (jobRows.length > 0) {
            const employerId = jobRows[0].employer_id;
            const jobTitle = jobRows[0].job_title;

            // 2. Get the Applicant's Name
            const [appRows] = await db.execute(
                "SELECT firstname, lastname FROM applicant_profiles WHERE user_id = ?", 
                [applicant_id] 
            );
            const applicantName = appRows.length > 0 ? `${appRows[0].firstname} ${appRows[0].lastname}` : "A new candidate";

            // 3. Trigger the Notification & Email to the EMPLOYER!
            const alertTitle = `New Application: ${jobTitle}`;
            const alertMessage = `${applicantName} has just applied for your open ${jobTitle} role! Log in to your AbleWork dashboard to review their resume and pitch.`;

            await sendNotification(employerId, alertTitle, alertMessage, 'application');
        }
        
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
        // Use a JOIN to get the job title, company name, AND employer message
        const [applications] = await db.execute(`
            SELECT 
                a.id as application_id, a.status, a.applied_at, a.employer_message, 
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
            SELECT u.email, 
                    u.phone, 
                    u.verification_status, 
                    u.rejection_reason,
                    u.rejection_timestamp,
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

        // --- NEW: 4. Generate Last 7 Days Application Data for Recharts ---
        
        // A. Fetch all applications from the last 7 days
        const [recentApps] = await db.execute(
            `SELECT a.applied_at 
             FROM applications a
             JOIN job_postings j ON a.job_id = j.id
             WHERE j.employer_id = ? 
               AND a.applied_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)`,
             [employerId]
        );

        // B. Dynamically build the 7-day array to ensure empty days equal 0
        const chartData = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Loop backwards from 6 days ago to today (0)
        for (let i = 6; i >= 0; i--) {
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() - i);
            
            // Count how many applications in the SQL results match this specific day
            const dailyCount = recentApps.filter(row => {
                const rowDate = new Date(row.applied_at);
                return rowDate.getDate() === targetDate.getDate() && 
                       rowDate.getMonth() === targetDate.getMonth() &&
                       rowDate.getFullYear() === targetDate.getFullYear();
            }).length;

            chartData.push({
                name: dayNames[targetDate.getDay()], // Converts day number to 'Mon', 'Tue', etc.
                applications: dailyCount
            });
        }

        // 5. Send everything to the frontend
        res.status(200).json({
            activeJobs: activeJobs[0].count || 0,
            pendingApps: appStats[0].pending_count || 0,
            shortlistedApps: appStats[0].shortlisted_count || 0,
            recentActivity: recentActivity,
            chartData: chartData // <-- The new analytics array is now sent to React!
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

    const { 
        employer_id, job_title, company_name, job_description, 
        required_skills, provided_accommodations, accepted_disabilities,
        salary_range, benefits, latitude, longitude 
    } = req.body;

    try {

        const [users] = await db.execute('SELECT verification_status FROM users WHERE id = ?', [employer_id]);
        
        if (users.length === 0 || users[0].verification_status !== 'Approved') {
            return res.status(403).json({ message: "You must be an approved employer to post jobs." });
        }


        const [result] = await db.execute(
            `INSERT INTO job_postings 
             (employer_id, job_title, company_name, job_description, required_skills, provided_accommodations, accepted_disabilities, salary_range, benefits, latitude, longitude, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
            [
                employer_id ?? null, 
                job_title ?? null, 
                company_name ?? null, 
                job_description ?? null, 
                required_skills ? JSON.stringify(required_skills) : '[]', 
                provided_accommodations ? JSON.stringify(provided_accommodations) : '[]', 
                accepted_disabilities ? JSON.stringify(accepted_disabilities) : '[]', 
                salary_range ?? null,                       
                benefits ? JSON.stringify(benefits) : '[]', 
                latitude ?? null, 
                longitude ?? null
            ]
        );

        const newJobId = result.insertId;

        try {
            const [newJobRows] = await db.execute("SELECT * FROM job_postings WHERE id = ?", [newJobId]);
            if (newJobRows.length > 0) {
                const job = newJobRows[0];

                const [applicants] = await db.execute(`
                    SELECT ap.*, u.id as user_id 
                    FROM applicant_profiles ap 
                    JOIN users u ON ap.user_id = u.id 
                    WHERE u.verification_status = 'Approved'
                `);

                const safeParse = (data) => {
                    if (!data) return [];
                    if (Array.isArray(data)) return data;
                    let parsed = data;
                    while (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('"'))) {
                        try { parsed = JSON.parse(parsed); } catch (e) { break; }
                    }
                    if (Array.isArray(parsed)) return parsed;
                    if (typeof parsed === 'string') {
                        const cleaned = parsed.replace(/[\[\]"\\]/g, ''); 
                        return cleaned.split(',').map(item => item.trim()).filter(item => item);
                    }
                    return [];
                };

                const jobAccommodations = safeParse(job.provided_accommodations).map(a => a.toLowerCase());
                const jobAcceptedDisabilities = safeParse(job.accepted_disabilities).map(d => d.toLowerCase());
                const jobSkills = safeParse(job.required_skills).map(s => s.toLowerCase());

for (let applicant of applicants) {
                    const appRadius = Number(applicant.travel_radius_km) || 5;
                    const appAccommodations = safeParse(applicant.accommodations_needed).map(a => a.toLowerCase());
                    
                    // FIXED: Properly handle string-based disability_type from applicant_profiles
                    const applicantDisabilityStr = (applicant.disability_type || "").toLowerCase();
                    
                    const appSkills = safeParse(applicant.skills).map(s => s.toLowerCase());

                    let distance = 0;
                    let distanceScore = 40;
                    if (applicant.latitude && applicant.longitude && job.latitude && job.longitude) {
                        const R = 6371;
                        const dLat = (job.latitude - applicant.latitude) * (Math.PI / 180);
                        const dLon = (job.longitude - applicant.longitude) * (Math.PI / 180);
                        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                  Math.cos(applicant.latitude * (Math.PI / 180)) * Math.cos(job.latitude * (Math.PI / 180)) * 
                                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                        distance = R * c;

                        if (distance > appRadius) continue;
                        distanceScore = Math.max(0, 40 - ((distance / appRadius) * 40));
                    }

                    // A. Accommodations Dealbreaker Check
                    const meetsAllNeeds = appAccommodations.every(need => jobAccommodations.includes(need));
                    if (!meetsAllNeeds) continue;

                    // B. Disability Check (Ensures the applicant's disability type matches one accepted by the job)
                    const isDisabilitySupported = jobAcceptedDisabilities.length === 0 || jobAcceptedDisabilities.some(d => applicantDisabilityStr.includes(d));
                    if (!isDisabilitySupported) continue;

                    // C. Skill Scoring
                    let matchingSkillsCount = 0;
                    appSkills.forEach(skill => {
                        if (jobSkills.includes(skill)) matchingSkillsCount++;
                    });
                    const skillScore = jobSkills.length > 0 ? (matchingSkillsCount / jobSkills.length) * 60 : 60;
                    const overallMatchPercentage = Math.round(skillScore + distanceScore);

                    // D. Fire notification if score is >= 50%
                    if (overallMatchPercentage >= 50) {
                        const alertTitle = `New Smart Match: ${job.job_title}`;
                        const alertMessage = `Great news! A new opening for ${job.job_title} at ${job.company_name} matches your profile with a ${overallMatchPercentage}% score.`;
                        
                        await sendNotification(applicant.user_id, alertTitle, alertMessage, 'match');
                    }
                }
            }
        } catch (matchError) {
            console.error("Smart Match Notification Error:", matchError.message);
        }
     

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
    const { 
        job_title, job_description, required_skills, 
        provided_accommodations, accepted_disabilities, 
        salary_range, benefits 
    } = req.body;

    try {
        await db.execute(
            `UPDATE job_postings 
             SET job_title = ?, job_description = ?, required_skills = ?, provided_accommodations = ?, accepted_disabilities = ?, salary_range = ?, benefits = ? 
             WHERE id = ?`,
            [
                job_title, 
                job_description, 
                JSON.stringify(required_skills || []), 
                JSON.stringify(provided_accommodations || []), 
                JSON.stringify(accepted_disabilities || []), // <-- Added to update query
                salary_range ?? null,
                JSON.stringify(benefits || []),
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
            SELECT a.id as application_id, a.applicant_id, a.status as application_status, a.applied_at,
                   a.resume_path, a.cover_letter, 
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
// ROUTE: UPDATE APPLICATION STATUS & ADD NEXT STEPS
// ---------------------------------------------------------
app.put('/api/applications/:id/status', async (req, res) => {
    const applicationId = req.params.id;
    const { status, applicant_id, job_title, company_name } = req.body; 

    try {
        // 1. Update status in database
        await db.execute("UPDATE applications SET status = ? WHERE id = ?", [status, applicationId]);

        // 2. Trigger the notification & email
        const alertTitle = `Application Status Update: ${status}`;
        const alertMessage = `Hello! Your application for the ${job_title} role at ${company_name} has been marked as ${status}. Please log in to your AbleWork dashboard for more details.`;
        
        await sendNotification(applicant_id, alertTitle, alertMessage, 'update');

        res.status(200).json({ message: "Status updated and applicant notified!" });
    } catch (error) {
        console.error("Status Update Error:", error.message);
        res.status(500).json({ error: "Failed to update status." });
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

// ---------------------------------------------------------
// ROUTE: UPDATE APPLICANT PROFILE
// ---------------------------------------------------------
app.put('/api/applicant/:id/profile', async (req, res) => {
    const userId = req.params.id;
    const { 
        residential_address, latitude, longitude, travel_radius_km, 
        workplace_independence, accommodations_needed, skills, disability_type 
    } = req.body;

    try {
        await db.execute(
            `UPDATE applicant_profiles 
             SET residential_address = ?, latitude = ?, longitude = ?, travel_radius_km = ?, 
                 workplace_independence = ?, accommodations_needed = ?, skills = ?, disability_type = ? 
             WHERE user_id = ?`,
            [
                residential_address, 
                latitude || null, 
                longitude || null, 
                travel_radius_km, 
                workplace_independence, 
                JSON.stringify(accommodations_needed), 
                JSON.stringify(skills),
                disability_type,
                userId
            ]
        );
        res.status(200).json({ message: "Profile updated successfully." });
    } catch (error) {
        console.error("Profile Update Error:", error.message);
        res.status(500).json({ message: "Server error updating profile." });
    }
});

// =========================================================
//                  ADMIN PANEL ROUTES
// =========================================================

// 1. Fetch High-Level Platform Statistics (Updated to count pending applicants)
app.get('/api/admin/stats', async (req, res) => {
    try {
        const [applicantCount] = await db.execute(`SELECT COUNT(*) as count FROM users WHERE role = 'applicant'`);
        const [employerCount] = await db.execute(`SELECT COUNT(*) as count FROM users WHERE role = 'employer'`);
        const [activeJobs] = await db.execute(`SELECT COUNT(*) as count FROM job_postings WHERE status = 'Active'`);
        const [pendingEmpVerifications] = await db.execute(`SELECT COUNT(*) as count FROM users WHERE role = 'employer' AND verification_status = 'Pending'`);
        const [pendingAppVerifications] = await db.execute(`SELECT COUNT(*) as count FROM users WHERE role = 'applicant' AND verification_status = 'Pending'`);

        res.status(200).json({
            totalApplicants: applicantCount[0].count,
            totalEmployers: employerCount[0].count,
            activeJobs: activeJobs[0].count,
            pendingEmployers: pendingEmpVerifications[0].count,
            pendingApplicants: pendingAppVerifications[0].count
        });
    } catch (error) {
        console.error("Admin Stats Error:", error.message);
        res.status(500).json({ message: "Failed to fetch admin statistics." });
    }
});

// 2. Fetch ALL Employers (Pending, Approved, Rejected, Disabled)
app.get('/api/admin/employers/all', async (req, res) => {
    try {
        const [employers] = await db.execute(`
            SELECT u.id as user_id, u.email, u.created_at, u.verification_status, IFNULL(u.account_status, 'Active') as account_status,
                   e.company_name, e.industry, e.verification_document
            FROM users u
            JOIN employer_profiles e ON u.id = e.user_id
            WHERE u.role = 'employer'
            ORDER BY u.created_at DESC
        `);
        res.status(200).json(employers);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch employers." });
    }
});

// 3. Fetch ALL Applicants (Pending, Approved, Rejected, Disabled)
app.get('/api/admin/applicants/all', async (req, res) => {
    try {
        const [applicants] = await db.execute(`
            SELECT u.id as user_id, u.email, u.created_at, u.verification_status, IFNULL(u.account_status, 'Active') as account_status,
                   a.firstname, a.lastname, a.disability_type, a.pwd_document_path
            FROM users u
            JOIN applicant_profiles a ON u.id = a.user_id
            WHERE u.role = 'applicant'
            ORDER BY u.created_at DESC
        `);
        res.status(200).json(applicants);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch applicants." });
    }
});

// 4. Approve/Reject ANY User (Applicant or Employer)
app.put('/api/admin/users/:id/verify', async (req, res) => {
    const { id } = req.params;
    const { status, rejection_reason } = req.body; 

    try {
        if (status === 'Rejected') {
            // Apply rejection reason and set the cooldown timestamp
            await db.execute(
                `UPDATE users SET verification_status = ?, rejection_reason = ?, rejection_timestamp = NOW() WHERE id = ?`,
                [status, rejection_reason, id]
            );
        } else {
            // If approved, clear out any previous rejection data
            await db.execute(
                `UPDATE users SET verification_status = ?, rejection_reason = NULL, rejection_timestamp = NULL WHERE id = ?`,
                [status, id]
            );
        }
        
        res.status(200).json({ message: `User status updated to ${status}.` });
    } catch (error) {
        console.error("Verification Error:", error.message);
        res.status(500).json({ message: "Error updating user status." });
    }
});

// 5. Disable/Enable ANY Account
app.put('/api/admin/users/:id/account-status', async (req, res) => {
    const userId = req.params.id;
    const { account_status } = req.body;
    try {
        await db.execute(`UPDATE users SET account_status = ? WHERE id = ?`, [account_status, userId]);
        res.status(200).json({ message: `Account is now ${account_status}.` });
    } catch (error) {
        res.status(500).json({ message: "Failed to update account status." });
    }
});
//---------------------------------------------------------
// ROUTE: Create Admin Account
// ---------------------------------------------------------
app.get('/api/setup-admin', async (req, res) => {
    try {
        const adminEmail = "admin@ablework.com";
        const adminPassword = "admin123"; 
        
       
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [adminEmail]);
        if (existing.length > 0) {
            return res.status(200).json({ message: "Admin already exists!" });
        }

   
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
    
        await db.execute(
            `INSERT INTO users (email, phone, password_hash, ui_preference, verification_status, role) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [adminEmail, '000-000-0000', hashedPassword, 'default', 'Approved', 'admin']
        );

        res.status(201).json({ message: "Admin account created successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create admin" });
    }
});

// ---------------------------------------------------------
// ROUTE: ADMIN ANNUAL ANALYTICS (Users Only)
// ---------------------------------------------------------
app.get('/api/admin/analytics/annual', async (req, res) => {
    try {
        // Fetch User Growth by Month (Current Year)
        const [userGrowth] = await db.execute(`
            SELECT MONTH(created_at) as month, COUNT(*) as total 
            FROM users 
            WHERE YEAR(created_at) = YEAR(CURDATE())
            GROUP BY MONTH(created_at)
            ORDER BY month
        `);

        // Format data for Recharts [ { name: 'Jan', users: 10 }, ... ]
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedData = months.map((month, index) => {
            const userStat = userGrowth.find(u => u.month === index + 1);
            return {
                name: month,
                users: userStat ? userStat.total : 0
            };
        });

        res.status(200).json(formattedData);
    } catch (error) {
        console.error("Analytics Error:", error.message);
        res.status(500).json({ message: "Error fetching analytics." });
    }
});

// ---------------------------------------------------------
// ROUTE: GET POPULAR SKILLS FROM EMPLOYER POSTINGS
// ---------------------------------------------------------
app.get('/api/skills/popular', async (req, res) => {
    try {
        const [jobs] = await db.execute(`
            SELECT required_skills 
            FROM job_postings 
            WHERE status = 'Active'
        `);
        
        // --- ADD THE BULLETPROOF PARSER HERE ---
        const safeParse = (data) => {
            if (!data) return [];
            if (Array.isArray(data)) return data;
            let parsed = data;
            while (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('"'))) {
                try { parsed = JSON.parse(parsed); } catch (e) { break; }
            }
            if (Array.isArray(parsed)) return parsed;
            if (typeof parsed === 'string') {
                const cleaned = parsed.replace(/[\[\]"\\]/g, ''); 
                return cleaned.split(',').map(item => item.trim()).filter(item => item);
            }
            return [];
        };

        let skillCounts = {};
        
        jobs.forEach(job => {
            // USE SAFEPARSE INSTEAD OF JSON.PARSE
            const skills = safeParse(job.required_skills);
            
            // Now .forEach() will always work because safeParse ALWAYS returns an array!
            skills.forEach(skill => {
                if (skill) {
                    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                }
            });
        });

        const sortedSkills = Object.keys(skillCounts).sort((a, b) => skillCounts[b] - skillCounts[a]);

        res.status(200).json(sortedSkills);
    } catch (error) {
        console.error("Fetch Skills Error:", error.message);
        res.status(500).json({ message: "Error fetching popular skills." });
    }
});

// ---------------------------------------------------------
// ROUTE: USER RESUBMIT VERIFICATION DOCUMENT
// ---------------------------------------------------------
app.post('/api/users/:id/resubmit', upload.single('document'), async (req, res) => {
    const userId = req.params.id;
    
    // 1. CAPTURE CLIENT IP
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        // 2. IP RATE LIMITING (Max 3 reverification attempts per IP)
        // We sum all reverification attempts made from this specific IP address
        if (clientIp) {
            const [ipCheck] = await db.execute(
                'SELECT SUM(reverification_attempts) as total_attempts FROM users WHERE ip_address = ?', 
                [clientIp]
            );
            
            const attempts = ipCheck[0].total_attempts || 0;
            if (attempts >= 3) {
                return res.status(403).json({ 
                    message: "Security Lock: Maximum reverification attempts (3) reached for your network. Please contact support." 
                });
            }
        }

        // 3. Fetch the user's current status and rejection timestamp
        const [userRows] = await db.execute(`
            SELECT verification_status, rejection_timestamp 
            FROM users 
            WHERE id = ?
        `, [userId]);

        if (userRows.length === 0) return res.status(404).json({ message: "User not found." });
        const user = userRows[0];

        // 4. ENFORCE THE 7-DAY COOLDOWN
        if (user.verification_status === 'Rejected' && user.rejection_timestamp) {
            const rejectionDate = new Date(user.rejection_timestamp);
            const currentDate = new Date();
            
            const diffTime = Math.abs(currentDate - rejectionDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            if (diffDays <= 7) {
                const daysLeft = 8 - diffDays; 
                return res.status(403).json({ 
                    message: `Security Lock: You must wait ${daysLeft} more day(s) before resubmitting your document.` 
                });
            }
        }

        // 5. If they pass all checks, process the file and update the database
        const filePath = req.file.path; 
        
        // We increment the attempt counter, record the IP used, and clear the rejection status
        await db.execute(`
            UPDATE users 
            SET verification_document = ?, 
                verification_status = 'Pending', 
                rejection_reason = NULL, 
                rejection_timestamp = NULL,
                ip_address = ?,
                reverification_attempts = reverification_attempts + 1
            WHERE id = ?
        `, [filePath, clientIp, userId]);

        res.status(200).json({ message: "Document resubmitted successfully. Your account is back under review." });

    } catch (error) {
        console.error("Resubmit Error:", error.message);
        res.status(500).json({ message: "Error processing document." });
    }
});

// ---------------------------------------------------------
// ROUTE: UPDATE APPLICANT CREDENTIALS & SECURITY
// ---------------------------------------------------------
app.put('/api/applicant/:id/credentials', async (req, res) => {
    const userId = req.params.id;
    const { email, currentPassword, newPassword } = req.body;

    try {
        const [users] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: "User not found." });
        const user = users[0];

        // ACTION A: Update Password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required to set a new password." });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: "Incorrect current password." });
            }
            
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedNewPassword, userId]);
            return res.status(200).json({ message: "Password updated successfully." });
        } 
        
        // ACTION B: Update Email Only
        if (email && !newPassword) {
            await db.execute('UPDATE users SET email = ? WHERE id = ?', [email, userId]);
            return res.status(200).json({ message: "Email updated successfully." });
        }

        res.status(400).json({ message: "No valid updates provided." });
    } catch (error) {
        console.error("Credentials Update Error:", error.message);
        res.status(500).json({ message: "Server error updating credentials." });
    }
});


// ---------------------------------------------------------
// ROUTE: UPDATE EMPLOYER CREDENTIALS & SECURITY
// ---------------------------------------------------------
app.put('/api/employer/:id/credentials', async (req, res) => {
    const userId = req.params.id;
    const { email, currentPassword, newPassword } = req.body;

    try {
        const [users] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: "User not found." });
        const user = users[0];

        // ACTION A: Update Password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required to set a new password." });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: "Incorrect current password." });
            }
            
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedNewPassword, userId]);
            return res.status(200).json({ message: "Password updated successfully." });
        } 
        
        // ACTION B: Update Email Only
        if (email && !newPassword) {
            await db.execute('UPDATE users SET email = ? WHERE id = ?', [email, userId]);
            return res.status(200).json({ message: "Email updated successfully." });
        }

        res.status(400).json({ message: "No valid updates provided." });
    } catch (error) {
        console.error("Credentials Update Error:", error.message);
        res.status(500).json({ message: "Server error updating credentials." });
    }
});

// ---------------------------------------------------------
// ROUTE: DEACTIVATE ACCOUNT (Soft Disable)
// ---------------------------------------------------------
app.put('/api/users/:id/deactivate', async (req, res) => {
    const userId = req.params.id;
    try {
        await db.execute(`UPDATE users SET account_status = 'Disabled' WHERE id = ?`, [userId]);
        res.status(200).json({ message: "Account has been deactivated." });
    } catch (error) {
        res.status(500).json({ message: "Failed to deactivate account." });
    }
});

// ---------------------------------------------------------
// ROUTE: DELETE ACCOUNT (Strict Permanent Deletion)
// ---------------------------------------------------------
app.delete('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { password } = req.body;

    try {
        const [users] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: "User not found." });

        const isMatch = await bcrypt.compare(password, users[0].password_hash);
        if (!isMatch) return res.status(401).json({ message: "Incorrect password. Deletion aborted." });

        // Delete from both profile tables just to be safe (if a row doesn't exist, it just skips it)
        await db.execute('DELETE FROM applicant_profiles WHERE user_id = ?', [userId]);
        await db.execute('DELETE FROM employer_profiles WHERE user_id = ?', [userId]);
        // Note: Make sure your `applications` and `job_postings` tables use ON DELETE CASCADE, 
        // otherwise you'll need to manually delete those records here first!
        await db.execute('DELETE FROM users WHERE id = ?', [userId]);

        res.status(200).json({ message: "Account permanently deleted." });
    } catch (error) {
        console.error("Deletion Error:", error.message);
        res.status(500).json({ message: "Server error deleting account." });
    }
});

// ---------------------------------------------------------
// ROUTE: Fetch Applicant's Notifications
// ---------------------------------------------------------
app.get('/api/users/:id/notifications', async (req, res) => {
    try {
        const [notifications] = await db.execute(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", 
            [req.params.id]
        );
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notifications." });
    }
});

// ---------------------------------------------------------
// ROUTE: Mark Notification as Read
// ---------------------------------------------------------
app.put('/api/notifications/:id/read', async (req, res) => {
    try {
        await db.execute("UPDATE notifications SET is_read = TRUE WHERE id = ?", [req.params.id]);
        res.status(200).json({ message: "Marked as read." });
    } catch (error) {
        res.status(500).json({ error: "Failed to update notification." });
    }
});

// ---------------------------------------------------------
// ROUTE: REQUEST SECURITY OTP
// ---------------------------------------------------------
app.post('/api/users/:id/request-otp', async (req, res) => {
    const userId = req.params.id;
    const { email, type } = req.body;

    try {
        // 1. Generate a random 6-digit code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // 2. Set expiration for 15 minutes from now
        const expires = new Date(Date.now() + 15 * 60000); 

        // 3. Save OTP to the database for this user
        await db.execute(
            "UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?",
            [otpCode, expires, userId]
        );

        // 4. Send the email using your existing nodemailer transporter
        const subjectLine = type === 'email' ? 'Verify your new Email Address' : 'Verify your Password Change';
        const messageBody = `Hello!\n\nYour 6-digit AbleWork verification code is: ${otpCode}\n\nThis code will expire in 15 minutes. If you did not request this change, please ignore this email.`;

        await transporter.sendMail({
            from: '"AbleWork Security" <ableworksys5i@gmail.com>',
            to: email, // Sends to the new email if changing email, or current email if changing password
            subject: subjectLine,
            text: messageBody
        });

        res.status(200).json({ message: "Verification code sent successfully." });

    } catch (error) {
        console.error("Failed to generate OTP:", error.message);
        res.status(500).json({ message: "Server error sending verification code." });
    }
});

// ---------------------------------------------------------
// ROUTE: TOGGLE ACCOUNT ACTIVATION/DEACTIVATION
// ---------------------------------------------------------
app.put('/api/users/:id/toggle-status', async (req, res) => {
    const userId = req.params.id;
    const { action } = req.body; // Expects 'activate' or 'deactivate'

    try {
        // Determine the new status string based on the action
        const newStatus = action === 'deactivate' ? 'Deactivated' : 'Active';

        // Update the user's status in the database
        // Note: If your column is named just 'status' instead of 'account_status', change it here!
        await db.execute(
            "UPDATE users SET account_status = ? WHERE id = ?",
            [newStatus, userId]
        );

        res.status(200).json({ 
            message: `Account successfully ${newStatus.toLowerCase()}.`,
            status: newStatus
        });
    } catch (error) {
        console.error("Toggle Status Error:", error.message);
        res.status(500).json({ message: "Server error toggling account status." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is officially running on http://localhost:${PORT}`);
});