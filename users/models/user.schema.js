import { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: {
        first: { type: String, required: true, minlength: 3 },
        last: { type: String, required: true, minlength: 3 }
    },
    isManager: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    managerId: { type: Schema.Types.ObjectId, ref: "User" },
});

export default model("User", userSchema);
