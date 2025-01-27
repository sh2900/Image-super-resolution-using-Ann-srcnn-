const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const port = 5000;

// Enable CORS
app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'SRCNN Server is running!' });
});

// SRCNN processing route
app.post('/srcnn', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const inputPath = req.file.path;
        const outputPath = path.join('uploads', `sr_${path.basename(req.file.filename)}`);

        console.log('Full input path:', path.resolve(inputPath));
        console.log('Full output path:', path.resolve(outputPath));

        const pythonPath = 'C:\\Users\\Dell\\AppData\\Local\\Microsoft\\WindowsApps\\PythonSoftwareFoundation.Python.3.7_qbz5n2kfra8p0\\python.exe';

        // Spawn Python process
        const pythonProcess = spawn(pythonPath, [
            'srcnn_inference.py',
            path.resolve(inputPath),
            path.resolve(outputPath)
        ]);

        pythonProcess.stdout.on('data', (data) => {
            console.log(`Python output: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return res.status(500).json({ error: 'Failed to process image' });
            }
            res.json({
                original: `http://localhost:${port}/${inputPath}`,
                processed: `http://localhost:${port}/${outputPath}`
            });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
