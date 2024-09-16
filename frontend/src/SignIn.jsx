import { Link } from "react-router-dom";
import { signin } from "../store/session/sessionSlice.js";
import './SignIn.css'; 
import logo from './assets/logo.png';

import { useDispatch, useSelector } from "react-redux";

function SignIn() {
  const dispatch = useDispatch();
  const error = useSelector((state) => state.sessionReducer?.error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = {
      email: e.target[0].value,
      password: e.target[1].value
    };
    await dispatch(signin(user));
  };
  
  return (
    <>
    <div className="header">
      <img src={logo} alt="Logo" className="logo" />
    </div>
    <div className="signin-container">
      <div className="signin-box">
        <h1 className="signin-title">Sign In</h1>
        {error && <p className="signin-error">{error}</p>}
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
    </>
  );
}

export default SignIn;
