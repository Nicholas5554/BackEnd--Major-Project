import joi from "joi";

const updateUserValidation = joi.object({
    name: joi.object()
        .keys({
            first: joi.string().min(2).max(20).required(),
            last: joi.string().min(2).max(20).required(),
        })
        .required(),

    email: joi.string()
        .email({ tlds: { allow: false } })
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        .message("Please enter a valid email address")
        .required()
        .messages({
            "string.email": "Please enter a valid email address",
            "string.empty": "Email is required",
            "any.required": "Email is required"
        }),

    password: joi.string()
        .ruleset.regex(
            /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*-]).{6,20}$/)
        .rule({
            message:
                'password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*-)',
        })
        .required(),

    isManager: joi.boolean().default(false),
});

export default updateUserValidation;