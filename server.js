const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cropguard';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Mongoose Schema for Analysis History
const analysisSchema = new mongoose.Schema({
    analysisId: { type: String, required: true, unique: true },
    imagePath: { type: String, required: true },
    result: {
        disease: { type: String, required: true },
        diseaseName: { type: String, required: true },
        confidence: { type: Number, required: true },
        description: { type: String, required: true },
        solutions: [{ type: String }],
        prevention: [{ type: String }]
    },
    createdAt: { type: Date, default: Date.now }
});

const Analysis = mongoose.model('Analysis', analysisSchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

// Disease Database
const diseaseDatabase = {
    healthy: {
        name: "Healthy",
        description: "The leaf appears to be healthy with no visible signs of disease or pest damage. The color is vibrant and the structure is intact.",
        solutions: [
            "Continue regular watering schedule",
            "Maintain proper sunlight exposure",
            "Monitor for any changes in leaf color",
            "Apply balanced fertilizer as needed"
        ],
        prevention: [
            "Ensure good air circulation around plants",
            "Avoid overwatering - water at the base",
            "Regular inspection of plants for early detection",
            "Practice crop rotation annually"
        ]
    },
    leafSpot: {
        name: "Leaf Spot Disease",
        description: "Fungal or bacterial infection causing distinct spots on leaves. The spots may vary in color from brown to black, often with yellow halos.",
        solutions: [
            "Remove and destroy infected leaves immediately",
            "Apply copper-based fungicide or neem oil",
            "Improve air circulation by pruning",
            "Water at the base to avoid wetting foliage"
        ],
        prevention: [
            "Space plants properly for air flow",
            "Avoid overhead watering",
            "Clean garden tools regularly",
            "Use disease-resistant varieties"
        ]
    },
    blight: {
        name: "Blight",
        description: "A serious disease causing rapid browning and death of plant tissue. Can spread quickly and destroy entire crops.",
        solutions: [
            "Remove and destroy all infected plant material",
            "Apply appropriate fungicide immediately",
            "Avoid working with wet plants",
            "Consider removing severely infected plants"
        ],
        prevention: [
            "Practice crop rotation (3-4 years)",
            "Use certified disease-free seeds",
            "Maintain proper plant spacing",
            "Apply preventive fungicides in humid weather"
        ]
    },
    powderyMildew: {
        name: "Powdery Mildew",
        description: "Fungal disease appearing as white powdery patches on leaves. Thrives in humid conditions with poor air circulation.",
        solutions: [
            "Apply sulfur-based fungicide or potassium bicarbonate",
            "Prune to improve air circulation",
            "Remove severely infected leaves",
            "Spray with milk solution (1:9 milk:water)"
        ],
        prevention: [
            "Plant in sunny locations",
            "Ensure adequate spacing between plants",
            "Avoid excessive nitrogen fertilizer",
            "Water in the morning to allow drying"
        ]
    },
    rust: {
        name: "Rust Disease",
        description: "Fungal disease producing orange, yellow, or brown pustules on leaf undersides. Can cause significant yield loss.",
        solutions: [
            "Remove and destroy infected plant parts",
            "Apply sulfur or copper fungicide",
            "Avoid overhead irrigation",
            "Improve air circulation around plants"
        ],
        prevention: [
            "Plant resistant varieties when available",
            "Remove nearby weeds that may host rust",
            "Maintain proper plant nutrition",
            "Monitor regularly for early signs"
        ]
    },
    wilt: {
        name: "Wilt Disease",
        description: "Vascular disease causing plants to wilt despite adequate water. Fungus blocks water transport in the plant.",
        solutions: [
            "Remove and destroy infected plants completely",
            "Do not compost infected material",
            "Solarize soil in affected areas",
            "Apply biocontrol agents for mild cases"
        ],
        prevention: [
            "Practice long-term crop rotation",
            "Use resistant varieties",
            "Maintain soil health with organic matter",
            "Avoid overwatering and waterlogging"
        ]
    },
    pestDamage: {
        name: "Pest Damage",
        description: "Damage caused by insects such as aphids, caterpillars, or mites. May include holes, discoloration, or distorted growth.",
        solutions: [
            "Identify the specific pest first",
            "Use insecticidal soap or neem oil",
            "Introduce beneficial insects (ladybugs, lacewings)",
            "Handpick larger pests when possible"
        ],
        prevention: [
            "Use row covers to protect young plants",
            "Encourage beneficial insects in garden",
            "Maintain plant health to resist pests",
            "Regular monitoring for pest presence"
        ]
    }
};

// AI Detection Simulation (Replace with actual ML model)
async function detectDisease(imagePath) {
    // TODO: Integrate with actual ML model API
    // Example: TensorFlow.js, Plant.id API, or custom model
    
    // For now, simulate detection with random results
    const diseases = Object.keys(diseaseDatabase);
    const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
    const confidence = Math.floor(Math.random() * 15) + 85; // 85-99%
    
    return {
        disease: randomDisease,
        confidence: confidence
    };
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'CropGuard API is running',
        timestamp: new Date().toISOString()
    });
});

// Get all disease categories
app.get('/api/diseases', (req, res) => {
    const diseases = Object.entries(diseaseDatabase).map(([key, value]) => ({
        id: key,
        name: value.name,
        description: value.description
    }));
    res.json(diseases);
});

// Get specific disease details
app.get('/api/diseases/:id', (req, res) => {
    const disease = diseaseDatabase[req.params.id];
    if (!disease) {
        return res.status(404).json({ error: 'Disease not found' });
    }
    res.json({ id: req.params.id, ...disease });
});

// Analyze image endpoint
app.post('/api/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const imagePath = req.file.path;
        const analysisId = uuidv4();

        // Perform disease detection
        const detectionResult = await detectDisease(imagePath);
        const diseaseInfo = diseaseDatabase[detectionResult.disease];

        // Prepare result
        const result = {
            disease: detectionResult.disease,
            diseaseName: diseaseInfo.name,
            confidence: detectionResult.confidence,
            description: diseaseInfo.description,
            solutions: diseaseInfo.solutions,
            prevention: diseaseInfo.prevention
        };

        // Save to database
        const analysis = new Analysis({
            analysisId,
            imagePath,
            result
        });
        await analysis.save();

        res.json({
            success: true,
            analysisId,
            result,
            imageUrl: `/uploads/${path.basename(imagePath)}`
        });

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ 
            error: 'Analysis failed', 
            message: error.message 
        });
    }
});

// Get analysis history
app.get('/api/history', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const analyses = await Analysis.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('-__v');
        
        res.json({
            count: analyses.length,
            analyses
        });
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Get specific analysis
app.get('/api/history/:id', async (req, res) => {
    try {
        const analysis = await Analysis.findOne({ analysisId: req.params.id });
        if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }
        res.json(analysis);
    } catch (error) {
        console.error('Analysis fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch analysis' });
    }
});

// Delete analysis
app.delete('/api/history/:id', async (req, res) => {
    try {
        const analysis = await Analysis.findOneAndDelete({ analysisId: req.params.id });
        if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }
        
        // Delete associated image file
        try {
            fs.unlinkSync(analysis.imagePath);
        } catch (err) {
            console.error('Failed to delete image file:', err);
        }
        
        res.json({ success: true, message: 'Analysis deleted' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete analysis' });
    }
});

// Statistics endpoint
app.get('/api/stats', async (req, res) => {
    try {
        const totalAnalyses = await Analysis.countDocuments();
        const healthyCount = await Analysis.countDocuments({ 'result.disease': 'healthy' });
        const diseasedCount = totalAnalyses - healthyCount;
        
        // Get disease distribution
        const diseaseDistribution = await Analysis.aggregate([
            { $group: { _id: '$result.disease', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            totalAnalyses,
            healthyCount,
            diseasedCount,
            diseaseDistribution
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large. Max 10MB allowed.' });
        }
    }
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CropGuard server running on http://localhost:${PORT}`);
    console.log(`📁 Upload directory: ${uploadsDir}`);
});
