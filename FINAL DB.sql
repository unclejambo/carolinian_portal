-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 03, 2024 at 10:48 PM
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
(1, 'BS-IT', 'TOR, Birth Certificate'),
(2, 'BS-CS', 'TOR, Birth Certificate'),
(3, 'BS-IS', 'TOR, Birth Certificate'),
(4, 'Psyche', 'TOR, Birth Certificate'),
(5, 'BS-ME', 'TOR, Birth Certificate'),
(6, 'BS-IE', 'TOR, Birth Certificate'),
(7, 'BS-CE', 'TOR, Birth Certificate'),
(8, 'Nursing', 'TOR, Birth Certificate');

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
(41, 58, '1733262083009-7954987.jpg', '1733262083015-Untitled.png', '1733262355308-newhero.jpg', 'Approved');

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
(58, 'Renz', 'Diaz', 'renzD@email.com', '$2b$10$ZJjmVB8jdHRknXF6MlE4peq6fkxxBrH.cRZj9pLhro077usjh.afe', '09271231234', '', '', 'student', 'ADVISE', '2024-12-28', 'USC-DC', 'pending', 1);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

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
