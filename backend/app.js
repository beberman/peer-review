require('dotenv').config();
const express = require('express');
const Logger = require('./logger');
const jwt = require('jsonwebtoken');

const clientID = process.env.GOOGLE_CLIENT_ID;

const bodyParser = require('body-parser');
const {
  checkStudent,
  getStudent,
  getTeam,
  completed,
  getQuestions,
  saveRatings,
  clearData,
} = require('./googleapi');

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
    Logger.debug('found students');
    Logger.debug('student', student);
    if (student === undefined || !student) {
      Logger.debug('returning 401');
      return res
        .status(401)
        .json({ success: false, message: 'Invalid team or email' });
    }

    const complete = await completed(student);
    if (complete) {
      Logger.debug('Student completed');
      Logger.debug('returning 200');
      return res.json({
        success: true,
        message: 'Student has completed the assignment',
      });
    }

    const token = jwt.sign({ teamNumber, email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    Logger.debug('Returning team');
    const members = await getTeam(teamNumber);
    res.json({ success: true, members, token });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error validating team or email' });
  }
});

app.get('/api/questions', async (req, res) => {
  try {
    const questions = await getQuestions();
    res.json({ success: true, questions });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error fetching questions' });
  }
});

app.post('/api/submit', async (req, res) => {
  try {
    Logger.debug('submitting ratings');
    if (!req.headers.authorization) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    Logger.debug('checking decoded', decoded);
    const { userID, ratings } = req.body;
    const student = await getStudent(userID);
    if (!userID || !student) {
      Logger.debug('missing message deata');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (student.Email != decoded.email || student.Team != decoded.teamNumber) {
      Logger.debug('invalid team or email');
      Logger.debug('Email', student.Email, decoded.email);
      Logger.debug('Team', student.Team, decoded.teamNumber);
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    Logger.debug('saving for userID', userID);

    const result = await saveRatings(userID, ratings);
    if (result.status == 'completed') {
      return res.json({ success: true, message: 'Ratings saved successfully' });
    } else {
      return res
        .status(500)
        .json({ success: false, message: 'Error saving ratings' });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error saving ratings' });
  }
});

module.exports = app;
