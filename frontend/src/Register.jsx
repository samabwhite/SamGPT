import React from "react";
import { Link } from "react-router-dom";
import { register } from "../store/session/sessionSlice.js";
import './Register.css';
import logo from './assets/logo.png';

import { useDispatch, useSelector } from "react-redux";

function Register() {
	const dispatch = useDispatch();
	const error = useSelector((state) => state.sessionReducer?.error);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const user = {
			username: e.target[0].value,
			email: e.target[1].value,
			password: e.target[2].value
		};
		await dispatch(register(user));
	};

	return (
		<>
			<div className="header">
				<img src={logo} alt="Logo" className="logo" />
			</div>
			<div className="register-container">
				<div className="register-box">
					<h1 className="register-title">Register</h1>
					{error && <p className="register-error">{error}</p>}
					<form className="register-form" onSubmit={handleSubmit}>
						<div className="input-group">
							<label className="input-label">Username:</label>
							<input className="input-field" type="text" name="username" required />
						</div>
						<div className="input-group">
							<label className="input-label">Email:</label>
							<input className="input-field" type="email" name="email" required />
						</div>
						<div className="input-group">
							<label className="input-label">Password:</label>
							<input className="input-field" type="password" name="password" required />
						</div>
						<input className="register-button" type="submit" value="Register" />
					</form>
					<p className="register-signin">
						Already have an account? <Link to="/signin" className="signin-link">Sign In</Link>
					</p>
				</div>
			</div>
		</>
	);
}

export default Register;
