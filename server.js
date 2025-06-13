import express from "express";
import router from "./router/router.js";
import { badRequest } from "./middlewares/badRequest.js";
import { conn } from "./services/db.service.js";
import User from "./users/models/user.schema.js";
import chalk from "chalk";
import { hashPassword } from "./users/services/password.service.js";
import dotenv from "dotenv";
import { morganFileLogger } from "./middlewares/logger.js";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();
const { PORT, ADMIN_EMAIL, ADMIN_PASSWORD, SEED_ADMIN } = process.env;

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

// Database Connection & Seeding
const startServer = async () => {
    try {
        await conn();
        await User.find();

        if (SEED_ADMIN === "true") {
            const existing = await User.findOne({ email: ADMIN_EMAIL });
            if (!existing) {
                const hashedPassword = await hashPassword(ADMIN_PASSWORD);
                const adminUser = new User({
                    name: {
                        first: "admin",
                        middle: "",
                        last: "admin",
                    },
                    image: {
                        url: "https://cdn.mos.cms.futurecdn.net/o2QR532EoNCFnrvjuia6r6-320-80.jpg",
                        alt: "iphone 16",
                    },
                    isManager: true,
                    isAdmin: true,
                    phone: "0541231234",
                    email: ADMIN_EMAIL,
                    password: hashedPassword,
                    address: {
                        country: "Israel",
                        city: "tel aviv",
                        street: "tel aviv street",
                        houseNumber: 130,
                    },
                });

                await adminUser.save();
            }
        }


        server.listen(PORT, () => {
            console.log(chalk.green(`Server is running on port: ${PORT}`));
        });

    } catch (error) {
        console.error("Database connection failed:", error);
    }
};

startServer();
