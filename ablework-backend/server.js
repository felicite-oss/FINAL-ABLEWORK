const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./config/db');
const multer = require('multer'); 
const path = require('path'); 
const helmet = require('helmet');
require('dotenv').config();

const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ableworksys5i@gmail.com',
    pass: 'dans ixce pffc cykq'    
  }
});


async function sendNotification(userId, title, message, type) {
  try {
    
    let inAppMessage = message.replace(/Please log in to your AbleWork dashboard for more details\./gi, '').trim();
    if (inAppMessage.endsWith('.')) {
      inAppMessage = inAppMessage.slice(0, -1); 
    }
    
    if (type === 'match') {
      inAppMessage += '. Check your Smart Matches tab for details.';
    } else {
      inAppMessage += '. Check your Job Tracker for details.';
    }

    await db.execute(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
      [userId ?? null, title ?? null, inAppMessage ?? null, type ?? 'general']
    );

    
    const [users] = await db.execute("SELECT email FROM users WHERE id = ?", [userId ?? null]);
    
    if (users.length > 0 && users[0].email) {
      
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


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();

app.use(
  helmet.crossOriginResourcePolicy({ policy: "cross-origin" })
);


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



async function getUserLiveContext(userId, role) {
    let contextSummary = { role };

    try {
        if (role === 'employer') {
            const [profile] = await db.execute(
                `SELECT company_name, industry FROM employer_profiles WHERE user_id = ?`,
                [userId]
            );
            const [jobs] = await db.execute(
                `SELECT id, job_title, status, created_at FROM job_postings WHERE employer_id = ?`,
                [userId]
            );
            
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
    const { message, userId, role, conversationHistory = [] } = req.body;
    console.log(`Received message for Abby from ${role || 'Guest'} ${userId || ''}:`, message);

    try {
        let liveContext = {};
        if (userId && role) {
            liveContext = await getUserLiveContext(userId, role);
        }

    
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

       
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3-flash-preview", 
            systemInstruction 
        });

        
        const formattedHistory = conversationHistory.map(turn => ({
            role: turn.sender === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }]
        }));

       
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
        
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ error: "Invalid credentials." });
        const user = users[0];

       
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials." });

       
        res.status(200).json({ 
            message: "Login successful", 
            user: { 
                id: user.id, 
                email: user.email, 
                ui_preference: user.ui_preference,
                verification_status: user.verification_status,
                role: user.role 
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


        let parsedSkills = [];
        let parsedAccommodations = [];
        
        try { parsedSkills = JSON.parse(profile.skills); } catch (e) {}
        try { parsedAccommodations = JSON.parse(profile.accommodations_needed); } catch (e) {}

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
    
    
    if (!req.body) {
        return res.status(400).json({ message: "No data received. Ensure you are sending FormData." });
    }

    const { 
        firstName, middleName, lastName, email, phone, password, birthdate, 
        address, latitude, longitude, radius, 
        independence, disabilities, accommodations, skills 
    } = req.body;


    const pwdDocumentPath = req.file ? req.file.path : null;

    try {
        const [existingUser] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [userResult] = await connection.execute(
                `INSERT INTO users (email, phone, password_hash, ui_preference, verification_status, role) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    email, 
                    phone, 
                    hashedPassword, 
                    'default', 
                    'Pending', 
                    'applicant'
                ]
            );

            const newUserId = userResult.insertId;
            const parsedDisabilities = JSON.parse(disabilities || '[]');
            const disabilityString = parsedDisabilities.join(', ');


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
app.post('/api/auth/register/employer', upload.single('verificationDocument'), async (req, res) => {
    console.log("--- INCOMING EMPLOYER REGISTRATION ---");
    
   
    const { 
        companyName, companyDescription, email, phone, password, industry, 
        jobRole, address, latitude, longitude 
    } = req.body;


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
            const [userResult] = await connection.execute(
                `INSERT INTO users (email, phone, password_hash, ui_preference, verification_status, role) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [email, phone, hashedPassword, 'default', 'Pending', 'employer']
            );

            const newUserId = userResult.insertId;


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
// HELPER: Haversine Formula 
// ---------------------------------------------------------
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; 
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
// ROUTE: SMART MATCHING ENGINE 
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
            
            // A. geofencing & distance score
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

            // B. accommodation 
            const jobAccommodations = safeParse(job.provided_accommodations).map(a => a.toLowerCase());
            const meetsAllNeeds = appAccommodations.every(need => jobAccommodations.includes(need));
            if (!meetsAllNeeds) continue; 

            // C. disability match check
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

app.post('/api/applications/apply', upload.single('resume'), async (req, res) => {

    const { applicant_id, job_id, cover_letter } = req.body;
    

    const resumePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!applicant_id || !job_id) {
        return res.status(400).json({ message: "Missing applicant or job ID." });
    }

    if (!resumePath) {
        return res.status(400).json({ message: "A resume file is required to apply." });
    }

    try {

        const [existing] = await db.execute(
            'SELECT id FROM applications WHERE applicant_id = ? AND job_id = ?', 
            [applicant_id, job_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: "You have already applied for this job." });
        }

        await db.execute(
            'INSERT INTO applications (applicant_id, job_id, status, resume_path, cover_letter) VALUES (?, ?, ?, ?, ?)',
            [applicant_id, job_id, 'Under Review', resumePath, cover_letter || null]
        );

        const [jobRows] = await db.execute(
            "SELECT employer_id, job_title FROM job_postings WHERE id = ?", 
            [job_id] 
        );
        
        if (jobRows.length > 0) {
            const employerId = jobRows[0].employer_id;
            const jobTitle = jobRows[0].job_title;

            const [appRows] = await db.execute(
                "SELECT firstname, lastname FROM applicant_profiles WHERE user_id = ?", 
                [applicant_id] 
            );
            const applicantName = appRows.length > 0 ? `${appRows[0].firstname} ${appRows[0].lastname}` : "A new candidate";

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
        const [activeJobs] = await db.execute(
            `SELECT COUNT(*) as count FROM job_postings WHERE employer_id = ? AND status = 'Active'`, 
            [employerId]
        );

        const [appStats] = await db.execute(
            `SELECT 
                SUM(CASE WHEN a.status IN ('Pending', 'Under Review') THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN a.status = 'Shortlisted' THEN 1 ELSE 0 END) as shortlisted_count
             FROM applications a
             JOIN job_postings j ON a.job_id = j.id
             WHERE j.employer_id = ?`,
             [employerId]
        );


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


        const [recentApps] = await db.execute(
            `SELECT a.applied_at 
             FROM applications a
             JOIN job_postings j ON a.job_id = j.id
             WHERE j.employer_id = ? 
               AND a.applied_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)`,
             [employerId]
        );


        const chartData = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        

        for (let i = 6; i >= 0; i--) {
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() - i);
            
            const dailyCount = recentApps.filter(row => {
                const rowDate = new Date(row.applied_at);
                return rowDate.getDate() === targetDate.getDate() && 
                       rowDate.getMonth() === targetDate.getMonth() &&
                       rowDate.getFullYear() === targetDate.getFullYear();
            }).length;

            chartData.push({
                name: dayNames[targetDate.getDay()], 
                applications: dailyCount
            });
        }

        
        res.status(200).json({
            activeJobs: activeJobs[0].count || 0,
            pendingApps: appStats[0].pending_count || 0,
            shortlistedApps: appStats[0].shortlisted_count || 0,
            recentActivity: recentActivity,
            chartData: chartData 
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

                    const meetsAllNeeds = appAccommodations.every(need => jobAccommodations.includes(need));
                    if (!meetsAllNeeds) continue;

                    const isDisabilitySupported = jobAcceptedDisabilities.length === 0 || jobAcceptedDisabilities.some(d => applicantDisabilityStr.includes(d));
                    if (!isDisabilitySupported) continue;

                    let matchingSkillsCount = 0;
                    appSkills.forEach(skill => {
                        if (jobSkills.includes(skill)) matchingSkillsCount++;
                    });
                    const skillScore = jobSkills.length > 0 ? (matchingSkillsCount / jobSkills.length) * 60 : 60;
                    const overallMatchPercentage = Math.round(skillScore + distanceScore);

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
                JSON.stringify(accepted_disabilities || []), 
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
    const { status, employer_message, applicant_id, job_title, company_name } = req.body; 

    try {
        await db.execute(
            "UPDATE applications SET status = ?, employer_message = ? WHERE id = ?", 
            [status, employer_message || null, applicationId]
        );

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
    const company_logo = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        await db.execute(`UPDATE users SET email = ? WHERE id = ?`, [email, userId]);

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


app.put('/api/admin/users/:id/verify', async (req, res) => {
    const { id } = req.params;
    const { status, rejection_reason } = req.body; 

    try {
        if (status === 'Rejected') {
            await db.execute(
                `UPDATE users SET verification_status = ?, rejection_reason = ?, rejection_timestamp = NOW() WHERE id = ?`,
                [status, rejection_reason, id]
            );
        } else {
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
        const [userGrowth] = await db.execute(`
            SELECT MONTH(created_at) as month, COUNT(*) as total 
            FROM users 
            WHERE YEAR(created_at) = YEAR(CURDATE())
            GROUP BY MONTH(created_at)
            ORDER BY month
        `);

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
            const skills = safeParse(job.required_skills);
            
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
    
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
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

        const [userRows] = await db.execute(`
            SELECT verification_status, rejection_timestamp 
            FROM users 
            WHERE id = ?
        `, [userId]);

        if (userRows.length === 0) return res.status(404).json({ message: "User not found." });
        const user = userRows[0];

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

        const filePath = req.file.path; 
        
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

        await db.execute('DELETE FROM applicant_profiles WHERE user_id = ?', [userId]);
        await db.execute('DELETE FROM employer_profiles WHERE user_id = ?', [userId]);
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
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60000); 

        await db.execute(
            "UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?",
            [otpCode, expires, userId]
        );


        const subjectLine = type === 'email' ? 'Verify your new Email Address' : 'Verify your Password Change';
        const messageBody = `Hello!\n\nYour 6-digit AbleWork verification code is: ${otpCode}\n\nThis code will expire in 15 minutes. If you did not request this change, please ignore this email.`;

        await transporter.sendMail({
            from: '"AbleWork Security" <ableworksys5i@gmail.com>',
            to: email, 
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
    const { action } = req.body; 

    try {
        const newStatus = action === 'deactivate' ? 'Deactivated' : 'Active';

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


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`🚀 Server is officially running on http://localhost:${PORT}`);
});