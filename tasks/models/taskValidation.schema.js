import joi from "joi";

const taskValidation = joi.object({
    title: joi.string().min(3).required(),
    assignedTo: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    status: joi.string().default("to do"),
    priority: joi.string().valid("low", "medium", "high", "urgent").required(),
    description: joi.string().min(3).required(),
});

export default taskValidation;