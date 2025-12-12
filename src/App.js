import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import EndedPage from './pages/EndedPage';
import Login from './components/Login';
import Survey from './components/Survey';
import Done from './pages/Done';

const done = false;

function App() {
    console.log("App rendered, done =", done);
	if (done) {
		return (
			<Router>
				<div className="App">
					<Routes>
						<Route path="/" element={<EndedPage />} />
					</Routes>
				</div>
			</Router>
		);
	}  else {
		return (
			<Router>
				<div className="App">
					<Routes>
						<Route path="/" element={<LandingPage />} />
						<Route path="/login" element={<Login />} />
						<Route path="/survey" element={<Survey />} />
						<Route path="/done" element={<Done />} />
					</Routes>
				</div>
			</Router>
		);
	}
}

export default App;
