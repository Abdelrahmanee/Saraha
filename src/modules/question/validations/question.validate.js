import Joi from "joi";


export const addQuestionSchema = Joi.object({
    body: { content: Joi.string().required(), },
    params: { id: Joi.string().hex().length(24).required() },
    query: {}
})

export const updateQuestionSchema = Joi.object({
    body: {
        content: Joi.string().required(),
        question_id: Joi.string().hex().length(24).required()
    },
    params: { id: Joi.string().hex().length(24).required() },
    query: {}
})
export const deleteQuestionSchema = Joi.object({
    body: {},
    params: { id: Joi.string().hex().length(24).required() },
    query: {}
})
export const getMyQuestionsToSpecificUserSchema = Joi.object({
    body: {},
    params: { id: Joi.string().hex().length(24).required() },
    query: {}
})