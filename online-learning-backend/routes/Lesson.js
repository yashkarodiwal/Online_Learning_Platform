const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ✅ Auth middleware
const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(401).json({ message: 'User not found' });

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// ✅ POST /api/courses/:courseId/lessons – Add a lesson (instructor only)
router.post('/:courseId/lessons', authMiddleware, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Only the instructor who created the course can add lessons
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to add lessons' });
        }

        const { title, content, videoUrl } = req.body;

        const lesson = new Lesson({
            course: course._id,
            title,
            content,
            videoUrl
        });

        await lesson.save();
        res.status(201).json(lesson);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET /api/courses/:courseId/lessons – Get lessons of a course
router.get('/:courseId/lessons', async (req, res) => {
    try {
        const lessons = await Lesson.find({ course: req.params.courseId }).sort({ createdAt: 1 });
        res.json(lessons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
