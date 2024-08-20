export const getChat = user => (
    fetch("api/chat", {
        method: "GET",
        body: JSON.stringify(user),
        headers: {
            "Content-Type": "application/json"
        }
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

