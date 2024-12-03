import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const [status, setStatus] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [examDate, setExamDate] = useState("");
  const [examLocation, setExamLocation] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/student-status", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { status: currentStatus, first_name, student_id } = res.data;

        setStatus(currentStatus || "pending");
        setStudentName(first_name);
        setStudentId(student_id);
        setIsAuthenticated(true);

        if (currentStatus.toLowerCase() === "partial") {
          navigate("/courseSelection");
        }

        if (res.data.exam_date) setExamDate(res.data.exam_date);
        if (res.data.exam_location) setExamLocation(res.data.exam_location);
        if (res.data.payment_status) setPaymentStatus(res.data.payment_status);
      } catch (error) {
        console.error("Error fetching status or token is invalid:", error);
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
        dates.push(new Date(current).toISOString().split("T")[0]);
      }

      setAvailableDates(dates);
    };

    checkAuthentication();
    generateAvailableDates();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setStatus("");
    setIsAuthenticated(false);
    navigate("/");
  };

  const handleSetExamDate = async () => {
    if (!examDate) {
      alert("Please select a valid exam date.");
      return;
    }

    if (!isDateAvailable(examDate)) {
      alert("Selected date is not available. Please choose a valid date.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/student/set-exam-date",
        { examDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Exam date set:", res.data);
      alert("Exam date set successfully.");
      setStatus("Waiting for approval of exam date");
    } catch (error) {
      console.error("Error setting exam date:", error);
      alert("Failed to set exam date.");
    }
  };

  const handleUploadReceipt = async () => {
    if (!receipt) {
      alert("Please upload a receipt.");
      return;
    }

    const formData = new FormData();
    formData.append("receipt", receipt);

    try {
      const res = await axios.post(
        "http://localhost:5000/student/upload-receipt",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        alert("Receipt uploaded and status updated to receipt approval.");
        setStatus("RECEIPT APPROVAL");
      }
    } catch (error) {
      console.error("Error uploading receipt:", error);
      alert("Failed to upload receipt. Please try again.");
    }
  };

  const isDateAvailable = (date) => availableDates.includes(date);

  let statusMessage = "";
  let statusStyle = {};

  if (status.toLowerCase() === "approved" && paymentStatus.toLowerCase() !== "paid") {
    statusMessage = "You have been approved for admission. Please upload your payment receipt.";
    statusStyle = { color: "green" };
  } else if (status.toLowerCase() === "waiting for approval of exam date") {
    statusMessage = "Waiting for approval of exam date.";
    statusStyle = { color: "orange" };
  } else if (status.toLowerCase() === "denied") {
    statusMessage = "Your admission application has been denied.";
    statusStyle = { color: "red" };
  } else if (status.toLowerCase() === "receipt") {
    statusMessage = "Exam set! Good Luck on your exam. Come back to see results";
    statusStyle = { color: "green" };
  } else if (status.toLowerCase() === "pending") {
    statusMessage = "Your admission status is still pending.";
    statusStyle = { color: "black" };
  } else if (status.toLowerCase() === "receipt approval") {
    statusMessage = "We are still verifying your receipt.";
    statusStyle = { color: "black" };
  } else if (status.toLowerCase() === "setexam") {
    statusMessage = "Please select a valid exam date";
    statusStyle = { color: "black" };
  } else if (status.toLowerCase() === "pass") {
    statusMessage =
      "Congratulations! You have passed. Check your email for your score and a scheduled interview from the department of your chosen course.";
    statusStyle = { color: "green" };
  } else if (status.toLowerCase() === "advise") {
    statusMessage =
      "Based on your results, you are advised to shift. You may contact or visit the Office of Recruitment and Admissions.";
    statusStyle = { color: "blue" };
  }

  const checklistItems = [
    {
      label: "PARTIAL REGISTRATION:",
      condition:
        ["partial", "approved", "receipt approval", "setexam", "receipt", "pass", "advise"].includes(
          status.toLowerCase()
        )
          ? "DONE"
          : "X",
    },
    {
      label: "COURSE & DOCUMENTS:",
      condition:
        ["approved", "receipt approval", "setexam", "receipt", "pass", "advise"].includes(
          status.toLowerCase()
        )
          ? "DONE"
          : "X",
    },
    {
      label: "PAYMENT:",
      condition:
        ["receipt approval"].includes(status.toLowerCase())
          ? "VALIDATING"
          : ["setexam", "receipt", "pass", "advise"].includes(status.toLowerCase())
          ? "DONE"
          : "X",
    },
    {
      label: "EXAM LOCATION & DATE:",
      condition:
        ["setexam"].includes(status.toLowerCase())
          ? "WAITING"
          : ["receipt", "pass", "advise"].includes(status.toLowerCase())
          ? "DONE"
          : "X",
    },
    {
      label: "EXAM RESULTS:",
      condition:
        ["receipt"].includes(status.toLowerCase())
          ? "TAKING"
          : ["pass"].includes(status.toLowerCase())
          ? "PASSED"
          : ["advise"].includes(status.toLowerCase())
          ? "ADVISE TO SHIFT"
          : "X",    
    },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 style={{ color: "black" }}>Carolinian Portal</h1>
        <div className="header-right" style={{ color: "black" }}>
          <p>
            {studentName} <br />
            Applicant ID: {studentId}
          </p>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      <div className="dashboard-body">
        <aside className="checklist">
          {checklistItems.map((item, index) => (
            <div
              key={index}
              className={`checklist-item ${item.condition === "DONE" || item.condition === "PASSED" ? "done" : "pending"}`}
            >
              <p>
                {item.label}{" "}
                <span
                  style={{
                    color:
                      item.condition === "DONE" || item.condition === "PASSED"
                        ? "green"
                        : item.condition === "VALIDATING" || item.condition === "ADVISE TO SHIFT"
                        ? "orange"
                        : "red",
                    fontWeight: "bold",
                  }}
                >
                  {item.condition}
                </span>
              </p>
            </div>
          ))}
        </aside>
        <main className="dashboard-content">
          <div className="status-box">
            <p style={statusStyle}>{statusMessage}</p>
          </div>
          {status.toLowerCase() === "approved" && paymentStatus.toLowerCase() !== "paid" && (
            <div>
              <p style={{ color: "black" }}>Please upload your payment receipt.</p>
              <input type="file" accept="image/*" onChange={(e) => setReceipt(e.target.files[0])} />
              <button onClick={handleUploadReceipt}>
                Upload Receipt
              </button>
            </div>
          )}
          {status.toLowerCase() === "setexam" && (
            <div>
              <label style={{ color: "black" }}>Set Exam Date:</label>
              <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
              <button style={{ color: "black" }} onClick={handleSetExamDate}>
                 Set Exam Date
              </button>
            </div>
          )}
          {examLocation && <p style={{ color: "black" }}>Exam Location: {examLocation}</p>}
        </main>
      </div>
    </div>
  );
  
}

export default Dashboard;
