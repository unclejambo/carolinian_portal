// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// function Dashboard() {
//   const [status, setStatus] = useState('');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [examDate, setExamDate] = useState('');
//   const [examLocation, setExamLocation] = useState('');
//   const [paymentStatus, setPaymentStatus] = useState('');
//   const [availableDates, setAvailableDates] = useState([]);
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

//     const generateAvailableDates = () => {
//       const today = new Date();
//       const oneYearAhead = new Date();
//       oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1);

//       const dates = [];
//       for (
//         let current = new Date(today);
//         current <= oneYearAhead;
//         current.setDate(current.getDate() + 1)
//       ) {
//         dates.push(new Date(current).toISOString().split('T')[0]);
//       }

//       setAvailableDates(dates);
//     };

//     checkAuthentication();
//     generateAvailableDates();
//   }, [token, navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     setStatus('');
//     setIsAuthenticated(false);
//     navigate('/');
//   };

//   const handleSetExamDate = async () => {
//     if (!examDate) {
//       alert('Please select a valid exam date.');
//       return;
//     }

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

//   const isDateAvailable = (date) => availableDates.includes(date);

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
//             onChange={(e) => {
//               const selectedDate = e.target.value;
//               if (isDateAvailable(selectedDate)) {
//                 setExamDate(selectedDate);
//               } else {
//                 alert('The selected date is not available. Please choose another date.');
//                 e.target.value = '';
//               }
//             }}
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
  const [availableDates, setAvailableDates] = useState([]);
  const [receipt, setReceipt] = useState(null);
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
          headers: { Authorization: `Bearer ${token}` },
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

    const generateAvailableDates = () => {
      const today = new Date();
      const oneYearAhead = new Date();
      oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1);

      const dates = [];
      for (
        let current = new Date(today);
        current <= oneYearAhead;
        current.setDate(current.getDate() + 1)
      ) {
        dates.push(new Date(current).toISOString().split('T')[0]);
      }

      setAvailableDates(dates);
    };

    checkAuthentication();
    generateAvailableDates();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setStatus('');
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleSetExamDate = async () => {
    if (!examDate) {
      alert('Please select a valid exam date.');
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:5000/student/set-exam-date',
        { examDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Exam date set:', res.data);
      alert('Exam date set successfully.');
      setStatus('Waiting for approval of exam date');
    } catch (error) {
      console.error('Error setting exam date:', error);
      alert('Failed to set exam date.');
    }
  };

  const handleUploadReceipt = async () => {
    if (!receipt) {
      alert('Please upload a receipt.');
      return;
    }

    const formData = new FormData();
    formData.append('receipt', receipt);

    try {
      const res = await axios.post('http://localhost:5000/student/upload-receipt', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Receipt uploaded successfully.');
      setPaymentStatus('waiting for admin approval');
    } catch (error) {
      console.error('Error uploading receipt:', error);
      alert('Failed to upload receipt. Please try again.');
    }
  };

  const isDateAvailable = (date) => availableDates.includes(date);

  let statusMessage;
  let statusStyle;

  if (status.toLowerCase() === 'approved' && paymentStatus.toLowerCase() !== 'paid') {
    statusMessage = 'You have been approved for admission. Please set your exam date.';
    statusStyle = { color: 'green' };
  } else if (status.toLowerCase() === 'waiting for approval of exam date') {
    statusMessage = 'Waiting for approval of exam date.';
    statusStyle = { color: 'orange' };
  } else if (status.toLowerCase() === 'waiting for receipt') {
    statusMessage = 'Please pay the amount of 3000 pesos.';
    statusStyle = { color: 'blue' };
  } else if (status.toLowerCase() === 'denied') {
    statusMessage = 'Your admission application has been denied.';
    statusStyle = { color: 'red' };
  } else if (status.toLowerCase() === 'payment approved') {
    statusMessage = 'Good Luck on your Exam!, You may come back after the exam to see the results.';
    statusStyle = { color: 'green' };
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
            onChange={(e) => {
              const selectedDate = e.target.value;
              if (isDateAvailable(selectedDate)) {
                setExamDate(selectedDate);
              } else {
                alert('The selected date is not available. Please choose another date.');
                e.target.value = '';
              }
            }}
          />
          <button onClick={handleSetExamDate}>Set Exam Date</button>
        </div>
      )}

      {status.toLowerCase() === 'waiting for receipt' && (
        <div>
          <p>Please pay the amount of 3000 pesos and upload your receipt.</p>
          <input type="file" accept="image/*" onChange={(e) => setReceipt(e.target.files[0])} />
          <button onClick={handleUploadReceipt}>Upload Receipt</button>
        </div>
      )}

      {examLocation && <p>Exam Location: {examLocation}</p>}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
