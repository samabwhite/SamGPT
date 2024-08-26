import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { signin } from "../actions/session";
import './SignIn.css'; 

const mapStateToProps = ({ errors }) => ({
  errors
});
const mapDispatchToProps = dispatch => ({
  signin: user => dispatch(signin(user))
});

const SignIn = ({ errors, signin }) => {
  const handleSubmit = e => {
    e.preventDefault();
    const user = {
      email: e.target[0].value,
      password: e.target[1].value
    };
    signin(user);
  };
  return (
    <div className="signin-container">
      <div className="signin-box">
        <h1 className="signin-title">Sign In</h1>
        {errors && <p className="signin-error">{errors}</p>}
        <form className="signin-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email:</label>
            <input className="input-field" type="email" name="email" required />
          </div>
          <div className="input-group">
            <label className="input-label">Password:</label>
            <input className="input-field" type="password" name="password" required />
          </div>
          <input className="signin-button" type="submit" value="Sign In" />
        </form>
        <p className="signin-register">
          Don't have an account? <Link to="/register" className="register-link">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SignIn);
