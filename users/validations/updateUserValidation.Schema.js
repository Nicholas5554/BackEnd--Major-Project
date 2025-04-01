import joi from "joi";


const updateUserValidation = joi.object({
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

export default updateUserValidation;