import {
    RECEIVE_CHAT,
    RECEIVE_NEW_MESSAGE,
    RECEIVE_CHAT_ERRORS,
    UPDATE_CONVERSATION
} from "../../actions/chat.js";

const initialState = {
    conversations: [],  
    error: [],
    messages: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case RECEIVE_CHAT:
            return {
                ...state,
                conversations: action.chat.conversations || [],  
                error: []
            };
        case RECEIVE_NEW_MESSAGE:
            return {
                ...state,
                messages: [...state.messages, action.message],
                error: []
            };
        case RECEIVE_CHAT_ERRORS:
            return {
                ...state,
                error: action.error
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
