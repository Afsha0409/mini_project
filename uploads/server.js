const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const Student = require('../models/student'); // Import your Mongoose Student model
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://afshanaaz0409:u1xGpyRHJ4Il9xyU@cluster0.p10uhvc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

const upload = multer({ dest: 'uploads/' });

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use('/', express.static(path.join(__dirname, '../uploads'))); // Serve uploaded files statically

// Route to handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    const file = req.file;
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    try {
        await Student.insertMany(sheetData);
        res.send('File uploaded and data saved successfully!');
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file');
    }
});

// Route to fetch student data based on filters
app.get('/students', async (req, res) => {
    const { rollNumber, grade, avg ,percentageThreshold,fail} = req.query;

    try {
        const query = {};
        if (rollNumber) {
            query.rollnumber = rollNumber;
        }
        if (grade) {
            query.grade = { $regex: `^${grade.trim()}\\s*$`, $options: 'i' }; // Match grade with optional trailing spaces
        }
        if (avg) {
            query.avg = Number(avg); // Ensure avg is a number
        }
        if (fail) {
            query.TotalGP = { $lt: 5.0 }; // Assuming fail is defined as gp < 5.0
        } 
        if (percentageThreshold) {
            query.TotalGP = { $gte: Number(percentageThreshold) / 10 }; // Convert percentage to GPA
        }

        // Using aggregation to get unique records
        const students = await Student.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$rollnumber",
                    rollnumber: { $first: "$rollnumber" },
                    m1: { $first: "$m1" },
                    m2: { $first: "$m2" },
                    avg: { $first: "$avg" },
                    grade: { $first: "$grade" },
                    gp: { $first: "$gp" }
                }
            }
        ]);

        res.json(students);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});



// Route to fetch overall performance data
app.get('/overall-performance', async (req, res) => {
    try {
        // Using aggregation to filter out duplicates based on rollnumber
        const students = await Student.aggregate([
            {
                $group: {
                    _id: "$rollnumber",
                    rollnumber: { $first: "$rollnumber" },
                    m1: { $first: "$m1" },
                    m2: { $first: "$m2" },
                    grade: { $first: "$grade" }
                }
            }
        ]);

        const totalStudents = students.length;
        const totalM1 = students.reduce((acc, student) => acc + student.m1, 0);
        const totalM2 = students.reduce((acc, student) => acc + student.m2, 0);
        const avgM1 = (totalM1 / totalStudents).toFixed(2);
        const avgM2 = (totalM2 / totalStudents).toFixed(2);

        const gradesCount = students.reduce((acc, student) => {
            acc[student.grade.trim()] = (acc[student.grade.trim()] || 0) + 1;
            return acc;
        }, {});

        const overallPerformance = {
            totalStudents,
            avgM1,
            avgM2,
            gradesCount
        };

        res.json(overallPerformance);
    } catch (error) {
        console.error('Error fetching overall performance data:', error);
        res.status(500).send('Error fetching overall performance data');
    }
});


// Route handler for the root URL ("/")
// app.get('/', (req, res) => {
//     res.send('Welcome to the Mini Project!');
// });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
