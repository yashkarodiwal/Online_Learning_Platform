import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
    const navigate = useNavigate();
    const { fetchUser } = useAuth();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('${import.meta.env.VITE_API_URL}/api/auth/register', form);
            localStorage.setItem('token', res.data.token);
            await fetchUser();
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow" style={{ maxWidth: '500px', width: '100%' }}>
                <h3 className="text-center mb-4">Create Account</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label>Name</label>
                        <input name="name" className="form-control" placeholder="Your name" onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label>Email</label>
                        <input name="email" type="email" className="form-control" placeholder="Email address" onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label>Password</label>
                        <input name="password" type="password" className="form-control" placeholder="Password" onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label>Role</label>
                        <select name="role" className="form-select" onChange={handleChange}>
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                        </select>
                    </div>
                    <button className="btn btn-success w-100 mb-3">Register</button>
                    <div className="text-center">
                        <small>Already have an account? <Link to="/">Login</Link></small>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
