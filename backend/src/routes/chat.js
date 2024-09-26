import express from "express";
import User from "../models/user.js";
import { parseError } from "../util/helpers.js";
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import { AWS_URL } from "../config.js"

const chatRouter = express.Router();

// Get all conversations
chatRouter.get("", async (req, res) => {
    try {
        const { user } = req.session;
        if (user) {
            const foundUser = await User.findById(user.userId);
            if (!foundUser) {
                throw new Error("User not found");
            }
            const message_count = foundUser.message_count;
            const conversations = foundUser.conversations;
            res.send({ message_count, conversations }); 
        } else {
            throw new Error("Not logged in, conversation history unavailable");
        }
    } catch (err) {
        res.status(400).send(parseError(err));
    }
});

// Send message
chatRouter.post("", async (req, res) => {
    try {
        const { user } = req.session;
        const { conversationId, message, initMessage } = req.body;
        if (message.message.length > 999) {
            throw new Error("Message length too large");
        }
        
        if (user) {
            const foundUser = await User.findById(user.userId);
            if (!foundUser) {
                throw new Error("User not found");
            }

            let conversation = foundUser.conversations.find(c => c.conversationId === conversationId);
            const newMessage = new Message(message);

            if (!conversation) {
                const firstMessage = new Message(initMessage);
                conversation = new Conversation({ messages: [firstMessage, newMessage], conversationId });
                foundUser.conversations.push(conversation);
                conversation = foundUser.conversations[foundUser.conversations.length - 1];
            } else {
                conversation.messages.push(newMessage);
                conversation.updatedAt = Date.now();
            }

            const response = await fetch(AWS_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    data: newMessage.message
                })
            });

            foundUser.message_count += 1;

            const data = await response.json()

            if (response.ok) {
                const modelMessage = new Message({    
                    message: data.generated_text,
                    sender: "SamGPT",
                    direction: "incoming"
                });
                conversation.messages.push(modelMessage);
                conversation.updatedAt = Date.now();

                await foundUser.save({ validateModifiedOnly: true });

                return res.send({ 
                    message_count: foundUser.message_count, 
                    message: modelMessage.message 
                });
            } else {
                    throw new Error("Come back soon, the model is currently not running since it's outside of scheduled hours. It run's everyday from 9am-8pm EST.");
            }
        } else {
            throw new Error("Not logged in, can't add conversation history");
        }
    } catch (err) {
        res.status(400).send(parseError(err));
    }
});

export default chatRouter;
