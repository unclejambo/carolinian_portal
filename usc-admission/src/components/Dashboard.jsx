// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// function Dashboard() {
//   const [status, setStatus] = useState('');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [examDate, setExamDate] = useState('');
//   const [examLocation, setExamLocation] = useState('');
//   const [paymentStatus, setPaymentStatus] = useState('');
//   const token = localStorage.getItem('token');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkAuthentication = async () => {
//       if (!token) {
//         navigate('/');
//         return;
//       }

//       try {
//         const res = await axios.get('http://localhost:5000/student-status', {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         setStatus(res.data.status || 'pending');
//         setIsAuthenticated(true);
        
//         if (res.data.exam_date) setExamDate(res.data.exam_date);
//         if (res.data.exam_location) setExamLocation(res.data.exam_location);
//         if (res.data.payment_status) setPaymentStatus(res.data.payment_status);

//       } catch (error) {
//         console.error('Error fetching status or token is invalid:', error);
//         handleLogout();
//       }
//     };

//     checkAuthentication();
//   }, [token, navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     setStatus('');
//     setIsAuthenticated(false);
//     navigate('/');
//   };

//   const handleSetExamDate = async () => {
//     try {
//       const res = await axios.post(
//         'http://localhost:5000/student/set-exam-date',
//         { examDate },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       console.log('Exam date set:', res.data);
//       alert('Exam date set successfully.');
//       setStatus('Waiting for approval of exam date');
//     } catch (error) {
//       console.error('Error setting exam date:', error);
//       alert('Failed to set exam date.');
//     }
//   };

//   let statusMessage;
//   let statusStyle;

//   if (status.toLowerCase() === 'approved' && paymentStatus.toLowerCase() !== 'paid') {
//     statusMessage = 'You have been approved for admission. Please set your exam date.';
//     statusStyle = { color: 'green' };
//   } else if (status.toLowerCase() === 'waiting for approval of exam date') {
//     statusMessage = 'Waiting for approval of exam date.';
//     statusStyle = { color: 'orange' };
//   } else if (status.toLowerCase() === 'waiting for payment') {
//     statusMessage = 'Please pay the amount of 3000 pesos.';
//     statusStyle = { color: 'blue' };
//   } else if (status.toLowerCase() === 'denied') {
//     statusMessage = 'Your admission application has been denied.';
//     statusStyle = { color: 'red' };
//   } else {
//     statusMessage = 'Your admission status is still pending.';
//     statusStyle = { color: 'yellow' };
//   }

//   return (
//     <div>
//       <h1>Student Dashboard</h1>
//       <p style={statusStyle}>{statusMessage}</p>
      
//       {status.toLowerCase() === 'approved' && paymentStatus.toLowerCase() !== 'paid' && (
//         <div>
//           <label>Set Exam Date:</label>
//           <input
//             type="date"
//             value={examDate}
//             onChange={(e) => setExamDate(e.target.value)}
//           />
//           <button onClick={handleSetExamDate}>Set Exam Date</button>
//         </div>
//       )}
      
//       {examLocation && <p>Exam Location: {examLocation}</p>}

//       <button onClick={handleLogout}>Logout</button>
//     </div>
//   );
// }

// export default Dashboard;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [status, setStatus] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [examDate, setExamDate] = useState('');
  const [examLocation, setExamLocation] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/student-status', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStatus(res.data.status || 'pending');
        setIsAuthenticated(true);

        if (res.data.exam_date) setExamDate(res.data.exam_date);
        if (res.data.exam_location) setExamLocation(res.data.exam_location);
        if (res.data.payment_status) setPaymentStatus(res.data.payment_status);
      } catch (error) {
        console.error('Error fetching status or token is invalid:', error);
        handleLogout();
      }
    };

    checkAuthentication();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setStatus('');
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleSetExamDate = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/student/set-exam-date',
        { examDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Exam date set:', res.data);
      alert('Exam date set successfully.');
      setStatus('Waiting for approval of exam date');
    } catch (error) {
      console.error('Error setting exam date:', error);
      alert('Failed to set exam date.');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const oneYearAhead = new Date();
  oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1);
  const maxDate = oneYearAhead.toISOString().split('T')[0];

  let statusMessage;
  let statusStyle;

  if (status.toLowerCase() === 'approved' && paymentStatus.toLowerCase() !== 'paid') {
    statusMessage = 'You have been approved for admission. Please set your exam date.';
    statusStyle = { color: 'green' };
  } else if (status.toLowerCase() === 'waiting for approval of exam date') {
    statusMessage = 'Waiting for approval of exam date.';
    statusStyle = { color: 'orange' };
  } else if (status.toLowerCase() === 'waiting for payment') {
    statusMessage = 'Please pay the amount of 3000 pesos.';
    statusStyle = { color: 'blue' };
  } else if (status.toLowerCase() === 'denied') {
    statusMessage = 'Your admission application has been denied.';
    statusStyle = { color: 'red' };
  } else {
    statusMessage = 'Your admission status is still pending.';
    statusStyle = { color: 'yellow' };
  }

  return (
    <div>
      <h1>Student Dashboard</h1>
      <p style={statusStyle}>{statusMessage}</p>

      {status.toLowerCase() === 'approved' && paymentStatus.toLowerCase() !== 'paid' && (
        <div>
          <label>Set Exam Date:</label>
          <input
            type="date"
            value={examDate}
            min={today}
            max={maxDate}
            onChange={(e) => setExamDate(e.target.value)}
          />
          <button onClick={handleSetExamDate}>Set Exam Date</button>
        </div>
      )}

      {examLocation && <p>Exam Location: {examLocation}</p>}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
