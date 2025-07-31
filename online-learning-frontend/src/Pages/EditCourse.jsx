import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';

const EditCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        liveLink: '',
        liveDate: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const token = localStorage.getItem('token');
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/courses/${id}`);
                const course = res.data;

                if (user?._id !== course.instructor._id) {
                    setMessage('❌ You are not authorized to edit this course.');
                    return;
                }

                setFormData({
                    title: course.title,
                    description: course.description,
                    price: course.price,
                    liveLink: course.liveLink || '',
                    liveDate: course.liveDate ? course.liveDate.slice(0, 16) : ''
                });
            } catch (err) {
                setMessage('⚠️ Failed to load course');
            }
        };

        fetchCourse();
    }, [id, user]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await axios.put(`http://localhost:5000/api/courses/${id}`, formData, authHeaders);
            setMessage('✅ Course updated!');
            setTimeout(() => navigate('/dashboard'), 1000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Update failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/courses/${id}`, authHeaders);
            alert('✅ Course deleted');
            navigate('/dashboard');
        } catch (err) {
            alert('❌ Failed to delete course');
        }
    };

    if (message.includes('not authorized')) {
        return <div className="container py-4"><h4>{message}</h4></div>;
    }

    return (
        <div className="container py-4">
            <h2>Edit Course</h2>
            {message && <div className="alert alert-info mt-3">{message}</div>}

            <form onSubmit={handleUpdate} className="card p-4 shadow-sm mt-3">
                <div className="mb-3">
                    <label className="form-label">Course Title</label>
                    <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea name="description" className="form-control" rows="4" value={formData.description} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Price (₹)</label>
                    <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Live Class Link (Zoom/Meet)</label>
                    <input type="text" name="liveLink" className="form-control" value={formData.liveLink} onChange={handleChange} placeholder="https://zoom.us/j/xxxxxx" />
                </div>

                <div className="mb-3">
                    <label className="form-label">Live Class Time</label>
                    <input type="datetime-local" name="liveDate" className="form-control" value={formData.liveDate} onChange={handleChange} />
                </div>

                <div className="d-flex justify-content-between">
                    <button className="btn btn-success" type="submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Course'}
                    </button>
                    <button type="button" className="btn btn-danger" onClick={handleDelete}>
                        🗑️ Delete Course
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditCourse;
