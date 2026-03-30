const bcrypt = require("bcryptjs");

const User = require("../models/User");
const { generateToken } = require("../utils/tokenUtils");

async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            const error = new Error("name, email and password are required");
            error.statusCode = 400;
            throw error;
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            const error = new Error("Email already registered");
            error.statusCode = 409;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            const error = new Error("email and password are required");
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            throw error;
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            throw error;
        }

        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        next(error);
    }
}

async function getUsers(req, res, next) {
    try {
        const users = await User.find(
            {
                _id: { $ne: req.user.id },
            },
            {
                name: 1,
                email: 1,
            }
        ).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
    getUsers,
};
