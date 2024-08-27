import express from "express";
import User from "../models/user.js";
import { signIn } from "../validations/user.js";
import { parseError, sessionizeUser } from "../util/helpers.js";
import { SESS_NAME } from "../config.js";

const sessionRouter = express.Router();

// signin
sessionRouter.post("", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (user && user.comparePasswords(password)) {
            const sessionUser = sessionizeUser(user);

            req.session.user = sessionUser;
            res.send(sessionUser);
        } else {
            throw new Error('Invalid login credentials');
        }
    } catch (err) {
        res.status(401).send(parseError(err));
    }
});

// logout
sessionRouter.delete("", ({ session }, res) => {
    try {
        const user = session.user;
        
        res.clearCookie(SESS_NAME);
        
        if (user) {
            session.destroy(err => {
                if (err) throw (err);
                res.send(user);
            });
        } else {
            res.send({ message: "Session not found, but cookie cleared" });
        }
    } catch (err) {
        res.status(422).send(parseError(err));
    }
});

// session activity
sessionRouter.get("", ({ session: { user } }, res) => {
    res.send({ user });
});

export default sessionRouter;

