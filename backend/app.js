require('dotenv').config();
const express = require('express');
const Logger =require('./logger');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');

const clientID = process.env.GOOGLE_CLIENT_ID;
const allowedEmails = process.env.ALLOWED_EMAILS.split(',').map((email) => email.trim());
const bodyParser = require('body-parser');
const {
    checkStudent,
    getTeam,
    completed, 
    getQuestions,
    saveRatings,
    clearData
} = require('./googleapi');


const client = new OAuth2Client();
async function authenticateGmailUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header is missing' });
        }

        const token = authHeader.split(' ')[1];
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientID,
        });

        const payload = ticket.getPayload();
        const email = payload.email;

        // Check if email matches your Gmail account
        if (!allowedEmails.includes(email)) {
            return res.status(403).json({ message: 'Access forbidden: Unauthorized email'
            });
        }
        next();
    } catch (error) {
        Logger.error('Authentication error:', error);
        return res.status(403).json({ message: 'Authentication failed' });
    }
}

const app = express();

const injectLogger = (req, res, next) => {
    Logger.debug(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
};

// Middleware to parse JSON requests
app.use(bodyParser.json());
app.use(injectLogger);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});


app.post('/api/validate', async (req, res) => {
    const { teamNumber, email } = req.body;
    Logger.debug(teamNumber, email);

    // Validate the team number and email combination
    try {
        const student = await checkStudent(email, teamNumber);
        Logger.debug("found students");
        Logger.debug("student", student);
        if (student === undefined ||
            !student) {
            Logger.debug("returning 401");
            return res.status(401).json({ success: false, message: 'Invalid team or email' });
        }

        const complete = await completed(student);
        if (complete) {
            Logger.debug("Student completed");
            Logger.debug("returning 200")
            return res.json({ success: true, message: 'Student has completed the assignment' });
        } 

        Logger.debug("Returning team");
        const members = await getTeam(teamNumber);
        res.json({ success: true, members });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error validating team or email' });
    }
});

app.get('/api/questions', async (req, res) => {
    try {
        const questions = await getQuestions();
        res.json({ success: true, questions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching questions' });
    }
});

app.post('/api/submit', async (req, res) => {
    try {
        Logger.debug("submitting ratings");
        Logger.debug(req.body);
        const { userID, ratings } = req.body;
        Logger.debug("saving for userID", userID);

        const result = await saveRatings(userID, ratings);
        if (result.status == "completed") {
            return res.json({ success: true, message: 'Ratings saved successfully' });
        } else {
            return res.status(500).json({ success: false, message: 'Error saving ratings' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error saving ratings' });
    }
});

const userCodes = {};
// Endpoint to generate and email the code
app.post('/api/sendCode', async (req, res) => {
    const { teamNumber, email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    if (!teamNumber) {
        return res.status(400).json({ message: 'Team number is required' });
    }

    try {
        const student = await checkStudent(email, teamNumber);
        if (student === undefined || !student) {
            return res.status(401).json({ message: 'Invalid team or email' });
        }
        
        // Generate a 4-digit random code
        const code = Math.floor(1000 + Math.random() * 9000);

        // Store the code for the email (expires in 5 minutes)
        userCodes[student.UserID] = { email, code, expiresAt: Date.now() + 5 * 60 * 1000 };

        // Send the code via email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MASTER_EMAIL, // Your Gmail account
                pass: process.env.EMAIL_PASSWORD, // Your Gmail app password
            },
        });

        await transporter.sendMail({
            from: process.env.MASTER_EMAIL,
            to: email,
            subject: 'Your Login Code',
            text: `Your verification code is: ${code}`,
        });

        res.status(200).json({ message: 'Verification code sent' });
        
    } catch (error) {
        console.error('Error sending code:', error);
        res.status(500).json({ message: 'Failed to send verification code' });
    }
});

app.post('/api/verifyCode', (req, res) => {
    const { UserID, code } = req.body;

    if (!UserID || !code) {
        return res.status(400).json({ message: 'UserID and code are required' });
    }

    const userCode = userCodes[UserID];

    // Check if the code exists and is valid
    if (!userCode || userCode.expiresAt < Date.now() || userCode.code !== parseInt(code, 10)) {
        return res.status(401).json({ message: 'Invalid or expired code' });
    }

    // Generate a token (expires in 1 hour)
    const token = jwt.sign({ email: userCode.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Clean up the code
    delete userCodes[UserID];

    res.status(200).json({ token });
});


/* clear the reviews and comments for an email */

/* app.post('/api/clear', authenticateGmailUser, async (req, res) => {
 *     try {
 *         Logger.debug("clearing ratings");
 *         const {email} = req.body;
 * 
 *         const result = await clearData(email);
 *         if (result.status === "completed") {
 *             return res.json({ success: true, message: 'Ratings cleared successfully' });
 *         } else {
 *             return res.status(500).json({ success: false, message: 'Error clearing ratings' });
 *         }
 *     } catch (error) {
 *         Logger.error(error);
 *         return res.status(500).json({ success: false, message: 'Server Error clearing ratings' });
 *     }
 * });
 *  */

module.exports = app;
