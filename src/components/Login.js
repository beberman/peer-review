import React, {useEffect} from 'react';
import {
    useLocation,
    useNavigate
} from 'react-router-dom';

import {validateUser} from '../api/api';
import Logger from './Logger';

function Login() {
    // Retrieve the state passed from LandingPage
    const location = useLocation();
    const navigate = useNavigate();
    const { email, teamNumber } = location.state || {};

    useEffect( () => {
        const handleLogin = async () => {
            if (!email || !teamNumber ) {
                Logger.debug("Email or teamNumber are missing");
                alert('Email and teamNumber are required.');
                navigate('/');
                return;
            }
            try {
                const response = await validateUser(teamNumber, email);
                
                if (response.status === "success") {
                    Logger.debug("Success");
                    const members = response.members;
                    navigate('/survey', { state: { email, teamNumber, members}});
                    return;
                }
                if (response.status === "inProgress") {
                    Logger.debug("inProgress");
                    alert("Student has completed survey. To redo the survey, please contact the instructor.");
                    navigate('/');
                    return;
                }
                Logger.debug("Unexpected response status:");
                alert("An error occurred while validating the team number and email");
                navigate('/');
            } catch (error) {
                Logger.error("Error logging in:");
                alert("An error occurred while validating the team number and email");
                navigate('/');
            }
        };

        handleLogin();
    }, [email, teamNumber, navigate]);

    return (
        <div className="container mt-5">
            <h1> Validating Team Number and Email</h1>
            <p> Please wait...</p>
        </div>
    );
};

export default Login;
