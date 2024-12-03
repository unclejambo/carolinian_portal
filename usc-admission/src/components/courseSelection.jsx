import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CourseSelection = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [birthCertificateFile, setBirthCertificateFile] = useState(null);
  const [gradesFile, setGradesFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/courses');
        setCourses(response.data);
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseChange = (event) => {
    const courseId = event.target.value;
    const selected = courses.find((course) => course.id === parseInt(courseId));
    setSelectedCourse(courseId);
    setRequirements(selected ? selected.requirements : '');
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
        { courseId: selectedCourse },
        { headers: { Authorization: `Bearer ${token}` } }
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
      alert('Failed to submit. Please try again later.');
    }
  };

  return (
    <div className="dashboard-content"
      style={{
        padding: '30px',
        borderRadius: '10px',
        maxWidth: '500px',
        margin: '40px auto',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Arial, sans-serif',
      }
    }
    >
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>
        Select a Course
      </h2>
  
      {loading ? (
        <p style={{ textAlign: 'center', color: '#555' }}>Loading courses...</p>
      ) : error ? (
        <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="course-select" style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
              Choose a Course:
            </label>
            <select
              id="course-select"
              onChange={handleCourseChange}
              defaultValue=""
              style={{
                color: '#333',
                backgroundColor: '#fff',
                padding: '10px',
                borderRadius: '5px',
                width: '100%',
                border: '1px solid #ccc',
                outline: 'none',
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
          </div>
  
          {requirements && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#555' }}>Requirements:</h3>
              <p style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '5px', color: '#555'}}>
                {requirements}
              </p>
            </div>
          )}
  
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>
              Upload Birth Certificate:
            </label>
            <input
              type="file"
              onChange={(e) => setBirthCertificateFile(e.target.files[0])}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                outline: 'none',
              }}
            />
          </div>
  
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>
              Upload Grades:
            </label>
            <input
              type="file"
              onChange={(e) => setGradesFile(e.target.files[0])}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                outline: 'none',
              }}
            />
          </div>
  
          <button
            type="submit"
            style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              backgroundColor: '#28A745',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#218838')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#28A745')}
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );  
};

export default CourseSelection;
