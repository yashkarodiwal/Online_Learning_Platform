// src/pages/Checkout.jsx
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';

const Checkout = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await axios.get(`https://online-learning-platform-x06t.onrender.com/api/courses/${courseId}`);
                setCourse(res.data);
            } catch (err) {
                alert('❌ Course not found');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    const handlePayment = async () => {
        if (!course) return;

        try {
            const { data: order } = await axios.post(
                'https://online-learning-platform-x06t.onrender.com/api/payment/create-order',
                { amount: course.price, courseId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: 'INR',
                name: 'Online Learning Platform',
                description: `Payment for ${course.title}`,
                order_id: order.id,
                handler: async function (response) {
                    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

                    try {
                        const verifyRes = await axios.post(
                            'https://online-learning-platform-x06t.onrender.com/api/payment/verify',
                            {
                                razorpay_payment_id,
                                razorpay_order_id,
                                razorpay_signature,
                                courseId,
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                                },
                            }
                        );

                        if (verifyRes.data.success) {
                            sessionStorage.setItem("orderId", razorpay_order_id);
                            navigate('/payment-success');
                        } else {
                            alert('❌ Payment verification failed');
                        }
                    } catch (error) {
                        console.error(error);
                        alert('❌ Something went wrong during verification.');
                    }
                },
                prefill: {
                    name: course.instructor?.name || '',
                    email: '', // Optionally get from auth context
                },
                theme: {
                    color: '#3399cc',
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error(err);
            alert('❌ Payment initialization failed');
        }
    };

    if (loading || !course) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-3">Loading course details...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-lg border-0">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">Checkout</h4>
                        </div>

                        <div className="card-body">
                            <h5 className="mb-3">{course.title}</h5>
                            <p className="text-muted">{course.description}</p>

                            <ul className="list-group mb-3">
                                <li className="list-group-item d-flex justify-content-between">
                                    <span>Instructor</span>
                                    <span>{course.instructor?.name}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between">
                                    <span>Price</span>
                                    <strong>₹{course.price}</strong>
                                </li>
                            </ul>

                            <div className="text-center">
                                <button className="btn btn-success w-100" onClick={handlePayment}>
                                    💳 Pay Now (Razorpay)
                                </button>
                            </div>
                        </div>

                        <div className="card-footer text-muted text-center">
                            🔐 Payments are powered by Razorpay.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
