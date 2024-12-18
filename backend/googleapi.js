const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const Logger = require('./logger');

require('dotenv').config();

// Load service account credentials
const credentials = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'sheets-permission.json'))
);

const spreadsheetId = process.env.SPREADSHEET_ID;

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets', // Full access to Sheets
  ],
});

const sheets = google.sheets({ version: 'v4', auth });

const StudentData = 'Students!A1:D36';
const QuestionData = 'Questions!A1:C7';
const ReviewData = 'Reviews!A1:D500';
const CommentData = 'Comments!A1:D500';

async function getSheetData(range) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: range,
  });
  const keys = response.data.values.shift();

  const result = [];
  response.data.values.forEach((row) => {
    const obj = {};
    keys.forEach((key, i) => {
      obj[key] = row[i];
    });
    result.push(obj);
  });
  return result;
}

async function getStudents() {
  return getSheetData(StudentData);
}

async function checkStudent(email, teamid) {
  const emailLowerCase = email.toLowerCase();
  const data = await getStudents();
  const teamidStr = teamid.toString();

  const result = data.find((obj) => {
    return obj.Email.toLowerCase() === emailLowerCase && obj.Team === teamidStr;
  });

  if (result) {
    if (Array.isArray(result)) {
      return result[0];
    }
    return result;
  } else {
    return undefined;
  }
}

async function getStudent(userID) {
  const data = await getStudents();
  return data.find((obj) => obj.UserID === userID);
}

async function getTeam(teamid) {
  const data = await getStudents();
  const teamidStr = teamid.toString();
  return data.filter((obj) => obj.Team === teamidStr);
}

async function getQuestions() {
  return getSheetData(QuestionData);
}

async function getReviews(userid) {
  const data = await getSheetData(ReviewData);
  return data.filter((obj) => obj.UserID === userid);
}

async function getComments(userid) {
  const data = await getSheetData(CommentData);
  return data.filter((obj) => obj.UserID === userid);
}

function emptyArray(a) {
  if (a === undefined) {
    return true;
  }
  if (Array.isArray(a) && a.length === 0) {
    return true;
  }
  return false;
}

async function completed(student) {
  try {
    const reviews = await getReviews(student.UserID);
    const comments = await getComments(student.UserID);
    if (!emptyArray(reviews)) {
      return true;
    }
    if (!emptyArray(comments)) {
      return true;
    }
    return false;
  } catch (error) {
    throw new Error('Error fetching data');
  }
}

async function saveRatings(userId, ratings) {
  try {
    // Log the received data for debugging
    Logger.debug(`Storing survey data for user: ${userId}`);
    const existingReviews = await getReviews(userId);
    const existingComments = await getComments(userId);

    if (!emptyArray(existingReviews)) {
      Logger.debug('User has already submitted reviews');
      return { status: 'error', message: 'User has already submitted reviews' };
    }
    if (!emptyArray(existingComments)) {
      Logger.debug('User has already submitted comments');
      return {
        status: 'error',
        message: 'User has already submitted comments',
      };
    }

    const ratingRows = [];
    const commentRows = [];
    ratings.map((entry) => {
      if (entry.comment) {
        commentRows.push([userId, entry.UserID, entry.comment]);
      }

      entry.Ratings.map((rating) => {
        ratingRows.push([
          userId,
          rating.QuestionID,
          entry.UserID,
          rating.Rating,
        ]);
      });
    });

    /* writing to the Rating sheet */
    if (ratingRows.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Reviews!A1',
        valueInputOption: 'RAW',
        resource: {
          values: ratingRows,
        },
      });
    }

    if (commentRows.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Comments!A1',
        valueInputOption: 'RAW',
        resource: {
          values: commentRows,
        },
      });
    }

    Logger.debug('Survey data stored successfully');
    return { status: 'completed', message: 'Survey data stored successfully' };
  } catch (error) {
    Logger.error('Error storing survey data:', error);
    // Simulate an error response
    return { status: 'error', message: 'Failed to store survey data' };
  }
}

async function clearData() {
  try {
    // Log the received data for debugging
    Logger.debug('Clearing all data');
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Reviews!A2:D1000',
    });
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Comments!A2:C1000',
    });

    Logger.debug('All data cleared successfully');
    return { status: 'completed', message: 'All data cleared successfully' };
  } catch (error) {
    console.error('Error clearing data:', error);
    // Simulate an error response
    return { status: 'error', message: 'Failed to clear data' };
  }
}

module.exports = {
  getStudents,
  getStudent,
  getTeam,
  checkStudent,
  getQuestions,
  getReviews,
  getComments,
  completed,
  saveRatings,
  clearData,
};
