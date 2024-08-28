import { configureStore } from "@reduxjs/toolkit";
import sessionReducer from './session/sessionSlice.js';
import chatReducer from './chat/chatSlice.js';
import thunk from 'redux-thunk';

export const store = configureStore({
    reducer: {sessionReducer, chatReducer}
});


// import { createStore, applyMiddleware } from "redux";
// import reducer from "../reducers/root.js";
// import { thunk } from "redux-thunk";

// const loadState = () => {
//   try {
//     const serializedState = localStorage.getItem('state');
//     if (serializedState === null) {
//       return undefined; 
//     }
//     return JSON.parse(serializedState);
//   } catch (err) {
//     console.error("Could not load state from localStorage:", err);
//     return undefined;
//   }
// };

// const saveState = (state) => {
//   try {
//     const serializedState = JSON.stringify(state);
//     localStorage.setItem('state', serializedState);
//   } catch (err) {
//     console.error("Could not save state to localStorage:", err);
//   }
// };

// export default preloadedState => {
//   const persistedState = loadState();
//   const store = createStore(
//     reducer,
//     persistedState || preloadedState,
//     applyMiddleware(thunk)
//   );

//   store.subscribe(() => {
//     saveState({
//       session: store.getState().session, 
//     });
//   });

//   return store;
// };
