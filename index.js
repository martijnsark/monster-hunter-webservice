import express from 'express';
import mongoose from "mongoose";
import monsterRouter from './routes/monsters.js';
import authRoutes from "./routes/auth.js";

try {
    const app = express();

    // middleware for parsing JSON and URL-encoded data
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // middleware prevent non json request receiving json data
    app.use((req, res, next) => {
        if(req.header('Accept') !== 'application/json' && req.method !== "OPTIONS"){
            res.status(406);
            res.json({error: 'only JSON as accept header pretty please'})
            return;
        }
        next();
    });

    // Connect to MongoDB
    await mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`, {
        serverSelectionTimeoutMS: 3000
    });

    // Root route
    app.get('/', (req, res) => {
        res.json({ message: 'Hello! This is my MonsterHunter webservice.' });
    });

    // monster routes
    app.use('/monsters', monsterRouter);
    // auth route for login
    app.use("/auth", authRoutes);

    app.listen(process.env.EXPRESS_PORT, () => {
        console.log(`The server is running on port ${process.env.EXPRESS_PORT}`);
    });

} catch (e) {
    console.log(e);
}
