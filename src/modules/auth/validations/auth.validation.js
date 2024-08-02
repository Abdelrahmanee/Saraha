import Joi from "joi";


export const signinSchema = Joi.object({
    body: {
        identifier: Joi.string().required(),
        password: Joi.string().pattern(new RegExp('^[1-9]')).required()
    },
    params: {},
    query: {}
})

export const signupSchema = Joi.object({
    body: {
        email: Joi.string().email().required(),
        recoveryEmail: Joi.string().email(),
        password: Joi.string().pattern(new RegExp('^[1-9]')).required(),
        firstName: Joi.string().min(2).max(100).required(),
        lastName: Joi.string().min(2).max(100).required(),
        DOB: Joi.date().required(),
        mobileNumber: Joi.string().required(),
        role: Joi.string(),
        sex: Joi.string().valid('Male', 'Female').required()
    },
    params: {},
    query: {},
    file: Joi.object({
        fieldname: Joi.string().optional(),
        originalname: Joi.string().required().messages({
            'any.required': 'File is required',
            'string.empty': 'File cannot be empty',
        }),
        encoding: Joi.string().optional(),
        mimetype: Joi.string().valid('image/jpeg', 'image/png').required().messages({
            'any.required': 'File type is required',
            'any.only': 'File must be a jpeg or png image'
        }),
        destination: Joi.string().optional(),
        filename: Joi.string().required().messages({
            'any.required': 'File name is required'
        }),
        path: Joi.string().optional(),
        size: Joi.number().max(5 * 1024 * 1024).messages({
            'number.max': 'File size must be less than 5MB'
        })
    }).required()
})