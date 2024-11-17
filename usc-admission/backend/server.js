const express = require('express');
const app = express();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const dotenv = require('dotenv');
const cors = require('cors');

app.use(cors());

dotenv.config();

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

//ANG PAGHIMO SA ADMIN
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
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' });
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
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
  database: 'carolinian_portal'
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

app.post('/register', upload.fields([{ name: 'birth_certificate' }, { name: 'grades' }]), (req, res) => {
  const { first_name, last_name, email, password, contact_number, classification } = req.body;
  const applicant_number = 'APP' + Date.now();
  const role = 'student';

  console.log('Received registration request:', req.body);

  if (!req.files['birth_certificate']) {
    console.error('No birth certificate uploaded');
    return res.status(400).json({ error: 'Birth certificate is required' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Password hashing failed:', err);
      return res.status(500).json({ error: 'Password hashing failed' });
    }

    console.log('Password successfully hashed.');

    const sql = "INSERT INTO students (first_name, last_name, email, password, contact_number, classification, applicant_number, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [first_name, last_name, email, hashedPassword, contact_number, classification, applicant_number, role], (err, result) => {
      if (err) {
        console.error('Database insertion failed:', err);
        return res.status(500).json({ error: 'Database insertion failed', details: err.message });
      }

      console.log('Student inserted into database:', result);

      const student_id = result.insertId;
      const birth_certificate = req.files['birth_certificate'][0]?.path;
      let grades = null;

      if (classification !== 'returnee' && req.files['grades']) {
        grades = req.files['grades'][0]?.path;
      }

      const docSql = "INSERT INTO documents (student_id, birth_certificate, grades) VALUES (?, ?, ?)";
      db.query(docSql, [student_id, birth_certificate, grades], (err, result) => {
        if (err) {
          console.error('Document insertion failed:', err);
          return res.status(500).json({ error: 'Document insertion failed', details: err.message });
        }

        console.log('Documents inserted into database:', result);

        res.status(200).json({
          success: true,
          message: 'Registration successful',
          applicant_number: applicant_number
        });
      });
    });
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
      res.status(500).json({ error: 'Failed to fetch applicants' });
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
      res.status(500).json({ error: 'Failed to fetch students' });
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

  const { status, examLocation, examDate } = req.body;
  const studentId = req.params.id;

  try {
    const studentCheck = await getStudentById(studentId);
    if (!studentCheck) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const updatedExamDate = examDate || studentCheck.exam_date;

    const sql = `
      UPDATE students 
      SET status = ?, exam_location = ?, exam_date = ? 
      WHERE id = ? AND role = 'student'
    `;
    
    db.query(sql, [status, examLocation, updatedExamDate, studentId], async (err, result) => {
      if (err) {
        console.error('SQL Error:', err.message);
        return res.status(500).json({ error: 'Database query failed', details: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'No student found to update' });
      }

      if (status === 'Approved') {
        const updatePaymentStatusSql = `UPDATE students SET status = 'Waiting for Payment' WHERE id = ?`;
        db.query(updatePaymentStatusSql, [studentId], (err, result) => {
          if (err) {
            console.error('Failed to update payment status:', err.message);
            return res.status(500).json({ error: 'Failed to update payment status', details: err.message });
          }

          console.log(`Student ${studentId} status updated to 'Waiting for Payment'`);
          return res.status(200).json({ 
            success: true, 
            message: 'Student status, exam location, and payment status updated successfully' 
          });
        });
      } else {
        console.log(`Student ${studentId} status updated`);
        res.status(200).json({ 
          success: true, 
          message: 'Student status and exam location updated successfully' 
        });
      }
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

app.put('/admin/update-status/:studentId', authenticateJWT, (req, res) => {
  const { status, examLocation } = req.body;
  const studentId = req.params.studentId;

  const sql = "UPDATE students SET status = ?, exam_location = ? WHERE id = ?";
  db.query(sql, [status, examLocation, studentId], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    res.json({ message: 'Status and exam location updated successfully' });
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




app.listen(5000, () => {
  console.log('Server running on port 5000');
});
