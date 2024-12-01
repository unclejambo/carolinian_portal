import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [examLocation, setExamLocation] = useState('');
  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/admin/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data.data || []);
      console.log("Updated students list:", res.data.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      if (error.response?.status === 401) navigate('/');
    }
  };

  const handleApprove = async (studentId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`http://localhost:5000/admin/approve/${studentId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchStudents();
    } catch (error) {
      console.error('Approval failed', error);
    }
  };

  const handleDeny = async (studentId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`http://localhost:5000/admin/deny/${studentId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchStudents();
    } catch (error) {
      console.error('Deny failed', error);
    }
  };

  const handleApprovePayment = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/admin/approve-payment/${studentId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log(res.data);
      await fetchStudents();
    } catch (error) {
      console.error('Error approving payment:', error);
    }
  };
  
  const handleDenyPayment = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/admin/deny-payment/${studentId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log(res.data);
      await fetchStudents();
    } catch (error) {
      console.error('Error denying payment:', error);
    }
  };
  
  const fetchStatusOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/admin/status-options', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatusOptions(res.data.statusOptions);
    } catch (error) {
      console.error('Failed to fetch status options:', error);
    }
  };

  const handleEditStatus = (student) => {
    setSelectedStudent(student);
    setNewStatus(student.status);
    setExamLocation(student.exam_location || '');
    setShowEditModal(true);
  };

  // const handleSaveStatus = async () => {
  //   if (!selectedStudent) return;
  
  //   const updatedStatus = examLocation ? 'RECEIPT' : newStatus;
    
  //   try {
  //     const token = localStorage.getItem('token');
  //     await axios.put(
  //       `http://localhost:5000/admin/update-status/${selectedStudent.id}`,
  //       { status: updatedStatus, examLocation },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     setShowEditModal(false);
  //     await fetchStudents();
  //   } catch (error) {
  //     console.error('Failed to update status:', error);
  //   }
  // };

  const handleSaveStatus = async () => {
    if (!selectedStudent) return;
  
    const updatedStatus = 
      newStatus === 'SETEXAM' && examLocation
        ? 'RECEIPT'
        : newStatus;
  
      console.log('Sent:', { status: updatedStatus, examLocation });

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/admin/update-status/${selectedStudent.id}`,
        { status: updatedStatus, examLocation },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditModal(false);
      await fetchStudents();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };
  
  
  const handleRemoveStudent = async () => {
    if (!selectedStudent) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/admin/delete-student/${selectedStudent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowEditModal(false);
      await fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  useEffect(() => {
    const verifyAdminRole = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/');
      try {
        const res = await axios.get('http://localhost:5000/admin/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.role !== 'admin') throw new Error('Not authorized');
      } catch (error) {
        setVerificationFailed(true);
        navigate('/');
      }
    };

    verifyAdminRole();
    fetchStudents();
    fetchStatusOptions();
  }, [navigate]);

  if (verificationFailed) {
    return <div>Unauthorized access. Redirecting to login...</div>;
  }

  return (
    <div className="dashboard-container">
  <div className="dashboard-content">
    <h1 style={{ color: 'black' }}>Admin Dashboard</h1>
    <button onClick={handleLogout}>Logout</button>
    <table>
      <thead>
        <tr>
          <th>Student ID</th>
          <th>Name</th>
          <th>Status</th>
          <th>Exam Date</th>
          <th>Exam Location</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student.id}>
            <td>{student.id}</td>
            <td>{student.first_name} {student.last_name}</td>
            <td>{student.status}</td>
            <td>{student.exam_date || 'Not Set'}</td>
            <td>{student.exam_location || 'Not Set'}</td>
            <td>
              {student.status === 'RECEIPT APPROVAL' ? (
                <>
                  <button onClick={() => handleApprovePayment(student.id)}>Approve Receipt</button>
                  <button onClick={() => handleDenyPayment(student.id)}>Deny Receipt</button>
                </>
              ) : null}

              {student.status === 'PENDING' ? (
                <>
                  <button onClick={() => handleApprove(student.id)}>Approve Admission</button>
                  <button onClick={() => handleDeny(student.id)}>Deny Admission</button>
                </>
              ) : null}

              {student.status !== 'pending' && student.status !== 'Waiting for Payment' ? (
                <button onClick={() => handleEditStatus(student)}>Edit Status</button>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>    
      {showEditModal && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Status for {selectedStudent.first_name} {selectedStudent.last_name}</h2>
            Status:
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {statusOptions.map((status, index) => (
                  <option key={index} value={status}>{status}</option>
                ))}
              </select>
            <label>
              Exam Location:
              <select
                value={examLocation}
                onChange={(e) => setExamLocation(e.target.value)}
              >
                <option value="">Select Location</option>
                <option value="Exam Location 1">Exam Location 1</option>
                <option value="Exam Location 2">Exam Location 2</option>
                <option value="Exam Location 3">Exam Location 3</option>
              </select>
            </label>
            <button onClick={handleSaveStatus}>Save</button>
            <button onClick={() => setShowEditModal(false)}>Cancel</button>
            <button onClick={handleRemoveStudent} style={{ color: 'red' }}>Remove Student</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;


