const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ✅ Moved to utility
// const sendEmail = require('../utils/sendEmail');
const authMiddleware = require('../middleware/auth');

// ❌ [REMOVED] Old POST /:courseId route — handled by Razorpay now

// ✅ GET /api/enrollments/my-courses – View all enrolled courses
router.get('/my-courses', authMiddleware, async (req, res) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Only students can access this' });
    }

    try {
        const enrollments = await Enrollment.find({ student: req.user._id })
            .populate('course')
            .sort({ enrolledAt: -1 });

        res.json(enrollments.map(e => e.course));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
