import { validateUser, getQuestions } from '../api';

// Enable fetch mocking
global.fetch = require('jest-fetch-mock');

const testuserid = '1111111111111111111';
const testname = 'Test Student';
const testemail = 'test@wpi.edu';
const testteam = '8';

const blankuserid = '1111111111111111112';
const blankname = 'Test Student2';
const blankemail = 'test2@wpi.edu';
const blankteam = '8';

function getMockMemberResponse() {
  return {
    success: true,
    members: [
      {
        userid: testuserid,
        name: testname,
        email: testemail,
        team: testteam,
      },
      {
        userid: blankuserid,
        name: blankname,
        email: blankemail,
        team: blankteam,
      },
    ],
  };
}

const questions = [
  'Rate teach team members support for background research including papers, user research etc. You can include design work or other offline work',
  'Rate each team members attendance and contribution to the discussions you had. Include both offline (chat/ message) and direct meetings. Did they attend discussions, did they work to contribute ideas, questions, refinements, etc.',
  'Rate the contribution to drafting, revising, and polishing the papers',
  'Rate the contirbution to the business analysis or innovation creation and refinement. That is they may have been in a lot of discussions but the discussion may not have been useful or a few comments may have been critical',
  'Rate how much this team member contributed against overall team performance to date',
];
const topics = ['Research', 'Discussion', 'Writing', 'Analysis', 'Overall'];

function getMockQuestions() {
  const n = topics.length;
  const mock = Array.from({ length: n }, (_, i) => {
    return {
      ID: i + 1,
      Topic: topics[i],
      Question: questions[i],
    };
  });
  return mock;
}

describe('POST /validate', () => {
  describe('validateUser API', () => {
    beforeEach(() => {
      fetch.resetMocks(); // Reset mock before each test
    });

    it('should return the list of members for a valid team and email', async () => {
      // Mock a successful response
      fetch.mockResponseOnce(JSON.stringify(getMockMemberResponse()));

      const response = await validateUser(blankteam, blankemail);

      expect(response.status).toBe('success');
      expect(response.members).toEqual(getMockMemberResponse().members);

      // Check if fetch was called with the correct arguments
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamNumber: blankteam,
          email: blankemail,
        }),
      });
    });

    it('should throw an error for an invalid team and email', async () => {
      // Mock an error response
      fetch.mockResponseOnce(
        JSON.stringify({ success: false, message: 'Invalid team or email' }),
        { status: 401 }
      );

      await expect(validateUser(5, testemail)).rejects.toThrow(
        'Invalid team or email'
      );
    });

    it('should return success and empty list of members because this member has done the survey', async () => {
      // mock the completed response
      fetch.mockResponseOnce(
        JSON.stringify({
          success: true,
          message: 'Student has completed the assignment',
        }),
        { status: 200 }
      );

      const response = await validateUser(testteam, testemail);
      expect(response.status).toBe('inProgress');
      expect(response.members).toBeUndefined();

      // Check if fetch was called with the correct arguments
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamNumber: testteam,
          email: testemail,
        }),
      });
    });
  });
});

describe('GET /questions', () => {
  describe('getQuestions API', () => {
    beforeEach(() => {
      fetch.resetMocks(); // Reset mock before each test
    });

    it('should return the list of questions', async () => {
      // Mock a successful response
      fetch.mockResponseOnce(JSON.stringify(getMockQuestions()));

      const response = await getQuestions();

      expect(response).toEqual(getMockQuestions());

      // Check if fetch was called with the correct arguments
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/questions');
    });
  });
});
