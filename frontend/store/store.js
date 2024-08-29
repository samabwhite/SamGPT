import { configureStore } from "@reduxjs/toolkit";
import sessionReducer from './session/sessionSlice.js';
import chatReducer from './chat/chatSlice.js';
import thunk from 'redux-thunk';

export const store = configureStore({
    reducer: {sessionReducer, chatReducer}
});