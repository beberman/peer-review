const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load service account credentials
const credentials = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'sheets-permission.json'))
);

const spreadsheetId = process.env.SPREADSHEET_ID;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

const StudentData = 'Students!A1:D36';
const QuestionData = 'Questions!A1:C7';
const ReviewData = 'Reviews!A1:D500';
const CommentData = 'Comments!A1:D500';

async function getSheetData(range) {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: range
    });
    const keys = response.data.values.shift();

    const result = []
    response.data.values.forEach(row => {
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

    const result = data.find(obj =>
        {
            return obj.Email.toLowerCase() === emailLowerCase && obj.Team === teamidStr;
        });

    if (result) {
        if(Array.isArray(result)) {
            return result[0];
        }
        return result;
    } else {
        return undefined;
    }
}

async function getTeam(teamid) {
    const data = await getStudents();
    const teamidStr = teamid.toString();
    return data.filter(obj => obj.Team === teamidStr);
}

async function getQuestions() {
    return getSheetData(QuestionData);
}

async function getReviews(userid) {
    const data = await getSheetData(ReviewData);
    return data.filter(obj => obj.UserID === userid);
}

async function getComments(userid) {
    const data = await getSheetData(CommentData);
    return data.filter(obj => obj.UserID === userid);
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

module.exports = {
    getStudents,
    getTeam,
    checkStudent,
    getQuestions,
    getReviews,
    getComments,
    completed
};
