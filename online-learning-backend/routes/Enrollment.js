const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ✅ Moved to utility
// const sendEmail = require('../utils/sendEmail');
const authMiddleware = require('../middleware/auth');


// ✅ GET /api/enrollments/my-courses – View all enrolled courses
router.get('/my-courses', authMiddleware, async (req, res) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Only students can access this' });
    }

    try {
        const enrollments = await Enrollment.find({ student: req.user._id })
            .populate('course')
            .sort({ enrolledAt: -1 });

        const courses = enrollments
            .filter(e => e.course)   // remove null populated courses
            .map(e => e.course);

        res.json(courses);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
