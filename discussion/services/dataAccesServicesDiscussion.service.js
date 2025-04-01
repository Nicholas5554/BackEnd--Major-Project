import lodash from "lodash";
import Discussion from "../models/discussion.schema.js"

const { pick } = lodash

const getAllDiscussions = async (allDiscussions) => {
    try {
        const discussion = await Discussion.find(allDiscussions);
        if (!discussion) {
            throw new Error("did find discussions")
        }
        return discussion;
    } catch (err) {
        throw new Error(err.message)
    }
};

const getDiscussionById = async (discussionId) => {
    try {
        const discussion = await Discussion.findById(discussionId);
        if (!discussion) {
            throw new Error("discussion was not found")
        }
        return discussion;
    } catch (err) {
        throw new Error(err.message)
    }
};

const getDiscussionByCreatedUserId = async (userId) => {
    try {
        const discussion = await Discussion.find({ userId });
        if (!discussion) {
            throw new Error("discussion was not found");
        }
        return discussion;
    } catch (err) {
        throw new Error(err.message);
    }
};

const getDiscussionByAddedUserId = async (users) => {
    try {
        const discussion = await Discussion.find({ users });
        if (!discussion) {
            throw new Error("discussion was not found");
        }
        return discussion;
    } catch (err) {
        throw new Error(err.message)
    }
}

const createDiscussion = async (newDiscussion) => {
    try {
        const discussion = new Discussion(newDiscussion);
        await discussion.save();
        if (!discussion) {
            throw new Error("discussion was not added")
        }
        return discussion;
    } catch (err) {
        throw new Error(err.message);
    }
};

const updateDiscussion = async (discussionId, newData) => {
    try {
        const discussion = await Discussion.findByIdAndUpdate(discussionId, newData, { runValidators: true, new: true });

        if (!discussion) {
            throw new Error("discussion was not found");
        }

        const returnDiscussion = pick(discussion, [
            "_id",
            "title",
            "description",
            "userId",
            "users",
            "comments"
        ]);
        return returnDiscussion;
    } catch (err) {
        throw new Error(err.message);
    }
};

const deleteDiscussion = async (discussionId) => {
    try {
        const discussion = Discussion.findByIdAndDelete(discussionId);
        if (!discussion) {
            throw new Error("discussion was not found")
        }
        return discussion;
    } catch (err) {
        throw new Error(err.message);
    }
};

const getCommentsByDiscussionId = async (discussionId) => {
    try {
        const discussion = await Discussion.findById(discussionId);

        if (!discussion) {
            throw new Error("Discussion not found");
        }

        return discussion.comments;
    } catch (err) {
        throw new Error(err.message);
    }
};

const getCommentById = async (discussionId, commentId) => {
    try {
        const discussion = await Discussion.findById(discussionId);

        if (!discussion) {
            throw new Error("Comment not found");
        }
        const comment = discussion.comments.find(c => c._id.toString() === commentId);

        if (!comment) {
            throw new Error("Comment not found");
        };

        const returnComment = pick(comment, ["_id", "userId", "text", "createdAt"]);
        return returnComment;

    } catch (err) {
        throw new Error(err.message);
    }
};

const addComment = async (discussionId, newComment) => {
    try {
        const discussion = await Discussion.findByIdAndUpdate(
            discussionId,
            { $push: { comments: newComment } },
            { runValidators: true, new: true }
        );

        if (!discussion) {
            throw new Error("Discussion was not found");
        }

        return discussion;
    } catch (err) {
        throw new Error(err.message);
    }
};

const likeComment = async (discussionId, commentId, userId) => {
    try {
        const discussion = await Discussion.findById(discussionId);
        if (!discussion) {
            throw new Error("Discussion not found");
        }

        const comment = discussion.comments.find(c => c._id.toString() === commentId);
        if (!comment) {
            throw new Error("Comment not found");
        }

        const updateQuery = comment.likes.includes(userId)
            ? { $pull: { "comments.$.likes": userId } }
            : { $push: { "comments.$.likes": userId } };

        const updatedDiscussion = await Discussion.findOneAndUpdate(
            { _id: discussionId, "comments._id": commentId },
            updateQuery,
            { new: true }
        );

        return updatedDiscussion;

    } catch (err) {
        throw new Error(err.message);
    }
};

const deleteComment = async (discussionId, commentId) => {
    try {
        const discussion = await Discussion.findById(discussionId);

        if (!discussion) {
            throw new Error("Comment not found");
        }

        const comment = discussion.comments.find(c => c._id.toString() === commentId);

        const deletedComment = await Discussion.findOneAndUpdate(
            { "comments._id": comment },
            { $pull: { comments: { _id: commentId } } },
            { new: true, runValidators: true }
        );

        return deletedComment;
    } catch (err) {
        throw new Error(err.message);
    }
};


export { getAllDiscussions, getCommentById, getDiscussionByCreatedUserId, getDiscussionByAddedUserId, createDiscussion, getDiscussionById, updateDiscussion, deleteDiscussion, likeComment, deleteComment, getCommentsByDiscussionId, addComment }