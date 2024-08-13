import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import { userRouter, sessionRouter, chatRouter } from './routes/index.js';
import { PORT, NODE_ENV, MONGO_URI, SESS_NAME, SESS_SECRET, SESS_LIFETIME } from './config.js';

mongoose.set('strictQuery', true);

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    const app = express();

    app.disable('x-powered-by');

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    const store = connectMongo.create({
      client: mongoose.connection.getClient(),
      collectionName: 'sessions',
      ttl: parseInt(SESS_LIFETIME) / 1000 
    });

    app.use(session({
      name: SESS_NAME,
      secret: SESS_SECRET,
      saveUninitialized: false,
      resave: false,
      store: store,
      cookie: {
        sameSite: true,
        secure: NODE_ENV === 'production',
        maxAge: parseInt(SESS_LIFETIME)
      }
    }));

    const apiRouter = express.Router();
    app.use('/api', apiRouter);
    apiRouter.use('/users', userRouter);
    apiRouter.use('/session', sessionRouter);
    apiRouter.use('/chat', chatRouter);

    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  } catch (err) {
    console.error(err);
  }
})();
