import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkSessionValidity } from "../actions/session";

const AuthRoute = ({ element }) => {
  const dispatch = useDispatch();
  const loggedIn = useSelector(state => Boolean(state.session?.userId));
  useEffect(() => {
    if (loggedIn) {
      dispatch(checkSessionValidity());
    }
  }, [dispatch, loggedIn]);
  return loggedIn ? <Navigate to="/chat" replace /> : element;
};

export default AuthRoute;
