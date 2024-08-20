export const signin = user => (
    fetch("/api/session", {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
            "Content-Type": "application/json"
        }
    })
);

export const logout = () => (
    fetch("/api/session", { method: "DELETE" })
);

export const session = user => (
    fetch("/api/session", {
        method: "GET",
        body: JSON.stringify(user),
        headers: {
            "Content-Type": "application/json"
        }
    })
);

export const register = user => (
    fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
            "Content-Type": "application/json",
        }
    })
);

