import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [progress, setProgress] = useState([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);

    const [discussions, setDiscussions] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replies, setReplies] = useState({});

    const [timeLeft, setTimeLeft] = useState('');
    const [showJoin, setShowJoin] = useState(false);

    const token = localStorage.getItem('token');
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    const fetchCourse = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses/${id}`);
            setCourse(res.data);
        } catch {
            console.error('Failed to load course');
        }
    };

    const fetchLessons = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses/${id}/lessons`);
            setLessons(res.data);
        } catch {
            console.error('Failed to load lessons');
        }
    };

    const fetchProgress = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/progress/${id}`, authHeaders);
            setProgress(res.data?.completedLessons || []);
        } catch {
            console.error('Failed to fetch progress');
        }
    };

    const fetchEnrollment = async () => {
        try {
            const res = await axios.get('${import.meta.env.VITE_API_URL}/api/enrollments/my-courses', authHeaders);
            const enrolled = res.data.some(course => course._id === id);
            setIsEnrolled(enrolled);
        } catch {
            console.error('Failed to check enrollment');
        }
    };

    const fetchDiscussions = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/discussions/${id}`);
            setDiscussions(res.data);
        } catch {
            console.error('Failed to load discussions');
        }
    };

    useEffect(() => {
        fetchCourse();
        fetchLessons();
        fetchDiscussions();
        if (user?.role === 'student') {
            fetchProgress();
            fetchEnrollment();
        }
        setLoading(false);
    }, [id, user]);

    // ⏳ Countdown logic
    useEffect(() => {
        if (!course?.liveDate) return;

        const interval = setInterval(() => {
            const now = new Date();
            const start = new Date(course.liveDate);
            const diff = start - now;

            if (diff <= 15 * 60 * 1000 && diff >= -15 * 60 * 1000) {
                setShowJoin(true);
            } else {
                setShowJoin(false);
            }

            if (diff > 0) {
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`⏳ Starts in ${minutes}m ${seconds}s`);
            } else if (diff >= -15 * 60 * 1000) {
                setTimeLeft('🟢 Live Now');
            } else {
                setTimeLeft('⏹️ Class Ended');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [course]);

    const markComplete = async (lessonId) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/progress/complete/${lessonId}`, {}, authHeaders);
            fetchProgress();
        } catch {
            alert('Failed to mark lesson complete');
        }
    };

    const addComment = async () => {
        if (!newComment.trim()) return;

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/discussions/${id}`,
                { content: newComment },
                authHeaders
            );
            setNewComment('');
            fetchDiscussions();
        } catch {
            alert('Failed to post comment');
        }
    };

    const addReply = async (parentId) => {
        const content = replies[parentId];
        if (!content?.trim()) return;

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/discussions/${id}/reply/${parentId}`,
                { content },
                authHeaders
            );
            setReplies({ ...replies, [parentId]: '' });
            fetchDiscussions();
        } catch {
            alert('Failed to reply');
        }
    };

    if (loading || !course) return <div className="container py-5">Loading course...</div>;

    return (
        <div className="container py-5">

            {/* 🔙 Back Button */}
            <button
                className="btn btn-outline-secondary mb-4"
                onClick={() => navigate('/dashboard')}
            >
                ⬅️ Back to Dashboard
            </button>

            <h2>{course.title}</h2>
            <p className="text-muted">{course.description}</p>
            <p><strong>Price:</strong> ₹{course.price}</p>
            {user?.role === 'student' && !isEnrolled && (
                <button className="btn btn-primary mt-3" onClick={() => navigate(`/checkout/${course._id}`)}>
                    💳 Enroll Now
                </button>
            )}

            {/* 🔴 Countdown + Join Link */}
            {user?.role === 'student' && course.liveLink && course.liveDate && (
                <>
                    <p><strong>Live Class:</strong> {new Date(course.liveDate).toLocaleString()}</p>
                    <p>{timeLeft}</p>
                    {isEnrolled && showJoin && (
                        <a
                            href={course.liveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary mb-3"
                        >
                            📺 Join Live Class
                        </a>
                    )}
                </>
            )}

            <hr />
            <h5>🎥 Lessons</h5>
            {lessons.length === 0 ? (
                <p>No lessons available.</p>
            ) : (
                <ul className="list-group mb-4">
                    {lessons.map(lesson => (
                        <li key={lesson._id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="mb-1">{lesson.title}</h6>
                                {lesson.content && <small className="text-muted">{lesson.content}</small>}
                                {lesson.videoUrl && (
                                    <div>
                                        <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary mt-2">
                                            ▶️ Watch Video
                                        </a>
                                    </div>
                                )}
                            </div>
                            {user?.role === 'student' && (
                                progress.includes(lesson._id) ? (
                                    <span className="badge bg-success">✅ Completed</span>
                                ) : (
                                    <button className="btn btn-sm btn-outline-success" onClick={() => markComplete(lesson._id)}>
                                        Mark Complete
                                    </button>
                                )
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <hr className="my-4" />
            <h5>💬 Course Discussions</h5>

            {/* New Comment Form */}
            <div className="mb-3">
                <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Ask a question or start a discussion..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button className="btn btn-primary mt-2" onClick={addComment}>
                    ➕ Post Comment
                </button>
            </div>

            {/* Discussion Threads */}
            {discussions.length === 0 ? (
                <p className="text-muted">No discussions yet. Be the first to start one!</p>
            ) : (
                discussions.map(thread => (
                    <div key={thread._id} className="border p-3 mb-3 rounded">
                        <div>
                            <strong>{thread.user.name}</strong> <small className="text-muted">({thread.user.role})</small>
                            <p className="mb-1">{thread.content}</p>
                        </div>

                        {thread.replies?.map(reply => (
                            <div key={reply._id} className="ms-3 mt-2 p-2 bg-light rounded">
                                <strong>{reply.user.name}</strong> <small className="text-muted">({reply.user.role})</small>
                                <p className="mb-1">{reply.content}</p>
                            </div>
                        ))}

                        <div className="mt-2 ms-3">
                            <textarea
                                className="form-control form-control-sm"
                                rows="2"
                                placeholder="Reply..."
                                value={replies[thread._id] || ''}
                                onChange={(e) => setReplies({ ...replies, [thread._id]: e.target.value })}
                            />
                            <button
                                className="btn btn-sm btn-outline-success mt-1"
                                onClick={() => addReply(thread._id)}
                            >
                                🔁 Reply
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default CourseDetail;
