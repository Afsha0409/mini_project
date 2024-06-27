const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const Student = require('../models/student'); // Ensure your Mongoose Student model includes the uploadId field
const path = require('path');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // To generate unique identifiers

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://afsha:2xU.qk-QvhQNgzC@cluster0.prgdq51.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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

    const uploadId = uuidv4(); // Generate a unique identifier for this upload

    // Add uploadId to each document
    const dataWithUploadId = sheetData.map((student) => ({ ...student, uploadId }));

    try {
        await Student.insertMany(dataWithUploadId);
        res.json({ message: 'File uploaded and data saved successfully!', uploadId });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Error uploading file' });
    }
});


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
        const { uploadId } = req.query;

        if (!uploadId) {
            return res.status(400).json({ error: 'Upload ID is required' });
        }

        // Using aggregation to filter out duplicates based on rollnumber and specific uploadId
        const students = await Student.aggregate([
            { $match: { uploadId } }, // Match documents with the specified uploadId
            {
                $group: {
                    _id: "$rollnumber",
                    rollnumber: { $first: "$rollnumber" },
                    internal: { $first: "$internal" },
                    external: { $first: "$external" },
                    grade: { $first: "$grade" }
                }
            }
        ]);

        if (students.length === 0) {
            return res.status(404).json({ error: 'No students found for the given uploadId' });
        }

        // Calculate overall performance metrics
        const totalStudents = students.length;
        const totalInternal = students.reduce((acc, student) => acc + student.internal, 0);
        const totalExternal = students.reduce((acc, student) => acc + student.external, 0);
        const avgInternal = totalStudents > 0 ? (totalInternal / totalStudents).toFixed(2) : 0;
        const avgExternal = totalStudents > 0 ? (totalExternal / totalStudents).toFixed(2) : 0;

        // Calculate grade counts
        const gradesCount = students.reduce((acc, student) => {
            const grade = student.grade ? student.grade.trim() : 'Unknown';
            acc[grade] = (acc[grade] || 0) + 1;
            return acc;
        }, {});

        const overallPerformance = {
            totalStudents,
            avgInternal,
            avgExternal,
            gradesCount
        };

        res.json(overallPerformance);
    } catch (error) {
        console.error('Error fetching overall performance data:', error);
        res.status(500).json({ error: 'Error fetching overall performance data' });
    }
});

app.get('/mid-performance', async (req, res) => {
    const { uploadId } = req.query;

    try {
        if (!uploadId) {
            return res.status(400).json({ error: 'Upload ID is required' });
        }
        const express = require('express');
        const multer = require('multer');
        const path = require('path');
        const xlsx = require('xlsx');
        
        const app = express();
        const port = process.env.PORT || 3000;
        
        const storage = multer.memoryStorage();
        const upload = multer({ storage });
        
        app.use(express.static(path.join(__dirname, 'public')));
        
        app.post('/upload', upload.single('file'), (req, res) => {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
        
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet);
        
            const uploadId = Date.now().toString();
            const parsedData = data.map(row => ({
                rollNumber: row['Roll Number'],
                name: row['Name'],
                internalMarks: row['Internal Marks'],
                externalMarks: row['External Marks'],
                grade: row['Grade']
            }));
        
            const uploads = {};
            uploads[uploadId] = parsedData;
        
            res.status(200).json({ uploadId });
        });
        
        app.get('/overall-performance', (req, res) => {
            const uploadId = req.query.uploadId;
            const uploadData = uploads[uploadId];
        
            if (!uploadData) {
                return res.status(404).json({ error: 'Upload data not found' });
            }
        
            const totalStudents = uploadData.length;
            const avgInternal = uploadData.reduce((sum, student) => sum + student.internalMarks, 0) / totalStudents;
            const avgExternal = uploadData.reduce((sum, student) => sum + student.externalMarks, 0) / totalStudents;
        
            const gradesCount = uploadData.reduce((counts, student) => {
                counts[student.grade] = (counts[student.grade] || 0) + 1;
                return counts;
            }, {});
        
            res.status(200).json({
                totalStudents,
                avgInternal,
                avgExternal,
                gradesCount
            });
        });
        
        // mid marks performance
        app.get('/mid-performance', (req, res) => {
            const uploadId = req.query.uploadId;
            const uploadData = uploads[uploadId];
        
            if (!uploadData) {
                return res.status(404).json({ error: 'Upload data not found' });
            }
        
            const midPerformanceData = uploadData.map(student => ({
                rollnumber: student.rollNumber,
                coa: student.COA,
                os: student.OS,
                java: student.Java,
                se: student.SE
            }));
        
            res.status(200).json(midPerformanceData);
        });
        
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}/`);
        });
        
        // Fetch MID performance data based on uploadId
        const midPerformanceData = await Student.find({ uploadId });

        // Check if data exists and send it as JSON response
        if (midPerformanceData.length > 0) {
            res.json(midPerformanceData);
        } else {
            res.status(404).json({ error: 'No MID performance data found for the given uploadId' });
        }
    } catch (error) {
        console.error('Error fetching MID performance data:', error);
        res.status(500).json({ error: 'Error fetching MID performance data' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
