import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { AuthProvider, useAuth } from './Context/AuthContext';
import CourseBrowser from './pages/CourseBrowser';
import CourseDetail from './pages/CourseDetail';
import AddCourse from './pages/AddCourse';
import AddLesson from './pages/AddLesson';
import EditCourse from './pages/EditCourse';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/courses" element={<PrivateRoute><CourseBrowser /></PrivateRoute>} />
          <Route path="/courses/:id" element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
          <Route path="/add-course" element={<PrivateRoute><AddCourse /></PrivateRoute>} />
          <Route path="/courses/:id/add-lesson" element={<PrivateRoute><AddLesson /></PrivateRoute>} />
          <Route path="/courses/:id/edit" element={<PrivateRoute><EditCourse /></PrivateRoute>} />
          <Route path="/checkout/:courseId" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
