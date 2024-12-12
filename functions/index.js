/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const Logger = require('firebase-functions/logger');
const { onRequest } = require('firebase-functions/v2/https');

if (process.env.NODE_ENV !== 'production') {
	const path = require('path');
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

const {initializeConfigVariables, getConfigVariable} = require('./config');

initializeConfigVariables()
	.then(() => {
		Logger.debug('Config variables initialized', { structuredData: true });

		const spreadsheetId = getConfigVariable('spreadsheetId');
		Logger.debug(`Spreadsheet ID: ${spreadsheetId}`, { structuredData: true });
	})
	.catch((error) => {
		Logger.error('Error initializing config variables', { structuredData: true });
		Logger.error(error, { structuredData: true });
	});

const { validate, questions, submit } = require('./wrapper');

exports.helloWorld = onRequest((req, res) => {
	Logger.debug('Hello world received a request', { structuredData: true });
  res.send('Hello from Firebase!');
});

function handleResponse(res, response) {
  if (response.code === 200) {
    return res.json(response.response);
  } else {
    return res.status(response.code).json(response.response);
  }
}

exports.questions = onRequest(async (req, res) => {
	try {
		Logger.debug('Quesions request received', { structuredData: true });
		const response = await questions();
		return handleResponse(res, response);
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: 'Server Error getting questions' });
	}
});

exports.validate = onRequest(async (req, res) => {
  try {
    const { teamNumber, email } = req.body;
    const response = await validate(teamNumber, email);
    return handleResponse(res, response);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error validating user' });
  }
});

exports.submit = onRequest(async (req, res) => {
  try {
    const { userID, ratings } = req.body;
    const response = await submit(req.headers, userID, ratings);
    return handleResponse(res, response);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: 'Server Error submitting answers' });
  }
});
