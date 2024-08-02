import { AppError, catchAsyncError } from "../../../utilies/error.js";
import { userModel } from "../../user/models/user.model.js";



export const checkUserExist = catchAsyncError(async (req , res ,next) =>{
    const {id} =req.params;
    const user = await userModel.findById(id)
    console.log(user);
    if(!user)throw new AppError('User is not found' ,400)
    next()
})