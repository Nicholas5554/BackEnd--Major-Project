import joi from "joi";


const discussionValidation = joi.object({
    title: joi.string().min(3).required(),
    description: joi.string().min(3).required(),
    content: joi.string().min(3).required(),
    users: joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)).required().messages({
        'array.base': "Users must be an array of user ID's",
        'array.includes': "Each user must be a valid user ID"
    })
})

export default discussionValidation;
