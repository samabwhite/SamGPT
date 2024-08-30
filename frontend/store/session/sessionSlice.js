import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    userId: null,
    username: null,
    error: null,
    status: 'idle'
}

const setUserDetails = (state, action) => {
    const { userId, username } = action.payload;
    state.status = 'succeeded';
    state.userId = userId;
    state.username = username;
};

export const sessionSlice = createSlice({
    name: 'session',
    initialState,
    extraReducers: builder => {
        // signin, register, and getSession
        // loop for each action since all cases are equivalent
        [signin, register, getSession].forEach((action) => {
            builder
                .addCase(action.pending, (state, action) => {
                    state.status = 'pending';
                })
                .addCase(action.fulfilled, (state, action) => {
                    setUserDetails(state, action);
                })
                .addCase(action.rejected, (state, action) => {
                    state.status = 'failed';
                    state.error = action.error.message ?? 'Unknown Error';
                })
        })
        builder
            // logout
            .addCase(logout.pending, (state, action) => {
                state.status = 'pending';
            })
            .addCase(logout.fulfilled, (state, action) => {
                return {...initialState};
            })
            .addCase(logout.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message ?? 'Unknown Error';
            });
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
    const body = await res.json();
    if (!res.ok) {
        throw new Error(body.message);
    }
    return body;
});

const register = createAsyncThunk("register", async user => {
    const res = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
            "Content-Type": "application/json",
        }
    });
    const body = await res.json();
    if (!res.ok) {
        throw new Error(body.message);
    }
    return body;
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
    const body = await res.json();
    if (!body.user) {
        throw new Error(body.message || "");
    }
    return body.user;
});

export { signin, register, logout, getSession };

export default sessionSlice.reducer

