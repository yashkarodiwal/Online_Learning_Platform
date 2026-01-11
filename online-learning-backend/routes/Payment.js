// routes/Payment.js
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Step 1: Create Razorpay Order
router.post('/create-order', auth, async (req, res) => {
    const { courseId } = req.body;

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        const options = {
            amount: course.price * 100, // convert to paisa
            currency: 'INR',
            receipt: `receipt_${courseId}_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order); // return full order object (useful for frontend)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Razorpay order creation failed' });
    }
});

// ✅ Step 2: Verify Payment + Enroll
router.post('/verify', auth, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

    try {
        // 1. Verify Signature
        const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        // 2. Check course
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        // 3. Prevent duplicate enrollment
        const alreadyEnrolled = await Enrollment.findOne({
            student: req.user._id,
            course: courseId
        });

        if (alreadyEnrolled) {
            return res.status(200).json({ success: true, message: 'Already enrolled' });
        }

        // 4. Save enrollment
        const enrollment = await Enrollment.create({
            student: req.user._id,
            course: courseId
        });

        // 5. Create notification
        await Notification.create({
            user: req.user._id,
            message: `🎉 You successfully enrolled in ${course.title}`,
            type: 'enrollment'
        });

        // 6. Send confirmation email
        await sendEmail(
            req.user.email,
            `Enrollment Confirmed: ${course.title}`,
            `<h3>Hello ${req.user.name},</h3>
       <p>You have successfully enrolled in <strong>${course.title}</strong>.</p>
       <p>Start here: <a href="${process.env.FRONTEND_URL}/courses/${course._id}">Go to Course</a></p>
       <p>Happy Learning! 🎓</p>`
        );

        return res.json({
            success: true,
            message: 'Payment verified & enrolled successfully!',
            enrollment
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
