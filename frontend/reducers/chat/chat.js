import {
    RECEIVE_CHAT,
    RECEIVE_NEW_MESSAGE,
    RECEIVE_CHAT_ERRORS
  } from "../../actions/chat.js";

const initialState = {
    chat: null,
    errors: [],
    messages: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case RECEIVE_CHAT:
            return {
                ...state,
                chat: action.chat,
                errors: []
            };
        case RECEIVE_NEW_MESSAGE:
            return {
                ...state,
                messages: [...state.messages, action.message],
                errors: []
            };
        case RECEIVE_CHAT_ERRORS:
            return {
                ...state,
                errors: action.errors
            };
        default:
            return state;
    }
};
