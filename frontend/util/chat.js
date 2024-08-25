export const getChat = () => (
    fetch("api/chat", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    })
);

export const sendMessage = (user, conversationId, message, initMessage)  => (
    fetch("api/chat", {
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
    })
);

