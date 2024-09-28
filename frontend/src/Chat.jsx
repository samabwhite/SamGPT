import React, { useState, useEffect } from 'react';
import { unwrapResult } from '@reduxjs/toolkit';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator, ConversationList, Conversation } from '@chatscope/chat-ui-kit-react';
import './Chat.css';
import logo from './assets/logo.png';
import githubLogo from './assets/github.png';
import { logout } from "../store/session/sessionSlice.js";
import { getConversations, sendMessage, addConversation, updateConversation, setCurrentConversation } from '../store/chat/chatSlice.js';
import { useDispatch, useSelector } from "react-redux";


function Chat() {
    const dispatch = useDispatch();

    const conversations = useSelector((state) => state.chatReducer.conversations);
    const sessionReducer = useSelector((state) => state.sessionReducer);
    const chatReducer = useSelector((state) => state.chatReducer);
    const session = { userId: sessionReducer.userId, username: sessionReducer.username }

    const [loading, setLoading] = useState(true);
    const [typing, setTyping] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [showPopup, setShowPopup] = useState(true);
    const [error, setError] = useState(null);

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    useEffect(() => {
        if (!chatReducer.currentConversation && conversations.length > 0) {
            dispatch(setCurrentConversation(conversations[conversations.length - 1]));
        } else if (conversations.length === 0 && !loading) {
            handleNewConversation();
        }
    }, [conversations]);

    useEffect(() => {
        setError(chatReducer.error);
    }, [chatReducer.error]);

    const handleLogout = () => {
        dispatch(logout());
    }

    const addMessage = (message, sender, direction, currentConversation) => {
        const newMessage = {
            message: message,
            sender: sender,
            direction: direction,
            timestamp: new Date()
        };

        const updatedMessages = [...currentConversation.messages, newMessage];

        const updatedConversation = {
            ...currentConversation,
            messages: updatedMessages,
            updatedAt: new Date()
        };

        dispatch(setCurrentConversation(updatedConversation));
        dispatch(updateConversation(updatedConversation));

        return updatedConversation;
    }

    const handleSend = async (message) => {
        try {
            setTyping(true);
            setError(null);
            if (!chatReducer.currentConversation) return;

            const updatedConversation = addMessage(message, "user", "outgoing", chatReducer.currentConversation);

            const initMessage = updatedConversation.messages.length === 2 ? updatedConversation.messages[0] : null;

            const resultAction = await dispatch(sendMessage({
                user: session,
                conversationId: chatReducer.currentConversation.conversationId,
                message: updatedConversation.messages[updatedConversation.messages.length - 1],
                initMessage: initMessage
            }));

            const result = unwrapResult(resultAction);

            addMessage(result.message, "SamGPT", "incoming", updatedConversation);
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setTyping(false);
        }
    };

// getting bug where the handle new conversation isnt accurately making a conversation id since the number of conversations is still loading in
    const handleNewConversation = () => {
        const newConversationId = conversations.length + 1;
        const newConversation = {
            conversationId: newConversationId,
            messages: [{
                message: "Hi, I'm SamGPT! Start a conversation.",
                sender: "SamGPT",
                direction: "incoming"
            }]
        };

        dispatch(addConversation(newConversation));
        dispatch(setCurrentConversation(newConversation));
    };


    useEffect(() => {
        const fetchConversations = async () => {
            if (session.userId) {
                await dispatch(getConversations()).then(() => {
                    setLoading(false);
                });
            }
        };
        fetchConversations();
    }, [session.userId, dispatch]);


    return (
        <div className="Chat">
            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup">
                        <h2>Welcome to SamGPT!</h2>
                        <p>
                            This is the home of my custom-made 10M parameter Decoder-Only Transformer GPT model, which I trained on my 2060 for roughly 12 hours. That’s just a fun way of saying I created an over-engineered Lorem Ipsum generator... but a pretty cool one. It's currently hosted on an AWS SageMaker endpoint, while the website itself is hosted on a DigitalOcean VPS Droplet. For more information, check out the GitHub repo&nbsp;
                            <a href="https://github.com/samabwhite/SamGPT" target="_blank">here</a>!
                        </p>
                        <p>
                            You can interact with the model by starting a conversation. The conversations will be saved to your account so you can come back to them later. Feel free to start new conversations if you want to keep things separate.
                        </p>
                        <p>
                            Try your best not to overuse the poor thing since it is transferring my money into Jeff Bezos' pocket. Thanks!
                        </p>
                        <p>
                            Let me know what you think!&nbsp;
                            <a href="mailto:swhite75@asu.edu">Email me</a>.
                        </p>
                        <button className="close-popup-button" onClick={handleClosePopup}>Close</button>
                    </div>
                </div>
            )}
            <div className="header">
                <img src={logo} alt="Logo" className="logo" />
                <a href="https://github.com/samabwhite/SamGPT" target="_blank" rel="noopener noreferrer" className="github-link">
                    <img src={githubLogo} alt="GitHub" className="github-logo" />
                </a>
                <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
            <div className="chat-container">
                <MainContainer>
                    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                        <div className="button-container">
                            <button onClick={handleNewConversation} className="new-conversation-button">
                                <span className="material-icons">add</span>
                            </button>
                            <button className="collapse-button" onClick={() => setIsCollapsed(!isCollapsed)}>
                                {isCollapsed ? (
                                    <span className="material-icons sp-icon-open">keyboard_double_arrow_right</span>
                                ) : (
                                    <span className="material-icons sp-icon-close">keyboard_double_arrow_left</span>
                                )}
                            </button>
                        </div>
                        <ConversationList className="cs-conversation-list">
                            {[...conversations].reverse().map((conversation, index) => (
                                <Conversation
                                    key={index}
                                    name={conversation.messages[conversation.messages.length - 1]?.message || 'No messages yet'}
                                    info={conversation.messages[conversation.messages.length - 1]?.timestamp?.toString().substring(0, 10) || 'No time'}
                                    lastSenderName={conversation.messages[conversation.messages.length - 1]?.sender || 'Unknown'}
                                    onClick={() => {
                                        dispatch(setCurrentConversation(conversation));
                                    }}
                                    className={conversation.conversationId === chatReducer.currentConversation?.conversationId ? 'cs-conversation current' : 'cs-conversation'}
                                />
                            ))}
                        </ConversationList>
                    </div>
                    <ChatContainer>
                        <MessageList typingIndicator={typing ? <TypingIndicator content="SamGPT is typing..." /> : null}>
                            {chatReducer.currentConversation?.messages.map((message, i) => (
                                <Message key={i} model={message} />
                            ))}
                        </MessageList>
                        <MessageInput placeholder={typing ? "Please wait for response..." : "Type message here"} onSend={handleSend} attachButton={false} disabled={typing} />
                    </ChatContainer>
                </MainContainer>
                {error && <p className="chat-error">{error}</p>}
            </div>
        </div>
    );
}

export default Chat;