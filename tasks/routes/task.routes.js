import { Router } from "express";
import { getAllTasks, getTaskById, createTask, updateTask, getTaskByUserId, deleteTask, getTaskByAssign } from "../services/dataAccessServicesTasks.service.js";
import { auth } from "../../middlewares/auth.js";
import { adminOnly, adminOrManagerOnly, adminOrUserTask, adminOrUserTaskOrAssignedToUser, userOnly } from "../../middlewares/userAuthentication.js";
import taskValidation from "../models/taskValidation.schema.js";
import taskStatusValidation from "../models/taskStatusValidation.schema.js";
import { io } from "../../server.js";


const tasksRouter = Router();

// getting all tasks
tasksRouter.get("/", auth, adminOnly, async (req, res) => {
    try {
        const tasks = await getAllTasks();
        res.json(tasks);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// get the user's created tasks by his id
tasksRouter.get("/my-createdTasks", auth, async (req, res) => {
    const user = req.user;
    const taskUserId = await getTaskByUserId(user._id);

    if (!taskUserId) {
        res.status(401).send("Unauthorized user");

    } else {
        try {
            return res.json(taskUserId);
        } catch (err) {
            res.status(400).send(err.message);
        }
    }
});

// get the user's task that he got assined to
tasksRouter.get("/myAssignedTasks", auth, async (req, res) => {
    try {
        const user = req.user;
        const tasks = await getTaskByAssign(user._id);
        if (!tasks || tasks.length === 0) {
            return res.status(400).send("no tasks found");
        }
        return res.json(tasks);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// get task by it's id
tasksRouter.get("/:id", auth, adminOrUserTaskOrAssignedToUser, async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await getTaskById(taskId);
        if (!task) {
            res.status(400).send("did not find task")
        }
        return res.json(task);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});

// creating a new task (only managers & admin)
tasksRouter.post("/", auth, adminOrManagerOnly, async (req, res) => {
    const { error } = taskValidation.validate(req.body, { abortEarly: false });

    if (error) {
        res.status(400).json({ errors: error.details.map((e) => e.message) });
    }

    try {
        const data = req.body;
        data.userId = req.user._id;

        const task = await createTask(data);
        await task.save();

        io.emit("Task created", task);
        res.json(task);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// update task (only the user who created the task or an admin)
tasksRouter.put("/:id", auth, async (req, res) => {
    const { error } = taskValidation.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ errors: error.details.map((e) => e.message) });
    }

    try {
        const data = req.body;
        const task = await getTaskById(req.params.id);

        if (!task) {
            return res.status(404).send("Task not found");
        }

        const updatedTask = await updateTask(req.params.id, data);
        io.emit("Task updatd", updatedTask);
        return res.json(updatedTask);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// delete a task (only the user who created or an admin)
tasksRouter.delete("/:id", auth, async (req, res) => {
    const task = await getTaskById(req.params.id);

    try {
        if (!task) {
            res.status(400).send("did not find task");
        }
        else {
            io.emit("Task deleted", task);
            res.json({ message: "Task deleted", task });
            await deleteTask(task);
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// change the status of the task,please keep in mind that there are 3 options : "to do", "in progress",  "completed"
tasksRouter.patch("/status/:id", auth, adminOrUserTaskOrAssignedToUser, async (req, res) => {
    const { error } = taskStatusValidation.validate(req.body, { abortEarly: false });

    if (error) {
        res.status(400).json({ errors: error.details.map((e) => e.message) });
    }
    try {
        const data = req.body;
        const task = await updateTask(req.params.id, data);
        io.emit("status updated", task);
        return res.json({ message: "Status has been updated", task });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

export default tasksRouter;