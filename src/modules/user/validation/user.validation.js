

import Joi from "joi";



export const updateAccountSchema = Joi.object({
    body: {
        recoveryEmail: Joi.string().email(),
        firstName: Joi.string().min(2).max(100),
        lastName: Joi.string().min(2).max(100),
        DOB: Joi.date(),
    },
    params: {},
    query: {},
})
export const updateProfilePictureSchema = Joi.object({
    body: {},
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
export const updateAccountEmailSchema = Joi.object({
    body: {
        email: Joi.string().email().required(),
    },
    params: {},
    query: {},
    file: {
        profilePicture: Joi.string().optional()
    }
})

export const anotherUserInfoSchema = Joi.object({
    body: {},
    params: { id: Joi.string().hex().length(24).required(), },
    query: {}
})
export const kickUserOutSchema = Joi.object({
    body: {},
    params: { id: Joi.string().hex().length(24).required(), },
    query: {}
})

export const updatePasswordSchema = Joi.object({
    body: {
        new_password: Joi.string().pattern(new RegExp('^[1-9]')).required(),
        current_password: Joi.string().pattern(new RegExp('^[1-9]')).required(),
    },
    params: {},
    query: {}
})

export const sendOTPSchema = Joi.object({
    body: {
        identifier: Joi.string().required(),
    },
    params: {},
    query: {}
})

export const resetPasswordSchema = Joi.object({
    body: {
        new_password: Joi.string().pattern(new RegExp('^[1-9]')).required(),
        identifier: Joi.string().required(),
        otp: Joi.string()
            .pattern(/^\d{6}$/)
            .required()
            .messages({
                'string.pattern.base': 'OTP must be exactly 6 digits.',
                'any.required': 'OTP is required.'
            }),
    },
    params: {},
    query: {}
})
export const recoveryEmailSchema = Joi.object({
    body: {
        recoveryEmail: Joi.string().email().required()
    },
    params: {},
    query: {}
})



