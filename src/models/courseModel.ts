import { timeStamp } from "console";
import mongoose from "mongoose";
const courseSchema = new mongoose.Schema({
    name: String,
   }, { timestamps: true });
   

const Courses = mongoose.model('Courses', courseSchema);

export default Courses;
