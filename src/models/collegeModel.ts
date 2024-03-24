import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
  name: String,
  pincode: {
    type: Number,
    required: true,
    unique: true,
  },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Courses' },],
},{timestamps:true});

const Colleges = mongoose.model('Colleges', collegeSchema);

export default Colleges