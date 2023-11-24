const mongoose=require('mongoose')
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

})
const Classes = mongoose.model("Classes", classesSchema);
module.exports=Classes