// utils/enrollUser.js
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const sendEmail = require('./sendEmail');

const enrollUser = async (user, courseId) => {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    const alreadyEnrolled = await Enrollment.findOne({
        student: user._id,
        course: courseId
    });
    if (alreadyEnrolled) throw new Error('Already enrolled in this course');

    const enrollment = new Enrollment({
        student: user._id,
        course: courseId
    });
    await enrollment.save();

    await Notification.create({
        user: user._id,
        message: `🎉 You successfully enrolled in ${course.title}`,
        type: 'enrollment'
    });

    await sendEmail(
        user.email,
        `Enrollment Confirmed for ${course.title}`,
        `<h3>Hello ${user.name},</h3>
     <p>You have successfully enrolled in <strong>${course.title}</strong>.</p>
     <p>Start learning here: <a href="${process.env.FRONTEND_URL}/courses/${course._id}">View Course</a></p>
     <p>Happy Learning! 🎓</p>`
    );

    return enrollment;
};

module.exports = enrollUser;
