import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {getQuestions} from '../api/api';

function Survey () {
    const location = useLocation();
    const navigate = useNavigate();

    const {email, teamNumber, members=[]} = location.state || {};

    const [ratings, setRatings] = useState({});

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect (() => {
        if (!email || !teamNumber || members.length === 0) {
            navigate('/');
        }
        
    }, [email, teamNumber, members, navigate]);

    const otherMembers = members.filter((member) => member.Email !== email);
    const thisUserId = members.find((member) => member.Email === email).UserID;
    const self = {UserID: thisUserId,
                  Name: "Self",
                  Email: email,
                  Team: teamNumber};
        
    const memberList = [self, ...otherMembers];

    useEffect (() => {
        const fetchQuestions = async () => {
            try {
                const questions = await getQuestions();
                setQuestions(questions);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setError("Failed to load questions");
            } finally {
                setLoading(false);
            }
        }
        fetchQuestions();
    }, []);

    const handleRatingChange = (userID, topicId, value) => {
        setRatings(prevState => ({
            ...prevState,
            [userID]: {
                ...prevState[userID] || {},
                [topicId]: value
            }
        }));
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div>Loading...</div>
            </div>);
    }

    if (error) {
        return (
            <div className="container mt-5">
                <h1> Error</h1>
                <p>{error}</p>
            </div>
        );
    }

    const ratingLevels = [
        {level: 1,
         statement: "Did not provide any substantial value on the topic"},
        {level: 2,
         statement: "Provided some value on the topic"},
        {level: 3,
         statement: "Provided average for the team on the topic"},
        {level: 4,
         statement: "Provided above average value on the topic"},
        {level: 5,
         statement: "Was critical to the team on the topic"}
    ];
        

    const renderLevels = () => {
        return (
        <div className="mb-4">
            <h2> Rating Levels </h2>
            <ul>
                {ratingLevels.map((level) => (
                    <li key={level.level}>
                        <strong>{level.level}</strong>: {level.statement}
                    </li>
                ))};
            </ul>
        </div>
        );
    }

    const renderQuestions  = () => {
        return (
        <div className="mb-4">
            <h2> Questions </h2>
            <ul>
                {questions.map((question) => (
                    <li key={question.ID}>
                        <strong>{question.Topic}</strong>: {question.Question}
                    </li>
                ))};
            </ul>
        </div>);
    }

    const renderTable = () => {
        return (
        <div className="table-response">
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Name</th>
                        {questions.map((q) => (
                            <th key={q.ID}>{q.Topic}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {memberList.map((member) => (
                        <tr key={member.UserID}>
                            <td>{member.Name}</td>
                            {questions.map((q) => (
                                <td key={q.ID}>
                                    <select
                                        className="form-select"
                                        value={ratings[member.UserID]?.[q.ID] || ''}
                                        onChange={(e) =>
                                            handleRatingChange(member.UserID, q.ID, e.target.value)
                                        }
                                    >
                                        <option value="">Select</option>
                                        {[1, 2, 3, 4, 5].map((val) => (
                                            <option key={val} value={val}>
                                                {val}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        )
    };

    return (
        <div className="container mt-5">
            <h1>Survey</h1>
            <p> Please rate your team members on the following questions.  Use a rating of 1-5 as follows: </p>
            {renderLevels()}

            {/* Questions */}
            {renderQuestions()}

            {/* Table */}
            {renderTable()}

        </div>
    );
};

export default Survey;
