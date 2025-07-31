const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Auth middleware
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

// POST /api/courses – Create course (instructor only)
router.post('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'instructor') {
        return res.status(403).json({ message: 'Only instructors can create courses' });
    }

    const { title, description, price, liveLink, liveDate } = req.body;

    try {
        const course = new Course({
            title,
            description,
            price,
            instructor: req.user._id,
            liveLink,
            liveDate
        });

        await course.save();
        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/courses – List all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().populate('instructor', 'name email');
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/courses/:id – Get course by ID
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('instructor', 'name email');
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/courses/:id – Update a course (instructor only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Only the instructor who created the course can update it
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to update this course' });
        }

        const { title, description, price, liveLink, liveDate } = req.body;

        course.title = title ?? course.title;
        course.description = description ?? course.description;
        course.price = price ?? course.price;
        course.liveLink = liveLink ?? course.liveLink;
        course.liveDate = liveDate ?? course.liveDate;

        await course.save();

        res.json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/courses/:id – Delete a course (instructor only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this course' });
        }

        await Course.findByIdAndDelete(req.params.id);

        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});  
  
module.exports = router;
