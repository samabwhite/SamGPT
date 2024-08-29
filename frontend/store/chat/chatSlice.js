import { createSlice, createAsyncThunk} from "@reduxjs/toolkit";

const initialState = {
    conversations: [],
    messages: [],
    error: null,
    status: 'idle'
};

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addConversation: (state, action) => {
            state.conversations.push(action.payload.conversation);
        }
    },
    extraReducers: builder => {
        builder
            // getConversations
            .addCase(getConversations.pending, (state, action) => {
                state.status = 'pending';
            })
            .addCase(getConversations.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.conversations = action.payload.conversations;
            })
            .addCase(getConversations.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message ?? 'Unknown Error';
            })

            // sendMessage
            .addCase(sendMessage.pending, (state, action) => {
                state.status = 'pending';
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.messages.push(action.payload.message);
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message ?? 'Unknown Error';
            })
    }
}); 



const getConversations = createAsyncThunk("getConversations", async () => {
    const res = await fetch("api/chat", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });
    return res?.json();
});

const sendMessage = createAsyncThunk("sendMessage", async (user, conversationId, message, initMessage)  => {
    const res = await fetch("api/chat", {
        method: "POST",
        body: JSON.stringify({
            user,
            conversationId,
            message,
            initMessage
        }),
        headers: {
            "Content-Type": "application/json"
        }
    });
    return res.json();
});

export const { addConversation } = chatSlice.actions;
export { getConversations, sendMessage };

export default chatSlice.reducer;
