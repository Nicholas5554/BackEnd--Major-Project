import joi from "joi";


const taskStatusValidation = joi.object({
    status: joi.string().valid("to do", "in progress", "completed").required()
});

export default taskStatusValidation;