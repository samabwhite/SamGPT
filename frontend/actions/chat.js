import * as apiUtil from '../util/chat.js';

export const RECEIVE_CHAT = 'RECEIVE_CHAT';
export const RECEIVE_NEW_MESSAGE = 'RECEIVE_NEW_MESSAGE';
export const RECEIVE_CHAT_ERRORS = 'RECEIVE_CHAT_ERRORS';
export const UPDATE_CONVERSATION = 'UPDATE_CONVERSATION';

const receiveChat = chat => ({
    type: RECEIVE_CHAT,
    chat
});

const receiveNewMessage = message => ({
    type: RECEIVE_NEW_MESSAGE,
    message
});

const receiveChatErrors = errors => ({
    type: RECEIVE_CHAT_ERRORS,
    errors
});

const updateConversation = conversation => ({
    type: UPDATE_CONVERSATION,
    conversation
});

export const getChat = () => async dispatch => {
    try {
        const response = await apiUtil.getChat();
        const data = await response.json();
        if (response.ok) {
            return dispatch(receiveChat(data));
        } else {
            return dispatch(receiveChatErrors(['Failed to fetch chat']));
        }
    } catch (error) {
        return dispatch(receiveChatErrors(['An unexpected error occurred while fetching the chat']));
    }
};



export const sendMessage = (user, conversationId, message, initMessage) => async dispatch => {
    try {
        const response = await apiUtil.sendMessage(user, conversationId, message, initMessage);
        const data = await response.json();

        if (response.ok) {
            return dispatch(receiveNewMessage(data));
        } else {
            return dispatch(receiveChatErrors(data.errors || ['Failed to send message']));
        }
    } catch (error) {
        return dispatch(receiveChatErrors([error.message || 'An unexpected error occurred while sending the message']));
    }
};

export const addConversation = (conversation) => async dispatch => {
    try {
        return dispatch(updateConversation(conversation));
    } catch (error) {
        console.log(error);
    }
};

