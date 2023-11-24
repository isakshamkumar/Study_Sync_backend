const mongoose=require('mongoose')
const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    collegeDetails: {
        enrollmentNumber: Number,
        collegeId: { type: mongoose.Schema.Types.ObjectId, ref: "Colleges" },
        courseEnrolled: { type: mongoose.Schema.Types.ObjectId, ref: "Courses" },//particular course
    },
    classesJoined: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Classes',
        },
    ],
    projectsUploaded: [{ type: mongoose.Schema.Types.ObjectId, ref: "Projects" }]

})

const Students = mongoose.model('Students', studentSchema);
module.exports=Students