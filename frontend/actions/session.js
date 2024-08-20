import * as apiUtil from '../util/session.js'

export const RECEIVE_CURRENT_USER = 'RECEIVE_CURRENT_USER';
export const LOGOUT_CURRENT_USER = 'LOGOUT_CURRENT_USER';
export const RECEIVE_SESSION_ERRORS = 'RECEIVE_SESSION_ERRORS';


const receiveCurrentUser = user => ({
    type: RECEIVE_CURRENT_USER,
    user
});

const receiveSessionErrors = errors => ({
    type: RECEIVE_SESSION_ERRORS,
    errors
});

const logoutCurrentUser = () => ({
    type: LOGOUT_CURRENT_USER
});



export const signin = user => async dispatch => {
    try {
        const response = await apiUtil.signin(user);
        const data = await response.json();
        if (response.ok) {
            return dispatch(receiveCurrentUser(data));
        } else {
            return dispatch(receiveSessionErrors(data.errors || ['Sign-in failed']));
        }
    } catch (error) {
        return dispatch(receiveSessionErrors([error.message || 'An unexpected error occurred during sign-in']));
    }
};

export const register = user => async dispatch => {
    try {
        const response = await apiUtil.register(user);
        const data = await response.json();
        if (response.ok) {
            return dispatch(receiveCurrentUser(data));
        } else {
            return dispatch(receiveSessionErrors(data.errors || ['Registration failed']));
        }
    } catch (error) {
        return dispatch(receiveSessionErrors([error.message || 'An unexpected error occurred during registration']));
    }
};

export const logout = () => async dispatch => {
    try {
        const response = await apiUtil.logout();
        
        if (response.ok) {
            return dispatch(logoutCurrentUser());
        } else {
            const data = await response.json();
            return dispatch(receiveSessionErrors(data.errors || ['Logout failed']));
        }
    } catch (error) {
        return dispatch(receiveSessionErrors([error.message || 'An unexpected error occurred during logout']));
    }
};