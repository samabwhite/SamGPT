import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { register } from "../actions/session";

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
      <>
        <h1>Register</h1>
        <p>{errors}</p>
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input type="text" name="username" />
          </label>
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
        <Link to="/signin">Sign In</Link>
      </>
      );
    };

    export default connect(
        mapStateToProps,
        mapDispatchToProps
      )(Register);