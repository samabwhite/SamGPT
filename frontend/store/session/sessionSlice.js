import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    userId: null,
    username: null,
    error: null,
    status: 'idle'
}

export const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setUser: (state, action) => {
            userId, username = action.payload;
            state.userId = userId;
            state.username = username;
        },
        logoutUser: (state) => {
            state = initialState;
        }
    }
});




const signin = createAsyncThunk("signin", async user => {
    const res = await fetch("/api/session", {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
            "Content-Type": "application/json"
        }
    });
    return res?.json();
});

const logout = createAsyncThunk("logout", async () => {
    const res = await fetch("/api/session", { method: "DELETE" });
    return res?.json();
});

const getSession = createAsyncThunk("getSession", async user => {
    const res = await fetch("/api/session", {
        method: "GET",
        body: JSON.stringify(user),
        headers: {
            "Content-Type": "application/json"
        }
    });
    return res?.json();
});

const register = createAsyncThunk("register", async user => {
    const res = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
            "Content-Type": "application/json",
        }
    });
    return res?.json();
});







export const { setUser, logoutUser, getSessionError } = sessionSlice.actions

export default sessionSlice.reducer

