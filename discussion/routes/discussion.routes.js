import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { createDiscussion, getAllDiscussions, getDiscussionById, getDiscussionByCreatedUserId, updateDiscussion, deleteDiscussion, getCommentById, deleteComment, getCommentsByDiscussionId, addComment, likeComment, getDiscussionByAddedUserId } from "../services/dataAccesServicesDiscussion.service.js";
import discussionValidation from "../models/discussionValidation.schema.js";
import { adminOnly, adminOrActiveUserOrCommentedUser, adminOrDiscussionUser, adminOrUser, adminOrUserDiscussionOrActiveUser, adminOrDiscussionUserComments } from "../../middlewares/userAuthentication.js";
import discussionCommentsValidation from "../models/discussionCommentsValidation.schema.js";
import { io } from "../../server.js";

const discussionRouter = Router();

// get all the discussions
discussionRouter.get("/", auth, adminOnly, async (req, res) => {
    try {
        const discussions = await getAllDiscussions();
        return res.json(discussions);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// get the discussions that the user created
discussionRouter.get("/my-createdDiscussions", auth, async (req, res) => {
    try {
        const user = req.user;
        const discussion = await getDiscussionByCreatedUserId(user._id);

        if (!discussion) {
            res.status(404).send("discussion was not found");
        }
        else {
            return res.json(discussion);
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// get the discussions that the user is in them
discussionRouter.get("/my-discussions", auth, async (req, res) => {
    try {
        const user = req.user
        const discussion = await getDiscussionByAddedUserId(user._id);
        if (!discussion) {
            res.status(404).send("discussion was not found");
        }
        return res.json(discussion);
    } catch (err) {
        res.status(500).send(err.message);
    }
})

// get a discussion by it's id
discussionRouter.get("/:id", auth, adminOrUserDiscussionOrActiveUser, async (req, res) => {
    try {
        const discussionId = await getDiscussionById(req.params.id);
        if (!discussionId) {
            return res.status(400).send("discussion was not found");
        }
        return res.json(discussionId);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// create a discussion (must be a logged user)
discussionRouter.post("/", auth, async (req, res) => {
    const { error } = discussionValidation.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({ errors: error.details.map((e) => e.message) });
    }

    try {
        const data = req.body;
        const user = req.user;
        data.userId = user._id;

        const discussion = await createDiscussion(data);
        if (!discussion) {
            res.status(400).send("discussion was not created");
        }
        try {
            io.emit("Discussion created", discussion);
        } catch (err) {
            console.error(`web soket error: ${err}`);
        }

        return res.json(discussion);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// update a discussion (must be logged and the user who created it or an admin)
discussionRouter.put("/:id", auth, adminOrDiscussionUser, async (req, res) => {
    const { error } = discussionValidation.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({ errors: error.details.map((e) => e.message) });
    }

    try {
        const discussionId = req.params.id;
        const data = req.body;
        const discussion = await updateDiscussion(discussionId, data);
        try {
            io.emit("Discussion updated", discussion);
        } catch (err) {
            console.error(`web soket error: ${err}`);
        }

        return res.json({ message: "discussion was updated", discussion });
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// delete a discussion (must be logged and the user who created it or an admin)
discussionRouter.delete("/:id", auth, adminOrDiscussionUser, async (req, res) => {
    try {
        const discussion = await deleteDiscussion(req.params.id);
        if (!discussion) {
            return res.status(400).send("discussion was not found");
        }
        res.json({ message: "discussion was deleted", discussion });

        try {
            io.emit("Discussion deleted", discussion);
        } catch (err) {
            console.error(`web soket error: ${err}`);
        }

    } catch (err) {
        res.status(500).send(err.message);
    }
});

// view all the comments from a discussion
discussionRouter.get("/:id/comments", auth, adminOrUserDiscussionOrActiveUser, async (req, res) => {
    try {
        const discussionComments = await getCommentsByDiscussionId(req.params.id);

        if (!discussionComments || discussionComments.length === 0) {
            return res.status(400).send("no comments found");
        };

        return res.status(200).json({ comments: discussionComments });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get a comment by it's id
discussionRouter.get("/:discussionId/comments/:commentId", auth, adminOrActiveUserOrCommentedUser, async (req, res) => {
    try {
        const { discussionId, commentId } = req.params;
        const comment = await getCommentById(discussionId, commentId);
        if (!comment) {
            return res.status(400).send("comment not found");
        }
        return res.json(comment);
    } catch (err) {
        res.send(err.message);
    }
});

//like a comment by it's id
discussionRouter.patch("/:discussionId/comments/:commentId", auth, adminOrActiveUserOrCommentedUser, async (req, res) => {
    try {
        const user = req.user;
        const { discussionId, commentId } = req.params;
        const comment = await likeComment(discussionId, commentId, user._id);
        if (!comment) {
            res.status(404).send("comment not found");
        }

        return res.json(comment);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

// add a comment to a discussion
discussionRouter.patch("/:id/comments", auth, adminOrUserDiscussionOrActiveUser, async (req, res) => {
    const { error } = discussionCommentsValidation.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({ errors: error.details.map((e) => e.message) });
    };

    try {
        const text = req.body.comments?.[0]?.text;
        const user = req.user;
        const discussionId = req.params.id;

        const newComment = {
            userId: user._id,
            text
        };

        const discussion = await addComment(discussionId, newComment);
        res.json({ message: "Comment added", discussion });

        try {
            io.emit("Comment added", newComment);
        } catch (err) {
            console.error(`web soket error: ${err}`);
        }

    } catch (err) {
        res.status(500).send(err.message);
    };
});

// delete a comment by it's id
discussionRouter.delete("/:discussionId/comments/:commentId", auth, async (req, res) => {
    try {
        const { discussionId, commentId } = req.params;
        const comment = await deleteComment(discussionId, commentId);
        if (!comment) {
            res.status(400).send("comment was not found");
        }
        res.json({ message: "comment deleted", comment });
        try {
            io.emit("Comment deleted", comment);
        } catch (err) {
            console.error(`web soket error: ${err}`);
        }

    } catch (err) {
        throw new Error(err.message);
    }
});

export default discussionRouter;