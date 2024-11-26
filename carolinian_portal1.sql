-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 26, 2024 at 10:24 PM
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
(9, 10, 'uploads\\1732655403119-newhero.jpg', 'uploads\\1732655403120-newhero.jpg', 'uploads\\1732655442351-newhero.jpg', 'Pending'),
(11, 12, 'uploads\\1732656186665-newhero.jpg', 'uploads\\1732656186666-newhero.jpg', 'uploads\\1732656235865-newhero.jpg', 'Pending');

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
  `status` enum('PENDING','APPROVED','DENIED','RECEIPT','EXAM') NOT NULL,
  `exam_date` date DEFAULT NULL,
  `exam_location` varchar(255) DEFAULT NULL,
  `payment_status` enum('pending','paid') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `first_name`, `last_name`, `email`, `password`, `contact_number`, `classification`, `applicant_number`, `role`, `status`, `exam_date`, `exam_location`, `payment_status`) VALUES
(1, 'Admin', 'User', 'admin@email.com', '$2b$10$CW5DAMycGuKaWFi7O.Qj5eG6eBig/4c7bS0Q9pOsIzRF6LgKVBzXy', '1234567890', '', 'APP_ADMIN', 'admin', 'PENDING', NULL, NULL, 'pending'),
(10, 'Renz', 'Diaz', 'renzD@email.com', '$2b$10$GTnMtEGdNqItgRkpMZ1AjOe6Ru1ZQoFjLV/uPTBT02GA9ijH/W2jW', '09271234567', '', 'APP1732655403123', 'student', 'RECEIPT', '2024-11-30', 'Exam Location 2', 'pending'),
(12, 'jaja', 'boy', 'jaja@email.com', '$2b$10$Fy8cjwT1xDJy2U7afS9EQ.C6I6Io2iyLYnmN0IIDI.fXy73jAs.i2', '09271234567', '', 'APP1732656186667', 'student', '', '2024-11-30', 'Exam Location 2', 'pending');

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
  ADD UNIQUE KEY `email` (`email`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
