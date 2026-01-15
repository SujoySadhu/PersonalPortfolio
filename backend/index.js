// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ১. MongoDB কানেকশন (Local)
// 'my_portfolio' নামে অটোমেটিক ডাটাবেস তৈরি হয়ে যাবে
mongoose.connect('mongodb://127.0.0.1:27017/my_portfolio')
    .then(() => console.log('MongoDB Connected Successfully!'))
    .catch(err => console.log(err));

// ২. একটি সিম্পল স্কিমা (Schema) বানানো
const ProjectSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    link: String
});
const Project = mongoose.model('Project', ProjectSchema);

// ৩. API তৈরি করা (Routes)

// ক. ডাটা পাওয়ার জন্য (GET)
app.get('/projects', async (req, res) => {
    const projects = await Project.find();
    res.json(projects);
});

// খ. ডাটা পাঠানোর জন্য (POST)
app.post('/add-project', async (req, res) => {
    const newProject = new Project(req.body);
    await newProject.save();
    res.json(newProject);
});

// ৪. সার্ভার চালু করা
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});