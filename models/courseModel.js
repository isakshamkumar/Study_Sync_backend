const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: String,
});

const Courses = mongoose.model('Courses', courseSchema);

module.exports = Courses;
