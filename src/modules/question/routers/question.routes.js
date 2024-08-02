import { Router } from "express";
import { authenticate, authorize } from "../../auth/middelwares/auth.middelware.js";
import { addQuestion, clearIncomingQuestions, deleteQuestion, getMyAskedtQuestions, getMyIncomingQuestions, getMyQuestionsToSpecificUser, updateQuestion } from "../controllers/question.controller.js";
import { checkUserExist } from "../middelwares/question.middelware.js";
import { validate } from "../../../middelwares/validation.middelware.js";
import { addQuestionSchema, deleteQuestionSchema, getMyQuestionsToSpecificUserSchema, updateQuestionSchema } from "../validations/question.validate.js";
import { ROLES } from "../../../utilies/enums.js";



const router = Router()

router.route('/asked_questions')
    .get(authenticate, authorize(ROLES.USER), getMyAskedtQuestions)

router.route('/incoming_questions')
    .get(authenticate, authorize(ROLES.USER), getMyIncomingQuestions)


router.route('/get_questions_to_specific_user/:id')
    .get(validate(getMyQuestionsToSpecificUserSchema), authenticate, authorize(ROLES.USER), checkUserExist, getMyQuestionsToSpecificUser)


router.route('/clear_incoming_questions')
    .delete(authenticate, authorize(ROLES.USER), clearIncomingQuestions)


router.route('/add_question/:id')
    .post(validate(addQuestionSchema), authenticate, authorize(ROLES.USER), checkUserExist, addQuestion)

router.route('/update_question/:id')
    .patch(validate(updateQuestionSchema), authenticate, authorize(ROLES.USER), checkUserExist, updateQuestion)
router.route('/delete_question/:id')
    .delete(validate(deleteQuestionSchema), authenticate, authorize(ROLES.USER), checkUserExist, deleteQuestion)




export default router 