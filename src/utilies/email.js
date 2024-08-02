import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator';

export const sendEmailVerfication = async (email, options = {}) => {
	const { otp, link } = options;

	let message = '';
	if (otp) {
		message += `To reset your password.Submit this reset password code : <h1>${otp}</h1>  If you did not request a change of password, please ignore this email!`;
	}
	if (link) {
		message += (otp ? '<br/><br/>' : '') + `<a href="${link}">Click here to verify your email</a>`;
	}

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL, // Your email address
			pass: process.env.EMAIL_PASSWORD // Your email password
		}
	});

	const mailOptions = {
		from: process.env.EMAIL,
		to: email,
		subject: 'Your Verification Details',
		html: message
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (error) {
		console.error('Error sending email:', error);

		// Detailed error handling
		if (error.response && error.response.body && error.response.body.errors) {
			console.error('Email error details:', error.response.body.errors);
		}
		throw new Error('Failed to send email');
	}
};

export const generateOTP = () => {
	return otpGenerator.generate(6, {
		digits: true,
		upperCaseAlphabets: false,
		specialChars: false,
		lowerCaseAlphabets: false
	});
};
