const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');
const Course = require('../models/Course');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

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

// ✅ POST /api/discussions/:courseId – Add a comment
router.post('/:courseId', authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;

        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const discussion = new Discussion({
            course: course._id,
            user: req.user._id,
            content
        });

        await discussion.save();
        res.status(201).json(discussion);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET /api/discussions/:courseId – Get discussions with nested replies
router.get('/:courseId', async (req, res) => {
    try {
        const threads = await Discussion.find({
            course: req.params.courseId,
            parent: null
        })
            .populate('user', 'name role')
            .sort({ createdAt: -1 });

        // Fetch replies for each thread
        const result = await Promise.all(threads.map(async (thread) => {
            const replies = await Discussion.find({ parent: thread._id })
                .populate('user', 'name role')
                .sort({ createdAt: 1 });

            return {
                ...thread.toObject(),
                replies
            };
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
  

// ✅ POST /api/discussions/:courseId/reply/:parentId – Add a reply
router.post('/:courseId/reply/:parentId', authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;

        const course = await Course.findById(req.params.courseId);
        const parent = await Discussion.findById(req.params.parentId).populate('user');

        if (!course || !parent) {
            return res.status(404).json({ message: 'Course or parent discussion not found' });
        }

        const reply = new Discussion({
            course: course._id,
            user: req.user._id,
            content,
            parent: parent._id
        });

        await reply.save();

        // Don’t notify if someone replies to themselves
        if (parent.user._id.toString() !== req.user._id.toString()) {
            await Notification.create({
                user: parent.user._id,
                message: `${req.user.name} replied to your comment on ${course.title}`,
                type: 'reply'
            });
        }


        res.status(201).json(reply);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
  

module.exports = router;
