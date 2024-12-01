const User = require('./../models/User')

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

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate('role');
        res.status(200).json({ data: users, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.json({ data: user, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('role');
        res.json({ data: user, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.updateUser = async (req, res) => {
    try {
        if(req.body.otpVerified === true){
            req.body.otp = generateOTP();
        }
        
        const user = await User.findByIdAndUpdate(req.params.id, req.body);
        if (!user) {
            return res.status(404).json({ status: "error", message: "Passenger not found" });
        }

        res.json({ data: user, status: "success" });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({
              status: 'fail',
              message: 'The Email or Contact Number you entered is already in use. Please use a different one.',
            });
        } else {
            res.status(500).json({
              message: err.message,
            });
        }
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        res.json({ data: user, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
