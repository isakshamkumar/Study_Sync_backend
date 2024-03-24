import mongoose from "mongoose";
const classesSchema = new mongoose.Schema({
    nameOfClass: {
        type: String
    },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teachers" },//jo req.teacher se aayegi
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Students',
        },
    ],
    dateCreated: String,
    // classCode: String,
    inviteTokens: //either students manually enter or automate it(V.hard)
    {
        type: String,
    },

},{timestamps:true})
const Classes = mongoose.model("Classes", classesSchema);
export default Classes