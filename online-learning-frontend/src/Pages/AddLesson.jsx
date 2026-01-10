import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';

const AddLesson = () => {
    const { id } = useParams(); // courseId from URL
    const { user } = useAuth();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        videoUrl: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    const fetchCourse = async () => {
        try {
            const res = await axios.get(`https://online-learning-platform-x06t.onrender.com/api/courses/${id}`);
            setCourse(res.data);
        } catch (err) {
            setMessage('Error loading course');
        }
    };

    useEffect(() => {
        fetchCourse();
    }, [id]);

    if (user?.role !== 'instructor') {
        return <div className="container py-4"><h4>❌ Access Denied</h4></div>;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await axios.post(`https://online-learning-platform-x06t.onrender.com/api/courses/${id}/lessons`, formData, authHeaders);
            setMessage('✅ Lesson added!');
            setFormData({ title: '', content: '', videoUrl: '' });
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error adding lesson');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            {/* 🔙 Back Button */}
            <button
                className="btn btn-outline-secondary mb-3"
                onClick={() => navigate('/dashboard')}
            >
                ⬅️ Back to Dashboard
            </button>
            
            <h2 className="mb-3">📘 Add Lesson to: {course?.title || '...'}</h2>

            {message && <div className="alert alert-info">{message}</div>}

            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                <div className="mb-3">
                    <label className="form-label">Lesson Title</label>
                    <input
                        type="text"
                        name="title"
                        className="form-control"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Lesson Content</label>
                    <textarea
                        name="content"
                        className="form-control"
                        rows="3"
                        value={formData.content}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div className="mb-3">
                    <label className="form-label">Video URL (optional)</label>
                    <input
                        type="text"
                        name="videoUrl"
                        className="form-control"
                        value={formData.videoUrl}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? 'Saving...' : 'Add Lesson'}
                </button>
            </form>
        </div>
    );
};

export default AddLesson;
