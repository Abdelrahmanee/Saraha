





import fs from 'fs'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary';

import { AppError, catchAsyncError } from "../../../utilies/error.js";
import { userModel } from "../models/user.model.js";
import { generateOTP, sendEmailVerfication } from '../../../utilies/email.js';



// update account.
export const updateAccount = catchAsyncError(async (req, res, next) => {
    const { _id } = req.user;
    if (!_id) {
        return next(new AppError('User not found', 404));
    }

    const allowedUpdates = ['lastName', 'firstName', 'recoveryEmail', 'DOB'];
    const updates = {};

    // Extract keys from the request body
    const keys = Object.keys(req.body);

    // Check if at least one valid field is present
    const isValidOperation = keys.some(key => allowedUpdates.includes(key));

    if (!isValidOperation) {
        return next(new AppError('Invalid updates! You must provide at least one valid field.', 400));
    }

    // Add allowed fields to the updates object
    keys.forEach(key => {
        if (allowedUpdates.includes(key)) {
            updates[key] = req.body[key];
        }
    });

    // Update the user with the allowed fields
    const user = await userModel.findByIdAndUpdate(_id, { $set: updates }, { new: true, runValidators: true });

    if (!user) {
        return next(new AppError('User not found or update failed', 404));
    }

    res.status(200).json({
        message: "Account updated successfully",
        user
    });
});

export const updateProfilePicture = catchAsyncError(async (req, res, next) => {
    const { _id } = req.user;
    if (!_id) {
        return next(new AppError('User not found', 404));
    }

    const user = await userModel.findById(_id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Extract the public ID from the profile picture URL
    const profilePictureUrl = user.profilePicture;
    if (profilePictureUrl) {
        const publicIdMatch = profilePictureUrl.match(/\/upload\/(?:v[0-9]+\/)?([^/.]+)(?=\.[^.]+$)/);
        const publicId = publicIdMatch ? publicIdMatch[1] : null;


        // Remove the old profile picture from Cloudinary if public ID exists
        if (publicId) {
            try {
                const destroyResponse = await cloudinary.uploader.destroy(publicId);

                //    await cloudinary.uploader.destroy(destroyResponse.UploadResponse)
            } catch (error) {
                console.error('Error removing image from Cloudinary:', error);
            }
        }
    }

    // Upload the new profile picture to Cloudinary
    let cloud;
    try {
        cloud = await cloudinary.uploader.upload(req.file.path);
    } catch (error) {
        return next(new AppError('Failed to upload profile picture', 500));
    }

    // Update the user with the new profile picture URL
    user.profilePicture = cloud.secure_url;
    // Save the new public ID if needed
    // user.profilePicturePublicId = cloud.public_id;
    await user.save();

    // Remove the local file
    fs.unlink(req.file.path, (err) => {
        if (err) {
            console.error('Error removing file:', err);
        } else {
            console.log('Old profile picture file removed:', req.file.path);
        }
    });

    res.status(200).json({
        message: "Profile picture updated successfully",
        user
    });
});
export const updateAccountEmail = catchAsyncError(async (req, res, next) => {
    const { _id: userId, email: userEmail } = req.user
    const { email } = req.body

    if (!userId) { return next(new AppError('User not found', 404)) };
    if (email === userEmail) { return next(new AppError("you can't update your email to your current email", 409)) };
    const isEmailExist = await userModel.findOne({ email })
    if (isEmailExist) { return next(new AppError('try another email', 409)) };

    const email_token = jwt.sign({ email }, process.env.EMAIL_SECRET_KEY)
    const link = process.env.BASE_URL + `api/v1/auth/confirmEmail/${email_token}`
    await sendEmailVerfication(email, { link })
    req.user.email = email
    req.user.status = "offline"
    req.user.isEmailVerified = false
    req.user.isLoggedOut = true
    await req.user.save()
    res.status(200).json({
        status: "success",
        message: "user email updated please login again",
        date: req.user
    })
})

// Delete account

export const deleteAccount = catchAsyncError(async (req, res, next) => {
    const { _id } = req.user
    if (!_id) { return next(new AppError('User not found', 404)) };

    await userModel.findByIdAndDelete(_id)
    res.status(200).json({ status: "success", message: "Account is deleted" })
})

// Get user account data 
export const userInfo = catchAsyncError(async (req, res, next) => {
    const { _id } = req.user
    if (!_id) { return next(new AppError('User not found', 404)) };
    const user = await userModel.findById(_id)
    res.status(200).json({ user })
})

// Get profile data for another user 

export const anotherUserInfo = catchAsyncError(async (req, res, next) => {
    const { id: friend_id } = req.params;
    if (!friend_id) { return next(new AppError('User not found', 404)) };

    const user = await userModel.findById(friend_id, 'userName email age status')
    res.status(200).json({ user })
})

//  Update password 
export const updatePassword = catchAsyncError(async (req, res, next) => {
    const { _id } = req.user;
    if (!_id) { return next(new AppError('Not allowed', 401)); }

    const { current_password, new_password } = req.body;

    // Fetch the user by ID
    const user = await userModel.findById(_id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Check if the current password matches
    const isMatch = await new Promise((resolve, reject) => {
        user.comparePassword(current_password, (err, isMatch) => {
            if (err) reject(err);
            resolve(isMatch);
        });
    });

    if (!isMatch) {
        return next(new AppError('Enter a valid current password', 400));
    }

    // Check if new password is the same as the current password
    if (new_password === current_password) {
        return next(new AppError('Try another password', 400));
    }

    // Update the password
    user.password = new_password;
    user.isLoggedOut = true;
    user.status = 'offline';
    user.passwordChangedAt = Date.now(); // Optional: track when the password was last changed

    await user.save(); // This will trigger the pre-save hook to hash the password

    res.status(200).json({
        status: 'success',
        message: 'Account password updated successfully',
    });
});
// Forget password 

export const sendOTP = catchAsyncError(async (req, res, next) => {

    const { identifier } = req.body;

    const user = await userModel.findOne({ $or: [{ email: identifier }, { mobileNumber: identifier }] })
    if (!user) throw new AppError("user is not found", 404)
    if (!user.isEmailVerified) throw new AppError("confirm email first", 400)
    const otp = generateOTP();;
    user.otp = otp;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    await sendEmailVerfication(user.email, { otp })


    res.status(200).json({ status: "success", message: 'OTP is sent' })
})
// reset password

export const resetPassword = catchAsyncError(async (req, res) => {
    const { new_password } = req.body
    req.user.password = new_password;
    req.user.resetPasswordExpires = null
    req.user.otp = null;
    await req.user.save();

    res.status(200).json({ status: "success", message: 'Password reset successfully', user: req.user });
})

// Get all accounts associated to a specific recovery Email 


export const getAllAccountsAssociated = catchAsyncError(async (req, res, next) => {
    const { recoveryEmail } = req.body;

    // Build the query object
    let query = {};
    if (recoveryEmail) {
        query.recoveryEmail = recoveryEmail;
    }

    try {
        const Accounts = await userModel.find(query, { userName: 1 });
        res.status(200).json({ status: "success", Accounts });
    } catch (error) {
        next(error); // Pass any error to the error handling middleware
    }
});


export const kickUserOut = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    // Find and update the user
    const isUser = await userModel.findById(id)
    if (!isUser) return next(new AppError('User not found', 404));
    console.log(isUser);
    if (isUser.status === 'blocked') return next(new AppError('User already blocked', 400));
    isUser.status = 'blocked'

    await isUser.save()
    res.status(200).json({
        status: 'success',
        message: `Account is  blocked`,
    });
});

export const softDeleteUser = catchAsyncError(async (req, res, next) => {
    const { _id } = req.user;

    // Mark the user as deleted
    const user = await userModel.findByIdAndUpdate(_id, { status: 'deleted', isLoggedOut: true }, { new: true });

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Account deleted successfully',
        data: {
            user
        }
    });
});


export const userLoggedOut = catchAsyncError(async (req, res, next) => {
    const { _id } = req.user;

    // Mark the user as logged out
    const user = await userModel.findById(_id);

    if (!user) return next(new AppError('User not found', 404));

    user.status = 'offline',
        user.isLoggedOut = true,
        await user.save();
    res.status(200).json({
        status: 'success',
        message: 'User logged out successfully',
        data: {
            user
        }
    });
});

export const blockUser = catchAsyncError(async (req, res, next) => {
    const { _id } = req.user; // ID of the user who is blocking
    const { id: userIdToBlock } = req.params; // ID of the user to be blocked

    if (_id.toString() === userIdToBlock) return next(new AppError('User can not block him self', 404));

    // Check if the user to be blocked exists
    const userToBlock = await userModel.findById(userIdToBlock);

    if (!userToBlock) return next(new AppError('User not found', 404));


    const isInBlockList = req.user.blockedUsers.find((user) => user.userId.toString() === userIdToBlock);
    if (isInBlockList) return next(new AppError('User in your block list', 404));

    req.user.blockedUsers.push({
        userId: userIdToBlock,
        userName: `${userToBlock.firstName} ${userToBlock.lastName}`,
        profilePicture: userToBlock.profilePicture
    });

    await req.user.save();

    res.status(200).json({
        status: "success",
        message: `${userToBlock.userName} has been blocked successfully.`,
        user: req.user
    });


    res.status(200).json({
        status: "success",
        message: `${userToBlock.userName} has been blocked successfully.`,
        user: req.user
    });
});


export const userBlockedList = catchAsyncError(async (req, res, next) => {

    const { _id } = req.user
    const user = await userModel.findById(_id)
    if (!user) return next(new AppError('User not found', 404));
    res.status(200).json({
        status: "success",
        data: user.blockedUsers
    })
})


export const removeFromBlockList = catchAsyncError(async (req, res, next) => {
    const { _id } = req.user
    if (!_id) return next(new AppError("user not found", 404))
    const { id: removedUser } = req.body

    const userIndex = req.user.blockedUsers.findIndex((user) => user.userId.toString() === removedUser)
    if (userIndex < 0) throw new AppError("user not found", 404)


    req.user.blockedUsers.splice(userIndex, 1)
    await req.user.save()
    res.status(200).json({
        status: "success",
        message: "user removed from your block list",
    })
})