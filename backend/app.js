const express = require('express');
const bodyParser = require('body-parser');
const {
    checkStudent,
    getTeam,
    completed, 
    getQuestions
} = require('./googleapi');

const app = express();

const Logger = {
  info: (message, ...optionalParams) => {
    console.info(`[INFO] ${new Date().toISOString()}: ${message}`, ...optionalParams);
  },
  warn: (message, ...optionalParams) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...optionalParams);
  },
  error: (message, ...optionalParams) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, ...optionalParams);
  },
  debug: (message, ...optionalParams) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, ...optionalParams);
    }
  },
};

export default Logger;

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

module.exports = app;
