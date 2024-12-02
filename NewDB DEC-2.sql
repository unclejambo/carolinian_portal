-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 02, 2024 at 08:53 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `carolinian_portal1`
--

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `requirements` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `name`, `requirements`) VALUES
(1, 'BS-IT', 'Requirement details'),
(2, 'BS-CS', 'Requirement details'),
(3, 'BS-IS', 'Requirement details'),
(4, 'Psyche', 'Requirement details'),
(5, 'BS-ME', 'Requirement details'),
(6, 'BS-IE', 'Requirement details'),
(7, 'BS-CE', 'Requirement details'),
(8, 'Nursing', 'Requirement details');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `birth_certificate` varchar(255) DEFAULT NULL,
  `grades` varchar(255) DEFAULT NULL,
  `payment_receipt` varchar(255) DEFAULT NULL,
  `receipt_status` enum('Pending','Approved','Rejected') DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `student_id`, `birth_certificate`, `grades`, `payment_receipt`, `receipt_status`) VALUES
(17, 33, '1733070788806-newhero.jpg', '1733070788808-newhero.jpg', 'uploads\\1733070833492-newhero.jpg', 'Approved'),
(18, 34, '1733125839840-newhero.jpg', '1733125839842-newhero.jpg', 'uploads\\1733125863480-newhero.jpg', 'Approved');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `contact_number` varchar(15) DEFAULT NULL,
  `classification` enum('returnee','freshman','transferee') NOT NULL,
  `applicant_number` varchar(50) NOT NULL,
  `role` enum('admin','student') NOT NULL,
  `status` enum('PENDING','PARTIAL','APPROVED','DENIED','RECEIPT','RECEIPT APPROVAL','EXAM','SETEXAM','PASS','ADVISE') NOT NULL,
  `exam_date` date DEFAULT NULL,
  `exam_location` varchar(255) DEFAULT NULL,
  `payment_status` enum('pending','paid') NOT NULL,
  `course_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `first_name`, `last_name`, `email`, `password`, `contact_number`, `classification`, `applicant_number`, `role`, `status`, `exam_date`, `exam_location`, `payment_status`, `course_id`) VALUES
(1, 'Admin', 'User', 'admin@email.com', '$2b$10$CW5DAMycGuKaWFi7O.Qj5eG6eBig/4c7bS0Q9pOsIzRF6LgKVBzXy', '1234567890', '', 'APP_ADMIN', 'admin', 'PENDING', NULL, NULL, 'pending', NULL),
(33, 'Renz', 'Diaz', 'renzD@email.com', '$2b$10$eY4DKKQbgIO9kUSNeEA/au2hxeKXrLD9wLBZ0GL/TIzg7dHSvzmre', '09271231234', '', 'APP1733070766243', 'student', 'ADVISE', '2024-12-31', 'Exam Location 2', 'pending', 2),
(34, 'test', 'Subject', 'test@email.com', '$2b$10$OUkSAwc.GQTUB6MMyB7PtuHlDkc7OoWmi7C.NrA9Q1FMFJvR8V.rq', '123456789', '', 'APP1733125826199', 'student', 'PASS', '2024-12-19', 'Exam Location 2', 'pending', 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `course_id` (`course_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
