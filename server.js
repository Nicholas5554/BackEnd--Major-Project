import express from "express";
import router from "./router/router.js";
import { badRequest } from "./middlewares/badRequest.js";
import { conn } from "./services/db.service.js";
import User from "./users/models/user.schema.js";
import usersSeed from "./users/initialData/initialusers.json" with {type: "json"};
import chalk from "chalk";
import { hashPassword } from "./users/services/password.service.js";
import dotenv from "dotenv";
import { morganFileLogger } from "./middlewares/logger.js";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();
const { PORT } = process.env;

const app = express();
const server = createServer(app);
export const io = new Server(server, {
    cors: {
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
    }
});

// Middleware
app.use(morganFileLogger);
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.static("public"));

// API Routes
app.use(router);
app.use(badRequest);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).send("Oh oh, something broke");
});

// Handle WebSocket Connections
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Database Connection & Seeding
const startServer = async () => {
    try {
        await conn();
        const usersFromDb = await User.find();

        usersSeed.forEach(async (user) => {
            if (!usersFromDb.find((dbUser) => dbUser.email === user.email)) {
                const newUser = new User(user);
                newUser.password = await hashPassword(newUser.password);
                await newUser.save();
            }
        });

        server.listen(PORT, () => {
            console.log(chalk.green(`Server is running on port: ${PORT}`));
        });

    } catch (error) {
        console.error("Database connection failed:", error);
    }
};

startServer();
