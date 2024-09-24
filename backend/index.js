const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests
app.use(bodyParser.json()); // Parse incoming request bodies as JSON

// MongoDB connection URI (using your credentials)
const uri = 'mongodb+srv://mahabduswamad:nPfr7eycOfbtATqO@cluster1.gictr.mongodb.net/customer-satisfaction?retryWrites=true&w=majority';
const client = new MongoClient(uri);

let surveyCollection;

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        const database = client.db('airlineDB'); // Database name
        surveyCollection = database.collection('surveys'); // Collection name
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectDB();

// POST route to save survey data with the current date
app.post('/api/surveys', async (req, res) => {
    const surveyData = {
        ...req.body,
        date: new Date() // Add the current date to the survey data
    };

    // Log the received survey data for debugging
    console.log('Received survey data:', surveyData);

    try {
        const result = await surveyCollection.insertOne(surveyData);
        console.log('Data successfully saved to MongoDB:', result);
        res.status(200).send('Survey data saved successfully');
    } catch (error) {
        console.error('Error saving survey data:', error);
        res.status(500).send('Error saving survey data');
    }
});

// GET route to fetch all survey data
app.get('/api/surveys', async (req, res) => {
    try {
        const surveys = await surveyCollection.find({}).toArray();
        console.log('Fetched surveys from MongoDB:', surveys);
        res.status(200).json(surveys);
    } catch (error) {
        console.error('Error fetching survey data:', error);
        res.status(500).send('Error fetching survey data');
    }
});

// Route to run AI model with logging
app.get('/run-ai', (req, res) => {
    console.log('Running AI model...');

    exec('python ' + path.join(__dirname, 'models/ai_model.py'), (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error.message}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).send('Error running AI model');
        }

        console.log(`AI Model ran successfully: ${stdout}`);
        res.status(200).send('AI model ran successfully');
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
