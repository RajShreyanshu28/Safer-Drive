const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const FormDataModel = require('./models/FormData');

require('dotenv').config(); // For environment variables

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb+srv://shreyanshu7:sr123456@cluster0.evyhu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const saltRounds = 10; // Number of salt rounds for hashing
const jwtSecret = process.env.JWT_SECRET || '8c5a7d2482c4f9e47c5b233e3a0c4e3b7e2b9a567f43d2b6f5b7a9b0b8d8b2f6'; // Add this to your .env file

// Register Endpoint
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await FormDataModel.findOne({ email });

        if (user) {
            return res.status(400).json("Already registered");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user with the hashed password
        const newUser = await FormDataModel.create({ ...req.body, password: hashedPassword });
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await FormDataModel.findOne({ email });

        if (!user) {
            return res.status(404).json("No records found!");
        }

        // Compare the hashed password
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const token = jwt.sign({ email: user.email }, jwtSecret, { expiresIn: '1h' }); // Create a token
            res.json({ message: "Success", token });
        } else {
            res.status(401).json("Wrong password");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// Middleware to verify JWT token
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Extract token from the header

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Route to add numbers to a user
app.post('/add-numbers', authenticateJWT, async (req, res) => {
    const { numbers } = req.body;
    const { email } = req.user;

    if (!Array.isArray(numbers)) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    try {
        const user = await FormDataModel.findOneAndUpdate(
            { email: email },
            { $set: { numbers: numbers } },
            { new: true, upsert: true }
        );
        res.status(200).json({ message: 'Numbers saved successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Error updating numbers' });
    }
});

// Route to get numbers for a user
app.get('/get-numbers', authenticateJWT, async (req, res) => {
    const { email } = req.user; // Use the email from the JWT payload

    try {
        const user = await FormDataModel.findOne({ email: email });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.status(200).json(user.numbers);
    } catch (error) {
        res.status(500).send('Error fetching numbers');
    }
});

app.listen(3001, () => {
    console.log("Server listening on http://127.0.0.1:3001");
});
