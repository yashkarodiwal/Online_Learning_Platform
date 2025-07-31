const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');

// 🔐 Auth middleware
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

// ✅ POST /api/progress/complete/:lessonId
router.post('/complete/:lessonId', authMiddleware, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.lessonId);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

        const courseId = lesson.course;

        let progress = await Progress.findOne({
            student: req.user._id,
            course: courseId
        });

        if (!progress) {
            progress = new Progress({
                student: req.user._id,
                course: courseId,
                completedLessons: [lesson._id]
            });
        } else {
            if (!progress.completedLessons.includes(lesson._id)) {
                progress.completedLessons.push(lesson._id);
            }
        }

        await progress.save();

        res.status(200).json({
            message: 'Lesson marked as completed',
            completedLessons: progress.completedLessons
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET /api/progress/:courseId
router.get('/:courseId', authMiddleware, async (req, res) => {
    try {
        const progress = await Progress.findOne({
            student: req.user._id,
            course: req.params.courseId
        }).populate('completedLessons');

        res.status(200).json(progress || { completedLessons: [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
