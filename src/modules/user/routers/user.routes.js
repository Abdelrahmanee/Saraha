import { authenticate, authorize, checkAccountVerification, checkUniqueIdentifier, isEmailExist, isUserExist } from "../../auth/middelwares/auth.middelware.js";
import { anotherUserInfo, deleteAccount, sendOTP, getAllAccountsAssociated, resetPassword, updateAccount, updateAccountEmail, updatePassword, userInfo, kickUserOut, softDeleteUser, updateProfilePicture, userLoggedOut, blockUser, userBlockedList, removeFromBlockList } from "../controllers/user.controller.js";

import { Router } from "express";
import { anotherUserInfoSchema, sendOTPSchema, recoveryEmailSchema, resetPasswordSchema, updateAccountEmailSchema, updateAccountSchema, updatePasswordSchema, kickUserOutSchema, updateProfilePictureSchema } from "../validation/user.validation.js";
import { validate } from "../../../middelwares/validation.middelware.js";
import { ROLES } from "../../../utilies/enums.js";
import { uploadSingle } from "../../../middelwares/upload.middelware.js";
import { validateFields } from "../../../middelwares/validateFields.js";
import { checkBlockStatus, checkUserOtp } from "../middelwares/user.middelware.js";


const router = Router()

// user cruds
router.put('/update_account',
    validate(updateAccountSchema),
    authenticate,
    authorize(ROLES.USER, ROLES.ADMIN),
    updateAccount
)
router.patch('/update_profilePicture',
    uploadSingle('profilePicture', 'profilePictures'),
    validate(updateProfilePictureSchema),
    authenticate,
    authorize(ROLES.USER, ROLES.ADMIN),
    updateProfilePicture
)
router.patch('/update_email',
    validate(updateAccountEmailSchema),
    authenticate,
    authorize(ROLES.USER, ROLES.ADMIN),
    updateAccountEmail
)
router.delete('/delete_account', authenticate, authorize(ROLES.USER, ROLES.ADMIN), deleteAccount)

router.patch('/update_password',
    validate(updatePasswordSchema), authenticate, authorize(ROLES.USER, ROLES.ADMIN) , updatePassword)

router.get('/user_info', authenticate, authorize(ROLES.USER, ROLES.ADMIN) ,userInfo)



// forget password apis
router.put('/send_otp',
    validate(sendOTPSchema), sendOTP)

router.put('/reset_password', validate(resetPasswordSchema), isUserExist, checkUserOtp, resetPassword)


router.get('/getAllAccountsAssociated',
    validate(recoveryEmailSchema), authenticate, authorize(ROLES.USER, ROLES.ADMIN), getAllAccountsAssociated)

router.delete('/soft_delete', authenticate, authorize(ROLES.USER, ROLES.ADMIN), softDeleteUser)
router.delete('/logout', authenticate, authorize(ROLES.USER, ROLES.ADMIN), userLoggedOut)
// user only

router.get('/user/blocked_list', authenticate, authorize(ROLES.USER), userBlockedList)
router.patch('/user/remove_from_block_list', authenticate, authorize(ROLES.USER), removeFromBlockList)
router.delete('/block_user/:id', authenticate, authorize(ROLES.USER), blockUser)

router.get('/user/:id',
    validate(anotherUserInfoSchema), authenticate, authorize(ROLES.USER, ROLES.ADMIN) , checkBlockStatus ,anotherUserInfo)

// Admin only
router.delete('/kickUserOut/:id',
    validate(kickUserOutSchema), authenticate, authorize(ROLES.ADMIN), kickUserOut)


export default router

