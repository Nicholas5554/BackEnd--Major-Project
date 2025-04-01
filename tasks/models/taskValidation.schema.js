import joi from "joi";

const taskValidation = joi.object({
    title: joi.string().min(3).required(),
    type: joi.string().min(3).required(),
    assignedTo: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    status: joi.string().valid("to do", "in progress", "completed").required(),
    priority: joi.string().valid("low", "medium", "high", "urgent").required(),
    description: joi.string().min(3).required(),
});

export default taskValidation;