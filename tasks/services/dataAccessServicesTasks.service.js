import Task from "../models/tasks.schema.js"

const getAllTasks = async (alltasks) => {
    try {
        const tasks = await Task.find(alltasks)
            .populate("userId", "name.first name.last")
            .populate("assignedTo", "name.first name.last");
        if (!tasks) {
            throw new Error("Did not find tasks")
        }
        return tasks;
    } catch (err) {
        throw new Error(err.message)
    }
}

const getTaskById = async (taskId) => {
    try {
        const task = Task.findById(taskId)
            .populate("userId", "name.first name.last")
            .populate("assignedTo", "name.first name.last");
        if (!task) {
            throw new Error("Did not find task")
        }

        return task;
    } catch (err) {
        throw new Error(err.message);
    }
}

const getTaskByUserId = async (userId) => {
    try {
        const task = await Task.find({ userId })
            .populate("userId", "name.first name.last")
            .populate("assignedTo", "name.first name.last");
        if (!task) {
            throw new Error("Did not find the task");
        }
        return task;
    } catch (err) {
        throw new Error(err.message);
    }
};

const getTaskByAssign = async (assignedTo) => {
    try {
        const task = await Task.find({ assignedTo })
            .populate("userId", "name.first name.last")
            .populate("assignedTo", "name.first name.last");
        if (!task) {
            throw new Error("did not find the task");
        }
        return task;
    } catch (err) {
        throw new Error(err.message)
    }
}

const createTask = async (newtask) => {
    try {
        const task = new Task(newtask)
        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate("userId", "name.first name.last")
            .populate("assignedTo", "name.first name.last");

        if (!populatedTask) {
            throw new Error("Task was not added");
        }

        return populatedTask;
    } catch (err) {
        throw new Error(err);
    }
};

const updateTask = async (updatedTask, updateData) => {
    try {
        const task = await Task.findByIdAndUpdate(updatedTask, updateData, { runValidators: true, new: true });
        if (!task) {
            throw new Error("task was not updated");
        }
        return task;
    } catch (err) {
        throw new Error(err.message);
    }
};

const deleteTask = async (taskId) => {
    try {
        const task = Task.findByIdAndDelete(taskId);
        if (!task) {
            throw new Error("Did not find task and did not delete");
        }
        return task;
    } catch (err) {
        throw new Error(err.message);
    }
};
export { getAllTasks, getTaskById, createTask, updateTask, getTaskByUserId, deleteTask, getTaskByAssign };