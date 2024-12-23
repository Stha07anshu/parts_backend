const userModel = require('../models/userModels');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

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
            return res.status(400).json({
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
        res.status(201).json({
            success: true,
            message: "User created successfully!"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required!"
        });
    }

    try {
        // Find user by email
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        }

        // Validate the password
        if (!validPassword(password, user.password, user.salt)) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password!"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, is_admin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token valid for 1 day
        );

        // Send the token, userData, and success message to the user
        res.status(200).json({
            success: true,
            message: "Login successful!",
            token: token,
            userData: { id: user._id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        });
    }
};

module.exports = {
    createUser,
    loginUser
};
