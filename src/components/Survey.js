import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getQuestions, submitSurvey } from '../api/api';
import Logger from './Logger';

function Survey() {
  const location = useLocation();
  const navigate = useNavigate();

  const { email, teamNumber, members = [] } = location.state || {};
  const [self, setSelf] = useState(null);
  const [memberList, setMemberList] = useState(null);

  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!email || !teamNumber || members.length === 0) {
      navigate('/');
    } else {
      const foundUser = members.find((member) => member.Email === email);
      if (foundUser) {
        const self = {
          UserID: foundUser.UserID,
          Name: 'Self',
          Email: email,
          Team: teamNumber,
        };
        setSelf(self);
        const otherMembers = members.filter((member) => member.Email !== email);
        const mList = [self, ...otherMembers];
        setMemberList(mList);
      } else {
        Logger.error('User not found in team members');
        navigate('/');
      }
    }
  }, [email, teamNumber, members, navigate]);

  const handleSubmit = async () => {
    const payload = memberList.map((member) => {
      const ratingsForMember = ratings[member.UserID];
      return {
        UserID: member.UserID,
        Ratings: questions.map((q) => ({
          QuestionID: q.ID,
          Rating: ratingsForMember?.[q.ID] || 0,
        })),
        comment: comments[member.UserID] || '',
      };
    });

    try {
      const response = await submitSurvey(self.UserID, payload);
      if (response.status === 'success') {
        navigate('/done');
      } else {
        setError('Failed to submit survey');
        alert('Failed to submit survey');
      }
    } catch (error) {
      Logger.error('Error submitting survey', error);
      setError('Failed to submit survey');
      alert('Failed to submit survey');
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questions = await getQuestions();
        setQuestions(questions);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleRatingChange = (userID, topicId, value) => {
    setRatings((prevState) => ({
      ...prevState,
      [userID]: {
        ...(prevState[userID] || {}),
        [topicId]: value,
      },
    }));
  };

  const handleCommentChange = (userID, value) => {
    setComments((prevState) => ({
      ...prevState,
      [userID]: value,
    }));
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <h1> Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  const renderLevels = () => {
    const ratingLevels = [
      {
        level: 1,
        statement: 'Did not provide any substantial value on the topic',
      },
      { level: 2, statement: 'Provided some value on the topic' },
      { level: 3, statement: 'Provided average for the team on the topic' },
      { level: 4, statement: 'Provided above average value on the topic' },
      { level: 5, statement: 'Was critical to the team on the topic' },
    ];

    return (
      <div className="mb-4">
        <h2> Rating Levels </h2>
        <ul>
          {ratingLevels.map((level) => (
            <li key={level.level}>
              <strong>{level.level}</strong>: {level.statement}
            </li>
          ))}
          ;
        </ul>
      </div>
    );
  };

  const renderQuestions = () => {
    return (
      <div className="mb-4">
        <h2> Questions </h2>
        <ul>
          {questions.map((question) => (
            <li key={question.ID}>
              <strong>{question.Topic}</strong>: {question.Question}
            </li>
          ))}
          ;
        </ul>
      </div>
    );
  };

  const isRowCompleted = (ratingsForMember) => {
    return questions.every((q) => ratingsForMember?.[q.ID]);
  };

  const computeScore = (ratingsForMember) => {
    if (!isRowCompleted(ratingsForMember)) {
      return '';
    }
    const ratingValues = Object.values(ratingsForMember).map(Number);
    const beginningAverage =
      ratingValues
        .slice(0, ratingValues.length - 1)
        .reduce((acc, val) => acc + val, 0) /
      (ratingValues.length - 1);
    const overallScore = ratingValues[ratingValues.length - 1];
    const rawScore = 0.7 * beginningAverage + 0.3 * overallScore;
    return Number(rawScore.toPrecision(2));
  };

  const allRowsComplete = memberList.every((member) =>
    isRowCompleted(ratings[member.UserID])
  );

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
              <th>Overall Score</th>
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
                <td>{computeScore(ratings[member.UserID]) || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCommentTable = () => {
    return (
      <div className="table-responsive mt-4">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {memberList.map((member) => (
              <tr key={member.UserID}>
                <td>{member.Name}</td>
                <td>
                  <textarea
                    className="form-control"
                    value={comments[member.UserID] || ''}
                    onChange={(e) =>
                      handleCommentChange(member.UserID, e.target.value)
                    }
                    placeholder="Enter your comment"
                    rows="2"
                  ></textarea>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mt-5">
      <h1>Survey</h1>
      <p>
        {' '}
        Please rate your team members on the following questions. Use a rating
        of 1-5 as follows:{' '}
      </p>
      {renderLevels()}

      {/* Questions */}
      {renderQuestions()}

      {/* Table */}
      {renderTable()}

      {/* Comments */}
      {renderCommentTable()}

      {/* Submit Button */}
      <button
        className="btn btn-primary mt-3"
        disabled={!allRowsComplete}
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
}

export default Survey;
