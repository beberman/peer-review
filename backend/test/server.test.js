require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

const testuserid = '1111111111111111111';
const testname = 'Test Student';
const testemail = 'test@wpi.edu';
const testteam = '8';

const blankuserid = '1111111111111111112';
const blankname = 'Test Student2';
const blankemail = 'test2@wpi.edu';
const blankteam = '8';

const masterEmail = process.env.MASTER_EMAIL;

const ratings = [
  {
    UserID: blankuserid,
    comment: 'foo',
    Ratings: [
      { QuestionID: '1', Rating: '2' },
      { QuestionID: '2', Rating: '3' },
      { QuestionID: '3', Rating: '2' },
      { QuestionID: '4', Rating: '3' },
      { QuestionID: '5', Rating: '2' },
    ],
  },
  {
    UserID: testuserid,
    comment: 'bar',
    Ratings: [
      { QuestionID: '1', Rating: '3' },
      { QuestionID: '2', Rating: '4' },
      { QuestionID: '3', Rating: '3' },
      { QuestionID: '4', Rating: '4' },
      { QuestionID: '5', Rating: '3' },
    ],
  },
];

const generateToken = (email) => {
  return jwt.sign({ email }, 'mock-secret', { expiresIn: '1h' });
};

describe('POST /validate', () => {
  it('should return success and the list of the members of the team', async () => {
    const response = await request(app).post('/api/validate').send({
      teamNumber: blankteam,
      email: blankemail,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      members: [
        {
          UserID: testuserid,
          Name: testname,
          Email: testemail,
          Team: testteam,
        },
        {
          UserID: blankuserid,
          Name: blankname,
          Email: blankemail,
          Team: blankteam,
        },
      ],
    });
  });

  it('should return success and empty list of members because this member has done the survey', async () => {
    const response = await request(app).post('/api/validate').send({
      teamNumber: testteam,
      email: testemail,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Student has completed the assignment',
    });
    expect(response.body.members).toBeUndefined();
  });

  it('should return 401 because the student does not exist', async () => {
    const response = await request(app).post('/api/validate').send({
      teamNumber: 5,
      email: testemail,
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: 'Invalid team or email',
    });
  });
});

/* do the test for the questions */
describe('GET /questions', () => {
  it('should return the list of questions', async () => {
    const response = await request(app).get('/api/questions');
    expect(response.statusCode).toBe(200);
    const questions = response.body.questions;
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeGreaterThan(0);
  });
});

async function resetData() {
  await request(app)
    .post('/api/clear')
    .set('Authorization', 'Bearer ' + generateToken(masterEmail));

  await request(app).post('/api/submit').send({
    userID: testuserid,
    ratings: ratings,
  });
}

/* Test the submit survey */
describe('POST /submit', () => {
  it('should return success', async () => {
    const response = await request(app).post('/api/submit').send({
      userID: blankuserid,
      ratings: ratings,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Ratings saved successfully',
    });
    //           await resetData();
  });
});

/* describe('POST /clear', () => {
 *     it('should clear all the data',
 *        async() => {
 *            const token = generateToken(masterEmail);
 *
 *            const response = await request(app)
 *                .post('/api/clear')
 *                .set('Authorization', 'Bearer ' + token);
 *
 *            expect(response.statusCode).toBe(200);
 *            expect(response.body).toEqual({
 *                success: true,
 *                message: "Ratings cleared successfully"
 *            });
 *
 *            await request(app)
 *                .post('/api/submit')
 *                .send({
 *                    userID: testuserid,
 *                    ratings: ratings
 *                });
 *     });
 *
 *     it('should return 403 for unauthorized access',
 *        async() => {
 *            const token = generateToken(testemail);
 *            const response = await request(app)
 *                .post('/api/clear')
 *                .set('Authorization', 'Bearer ' + token);
 *            expect(response.statusCode).toBe(403);
 *            expect(response.body).toEqual({
 *                success: false,
 *                message: 'Access forbidden: Unauthorized email'
 *            });
 *     });
 * });
 *  */
