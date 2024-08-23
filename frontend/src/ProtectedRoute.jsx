import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkSessionValidity, logout } from "../actions/session";

const ProtectedRoute = ({ element }) => {
  const dispatch = useDispatch();
  const loggedIn = useSelector(state => Boolean(state.session?.userId));

  useEffect(() => {
    if (loggedIn) {
      dispatch(checkSessionValidity()).catch(() => {
        dispatch(logout());
      });
    }
  }, [dispatch, loggedIn]);
  return loggedIn ? element : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;
