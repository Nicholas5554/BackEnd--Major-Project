import { Router } from "express";
import userRouter from "../users/routes/user.routes.js";
import path from "path";
import { auth } from "../middlewares/auth.js";
import { adminOnly } from "../middlewares/userAuthentication.js";
import { upload } from "../middlewares/formData.js";
import tasksRouter from "../tasks/routes/task.routes.js";
import discussionRouter from "../discussion/routes/discussion.routes.js";

const router = Router();

router.get("/", (req, res) => {
    res.send("hello world");
});

router.get("/logs/:date", auth, adminOnly, (req, res) => {
    try {
        const date = req.params.date;
        return res.sendFile(path.join(process.cwd(), `logs/${date}.txt`));

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/upload", auth, upload, async (req, res) => {
    try {
        return res.json({ message: "File uploaded", file: req.fileName });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


router.use("/users", userRouter);
router.use("/tasks", tasksRouter);
router.use("/discussions", discussionRouter);

export default router;
