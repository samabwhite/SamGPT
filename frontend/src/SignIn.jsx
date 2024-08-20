import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { signin } from "../actions/session";

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
      <>
        <h1>Sign In</h1>
        <p>{errors}</p>
        <form onSubmit={handleSubmit}>
          <label>
            Email:
            <input type="email" name="email" />
          </label>
          <label>
            Password:
            <input type="password" name="password" />
          </label>
          <input type="submit" value="Submit" />
        </form>
        <Link to="/register">Register</Link>
      </>
      );
    };

    export default connect(
        mapStateToProps,
        mapDispatchToProps
      )(SignIn);