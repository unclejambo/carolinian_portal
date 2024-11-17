import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', password: '', contact_number: '', classification: ''
  });
  const [documents, setDocuments] = useState({
    birth_certificate: null, grades: null
  });
  const [applicantNumber, setApplicantNumber] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setDocuments({
      ...documents,
      [e.target.name]: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.keys(formData).forEach(key => data.append(key, formData[key]));

    data.append('birth_certificate', documents.birth_certificate);
    if (formData.classification !== 'returnee') {
      data.append('grades', documents.grades);
    }

    try {
      const response = await axios.post('http://localhost:5000/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setApplicantNumber(response.data.applicant_number);
      setErrorMessage('');

      const userConfirmed = window.confirm(`Registration successful! Your Applicant Number is: ${response.data.applicant_number}. Click OK to proceed to the student dashboard.`);
      if (userConfirmed) {
        navigate('/Dashboard');
      }
    } catch (error) {
      console.error('Registration failed', error);

      if (error.response && error.response.status === 400 && error.response.data.error === 'Email already in use') {
        setErrorMessage('The email you entered is already in use. Please use a different email.');
      } else {
        setErrorMessage(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="centered-container">
      <div className="form-container">
        <h2>Register</h2>

        {applicantNumber ? (
          <p>Your registration is successful! Your Applicant Number is: {applicantNumber}</p>
        ) : (
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <input 
              type="text" 
              name="first_name" 
              value={formData.first_name} 
              onChange={handleChange} 
              placeholder="First Name" 
              required 
            />
            <input 
              type="text" 
              name="last_name" 
              value={formData.last_name} 
              onChange={handleChange} 
              placeholder="Last Name" 
              required 
            />
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="Email" 
              required 
            />
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="Password" 
              required 
            />
            <input 
              type="text" 
              name="contact_number" 
              value={formData.contact_number} 
              onChange={handleChange} 
              placeholder="Contact Number" 
              required 
            />
            
            <select 
              name="classification" 
              value={formData.classification} 
              onChange={handleChange} 
              required
            >
              <option value="">Select Classification</option>
              <option value="freshmen">Freshmen</option>
              <option value="returnee">Returnee</option>
              <option value="transferee">Transferee</option>
            </select>

            <input 
              type="file" 
              name="birth_certificate" 
              onChange={handleFileChange} 
              required 
            />
            
            {formData.classification !== 'returnee' && (
              <input 
                type="file" 
                name="grades" 
                onChange={handleFileChange} 
                required 
              />
            )}
            
            <button type="submit">Register</button>
          </form>
        )}

        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>
    </div>
  );
}

export default Register;

