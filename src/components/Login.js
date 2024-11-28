import React from 'react';
import { useLocation } from 'react-router-dom';

function Login() {
  // Retrieve the state passed from LandingPage
    const location = useLocation();
    const { email, teamNumber } = location.state || {};

    const handleLogin = () => {
        if (!email || !teamNumber ) {
            alert('Email and teamNumber are required.');
            return;
        }
    };

    return (
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card shadow">
                <div className="card-body">
                  <h1 className="card-title text-center mb-4">Login</h1>
                  <p className="text-center text-muted">Welcome back, Team {teamNumber}!</p>

                  {/* Email Display */}
                  <div className="mb-3">
                    <label htmlFor="emailInput" className="form-label">Email Address</label>
                    <input
                      type="email"
                      id="emailInput"
                      className="form-control"
                      value={email || ''}
                      readOnly
                      />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
};

export default Login;
