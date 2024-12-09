const express = require('express');
const bodyParser = require('body-parser');
const {
    checkStudent,
    getTeam,
    completed, 
    getQuestions
} = require('./googleapi');

const app = express();

// Middleware to parse JSON requests
app.use(bodyParser.json());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});


app.post('/validate', async (req, res) => {
    const { teamNumber, email } = req.body;
    console.log(teamNumber, email);

    // Validate the team number and email combination
    try {
        const student = await checkStudent(email, teamNumber);
        console.log("student", student);
        if (student === undefined ||
            !student) {
            console.log("returning 401");
            return res.status(401).json({ success: false, message: 'Invalid team or email' });
        }

        const complete = await completed(student);
        if (complete) {
            console.log("returning 200")
            return res.json({ success: true, message: 'Student has completed the assignment' });
        } 

        
        const members = await getTeam(teamNumber);
        res.json({ success: true, members });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error validating team or email' });
    }
});

app.get('/questions', async (req, res) => {
    try {
        const questions = await getQuestions();
        res.json({ success: true, questions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching questions' });
    }
});

module.exports = app;
