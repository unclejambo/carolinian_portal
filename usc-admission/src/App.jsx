import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login';
import Registration from './components/Register';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import CourseSelection from './components/courseSelection';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/courseSelection" element={<CourseSelection />} />
      </Routes>
    </Router>
  );
}

export default App;
