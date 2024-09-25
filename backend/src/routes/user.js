import express from 'express';
import User from '../models/user.js';
import { register } from '../validations/user.js';
import { parseError, sessionizeUser } from '../util/helpers.js';

const userRouter = express.Router();

userRouter.post("", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        await register.validateAsync({ username, email, password });

        const newUser = new User({ username, email, password });
        const sessionUser = sessionizeUser(newUser);
        await newUser.save();
        
        req.session.user = sessionUser;

        res.send(sessionUser);
    } catch(err) {
        res.status(400).send(parseError(err));
    }
});

export default userRouter;