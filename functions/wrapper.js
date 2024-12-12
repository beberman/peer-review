const Logger = require('firebase-functions/logger');
const jwt = require('jsonwebtoken');

const {
  checkStudent,
  getStudent,
  getTeam,
  completed,
  getQuestions,
  saveRatings,
  clearData,
} = require('./googleapi');

const {getConfigVariable} = require('./config');


async function validate(teamNumber, email) {
  Logger.debug(teamNumber, email);

  // Validate the team number and email combination
  try {
    const student = await checkStudent(email, teamNumber);
    Logger.debug('found students');
    Logger.debug('student', student);
    if (student === undefined || !student) {
      Logger.debug('returning 401');
      const result = {
        code: 401,
        response: { success: false, message: 'Invalid team or email' },
      };
      return result;
    }

    const complete = await completed(student);
    if (complete) {
      Logger.debug('Student completed');
      Logger.debug('returning 200');
      const result = {
        code: 200,
        response: {
          success: true,
          message: 'Student has completed the assignment',
        },
      };
    }
      const jwtSecret = getConfigVariable('jwtSecret');
    const token = jwt.sign({ teamNumber, email }, jwtSecret, {
      expiresIn: '1h',
    });
    Logger.debug('Returning team');
    const members = await getTeam(teamNumber);
    const result = {
      code: 200,
      response: { success: true, members, token },
    };
    return result;
  } catch (error) {
    const result = {
      code: 500,
      response: { success: false, message: 'Error validating team or email' },
    };
    return result;
  }
}

async function questions() {
  try {
    Logger.debug('fetching questions');
    const questions = await getQuestions();
    return {
      code: 200,
      response: { success: true, questions },
    };
  } catch (error) {
    Logger.error('Problem fetching questions', error);
    return {
      code: 500,
      response: { success: false, message: 'Error fetching questions' },
    };
  }
}

async function submit(headers, userID, ratings) {
  try {
    Logger.debug('submitting ratings');
    if (!headers.authorization) {
      return {
        code: 401,
        response: { success: false, message: 'Unauthorized' },
      };
    }

    const token = headers.authorization.split(' ')[1];
    if (!token) {
      return {
        code: 401,
        response: { success: false, message: 'Unauthorized' },
      };
    }

    const student = await getStudent(userID);
    if (!userID || !student) {
      return {
        code: 401,
        response: { success: false, message: 'Unauthorized' },
      };
    }

      const jwtSecret = getConfigVariable('jwtSecret');
    const decoded = jwt.verify(token, jwtSecret);
    Logger.debug('checking decoded', decoded);
    if (student.Email != decoded.email || student.Team != decoded.teamNumber) {
      Logger.debug('invalid team or email');
      Logger.debug('Email', student.Email, decoded.email);
      Logger.debug('Team', student.Team, decoded.teamNumber);
      return {
        code: 401,
        response: { success: false, message: 'Unauthorized' },
      };
    }

    Logger.debug('saving for userID', userID);
    const result = await saveRatings(userID, ratings);
    if (result.status == 'completed') {
      return {
        code: 200,
        response: { success: true, message: 'Ratings saved successfully' },
      };
    } else {
      return {
        code: 500,
        response: { success: false, message: 'Error saving ratings' },
      };
    }
  } catch (error) {
    return {
      code: 500,
      response: { success: false, message: 'Server Error saving ratings' },
    };
  }
}

module.exports = {
  validate,
  questions,
  submit,
};
