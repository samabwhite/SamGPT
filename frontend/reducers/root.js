import { combineReducers } from 'redux';
import session from './session/session.js';
import chat from './chat/chat.js';

export default combineReducers({
    session,
    chat
});


