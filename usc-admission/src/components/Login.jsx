import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/login', { email, password });
      const { token, role } = res.data;

      localStorage.setItem('token', token);

      if (role === 'admin') {
        navigate('/admindashboard');
      } else if (role === 'student') {
        navigate('/dashboard');
      } else {
        console.error('Unknown role');
      }
    } catch (error) {
      console.error('Login failed', error);

      if (error.response) {
        const { status } = error.response;
        if (status === 401) {
          alert('Invalid email or password. Please try again.');
        } else if (status === 404) {
          alert('Login endpoint not found. Please check the server.');
        } else {
          alert('An error occurred. Please try again later.');
        }
      } else {
        alert('Network error. Please check your connection.');
      }
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="centered-container">
      <div className="form-container">
        <h2>Carolinian Portal</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
        </form>
        <button onClick={handleRegister} style={{ marginTop: '10px' }}>
          Register
        </button>
      </div>
    </div>
  );
}

export default Login;
