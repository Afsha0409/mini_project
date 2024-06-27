// models/student.js

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    rollnumber: {
        type: String,
        required: true
    },
    m1: {
        type: Number,
        // required: true
    },
    m2: {
        type: Number,
        // required: true
    },
    avg: {
        type: Number,
        // required: true
    },
    credits: {
        type: Number,
        // required: true
    },
    grade: {
        type: String,
        // required: true
    },
    gp: {
        type: Number,
        // required: true
    },

    TotalCredits: {
        type: Number,
        // required: true
    },

    TotalGrade: {
        type: Number,
        // required: true
    },

    TotalGP: {
        type: Number,
        // required: true
    },

    Total: {
        type: Number,
        // required: true
    },
    coa:{
        type: Number,
    },

    os:{
        type: Number,
    },

    java:{
        type: Number,
    },
    se:{
        type: Number,
    },
    uploadId: {
         type: String, required: true 
    }
    
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
