const {
    getStudents,
    checkStudent,
    getQuestions,
    getReviews,
    getComments,
    completed
} = require('./googleapi');

const {google} = require('googleapis');
const email = 'test@wpi.edu';
const team = 8;

const blankemail = 'test2@wpi.edu';
const blankteam =8;

describe('Google sheet Sheet API integration', () => {

    it('should fetch the list of students on a live sheet',
       async () => {
           const students = await getStudents();
           expect(students).toBeDefined();
           expect(students.length).toBeGreaterThan(0);
           expect(students[0]).toHaveProperty('UserID');
           expect(students[0]).toHaveProperty('Name');
           expect(students[0]).toHaveProperty('Email');
           expect(students[0]).toHaveProperty('Team');
    });


    it('should report that student exists', () => {
        async () => {
            const student = await checkStudent(email, team);
            expect(student).toBeDefined();
            expect(student).toBeDefined();
            expect(student.Email).toLowerCase().toBe(email);
            expect(student.Team).toBe(team);
        };
    });

    it('should report that student does not exist', () => {
        async () => {
            const student = await checkStudent(email, 1);
            expect(student).toBeUndefined();
        }
        async () => {
            const student = await checkStudent('fake@wpi.edu', team);
            expect(student).toBeUndefined();
        }
    });

    it('should report that blank email student exists', () => {
        async () => {
            const student = await checkStudent(blankemail, blankteam);
            expect(student).toBeDefined();
            expect(student.Email).toLowerCase().toBe(blankemail);
            expect(student.Team).toBe(blankteam);
        };
    });


    it('should fetch the list of reviews for a student', () => {
        async () => {
            const student = await checkStudent(email, team);
            expect(student).toBeDefined();
            
            const reviews = await getReviews(student.UserID);
            expect(reviews).toBeDefined();
            expect(reviews.length).toBeGreaterThan(0);
            expect(reviews[0]).toHaveProperty('UserID');
            expect(reviews[0]).toHaveProperty('QuestionID');
            expect(reviews[0]).toHaveProperty('ReviewedID');
            expect(reviews[0]).toHaveProperty('Rating');
        };
    });


    it('should fetch the list of comments for a student', () => {
        async () => {
            const student = await checkStudent(email, team);
            expect(student).toBeDefined();
            
            const comments = await getComments(student.UserID);
            expect(comments).toBeDefined();
            expect(comments.length).toBeGreaterThan(0);
            expect(comments[0]).toHaveProperty('UserID');
            expect(comments[0]).toHaveProperty('ReviewedID');
            expect(comments[0]).toHaveProperty('Comment');
        };
    });

    it('Should return that the student is not completed', () => {
        async () => {
            const student = await checkStudent(blankemail, blankteam);
            expect(student).toBeDefined();
            const result = await completed(student);
            expect(result).toBe(false);
        };
    });


    it('should fetch the list of questions on a live sheet', () => {
        async () => {
            const questions = await getQuestions();
            expect(questions).toBeDefined();
            expect(questions.length).toBeGreaterThan(1);
            expect(questions[0]).toHaveProperty('ID');
            expect(questions[0]).toHaveProperty('Topic');
            expect(questions[0]).toHaveProperty('Question');
        };
    });
    
});
