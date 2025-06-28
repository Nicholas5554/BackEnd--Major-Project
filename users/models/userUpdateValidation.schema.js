import joi from "joi";

const userUpdateValidation = joi.object({
    name: joi.object()
        .keys({
            first: joi.string().min(2).max(20).required(),
            last: joi.string().min(2).max(20).required(),
        })
        .required(),

    password: joi.string().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/).required(),
}
);

export default userUpdateValidation;