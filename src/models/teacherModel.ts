const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: String,
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'Colleges' },
  dept: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses' },
  contactNumber: Number,
  email: String,
  password: String,
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Classes' }],
  projectsRecieved: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Projects' }],
},{timestamps:true});

const Teachers = mongoose.model('Teachers', teacherSchema);

export default Teachers
