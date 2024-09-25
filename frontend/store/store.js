import { configureStore } from "@reduxjs/toolkit";
import sessionReducer from './session/sessionSlice.js';
import chatReducer from './chat/chatSlice.js';

export const store = configureStore({
    reducer: { sessionReducer, chatReducer },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        })
});