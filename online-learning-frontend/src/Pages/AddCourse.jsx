import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddCourse = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        liveLink: '',
        liveDate: ''
    });

    const [message, setMessage] = useState('');
    const token = localStorage.getItem('token');
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/courses', formData, authHeaders);
            setMessage('✅ Course created successfully!');
            setTimeout(() => navigate('/dashboard'), 1000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to create course');
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
            
            <h2>Add New Course</h2>
            {message && <div className="alert alert-info mt-3">{message}</div>}

            <form onSubmit={handleSubmit} className="card p-4 shadow-sm mt-3">
                <div className="mb-3">
                    <label className="form-label">Title</label>
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
                    <input type="text" name="liveLink" className="form-control" placeholder="https://zoom.us/j/xxxxxx" value={formData.liveLink} onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Live Class Time</label>
                    <input type="datetime-local" name="liveDate" className="form-control" value={formData.liveDate} onChange={handleChange} />
                </div>

                <button type="submit" className="btn btn-primary">Create Course</button>
            </form>
        </div>
    );
};

export default AddCourse;
