import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CourseSelection = () => {
  const [status, setStatus] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [birthCertificateFile, setBirthCertificateFile] = useState(null);
  const [gradesFile, setGradesFile] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
  
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/courses');
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setStatus("");
    setIsAuthenticated(false);
    navigate("/");
  };

  const handleCourseChange = (event) => {
    const courseId = event.target.value;
    const selected = courses.find((course) => course.id === parseInt(courseId));

    if (selected) {
      setSelectedCourse(courseId);
      setRequirements(selected.requirements);
    } else {
      setSelectedCourse('');
      setRequirements('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedCourse) {
      alert('Please select a course before proceeding.');
      return;
    }
  
    if (!birthCertificateFile || !gradesFile) {
      alert('Both files are required for submission.');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
  
      await axios.post(
        'http://localhost:5000/student/select-course',
        {
          courseId: selectedCourse,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const formData = new FormData();
      formData.append('birthCertificate', birthCertificateFile);
      formData.append('grades', gradesFile);
  
      await axios.post('http://localhost:5000/student/upload-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
  
      alert('Course and documents submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error during submission:', err);
      alert('Failed to submit. Please try again later.');
    }
  };
  

  return (
    <div className="dashboard-content">
      <header className="dashboard-header">
      <h1 style={{ color: 'black' }}>Carolinian Portal</h1>
      <div className="header-right" style={{ color: 'black' }}>
      <p>Student Name: John Doe<br />APPLICANT ID</p>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      
      <div
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '400px',
          margin: '20px auto',
        }}
      >
        <h2 style={{ margin: '0', color: '#333' }}>Select a Course</h2>
      </div>

      {loading ? (
        <p>Loading courses...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <select
            onChange={handleCourseChange}
            defaultValue=""
            style={{
              color: '#000',
              backgroundColor: '#fff',
              padding: '5px',
              borderRadius: '5px',
              width: '200px',
            }}
          >
            <option value="" disabled>
              Select a course
            </option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>

          {requirements && (
            <div>
              <h3>Requirements for {selectedCourse}:</h3>
              <p>{requirements}</p>
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <label>
              Upload Birth Certificate:
              <input
                type="file"
                onChange={(e) => setBirthCertificateFile(e.target.files[0])}
                style={{ display: 'block', margin: '10px 0' }}
              />
            </label>
            <label>
              Upload Grades:
              <input
                type="file"
                onChange={(e) => setGradesFile(e.target.files[0])}
                style={{ display: 'block', margin: '10px 0' }}
              />
            </label>
          </div>

          <button
            type="submit"
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#28A745',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default CourseSelection;
