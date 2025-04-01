import joi from "joi";

const userUpdateValidation = joi.object({
    name: joi.object()
        .keys({
            first: joi.string().min(2).max(20).required(),
            middle: joi.string().min(2).max(20).allow(""),
            last: joi.string().min(2).max(20).required(),
        })
        .required(),

    image: joi.object()
        .keys({
            url: joi.string()
                .uri()
                .rule({ message: "user image mast be a valid url" })
                .allow(""),
            alt: joi.string().min(2).max(256).allow(""),
        })
        .required(),

    phone: joi.string()
        .ruleset.regex(/0[0-9]{1,2}\-?\s?[0-9]{3}\s?[0-9]{4}/)
        .rule({ message: 'user "phone" mast be a valid phone number' })
        .required(),
    password: joi.string().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/).required(),

    address: joi.object()
        .keys({
            state: joi.string().allow(""),
            country: joi.string().required(),
            city: joi.string().required(),
            street: joi.string().required(),
            houseNumber: joi.number().required(),
            zip: joi.number(),
        })
        .required(),
}
);

export default userUpdateValidation;