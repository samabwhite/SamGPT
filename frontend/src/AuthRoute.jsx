import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getSession } from "../store/session/sessionSlice.js";

const AuthRoute = ({ element }) => {
	const dispatch = useDispatch();
	const loggedIn = useSelector((state) => state.sessionReducer.userId);

	useEffect(() => {
    	async function fetchSession() {
      	await dispatch(getSession());
    }
    fetchSession();
}, [dispatch]);

	return loggedIn ? <Navigate to="/chat" replace /> : element;
};

export default AuthRoute;
