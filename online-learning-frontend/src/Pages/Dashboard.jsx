import { useAuth } from '../Context/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [courseProgress, setCourseProgress] = useState({});

    const token = localStorage.getItem('token');
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    const logout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/notifications', authHeaders);
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, authHeaders);
            fetchNotifications();
        } catch (err) {
            alert('❌ Failed to mark notification as read');
        }
    };

    const getLessonsAndProgress = async (courseId) => {
        try {
            const [lessonsRes, progressRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/courses/${courseId}/lessons`),
                axios.get(`http://localhost:5000/api/progress/${courseId}`, authHeaders),
            ]);

            const total = lessonsRes.data.length;
            const completed = progressRes.data?.completedLessons?.length || 0;

            setCourseProgress(prev => ({
                ...prev,
                [courseId]: { total, completed }
            }));
        } catch (err) {
            console.error(`Error fetching progress for course ${courseId}`, err);
        }
    };

    const fetchEnrolledCourses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/enrollments/my-courses', authHeaders);
            const validCourses = res.data.filter(course => course && course._id);

            setCourses(validCourses);

            validCourses.forEach(course =>
                getLessonsAndProgress(course._id)
            );

        } catch (err) {
            console.error(err);
        }
    };

    const fetchInstructorCourses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/courses');
            const instructorCourses = res.data.filter(c => c.instructor && c.instructor._id === user._id);
            setCourses(instructorCourses);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchNotifications();
        if (user.role === 'student') {
            fetchEnrolledCourses();
        } else if (user.role === 'instructor') {
            fetchInstructorCourses();
        }
    }, [user]);

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Welcome, {user?.name} 👋</h2>
                    <p className="text-muted mb-0">Role: <strong>{user.role}</strong></p>
                </div>
                <button className="btn btn-outline-danger btn-sm" onClick={logout}>Logout</button>
            </div>

            {/* Notifications */}
            <div className="card mb-4 shadow-sm border-0">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">📢 Notifications</h5>
                    {notifications.length > 0 && (
                        <span className="badge bg-light text-dark">{notifications.length}</span>
                    )}
                </div>
                <div className="card-body">
                    {notifications.length === 0 ? (
                        <p className="text-muted">You have no notifications at the moment.</p>
                    ) : (
                        <ul className="list-group list-group-flush">
                            {notifications.map(n => (
                                <li
                                    key={n._id}
                                    className={`list-group-item d-flex justify-content-between align-items-center ${n.read ? '' : 'bg-light'}`}
                                >
                                    <div>
                                        <span className={n.read ? '' : 'fw-bold'}>{n.message}</span>
                                        <br />
                                        <small className="text-muted">{new Date(n.createdAt).toLocaleString()}</small>
                                    </div>
                                    {!n.read && (
                                        <button
                                            onClick={() => markAsRead(n._id)}
                                            className="btn btn-sm btn-outline-secondary"
                                        >
                                            Mark as Read
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Student View */}
            {user.role === 'student' && (
                <>
                    <div className="d-flex justify-content-end mb-3">
                        <Link to="/courses" className="btn btn-primary btn-sm">
                            📚 Browse All Courses
                        </Link>
                    </div>

                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0">🎓 Your Enrolled Courses</h5>
                        </div>
                        <div className="card-body">
                            {courses.length === 0 ? (
                                <p className="text-muted">You're not enrolled in any courses yet.</p>
                            ) : (
                                <div className="row">
                                        {courses
                                            .filter(course => course && course._id)
                                            .map(course => {
                                        const progress = courseProgress[course._id] || { completed: 0, total: 0 };
                                        const percent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;

                                        return (
                                            <div className="col-md-6 col-lg-4 mb-4" key={course._id}>
                                                <div className="card h-100 shadow-sm border">
                                                    <div className="card-body d-flex flex-column justify-content-between">
                                                        <div>
                                                            <h6 className="card-title fw-bold">{course.title}</h6>
                                                            <p className="card-text small text-muted">{course.description}</p>
                                                            <p><strong>Price:</strong> ₹{course.price}</p>

                                                            {progress.total > 0 && (
                                                                <div className="mt-2">
                                                                    <small className="text-muted">
                                                                        Progress: {progress.completed} / {progress.total} lessons
                                                                    </small>
                                                                    <div className="progress" style={{ height: '8px' }}>
                                                                        <div
                                                                            className="progress-bar bg-success"
                                                                            role="progressbar"
                                                                            style={{ width: `${percent}%` }}
                                                                            aria-valuenow={percent}
                                                                            aria-valuemin="0"
                                                                            aria-valuemax="100"
                                                                        />
                                                                    </div>

                                                                    <Link
                                                                        to={`/courses/${course._id}`}
                                                                        className="btn btn-sm btn-outline-primary mt-3"
                                                                    >
                                                                        📖 View Course
                                                                    </Link>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Instructor View */}
            {user.role === 'instructor' && (
                <div className="card shadow-sm border-0 mb-4">
                    <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">📚 Your Created Courses</h5>
                        <Link to="/add-course" className="btn btn-dark btn-sm">
                            + Add New Course
                        </Link>
                    </div>
                    <div className="card-body">
                        {courses.length === 0 ? (
                            <p className="text-muted">You haven't created any courses yet.</p>
                        ) : (
                            <div className="row">
                                {courses.map(course => (
                                    <div className="col-md-6 col-lg-4 mb-4" key={course._id}>
                                        <div className="card h-100 border">
                                            <div className="card-body">
                                                <h6 className="card-title fw-bold">{course.title}</h6>
                                                <p className="card-text small text-muted">{course.description}</p>
                                                <p><strong>Price:</strong> ₹{course.price}</p>
                                                {/* ✅ ⬇️ Add the button here: */}
                                                <Link
                                                    to={`/courses/${course._id}/add-lesson`}
                                                    className="btn btn-sm btn-outline-primary mt-2"
                                                >
                                                    ➕ Add Lesson
                                                </Link>

                                                <Link
                                                    to={`/courses/${course._id}/edit`}
                                                    className="btn btn-sm btn-outline-warning mt-2 me-2"
                                                >
                                                    ✏️ Edit Course
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
