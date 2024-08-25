import {
    RECEIVE_CHAT,
    RECEIVE_NEW_MESSAGE,
    RECEIVE_CHAT_ERRORS,
    UPDATE_CONVERSATION
} from "../../actions/chat.js";

const initialState = {
    conversations: [],  
    errors: [],
    messages: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case RECEIVE_CHAT:
            return {
                ...state,
                conversations: action.chat.conversations || [],  
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
        case UPDATE_CONVERSATION: 
            const updatedConversations = state.conversations.map(convo =>
                convo.conversationId === action.conversation.conversationId ? action.conversation : convo
            );
            return {
                ...state,
                conversations: updatedConversations
            };
        default:
            return state;
    }
};
