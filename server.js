const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');

const app = express();

// Define MongoDB connection
mongoose.connect('mongodb://localhost:27017/mongo-test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define course schema with data validation
const courseSchema = new mongoose.Schema({
    code: { type: String, required: true },
    description: { type: String, required: true },
    units: { type: Number, required: true },
    tags: { type: [String], required: true }
  });
  
  // Define course model
  const Course = mongoose.model('Course', courseSchema);
  

// Read courses from the JSON file and import them into the database
const coursesData = JSON.parse(fs.readFileSync('courses.json', 'utf-8'));

// Flatten the courses data for easier processing
const flattenedCourses = coursesData.reduce((acc, curr) => {
  Object.values(curr).forEach(year => {
    acc.push(...year);
  });
  return acc;
}, []);

// Import flattened courses data into the database
Course.insertMany(flattenedCourses)
  .then(() => {
    console.log('Courses imported successfully');
  })
  .catch(err => {
    console.error('Error importing courses:', err);
  });

// Endpoint to retrieve BSIS courses
app.get('/bsis-courses', async (req, res) => {
  try {
    // Retrieve all published BSIS courses
    const bsisCourses = await Course.find({ tags: 'BSIS', published: true });
    res.json(bsisCourses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to retrieve BSIT courses
app.get('/bsit-courses', async (req, res) => {
  try {
    // Retrieve all published BSIT courses
    const bsitCourses = await Course.find({ tags: 'BSIT', published: true });
    res.json(bsitCourses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
