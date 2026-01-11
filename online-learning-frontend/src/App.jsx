import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import { AuthProvider, useAuth } from './Context/AuthContext';
import CourseBrowser from './Pages/CourseBrowser';
import CourseDetail from './Pages/CourseDetail';
import AddCourse from './Pages/AddCourse';
import AddLesson from './Pages/AddLesson';
import EditCourse from './Pages/EditCourse';
import Checkout from './Pages/Checkout';
import PaymentSuccess from './Pages/PaymentSuccess';

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
