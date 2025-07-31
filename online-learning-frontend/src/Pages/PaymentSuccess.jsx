import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => {
    const [orderId, setOrderId] = useState('');
    const [timestamp, setTimestamp] = useState('');

    useEffect(() => {
        const id = sessionStorage.getItem('orderId') || 'ORDER_' + Math.random().toString(36).substring(2, 10).toUpperCase();
        setOrderId(id);

        const now = new Date();
        const formatted = now.toLocaleString();
        setTimestamp(formatted);
    }, []);

    return (
        <div className="container py-5 text-center">
            <h2 className="mb-4 text-success">🎉 Payment Successful</h2>
            <div className="alert alert-success">
                <p className="mb-2"><strong>Order ID:</strong> {orderId}</p>
                <p className="mb-2"><strong>Status:</strong> Paid ✅</p>
                <p className="mb-2"><strong>Time:</strong> {timestamp}</p>
            </div>
            <p className="mb-4">Thank you for enrolling! You can now access your course content from the dashboard.</p>
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        </div>
    );
};

export default PaymentSuccess;
