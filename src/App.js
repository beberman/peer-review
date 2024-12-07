import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './components/Login';
import Survey from './components/Survey';
//import Review from './pages/Review';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/survey" element={<Survey />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
