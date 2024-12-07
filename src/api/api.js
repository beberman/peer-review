import Logger from '../components/Logger';
//const BASE_URL = 'http://localhost:3000'; // Replace
const BASE_URL = '/api';

// POST to /validate endpoint
export async function validateUser(teamNumber, email) {
    try {
        const response = await fetch(`${BASE_URL}/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({teamNumber, email})
        });
        Logger.debug("fetch response", response);
        
        if (!response.ok) {

            throw new Error('Validation failed');
        }

        // if 200 and empty team then already in progress
        const data = await response.json();
        if (data.members === undefined) {
            return {status: 'inProgress'};
        } else {
            const result = {
                status: 'success',
                members: data.members
            }
            return result;
        }
    } catch (error) {
        Logger.error('Error validating team:', error);
        throw error;

    }
}

// GET the question set
export async function getQuestions() {
    try {
        const response = await fetch(`${BASE_URL}/questions`);
        if (!response.ok) {
            throw new Error('Failed to get questions');
        }
        const questions = await response.json();
        if (questions === undefined || questions.length === 0) {
            throw new Error('No questions found');
        }
        return questions.questions;
    } catch (error) {
        console.error('Error getting questions:', error);
        throw error;
    }
}
