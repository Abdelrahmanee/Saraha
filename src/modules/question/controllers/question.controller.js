import { catchAsyncError } from "../../../utilies/error.js";
import { QuestionModel } from "../models/question.model.js";
 
export const getMyAskedtQuestions = catchAsyncError(async (req, res) => {
    // الاسئله المرسله
    const { _id: userId } = req.user;
    const questions = await QuestionModel.find({ askedBy: userId });
    res.status(200).json({
        status: 'success',
        data: questions
    });

});
export const getMyIncomingQuestions = catchAsyncError(async (req, res) => {
    // الاسئله الوارده
    const { _id: userId } = req.user;
    const questions = await QuestionModel.find({ askedTo: userId });
    res.status(200).json({
        status: 'success',
        data: questions
    });

});


export const getMyQuestionsToSpecificUser = catchAsyncError(async (req, res) => {
    const { id: askedTo } = req.params
    const { _id: userId } = req.user;
    const questions = await QuestionModel.find({ askedTo, askedBy: userId });
    res.status(200).json({
        status: 'success',
        data: questions
    });
});

export const addQuestion = catchAsyncError(async (req, res) => {
    const { id: askedTo } = req.params
    const { _id: askedBy } = req.user;
    const { content } = req.body
    const question = await QuestionModel.create({ askedTo, askedBy, content })
    res.status(200).json({
        status: 'success',
        message: "question is sent",
        data: question
    });
});
 
export const updateQuestion = catchAsyncError(async (req, res) => {
    const { id: askedTo } = req.params; 
    const { question_id, content } = req.body;
    const { _id: askedBy } = req.user;

    const question = await QuestionModel.findOneAndUpdate({ askedBy, askedTo, _id: question_id },{ content },{ new: true });
    if (!question) {
        return res.status(404).json({
            status: 'fail',
            message: "Question not found or you don't have permission to update it"
        });
    }
    res.status(200).json({
        status: 'success',
        message: "Question is updated",
        data: question
    });
});;

export const deleteQuestion = catchAsyncError(async (req, res) => {
    // الاسئله اللي انا بعتها
    const { id: askedTo } = req.params
    const { _id: askedBy } = req.user;
    const question = await QuestionModel.findOneAndDelete({ askedBy, askedTo })

    res.status(200).json({
        status: 'success',
        message: "question is deleted",
        data: question
    });
});

export const clearIncomingQuestions = catchAsyncError(async (req, res) => {
    const { _id: askedTo } = req.user;
    const result = await QuestionModel.deleteMany({ askedTo });
    res.status(200).json({
        status: 'success',
        message: `${result.deletedCount} question(s) deleted`,
    });
});

