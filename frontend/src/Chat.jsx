import React, { useState, useEffect, useCallback } from 'react';
import { unwrapResult } from '@reduxjs/toolkit';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator, ConversationList, Conversation } from '@chatscope/chat-ui-kit-react';
import './Chat.css';
import logo from './assets/logo.png';
import githubLogo from './assets/github.png';

import { logout } from "../store/session/sessionSlice.js";
import { getConversations, sendMessage, addConversation, updateConversation } from '../store/chat/chatSlice.js';

import { useDispatch, useSelector } from "react-redux";


function Chat() {
    const dispatch = useDispatch();

    const conversations = useSelector((state) => state.chatReducer.conversations);
    const sessionReducer = useSelector((state) => state.sessionReducer);
    const chatReducer = useSelector((state) => state.chatReducer);
    const session = { userId : sessionReducer.userId, username: sessionReducer.username }

    const [loading, setLoading] = useState(true);
    const [typing, setTyping] = useState(false);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    useEffect(() => {
        if (!currentConversation && conversations.length > 0) {
            setCurrentConversation(conversations[conversations.length - 1]);
        } else if (conversations.length === 0 && !loading) {
            handleNewConversation();
        }
    }, [conversations]);

    useEffect(() => {
        setError(chatReducer.error);
    }, [chatReducer.error]);

    const handleLogout = async () => {
        dispatch(logout());
    }

    const handleSend = async (message) => {
        setSending(true);
        setError(null);
        if (!currentConversation) return;
        
        const newMessage = {
            message: message,
            sender: "user",
            direction: "outgoing",
            timestamp: new Date() 
        };
        
        const updatedMessages = [...currentConversation.messages, newMessage];
        
        const updatedConversation = { 
            ...currentConversation, 
            messages: updatedMessages,
            updatedAt: new Date() 
        };
    
        setCurrentConversation(updatedConversation);
        
        dispatch(updateConversation(updatedConversation));
        
        setTyping(true);
        
        const initMessage = currentConversation.messages.length === 1 ? currentConversation.messages[0] : null;
        
        try {
            const resultAction = await dispatch(sendMessage({
                user: session,
                conversationId: currentConversation.conversationId,
                message: newMessage,
                initMessage: initMessage
            }));
            
            const result = unwrapResult(resultAction);
            
            const responseMessage = {
                message: result.message,
                sender: "SamGPT",
                direction: "incoming",
                timestamp: new Date() 
            };
    
            const finalMessages = [...updatedMessages, responseMessage];
        
            const finalConversation = { 
                ...updatedConversation, 
                messages: finalMessages,
                updatedAt: new Date() 
            };
            
            setCurrentConversation(finalConversation);
            
            dispatch(updateConversation(finalConversation));
            
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setTyping(false);
            setSending(false);
        }
    };
    

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
        setCurrentConversation(newConversation);
    };

    const memoizedgetConversations = useCallback(() => {
        if (session.userId) {
            dispatch(getConversations());
            setLoading(false);
        }
    }, [session.userId, getConversations]);

    useEffect(() => {
        memoizedgetConversations();
    }, [memoizedgetConversations]);

    return (
        <div className="Chat">
            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup">
                        <h2>Welcome to SamGPT!</h2>
                        <p>This project is a chat application that uses a Decoder-Only Transform GPT model hosted on AWS SageMaker. You can interact with the model by starting a conversation below. The model is designed to respond to your queries in a conversational manner.</p>
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
                                        setCurrentConversation(conversation);
                                    }}
                                    className={conversation.conversationId === currentConversation?.conversationId ? 'cs-conversation current' : 'cs-conversation'}
                                />
                            ))}
                        </ConversationList>
                    </div>
                    <ChatContainer>
                        <MessageList typingIndicator={typing ? <TypingIndicator content="SamGPT is typing..." /> : null}>
                            {currentConversation?.messages.map((message, i) => (
                                <Message key={i} model={message} />
                            ))}
                        </MessageList>
                        <MessageInput placeholder={sending ? "Please wait for response..." : "Type message here"} onSend={handleSend} attachButton={false} disabled={sending}/>
                    </ChatContainer>
                </MainContainer>
                {error && <p className="chat-error">{error}</p>} 
            </div>
        </div>
    );
}

export default Chat;