import mongoose from "mongoose";
const projectSchema = new mongoose.Schema({
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teachers',
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Students',
    },

    isPlagiarized: {
      type: Boolean,
    },
    isApproved: {
      type: Boolean,
    },
    tags: [String], 
 
    content: {
      type: Buffer,//binary data-->buffer
    },
  },{timestamps:true});
const Projects = mongoose.model("Projects", projectSchema);
export default Projects