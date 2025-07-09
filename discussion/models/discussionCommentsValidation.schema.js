import joi from "joi";


const discussionCommentsValidation = joi.object({
    comments: joi.array().items(
        joi.object({
            text: joi.string().min(3).max(35).required()
        })
    ).optional()
});

export default discussionCommentsValidation;