import {
  RECEIVE_CURRENT_USER,
  LOGOUT_CURRENT_USER,
} from "../../actions/session.js";

const _nullSession = { userId: null, username: null, conversations: [] }; 

export default (state = _nullSession, { type, user, chat }) => {
  Object.freeze(state);
  switch (type) {
    case RECEIVE_CURRENT_USER:
      return {
        ...user,
        conversations: state.conversations,
      };
    case LOGOUT_CURRENT_USER:
      return _nullSession;
    default:
      return state;
  }
};
