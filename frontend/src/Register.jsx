import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { register } from "../actions/session";
import './Register.css'; 

const mapStateToProps = ({ errors }) => ({
  errors
});
const mapDispatchToProps = dispatch => ({
  register: user => dispatch(register(user))
});

const Register = ({ errors, register }) => {
  const handleSubmit = e => {
    e.preventDefault();
    const user = {
      username: e.target[0].value,
      email: e.target[1].value,
      password: e.target[2].value
    };
    register(user);
  };
  return (
    <div className="register-container">
      <div className="register-box">
        <h1 className="register-title">Register</h1>
        {errors && <p className="register-error">{errors}</p>}
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
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Register);
