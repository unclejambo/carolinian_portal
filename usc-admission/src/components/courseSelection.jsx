import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CourseSelection = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleCourseChange = (event) => {
    const courseId = event.target.value;
    const selected = courses.find((course) => course.id === parseInt(courseId));

    if (selected) {
      setSelectedCourse(selected.name);
      setRequirements(selected.requirements);
    } else {
      setSelectedCourse('');
      setRequirements('');
    }
  };

  return (
    <div>
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
        <>
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
              <button
                onClick={() => (window.location.href = '/register')}
                style={{
                  marginTop: '10px',
                  padding: '10px 20px',
                  backgroundColor: '#007BFF',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseSelection;
