import { Router } from "express"

import questionRouter from '../modules/question/routers/question.routes.js'
import userRouter from '../modules/user/routers/user.routes.js'
import authRouter from '../modules/auth/routers/auth.routes.js'


const router = Router()

router.use('/auth', authRouter)
router.use('/users', userRouter)
router.use('/questions', questionRouter)


export default router