import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);        // Current logged-in user
    const [loading, setLoading] = useState(true);  // While fetching user info

    // 🔄 Fetch user based on token in localStorage
    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get('${import.meta.env.VITE_API_URL}/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
        } catch {
            localStorage.removeItem('token');  // Clear invalid token
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch user on initial mount only
    useEffect(() => {
        fetchUser();
    }, []);

    // 🚪 Logout: Clear token and user, redirect
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, setUser, fetchUser, loading, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// 🔗 Custom hook to access auth state
export const useAuth = () => useContext(AuthContext);
