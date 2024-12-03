const express = require('express');
const app = express();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// const normalizedPath = path.normalize(doc.document_path).replace(/\\/g, '/');

app.use(cors());

dotenv.config();

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// //ANG PAGHIMO SA ADMIN
// const adminPassword = 'adminPass';
// bcrypt.hash(adminPassword, 10, (err, hashedPassword) => {
//   if (err) {
//     console.error('Error hashing password:', err);
//   } else {
//     console.log('Hashed Password:', hashedPassword);
//   }
// });

app.get('/admin/verify', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Authenticate token error' });
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Must be admin ka' });
    }
    res.status(200).json({ role: 'admin' });
  });
});


const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
  
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }
        req.user = user;
        next();
      });
    } else {
      res.sendStatus(401);
    }
};

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'carolinian_portal1'
});

db.connect(err => {
  if (err) throw err;
  console.log('SQL is here');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.post('/register', (req, res) => {
  const { first_name, last_name, email, password, contact_number, classification } = req.body;
  const applicant_number = 'APP' + Date.now();
  const role = 'student';

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Password hashing failed:', err);
      return res.status(500).json({ error: 'Password hashing failed' });
    }

    const sql = `
      INSERT INTO students (first_name, last_name, email, password, contact_number, classification, applicant_number, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [first_name, last_name, email, hashedPassword, contact_number, classification, applicant_number, role, 'PARTIAL'],
      (err, result) => {
        if (err) {
          console.error('Database insertion failed:', err);
          return res.status(500).json({ error: 'Database insertion failed', details: err.message });
        }

        console.log('Student inserted into database:', result);

        const student_id = result.insertId;

        const docSql = `
          INSERT INTO documents (student_id)
          VALUES (?)
        `;
        db.query(docSql, [student_id], (err, docResult) => {
          if (err) {
            console.error('Document insertion failed:', err);
            return res.status(500).json({ error: 'Document insertion failed', details: err.message });
          }

          console.log('Documents row created for student:', docResult);

          res.status(200).json({
            success: true,
            message: 'Registration successful',
            applicant_number: applicant_number,
          });
        });
      }
    );
  });
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM students WHERE email = ?";
  db.query(sql, [email], (err, results) => {
      if (err) return res.status(500).json({ error: 'Database query failed' });
      if (results.length === 0) return res.status(404).json({ error: 'User not found' });

      const user = results[0];

      bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) return res.status(500).json({ error: 'Password comparison failed' });
          if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });

          if (!process.env.JWT_SECRET) {
              console.error('JWT_SECRET is not defined');
              return res.status(500).json({ error: 'JWT secret is missing' });
          }

          const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

          res.status(200).json({ 
              success: true, 
              message: 'Login successful', 
              token, 
              role: user.role 
          });
      });
  });
});

app.get('/student/courses', authenticateJWT, (req, res) => {
  const sql = "SELECT id, course_name, requirements FROM courses";
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(result);
  });
});

app.post('/student/select-course', authenticateJWT, (req, res) => {
  const { courseId } = req.body;
  const studentId = req.user.id;

  const sql = "UPDATE students SET course_id = ? WHERE id = ?";
  db.query(sql, [courseId, studentId], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Failed to select course' });
    }
    res.json({ message: 'Course selected successfully' });
  });
});

app.post('/student/upload-documents', authenticateJWT, upload.fields([
  { name: 'birthCertificate', maxCount: 1 },
  { name: 'grades', maxCount: 1 },
]), (req, res) => {
  console.log('Files received:', req.files);
  
  if (!req.files['birthCertificate'] || !req.files['grades']) {
    return res.status(400).json({ error: 'Both documents are required' });
  }

  const studentId = req.user.id;
  const birthCertificate = req.files['birthCertificate'][0].filename;
  const grades = req.files['grades'][0].filename;

  const updateDocumentsSql = `
    UPDATE documents 
    SET birth_certificate = ?, grades = ? 
    WHERE student_id = ?
  `;

  db.query(updateDocumentsSql, [birthCertificate, grades, studentId], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Failed to upload documents' });
    }

    console.log('Documents updated successfully for student:', studentId);

    const updateStudentStatusSql = `
      UPDATE students 
      SET status = 'PENDING' 
      WHERE id = ?
    `;

    db.query(updateStudentStatusSql, [studentId], (err, statusResult) => {
      if (err) {
        console.error('Failed to update student status:', err);
        return res.status(500).json({ error: 'Failed to update student status' });
      }

      console.log('Student status updated to PENDING for student:', studentId);

      res.json({ message: 'Documents uploaded and status updated successfully' });
    });
  });
});


app.post('/admin/approve/:studentId', authenticateJWT, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

  const studentId = req.params.studentId;
  db.query('UPDATE students SET status = "Approved" WHERE id = ?', [studentId], (err, result) => {
      if (err) {
          console.error('Approval failed:', err);
          return res.status(500).json({ error: 'Approval failed' });
      }
      console.log(`Student ${studentId} approved`);
      res.status(200).json({ success: true, message: 'Student approved' });
  });
});

app.post('/admin/deny/:studentId', authenticateJWT, (req, res) => {
  if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
  }

  const studentId = req.params.studentId;
  db.query('UPDATE students SET status = "Denied" WHERE id = ?', [studentId], (err, result) => {
      if (err) {
          console.error('Denying student failed:', err);
          return res.status(500).json({ error: 'Failed to deny student' });
      }
      console.log(`Student ${studentId} denied`);
      res.json({ message: 'Student denied' });
  });
});



app.get('/admin/applicants', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

  try {
      const applicants = await getApplicantsFromDatabase();
      res.status(200).json({ 
          success: true, 
          data: applicants 
      });
  } catch (error) {
    //debug ni
      res.status(500).json({ error: 'fetch applicants error' });
  }
});

const getStudentsFromDatabase = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT id, first_name, last_name, status, exam_date, exam_location FROM students WHERE role = 'student'";
    db.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};


app.get('/admin/students', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

  try {
      const students = await getStudentsFromDatabase();
      res.status(200).json({ 
          success: true, 
          data: students 
      });
  } catch (error) {
      res.status(500).json({ error: 'students' });
  }
});


const getStudentById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM students WHERE id = ?";
    db.query(sql, [id], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results[0]);
    });
  });
};

app.put('/admin/update-status/:id', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

  console.log('Request Body:', req.body);

  const { status, examLocation, examDate } = req.body;
  const studentId = req.params.id;

  const validStatuses = ['PARTIAL', 'PENDING', 'APPROVED', 'DENIED', 'RECEIPT', 'SETEXAM', 'EXAM', 'RECEIPT APPROVAL', 'PASS', 'ADVISE'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid or missing status value' });
  }

  try {
    const studentCheck = await getStudentById(studentId);
    if (!studentCheck) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const updatedStatus =
      validStatuses.includes(status)
        ? (status === 'SETEXAM' && examLocation ? 'RECEIPT' : status)
        : 'PENDING';

    const updatedExamDate = examDate || studentCheck.exam_date;

    const sql = `
      UPDATE students 
      SET status = ?, exam_location = ?, exam_date = ? 
      WHERE id = ? AND role = 'student'
    `;

    db.query(sql, [updatedStatus, examLocation, updatedExamDate, studentId], (err, result) => {
      if (err) {
        console.error('SQL Error:', err.message);
        return res.status(500).json({ error: 'Database query failed', details: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Student does not exist' });
      }

      console.log(`Student ${studentId} status updated to ${updatedStatus}`);
      return res.status(200).json({
        success: true,
        message: `Student status updated to '${updatedStatus}' successfully`,
      });
    });
  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).json({ error: 'Failed to update student status', details: error.message });
  }
});



app.put('/admin/update-payment-status/:studentId', authenticateJWT, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

  const { paymentStatus } = req.body;
  const studentId = req.params.studentId;

  const sql = "UPDATE students SET payment_status = ? WHERE id = ?";
  db.query(sql, [paymentStatus, studentId], (err, result) => {
    if (err) {
      console.error('Failed to update payment status:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    res.status(200).json({ message: 'Payment status updated successfully' });
  });
});

app.post('/student/set-exam-date', authenticateJWT, (req, res) => {
  const { examDate } = req.body;
  const studentId = req.user.id;

  const sql = "UPDATE students SET exam_date = ? WHERE id = ?";
  db.query(sql, [examDate, studentId], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    res.json({ message: 'Exam date set successfully' });
  });
});

app.get('/student-status', authenticateJWT, (req, res) => {
  const sql = "SELECT status FROM students WHERE id = ?";
  db.query(sql, [req.user.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ status: result[0].status });
  });
});

app.delete('/admin/delete-student/:id', authenticateJWT, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

  const studentId = req.params.id;

  const sql = "DELETE FROM students WHERE id = ? AND role = 'student'";
  db.query(sql, [studentId], (err, result) => {
    if (err) {
      console.error('Failed to delete student:', err);
      return res.status(500).json({ error: 'Failed to delete student' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    console.log(`Student ${studentId} deleted`);
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  });
});

async function fetchCourses() {
  try {
    const [rows] = await db.query('SELECT id, course_name, requirements FROM courses');
    return rows;
  } catch (err) {
    console.error('Database query failed:', err);
    throw err;
  }
}

app.get('/courses', (req, res) => {
  const sql = 'SELECT id, name, requirements FROM courses';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Failed to fetch courses:', err);
      return res.status(500).json({ error: 'Failed to fetch courses', details: err.message });
    }
    res.status(200).json(results);
  });
});

// app.post('/student/upload-receipt', authenticateJWT, upload.single('receipt'), (req, res) => {
//   console.log('Received file:', req.file);
//   if (req.user.role !== 'student') {
//     return res.status(403).json({ error: 'Access denied' });
//   }

//   const studentId = req.user.id;
//   const receiptPath = req.file.path.replace(/\\/g, '/');

//   const updateReceiptSql = "UPDATE documents SET payment_receipt = ?, receipt_status = 'Pending' WHERE student_id = ?";
//   const updateStatusSql = "UPDATE students SET status = 'RECEIPT APPROVAL' WHERE id = ?";

//   db.query(updateReceiptSql, [receiptPath, studentId], (err, result) => {
//     if (err) {
//       console.error('Failed to upload receipt:', err);
//       return res.status(500).json({ error: 'Failed to upload receipt' });
//     }

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'No documents found for this student' });
//     }

//     db.query(updateStatusSql, [studentId], (err, result) => {
//       if (err) {
//         console.error('Failed to update student status:', err);
//         return res.status(500).json({ error: 'Failed to update student status' });
//       }

//       res.status(200).json({ success: true, message: 'Receipt uploaded and status updated to receipt approval' });
//     });
//   });
// });

app.post('/student/upload-receipt', authenticateJWT, upload.single('receipt'), (req, res) => {
  console.log('Received file:', req.file);
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const studentId = req.user.id;

  const receiptFileName = path.basename(req.file.path);

  const updateReceiptSql = "UPDATE documents SET payment_receipt = ?, receipt_status = 'Pending' WHERE student_id = ?";
  const updateStatusSql = "UPDATE students SET status = 'RECEIPT APPROVAL' WHERE id = ?";

  db.query(updateReceiptSql, [receiptFileName, studentId], (err, result) => {
    if (err) {
      console.error('Failed to upload receipt:', err);
      return res.status(500).json({ error: 'Failed to upload receipt' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No documents found for this student' });
    }

    db.query(updateStatusSql, [studentId], (err, result) => {
      if (err) {
        console.error('Failed to update student status:', err);
        return res.status(500).json({ error: 'Failed to update student status' });
      }

      res.status(200).json({ success: true, message: 'Receipt uploaded and status updated to receipt approval' });
    });
  });
});


app.post('/admin/approve-payment/:studentId', authenticateJWT, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const studentId = req.params.studentId;

  const sqlUpdateReceipt = `
    UPDATE documents 
    SET receipt_status = 'Approved' 
    WHERE student_id = ? AND receipt_status = 'Pending'
  `;
  
  const sqlUpdateStudentStatus = `
    UPDATE students 
    SET status = 'SETEXAM' 
    WHERE id = ?
  `;

  db.beginTransaction((err) => {
    if (err) {
      console.error('Failed to begin transaction:', err);
      return res.status(500).json({ error: 'Failed to start transaction' });
    }

    db.query(sqlUpdateReceipt, [studentId], (err, result) => {
      if (err) {
        db.rollback(() => {
          console.error('Error updating receipt status:', err);
          return res.status(500).json({ error: 'Failed to approve payment' });
        });
      }

      if (result.affectedRows === 0) {
        db.rollback(() => {
          return res.status(404).json({ error: 'No pending payment found for this student' });
        });
      }

      db.query(sqlUpdateStudentStatus, [studentId], (err, result) => {
        if (err) {
          db.rollback(() => {
            console.error('Error updating student status:', err);
            return res.status(500).json({ error: 'Failed to update student status' });
          });
        }

        db.commit((err) => {
          if (err) {
            db.rollback(() => {
              console.error('Failed to commit transaction:', err);
              return res.status(500).json({ error: 'Failed to commit changes' });
            });
          }
          res.status(200).json({ success: true, message: 'Payment approved and student status updated to EXAM' });
        });
      });
    });
  });
});

app.get('/admin/status-options', authenticateJWT, (req, res) => {
  const query = "SHOW COLUMNS FROM students LIKE 'status'";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error' });
    }

    const enumValues = result[0].Type.match(/enum\((.*)\)/)[1].replace(/'/g, "").split(",");
    res.json({ statusOptions: enumValues });
  });
});

app.post('/admin/deny-payment/:studentId', authenticateJWT, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const studentId = req.params.studentId;

  const sql = "UPDATE documents SET receipt_status = 'Denied' WHERE student_id = ? AND receipt_status = 'Waiting for Payment'";
  db.query(sql, [studentId], (err, result) => {
    if (err) {
      console.error('Failed to deny payment:', err);
      return res.status(500).json({ error: 'Failed to deny payment' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No pending payment found for this student' });
    }

    res.status(200).json({ success: true, message: 'Payment denied successfully' });
  });
});

app.use('/uploads', express.static('uploads'));


app.get('/admin/student-documents/:id', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

  const studentId = req.params.id;

  try {
    const sql = `
      SELECT birth_certificate, grades, payment_receipt, receipt_status 
      FROM documents 
      WHERE student_id = ?;
    `;
    db.query(sql, [studentId], (err, results) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Database query failed' });
      }

      if (!results.length) {
        return res.status(404).json({ error: 'No documents found for this student' });
      }

      const documents = results[0];

      if (!documents.birth_certificate) {
        console.warn('Missing path for birth certificate');
      }
      if (!documents.grades) {
        console.warn('Missing path for grades');
      }
      if (!documents.payment_receipt) {
        console.warn('Missing path for payment receipt');
      }

      res.status(200).json({
        documents: {
          birthCertificate: documents.birth_certificate,
          grades: documents.grades,
          paymentReceipt: {
            path: documents.payment_receipt,
            status: documents.receipt_status,
          },
        },
      });
    });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ error: 'Failed to fetch student documents', details: error.message });
  }
});


app.listen(5000, () => {
  console.log('Server running on port 5000');
});
