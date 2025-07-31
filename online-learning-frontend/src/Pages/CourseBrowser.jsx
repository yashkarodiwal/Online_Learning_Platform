import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';

const CourseBrowser = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);

    const token = localStorage.getItem('token');
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    const fetchAllCourses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/courses');
            setCourses(res.data);
        } catch (err) {
            console.error('Error fetching courses:', err);
        }
    };

    const fetchEnrolledCourses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/enrollments/my-courses', authHeaders);
            setEnrolledCourses(res.data.map(course => course._id));
        } catch (err) {
            console.error('Error fetching enrolled courses:', err);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchAllCourses();
        if (user.role === 'student') fetchEnrolledCourses();
    }, [user]);

    return (
        <div className="container py-4">
            {/* 🔙 Back Button */}
            <button
                className="btn btn-outline-secondary mb-3"
                onClick={() => navigate('/dashboard')}
            >
                ⬅️ Back to Dashboard
            </button>
            
            <h2 className="mb-4">📚 Browse Courses</h2>

            <div className="row">
                {courses.length === 0 ? (
                    <p className="text-muted">No courses available right now.</p>
                ) : (
                    courses.map(course => (
                        <div className="col-md-6 col-lg-4 mb-4" key={course._id}>
                            <div className="card h-100 shadow-sm border">
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <div>
                                        <h5 className="card-title fw-bold">{course.title}</h5>
                                        <p className="card-text small text-muted">{course.description}</p>
                                        <p className="mb-1"><strong>Instructor:</strong> {course.instructor?.name}</p>
                                        <p><strong>Price:</strong> ₹{course.price}</p>
                                    </div>

                                    {user?.role === 'student' && (
                                        enrolledCourses.includes(course._id) ? (
                                            <button className="btn btn-outline-success mt-3" disabled>
                                                ✅ Enrolled
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-primary mt-3"
                                                onClick={() => navigate(`/checkout/${course._id}`)}
                                            >
                                                💳 Enroll Now
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CourseBrowser;
