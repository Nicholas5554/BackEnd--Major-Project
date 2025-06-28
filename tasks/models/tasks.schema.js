import { Schema, model } from "mongoose";

const taskSchema = new Schema({
    title: { type: String, required: true, minlength: 3 },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, required: true, enum: ["to do", "in progress", "completed"], default: "to do" },
    priority: { type: String, required: true, enum: ["low", "medium", "high", "urgent"] },
    description: { type: String, required: true, minlength: 3 }
});

export default model("Task", taskSchema);