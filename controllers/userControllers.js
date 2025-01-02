const userModel = require('../models/userModels');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');  // We'll use nodemailer to send OTP to the user's email

// Function to generate hashed password
function generatePassword(password) {
    const salt = crypto.randomBytes(32).toString('hex');
    const genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return {
        salt: salt,
        hash: genHash
    };
}

// Function to validate password
function validPassword(password, hash, salt) {
    const checkHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === checkHash;
}

// Function to send OTP via email
function sendOtpEmail(email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',  // Or any other email provider
        auth: {
            user: process.env.EMAIL_USER,  // Your email address
            pass: process.env.EMAIL_PASS   // Your email password or app password
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for password change',
        text: `Your OTP for updating your account details is: ${otp}`
    };

    return transporter.sendMail(mailOptions);
}

// Function to generate OTP
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();  // 6-digit OTP
}

const createUser = async (req, res) => {
    console.log("Create user API hit");
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "All fields are required!"
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Passwords do not match!"
        });
    }

    try {
        // Check if the user already exists
        const existingUser = await userModel.findOne({ email: email });
        if (existingUser) {
            return res.json({
                success: false,
                message: "User already exists!"
            });
        }

        // Generate hashed password
        const { salt, hash } = generatePassword(password);

        // Save the user in the database
        const newUser = new userModel({
            name: name,
            email: email,
            password: hash,
            salt: salt
        });

        await newUser.save();

        // Send the success response
        res.json({
            success: true,
            message: "User created successfully!"
        });

    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: "Internal server error!"
        });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.json({
            success: false,
            message: "Email and password are required!"
        });
    }

    try {
        // Find user by email
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.json({
                success: false,
                message: "User not found!"
            });
        }

        // Validate the password
        if (!validPassword(password, user.password, user.salt)) {
            return res.json({
                success: false,
                message: "Incorrect password!"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, is_admin: user.isAdmin },
            process.env.JWT_SECRET,
        );

        // Send the token, userData, and success message to the user
        res.json({
            success: true,
            message: "Login successful!",
            token: token,
            userData: user
        });

    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: "Internal server error!"
        });
    }
};

// Function to update user details (name, password)
const updateUser = async (req, res) => {
    const { email, oldPassword, newPassword, newName, otp } = req.body;

    // Validation
    if (!email || (!oldPassword && !otp)) {
        return res.json({
            success: false,
            message: "Email and either old password or OTP are required!"
        });
    }

    try {
        // Find user by email
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.json({
                success: false,
                message: "User not found!"
            });
        }

        if (otp) {
            // Verify OTP
            if (user.otp !== otp) {
                return res.json({
                    success: false,
                    message: "Invalid OTP!"
                });
            }

            // Reset OTP after successful validation
            user.otp = null;

            if (newPassword) {
                const { salt, hash } = generatePassword(newPassword);
                user.password = hash;
                user.salt = salt;
            }

            if (newName) {
                user.name = newName;
            }

            await user.save();

            return res.json({
                success: true,
                message: "User details updated successfully!"
            });

        } else if (oldPassword) {
            // Validate old password
            if (!validPassword(oldPassword, user.password, user.salt)) {
                return res.json({
                    success: false,
                    message: "Incorrect old password!" // Return this message when old password is incorrect
                });
            }

            if (newPassword) {
                const { salt, hash } = generatePassword(newPassword);
                user.password = hash;
                user.salt = salt;
            }

            if (newName) {
                user.name = newName;
            }

            await user.save();

            return res.json({
                success: true,
                message: "User details updated successfully!"
            });
        }

    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: "Internal server error!"
        });
    }
};


// Request OTP for updating user details
const requestOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({
            success: false,
            message: "Email is required!"
        });
    }

    try {
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.json({
                success: false,
                message: "User not found!"
            });
        }

        const otp = generateOtp();

        // Save OTP to user (you can set expiration time for OTP if needed)
        user.otp = otp;
        await user.save();

        // Send OTP to the user's email
        await sendOtpEmail(email, otp);

        return res.json({
            success: true,
            message: "OTP sent to your email!"
        });

    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: "Internal server error!"
        });
    }
};

module.exports = {
    createUser,
    loginUser,
    updateUser,
    requestOtp
};
