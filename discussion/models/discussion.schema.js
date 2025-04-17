import { Schema, model } from "mongoose";

const discussionSchema = new Schema({
    title: { type: String, required: true, minlength: 3 },
    description: { type: String, required: true, minlength: 3 },
    content: { type: String, required: true, minlength: 3 },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    users: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    comments: [
        {
            _id: { type: Schema.Types.ObjectId, auto: true },
            userId: { type: Schema.Types.ObjectId, ref: "User" },
            text: { type: String, required: true, minlength: 3 },
            likes: [{ type: Schema.Types.ObjectId, ref: "user" }],
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

export default model("Discussion", discussionSchema);