import mongoose from 'mongoose';
import { messageSchema } from './message.js';

const conversationSchema = new mongoose.Schema({
    messages: [messageSchema],
    conversationId: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Conversation  = mongoose.model("Conversation", conversationSchema);

export default Conversation;
export { conversationSchema };