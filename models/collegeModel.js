const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: String,
  pincode: {
    type: Number,
    required: true,
    unique: true,
  },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Courses' }],
});

const Colleges = mongoose.model('Colleges', collegeSchema);

module.exports = Colleges;
