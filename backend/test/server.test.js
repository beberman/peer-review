const request = require('supertest');
const app = require('../app');

const testuserid = '1111111111111111111';
const testname= "Test Student";
const testemail = 'test@wpi.edu';
const testteam = "8";

const blankuserid = '1111111111111111112';
const blankname= "Test Student2";
const blankemail = 'test2@wpi.edu';
const blankteam ="8";

describe('POST /validate', () => {
    it('should return success and the list of the members of the team',
       async() => {
           const response = await request(app)
               .post('/api/validate')
               .send({
                   teamNumber: blankteam,
                   email: blankemail
               });
           
           expect(response.statusCode).toBe(200);
           expect(response.body).toEqual({
               success: true,
               members: [
                   {
                       UserID: testuserid,
                       Name: testname,
                       Email: testemail,
                       Team: testteam
                   },
                   {
                       UserID: blankuserid,
                       Name: blankname,
                       Email: blankemail,
                       Team: blankteam
                   }
               ]});
    });

    it('should return success and empty list of members because this member has done the survey',
       async() => {
           const response = await request(app)
               .post('/api/validate')
               .send({
                   teamNumber: testteam,
                   email: testemail
               });

           expect(response.statusCode).toBe(200);
           expect(response.body).toEqual({
               success: true,
               message: 'Student has completed the assignment'
           });
           expect(response.body.members).toBeUndefined();
    });


    it('should return 401 because the student does not exist',
       async () => {
           const response = await request(app)
               .post('/api/validate')
               .send({
                   teamNumber: 5,
                   email: testemail
               });

           expect(response.statusCode).toBe(401);
           expect(response.body).toEqual({
               success: false,
               message: 'Invalid team or email'
           });
       });

});;

/* do the test for the questions */
describe('GET /questions', () => {
    it('should return the list of questions', 
       async() => {
           const response = await request(app)
               .get('/api/questions');
           expect(response.statusCode).toBe(200);
           const questions = response.body.questions;
           console.log(questions);
           expect(Array.isArray(questions)).toBe(true);
           expect(questions.length).toBe(6);
    })
});
