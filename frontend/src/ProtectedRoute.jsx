import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getSession, logout } from "../store/session/sessionSlice.js";
import Loading from './Loading.jsx';
import { getConversations } from '../store/chat/chatSlice.js';

const ProtectedRoute = ({ element }) => {
	const dispatch = useDispatch();
	const session = useSelector((state) => state.sessionReducer);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchSession() {
			await dispatch(getSession());
			setLoading(false);
		};

		fetchSession();
	}, [dispatch]);

	useEffect(() => {
		async function checkLogout() {
			if (!loading && !session.userId) {
				await dispatch(logout());
			}
		}

		checkLogout();
	}, [dispatch, loading, session.userId]);

	if (loading) {
		return <Loading />;
	}

	if (!session.userId) {
		return <Navigate to="/signin" replace />;
	}

	return element;
};

export default ProtectedRoute;
