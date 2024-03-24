"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const classesSchema = new mongoose_1.default.Schema({
    nameOfClass: {
        type: String
    },
    teacher: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Teachers" }, //jo req.teacher se aayegi
    students: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Students',
        },
    ],
    dateCreated: String,
    // classCode: String,
    inviteTokens: //either students manually enter or automate it(V.hard)
    {
        type: String,
    },
}, { timestamps: true });
const Classes = mongoose_1.default.model("Classes", classesSchema);
exports.default = Classes;
