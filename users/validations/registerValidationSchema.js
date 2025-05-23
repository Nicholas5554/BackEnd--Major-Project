import joi from "joi";


const registerValidationSchema = joi.object({
    name: joi.object()
        .keys({
            first: joi.string().min(2).max(20).required(),
            middle: joi.string().min(2).max(20).allow("").default(""),
            last: joi.string().min(2).max(20).required(),
        })
        .required(),

    phone: joi.string()
        .ruleset.regex(/0[0-9]{1,2}\-?\s?[0-9]{3}\s?[0-9]{4}/)
        .rule({ message: 'user "phone" mast be a valid phone number' })
        .required(),

    email: joi.string().email({ tlds: { allow: false } })
        .ruleset.pattern(
            /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,6})$/
        )
        .rule({ message: 'user "mail" mast be a valid email' })
        .required(),

    password: joi.string()
        .ruleset.regex(
            /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*-]).{6,20}$/
        )
        .rule({
            message:
                'user "password" must be at least six characters long and contain an uppercase letter, a lowercase letter, a number and one of the following characters !@#$%^&*-',
        })
        .required(),

    image: joi.object()
        .keys({
            url: joi.string()
                .uri()
                .rule({ message: "user image must be a valid url" })
                .allow("").default(""),
            alt: joi.string().min(2).max(256).allow("").default(""),
        }),

    address: joi.object()
        .keys({
            country: joi.string().required(),
            city: joi.string().required(),
            street: joi.string().required(),
            houseNumber: joi.number().required()
        }),
    isManager: joi.boolean().default(false),
});

export default registerValidationSchema;