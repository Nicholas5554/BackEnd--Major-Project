import joi from "joi";


const registerValidationSchema = joi.object({
    name: joi.object()
        .keys({
            first: joi.string().min(2).max(20).required(),
            last: joi.string().min(2).max(20).required(),
        })
        .required(),

    email: joi.string().email({ tlds: { allow: false } })
        .ruleset.pattern(
            /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,6})$/
        )
        .rule({ message: 'email must be a valid email' })
        .required(),

    password: joi.string()
        .ruleset.regex(
            /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*-]).{6,20}$/
        )
        .rule({
            message:
                'password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*-)',
        })
        .required(),

    isManager: joi.boolean().default(false)
});

export default registerValidationSchema;