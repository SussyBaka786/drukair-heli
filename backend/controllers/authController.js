const jwt = require('jsonwebtoken')
const User = require('../models/User')
const nodemailer = require('nodemailer');
require('dotenv').config();

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    })
}

const generateOTP = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
};

const isOtpAssigned = async (otp) => {
    const existingUser = await User.findOne({ otp });
    return existingUser !== null;
};

const getUniqueOTP = async () => {
    let otp;
    let isAssigned = true;

    while (isAssigned) {
        otp = generateOTP();
        isAssigned = await isOtpAssigned(otp);
    }

    return otp;
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
        ),
        httpOnly: false,
        path: '/',
    }
    res.cookie('jwt', token, cookieOptions)

    res.status(statusCode).json({ status: "success", token, data: { user } })
}
exports.signup = async (req, res, next) => {
    try {
        const otp = await getUniqueOTP();
        const newUser = await User.create({
            ...req.body,
            otp: otp,
            otpVerified: false,
        });
        createSendToken(newUser, 201, res)

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: newUser.email,
            subject: 'Signup OTP Verification',
            text: `Your OTP for account verification is: ${otp}`
        };

        await transporter.sendMail(mailOptions);
    }
    catch (err) {
        if (err.code === 11000) {
            res.status(400).json({
                status: 'fail',
                message: 'Your Email or Contact Number is already in use. Please use a different one.',
            });
        } else {
            res.status(500).json({
                message: err.message,
            });
        }
    }
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(401).send('Please provide an email and password!')
        }
        const user = await User.findOne({ email }).select('+password').populate('role')

        if (!user || !await user.correctPassword(password, user.password)) {
            return res.status(401).send("Incorrect Email or Password!")
        }
        createSendToken(user, 200, res)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.logout = (req, res) => {
    res.clearCookie('jwt', { path: "/" })
    res.status(200).json({ status: 'success' })
}


exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('+password');
        if (!user || !(await user.correctPassword(req.body.currentPassword, user.password))) {
            return res.status(401).send('Your current password is incorrect!');
        }

        user.password = req.body.newPassword;
        await user.save();

        res.json({ status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];

        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token || token === "") {
            return res.redirect("/api/users/login");
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        const freshUser = await User.findById(decoded.id);
        if (!freshUser) {
            return res.status(401).send("The user belonging to this token no longer exists");
        }

        req.user = freshUser;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "sanchezpenjor@gmail.com",
        pass: "mevz sypn eetp bvvm",
    },
})

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({
                message: `No user found with this email. Please check the email address or register.`
            });
        }


        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Recovery Code',
            text: `Your Password Recovery OTP is: ${existingUser.otp}`,
        };

        await transporter.sendMail(mailOptions);

        return res.json({ status: "OTP sent successfully" });

    } catch (err) {
        // console.error('Error in sendOtp:', err); 
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
};


exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.params;

        const user = await User.findOne({ email });


        if (!user) {
            return res.status(404).send('No user found with that email address.');
        }

        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).send('New password is required.');
        }

        user.password = newPassword;

        const newOTP = generateOTP();
        user.otp = newOTP;

        await user.save();

        res.json({
            status: "success",
            message: "Your password has been reset successfully and a new OTP has been generated.",
            newOTP: newOTP
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};