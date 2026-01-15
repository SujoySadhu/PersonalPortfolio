/**
 * ============================================
 * index.js - Legacy Entry Point (Reference Only)
 * ============================================
 * 
 * This file was the original simple Express server setup.
 * The production server now uses server.js with a complete MVC architecture.
 * This file is kept for reference and learning purposes only.
 * 
 * @deprecated Use server.js instead for the main application
 * @author Portfolio Admin
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================
// Parse incoming JSON request bodies
app.use(express.json());
// Enable Cross-Origin Resource Sharing for frontend communication
app.use(cors());

// ============================================
// DATABASE CONNECTION
// ============================================
// Connect to local MongoDB instance
// Database 'my_portfolio' will be created automatically if it doesn't exist
mongoose.connect('mongodb://127.0.0.1:27017/my_portfolio')
    .then(() => console.log('MongoDB Connected Successfully!'))
    .catch(err => console.log(err));

// ============================================
// SCHEMA DEFINITION
// ============================================
// Define a simple Project schema for storing portfolio projects
const ProjectSchema = new mongoose.Schema({
    title: String,        // Project title/name
    description: String,  // Brief description of the project
    image: String,        // URL or path to project thumbnail
    link: String          // External link to project (GitHub, live demo, etc.)
});

// Create the Project model from the schema
const Project = mongoose.model('Project', ProjectSchema);

// ============================================
// API ROUTES
// ============================================

/**
 * GET /projects
 * Retrieve all projects from the database
 * @returns {Array} List of all project documents
 */
app.get('/projects', async (req, res) => {
    const projects = await Project.find();
    res.json(projects);
});

/**
 * POST /add-project
 * Create a new project in the database
 * @body {Object} Project data (title, description, image, link)
 * @returns {Object} The newly created project document
 */
app.post('/add-project', async (req, res) => {
    const newProject = new Project(req.body);
    await newProject.save();
    res.json(newProject);
});

// ============================================
// SERVER INITIALIZATION
// ============================================
// Start the Express server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
