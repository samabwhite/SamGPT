import {
  RECEIVE_CURRENT_USER,
  LOGOUT_CURRENT_USER,
  RECEIVE_SESSION_ERRORS
} from "../../actions/session.js";

const _nullSession = { userId: null, username: null, conversations: [] }; 

export default (state = _nullSession, action) => {
  const {type, user, chat} = action;
  Object.freeze(state);
  switch (type) {
    case RECEIVE_CURRENT_USER:
      return {
        ...user,
        conversations: state.conversations,
      };
    case LOGOUT_CURRENT_USER:
      return _nullSession;
    case RECEIVE_SESSION_ERRORS:
      return {
        ...user,
        error: action.error
      }
    default:
      return state;
  }
};
