import React, { useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator, ConversationList, Conversation } from '@chatscope/chat-ui-kit-react';
import './Chat.css';
import logo from './assets/logo.png';
import githubLogo from './assets/github.png';

import { connect } from "react-redux";
import { logout } from "../actions/session";

const mapStateToProps = ({ session }) => ({
  session
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout())
});

function Chat({ session, logout }) {
    const [typing, setTyping] = useState(false);
    const [messages, setMessages] = useState([
        {
            message: "Hi, I'm SamGPT! I'm a pretty useless model that is practically a random word generator. I am a homemade model trained on Sam's PC with the SciQ dataset. I'm currently living in an AWS SageMaker server. Ask me anything!",
            sender: "SamGPT",
            direction: "incoming"
        }
    ]);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleSend = async (message) => {
        const newMessage = {
            message: message,
            sender: "user",
            direction: "outgoing"
        };

        const newMessages = [...messages, newMessage];

        setMessages(newMessages);

        setTyping(true);

        const response = await sendMessageToBackend(message);
        const responseMessage = {
            message: response,
            sender: "SamGPT",
            direction: "incoming"
        };

        setMessages([...newMessages, responseMessage]);
        setTyping(false);
    };

    async function sendMessageToBackend(message) {
        const apiRequestBody = {
            data: message
        };

        const response = await fetch(process.env.REACT_APP_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(apiRequestBody)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const generated_text = data['generated_text'];
        return generated_text;
    }

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
                        <button className="collapse-button" onClick={() => setIsCollapsed(!isCollapsed)}>
                            {isCollapsed ? (
                                <span className="material-icons sp-icon-open">keyboard_double_arrow_right</span>
                            ) : (
                                <span className="material-icons sp-icon-close">keyboard_double_arrow_left</span>
                            )}
                        </button>
                        <ConversationList className="cs-conversation-list">
                            <Conversation
                                info="Yes i can do it for you"
                                lastSenderName="Lilly"
                                name="Lilly"
                            />
                            <Conversation
                                info="Yes i can do it for you"
                                lastSenderName="Joe"
                                name="Joe"
                            />
                        </ConversationList>
                    </div>
                    <ChatContainer>
                        <MessageList typingIndicator={typing ? <TypingIndicator content="SamGPT is typing..." /> : null}>
                            {messages.map((message, i) => (
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
