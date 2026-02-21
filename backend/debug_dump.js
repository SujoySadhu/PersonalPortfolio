require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const Blog = require('./models/Blog');
    const blogs = await Blog.find({}).select('title content').lean();
    const fs = require('fs');
    let output = '';
    for (const b of blogs) {
        output += `=== ${b.title} ===\n${b.content}\n---END---\n\n`;
    }
    fs.writeFileSync('debug_content.txt', output);
    console.log('Written to debug_content.txt');
    
    const Project = require('./models/Project');
    const projects = await Project.find({}).select('title description').lean();
    let pOutput = '';
    for (const p of projects) {
        pOutput += `=== ${p.title} ===\n${p.description}\n---END---\n\n`;
    }
    fs.writeFileSync('debug_projects.txt', pOutput);
    console.log('Written to debug_projects.txt');
    
    process.exit(0);
})();
