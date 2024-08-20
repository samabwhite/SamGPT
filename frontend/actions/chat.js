import * as apiUtil from '../util/session.js'

export const RECEIVE_CHAT = 'RECEIVE_CHAT';
export const RECEIVE_NEW_MESSAGE = 'RECEIVE_NEW_MESSAGE';
export const RECEIVE_CHAT_ERRORS = 'RECEIVE_CHAT_ERRORS';


const receiveChat = chat => ({
    type: RECEIVE_CHAT,
    chat
});

const receiveNewMessage = chat => ({
    type: RECEIVE_NEW_MESSAGE,
    message
});

const receiveChatErrors = chat => ({
    type: RECEIVE_CHAT_ERRORS,
    errors
});


export const getChat = user => async dispatch => {
    try {
        const response = await apiUtil.getChat(user);
        const data = await response.json();

        if (response.ok) {
            return dispatch(receiveChat(data));
        } else {
            return dispatch(receiveChatErrors(data.errors || ['Failed to fetch chat']));
        }
    } catch (error) {
        return dispatch(receiveChatErrors([error.message || 'An unexpected error occurred while fetching the chat']));
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








