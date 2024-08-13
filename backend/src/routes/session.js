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
        await signIn.validateAsync({ email, password });

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
        if (user) {
            session.destroy(err => {
                if (err) throw (err);

                res.clearCookie(SESS_NAME);
                res.send(user);
            });
        } else {
            throw new Error("Something went wrong, try again")
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

