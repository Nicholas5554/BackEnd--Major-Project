import joi from "joi";


const updateUserValidation = joi.object({
    name: joi.object()
        .keys({
            first: joi.string().min(2).max(20).required(),
            last: joi.string().min(2).max(20).required(),
        })
        .required(),

    isManager: joi.boolean().default(false),
});

export default updateUserValidation;