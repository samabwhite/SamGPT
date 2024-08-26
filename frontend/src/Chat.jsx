import React, { useState, useEffect, useCallback } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator, ConversationList, Conversation } from '@chatscope/chat-ui-kit-react';
import './Chat.css';
import logo from './assets/logo.png';
import githubLogo from './assets/github.png';

import { connect } from "react-redux";
import { logout } from "../actions/session";
import { getChat, sendMessage, addConversation } from '../actions/chat.js';

const mapStateToProps = ({ session, chat }) => ({
  session,
  conversations: chat.conversations || []  
});

const mapDispatchToProps = dispatch => ({
    logout: () => dispatch(logout()),
    getChat: () => dispatch(getChat()),
    sendMessage: (user, conversationId, message, initMessage) => 
        dispatch(sendMessage(user, conversationId, message, initMessage)),
    addConversation: (conversation) => dispatch(addConversation(conversation))
});


function Chat({ session, conversations, logout, getChat, sendMessage, addConversation }) {
    const [loading, setLoading] = useState(true);
    const [typing, setTyping] = useState(false);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(true);

    useEffect(() => {
        if (!currentConversation && conversations.length > 0) {
            setCurrentConversation(conversations[conversations.length - 1]);
        } else if (conversations.length == 0 && !loading) {
            handleNewConversation();
        }
    }, [conversations]);

    const handleSend = async (message) => {
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
        
        addConversation(updatedConversation);
        
        setTyping(true);
        
        const initMessage = currentConversation.messages.length === 1 ? currentConversation.messages[0] : null; 
        
        const response = await sendMessage(session, currentConversation.conversationId, newMessage, initMessage);
        
        const responseMessage = {
            message: response.message.message,
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
        
        addConversation(finalConversation);
        
        setTyping(false);
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

        conversations.push(newConversation);
        setCurrentConversation(newConversation);
    };

    const memoizedGetChat = useCallback(() => {
        if (session.userId) {
            getChat();
            setLoading(false);
        }
    }, [session.userId, getChat]);

    useEffect(() => {
        memoizedGetChat();
    }, [memoizedGetChat]);

    return (
        <div className="Chat">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>
            <div className="header">
                <img src={logo} alt="Logo" className="logo" />
                <a href="https://github.com/samabwhite/SamGPT" target="_blank" rel="noopener noreferrer" className="github-link">
                    <img src={githubLogo} alt="GitHub" className="github-logo" />
                </a>
                <button onClick={logout} className="logout-button">Logout</button>
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
                                    info={conversation.messages[conversation.messages.length - 1]?.timestamp.toString().substring(0, 10) || 'No time'}
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
                        <MessageInput placeholder="Type message here" onSend={handleSend} attachButton={false} />
                    </ChatContainer>
                </MainContainer>
            </div>
        </div>
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Chat);
