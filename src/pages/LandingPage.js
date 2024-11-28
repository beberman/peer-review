import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';


function LandingPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [teamNumber, setTeamNumber] = useState('');

    const teams = [
        {id: 1, name: 'Team 1'},
        {id: 2, name: 'Team 2'},
        {id: 3, name: 'Team 3'},
        {id: 4, name: 'Team 4'},
        {id: 5, name: 'Team 5'},
        {id: 6, name: 'Team 6'},
        {id: 7, name: 'Team 7'}
    ];

    const handleSubmit = () => {
        if (!email || !teamNumber) {
            alert('Please enter your email and team number');
            return;
        }
        console.log(email, teamNumber);
        console.log('submitting form');

        navigate('/login', {state: {email, teamNumber}});
    };


    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body">
                            <h1 className="card-title text-center mb-4">Welcome to the Peer Review Site for ETR 500</h1>
                            <p className="lead text-left mb-4">
                                ETR-500 is a team based class. Each team member is responsible for evaluating their own performance and contribution to the team projects, and the performance of team members on their team.
                            </p>
                            <p className="text-center text-muted">
                                Select your team, enter your email, and click submit to get started.
                            </p>
                            
                            {/* Team Dropdown */}
                            <div className="mb-3">
                                <label htmlFor="teamSelect" className="form-label">Select Team</label>
                                <select
                                    id="teamSelect"
                                    className="form-select"
                                    value={teamNumber}
                                    onChange={(e) => setTeamNumber(e.target.value)}
                                >
                                    <option value="">Choose a team...</option>
                                    {teams.map((team) => (
                                        <option key={team.id} value={team.id}>
                                            {team.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Email Input */}
                            <div className="mb-3">
                                <label htmlFor="emailInput" className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    id="emailInput"
                                    className="form-control"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            
                            {/* Submit Button */}
                            <div className="text-center">
                                <button className="btn btn-primary btn-lg w-100" onClick={handleSubmit}>
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default LandingPage;
