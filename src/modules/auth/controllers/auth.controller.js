import { v2 as cloudinary } from 'cloudinary';

import { userModel } from "../../user/models/user.model.js";
import jwt from "jsonwebtoken";
import { AppError, catchAsyncError } from "../../../utilies/error.js";
import { sendEmailVerfication } from "../../../utilies/email.js";





export const login = catchAsyncError(async (req, res, next) => {

    const { email, userName, role, sex, status, age, mobileNumber, _id } = req.user
    
    if (req.user.status === 'blocked') return next(new AppError("you have been blocked , contact us", 403))
    const token = jwt.sign({ email, sex, userName, role, status, age, mobileNumber, _id }, process.env.SECRET_KEY)
    req.user.status = 'online'
    req.user.isLoggedOut = false
    await req.user.save();

    res.status(200).json({
        status: 'success',
        message: "Signed in success", token, user: {
            email,
            userName,
            role,
            status,
            sex,
            age,
            mobileNumber,
            _id
        }
    })
})



export const signup = catchAsyncError(async (req, res) => {
    let { filename: profilePicture } = req.file
    req.body.profilePicture = profilePicture

    const isEmailExist = await userModel.findOne({ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber }] })
    if (isEmailExist) throw new AppError('try another email or mobileNumber', 409)

    const { email } = req.body
    const emailToken = jwt.sign({ email }, process.env.EMAIL_SECRET_KEY, { expiresIn: '1h' });

    const link = `${process.env.BASE_URL}api/v1/auth/confirmEmail/${emailToken}`;
    await sendEmailVerfication(email, { link })
    let cloud = await cloudinary.uploader.upload(req.file.path)
    req.body.profilePicture = cloud.secure_url

    const user = await userModel.create(req.body)
    res.status(201).json({
        status: "success",
        message: "user added successfully",
        data: user
    });
});



export const confirm_email = catchAsyncError(async (req, res, next) => {
    try {
        const { token } = req.params;
        const { email } = jwt.verify(token, process.env.EMAIL_SECRET_KEY)


        await userModel.findOneAndUpdate({ email }, { isEmailVerified: true })
        res.status(200).send("Email is confirmed")
    } catch (error) {
        throw new AppError(error.message, 498)
    }
})
