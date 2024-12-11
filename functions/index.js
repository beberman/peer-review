/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const {onRequest} = require("firebase-functions/v2/https");
const Logger = require("firebase-functions/logger");
const functions = require('firebase-functions');

const {validate, questions, submit} = require('./wrapper');

exports.helloWorld = onRequest((req, res) => {
    Logger.debug("Hello world received a request", {structuredData: true});
    res.send("Hello from Firebase!");
});

function handleResponse(res, response) {
    if (response.code === 200) {
        return res.json(response.response);
    } else {
        return res.status(response.code).json(response.response);
    }
}

exports.validate = onRequest(async (req, res) => {
    try {
        const { teamNumber, email } = req.body;
        const response = await validate(teamNumber, email);
        return handleResponse(res, response);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error validating user' });
    }
});

exports.questions = onRequest( async (req, res) => {
    try {
        const { teamNumber, email } = req.body;
        Logger.debug("Qusions request received", {structuredData: true});
        const response = await questions(teamNumber, email);
        return handleResponse(res, response);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error getting questions' });
    }
});

exports.submit = onRequest( async (req, res) => {
    try {
        const { teamNumber, email, answers } = req.body;
        const response = await submit(teamNumber, email, answers);
        return handleResponse(res, response);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error submitting answers' });
    }
});











