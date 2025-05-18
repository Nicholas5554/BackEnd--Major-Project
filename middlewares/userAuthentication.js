import { getCommentById, getDiscussionById } from "../discussion/services/dataAccesServicesDiscussion.service.js";
import { getTaskById } from "../tasks/services/dataAccessServicesTasks.service.js";

export const adminOnly = async (req, res, next) => {
    const user = await req.user;
    try {
        if (!user || !user.isAdmin) {
            return res.status(401).send("Unauthorized user");
        }
        next();

    } catch (err) {
        res.status(500).send(err);
    }
};

export const adminOrManagerOnly = async (req, res, next) => {
    const user = await req.user;

    try {
        if (!user.isManager && !user.isAdmin) {
            return res.status(401).send("Unauthorized user")
        }
        next();
    } catch (err) {
        res.status(500).send(err)
    }
};

export const adminOrUser = async (req, res, next) => {
    try {

        const user = req.user;

        if (user._id !== req.params.id && !user.isAdmin) {
            return res.status(401).send("Unauthorized user");
        }
        next();

    } catch (err) {
        throw new Error(err.message);
    }
};

export const adminOrDiscussionUser = async (req, res, next) => {
    try {
        const user = req.user;
        const discussion = await getDiscussionById(req.params.id);
        if (!discussion) {
            return res.status(404).send("discussion was not found");
        }
        if (user._id.toString() !== discussion.userId.toString() && !user.isAdmin) {
            return res.status(401).send("Unauthorized user")
        }
        next()
    } catch (err) {
        res.status(500).send(err.message)
    }
}

export const adminOrUserTask = async (req, res, next) => {

    try {
        const user = req.user;
        const task = await getTaskById(req.params.id);

        if (!task) {
            return res.status(404).send("Task not found");
        }

        if (task.userId.toString() !== user._id.toString() && !user.isAdmin) {
            return res.status(401).send("Unauthorized user");
        }
        next();
    } catch (err) {
        res.status(500).send(err.message);
    }
};

export const adminOrUserTaskOrAssignedToUser = async (req, res, next) => {
    try {
        const user = req.user;
        const task = await getTaskById(req.params.id);

        if (!task) {
            return res.status(404).send("Task not found");
        }

        if (!user.isAdmin && user._id.toString() !== task.userId.toString() && user._id !== task.assignedTo._id.toString()) {
            return res.status(401).send("Unauthorized user");
        }
        next();
    } catch (err) {
        res.status(500).send(err.message);
    }
};

export const adminOrUserDiscussionOrActiveUser = async (req, res, next) => {
    try {
        const user = req.user;
        const discussion = await getDiscussionById(req.params.id);

        if (!discussion) {
            return res.status(404).send("discussion not found");
        }
        if (!user.isAdmin &&
            user._id.toString() !== discussion.userId._id.toString() &&
            !discussion.users.some(u => u._id.toString() === user._id.toString())) {
            return res.status(401).send("Unauthorized user");
        }
        next();
    } catch (err) {
        res.status(500).send(err.message);
    }
};

export const adminOrActiveUserOrCommentedUser = async (req, res, next) => {
    try {
        const user = req.user;
        const discussion = await getDiscussionById(req.params.discussionId);
        const comment = await getCommentById(discussion, req.params.commentId);
        if (!discussion) {
            return res.status(404).send("discussion was not found");
        }
        if (!comment) {
            return res.status(404).send("comment was not found");
        }
        if (
            comment.userId._id.toString() !== user._id.toString() &&
            !user.isAdmin &&
            !discussion.users.some(u => u._id.toString() === user._id.toString())) {
            return res.status(401).send("Unauthorized user");
        }
        next();
    } catch (err) {
        res.status(500).send(err.message);
    }
};

export const adminOrDiscussionUserComments = async (req, res, next) => {
    try {
        const user = req.user;
        const discussion = await getDiscussionById(req.params.discussionId);
        const comment = await getCommentById(discussion, req.params.commentId);

        if (!discussion) {
            res.status(404).send("discussion was not found");
        }
        if (!comment) {
            res.status(404).send("comment was not found");
        }
        if (user._id.toString() !== discussion.userId.toString() && !user.isAdmin) {
            res.status(401).send("Unauthorized user")
        }
        next();
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export const userOnly = async (req, res, next) => {
    const user = await req.user;

    try {
        if (user._id !== req.params.id) {
            return res.status(401).send("Unauthorized user");
        }
        next();
    } catch (err) {
        res.status(500).send(err)
    }
};
