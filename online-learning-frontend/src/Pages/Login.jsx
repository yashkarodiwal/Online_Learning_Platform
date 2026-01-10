import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { fetchUser } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://online-learning-platform-x06t.onrender.com/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            await fetchUser();
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
                <h3 className="text-center mb-4">Login</h3>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label>Email</label>
                        <input type="email" className="form-control" placeholder="Enter email"
                            value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label>Password</label>
                        <input type="password" className="form-control" placeholder="Enter password"
                            value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button className="btn btn-primary w-100 mb-3">Login</button>
                    <div className="text-center">
                        <small>Don't have an account? <Link to="/register">Register</Link></small>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
