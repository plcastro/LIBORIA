-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: liboria
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `books` (
  `book_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `author_name` varchar(255) NOT NULL,
  `category` enum('Trending','Romance','Kids','Thriller','Textbooks') NOT NULL,
  `published_date` date NOT NULL,
  `total_copies` int NOT NULL DEFAULT '0',
  `available_copies` int NOT NULL DEFAULT '0',
  `description` text,
  `image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`book_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `books`
--

LOCK TABLES `books` WRITE;
/*!40000 ALTER TABLE `books` DISABLE KEYS */;
INSERT INTO `books` VALUES (1,'The Algorithm of Us','Lena Carter','Trending','2023-08-15',2,1,'A young coder must choose between human connection and a revolutionary AI she created.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(2,'Neon Horizons','Tariq Mendoza','Trending','2019-05-22',2,2,'In a hyper-connected city, a group of friends navigates fame, betrayal, and the cost of digital stardom.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(3,'Voices in the Cloud','Marianne Hsu','Trending','2022-11-03',2,2,'Anonymous messages expose secrets that could topple a powerful tech empire.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(4,'The Last Offline','Noah Calloway','Trending','2020-02-17',2,2,'In a world where internet connection is mandatory, one teenager decides to disappear.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(5,'Ink on Glass','Soraya Bell','Trending','2024-03-12',2,2,'Through a mix of poetry and prose, this novel explores the fragility of memory in a digital age.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(6,'Parallel Crowds','Ethan Markov','Trending','2021-07-29',2,2,'Two strangers’ lives become intertwined through mysterious glitches in a popular social network.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(7,'Midnight Letters','Clara Villeneuve','Romance','2020-12-01',2,2,'Two strangers fall in love through mysterious handwritten letters left in a café.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(8,'A Thousand Coffee Dates','Daniel Lee','Romance','2023-06-15',2,2,'A cynical novelist and a warm-hearted barista meet daily over coffee.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(9,'Chasing the Quiet','Elena Santos','Romance','2019-08-09',2,2,'Tired of city noise, a woman moves to the countryside to find peace.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(10,'Velvet Skies','Ibrahim Noor','Romance','2022-02-25',2,2,'Two pilots from rival airlines find romance thousands of feet above the clouds.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(11,'Almost Always Yours','Maya Renfield','Romance','2024-01-18',2,2,'A second-chance love story spanning a decade.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(12,'Hearts on Pause','Theo Kim','Romance','2018-09-14',2,2,'Two actors fall in love while pretending to be in love on set.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(13,'The Star Umbrella','Jessie Cole','Kids','2018-04-03',2,2,'When stars begin to fall like rain, a young girl embarks on a magical rescue mission.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(14,'Luna and the Pocket Planet','Mira Tan','Kids','2021-06-19',2,2,'Luna discovers a tiny world hidden inside her backpack.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(15,'Captain Crayon’s Big Adventure','Tommy Baker','Kids','2020-10-22',2,2,'When a boy’s drawings come to life, he must team up with his creations to save his town.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(16,'Milo’s Invisible Backpack','Catherine Park','Kids','2022-09-11',1,2,'Milo’s magical backpack gives him the courage to face his fears at school.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(17,'The Day the Toys Woke Up','Ravi Chandar','Kids','2023-02-05',2,2,'When the toy shop closes for the night, the toys come alive for a daring mission.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(18,'Penny and the Sky Train','Lauren Elliott','Kids','2019-12-27',2,2,'Penny boards a whimsical train that travels through the clouds.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(19,'Echoes in the Elevator','Samantha Doyle','Thriller','2024-04-14',2,2,'A group of strangers is trapped in an elevator as dark secrets unravel.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(20,'Thirteen Floors Down','Jasper Yi','Thriller','2018-07-09',2,2,'A detective uncovers a conspiracy beneath a luxury apartment complex.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(21,'The Silent Witness','Ingrid Falk','Thriller','2021-03-30',2,2,'A mute child holds the key to a shocking murder.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(22,'Dead Air Frequency','Colin Ramirez','Thriller','2020-11-16',2,2,'A late-night radio host receives calls from the future.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(23,'Ashes Under Glass','Henrietta Blake','Thriller','2019-01-07',2,2,'An antique mirror reveals more than reflections.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(24,'The Tenth Room','Leon Varga','Thriller','2022-05-28',2,2,'Nine guests check into a remote inn, but the tenth room is already occupied.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(25,'Foundations of Modern Logic','Dr. Emily Shore','Textbooks','2021-09-13',2,2,'An accessible yet rigorous introduction to the principles of logic.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(26,'Applied Nanotech: Concepts & Practice','Dr. Arun Malik','Textbooks','2020-06-05',2,2,'A comprehensive textbook exploring modern nanotechnology applications.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(27,'Global Economics in Transition','Prof. Maria Ortega','Textbooks','2018-02-19',2,2,'A detailed look at the shifting economic landscape of the 21st century.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(28,'Visual Coding: From Zero to Launch','Jake Munroe','Textbooks','2023-10-10',2,2,'A practical guide for beginners to build their first apps and websites.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(29,'Cultural Histories: A Comparative Approach','Dr. Hana Al-Sayed','Textbooks','2019-11-23',2,2,'A rich exploration of world cultures through parallel timelines.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(30,'Fundamentals of Green Architecture','Prof. Louise Tran','Textbooks','2024-05-02',2,2,'An essential introduction to sustainable design principles.','https://via.placeholder.com/150x200?text=No+Cover','2025-10-08 12:30:21'),(32,'Harry potter','asdf','Romance','2025-10-06',1,1,NULL,'https://brightspotcdn.byu.edu/dims4/default/841f0c6/2147483647/strip/true/crop/500x762+0+0/resize/500x762!/quality/90/?url=https%3A%2F%2Fbrigham-young-brightspot-us-east-2.s3.us-east-2.amazonaws.com%2F41%2F71%2Fd7d439b4fbd9ccee241416bf8d5c%2Fsorcerors-stone.jpg','2025-10-13 01:55:44');
/*!40000 ALTER TABLE `books` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `borrowed_books`
--

DROP TABLE IF EXISTS `borrowed_books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `borrowed_books` (
  `borrow_id` int NOT NULL AUTO_INCREMENT,
  `borrower_id` int NOT NULL,
  `book_id` int NOT NULL,
  `date_borrowed` date NOT NULL,
  `due_date` date NOT NULL,
  `status` enum('Borrowed','Returned','Lost') NOT NULL DEFAULT 'Borrowed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`borrow_id`),
  KEY `borrower_id` (`borrower_id`),
  KEY `book_id` (`book_id`),
  CONSTRAINT `borrowed_books_ibfk_1` FOREIGN KEY (`borrower_id`) REFERENCES `borrowers` (`borrower_id`) ON DELETE CASCADE,
  CONSTRAINT `borrowed_books_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `borrowed_books`
--

LOCK TABLES `borrowed_books` WRITE;
/*!40000 ALTER TABLE `borrowed_books` DISABLE KEYS */;
INSERT INTO `borrowed_books` VALUES (2,4,1,'2025-10-13','2025-10-20','Returned','2025-10-13 00:49:30'),(3,5,1,'2025-10-13','2025-10-17','Returned','2025-10-13 01:02:21'),(4,4,2,'2025-10-13','2025-10-20','Returned','2025-10-13 01:55:06'),(5,4,32,'2025-10-13','2025-10-20','Returned','2025-10-13 01:56:20'),(6,4,1,'2025-10-13','2025-10-20','Returned','2025-10-13 02:23:00'),(7,4,2,'2025-10-13','2025-10-20','Returned','2025-10-13 02:51:55'),(8,4,1,'2025-10-13','2025-10-20','Returned','2025-10-13 02:59:19'),(9,4,1,'2025-10-13','2025-10-20','Returned','2025-10-13 03:01:52'),(10,4,1,'2025-10-13','2025-10-20','Returned','2025-10-13 03:26:17'),(11,4,2,'2025-10-13','2025-10-20','Returned','2025-10-13 03:29:37'),(12,4,1,'2025-10-13','2025-10-20','Lost','2025-10-13 03:35:13');
/*!40000 ALTER TABLE `borrowed_books` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `borrowers`
--

DROP TABLE IF EXISTS `borrowers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `borrowers` (
  `borrower_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `year_level` varchar(50) NOT NULL,
  `course` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`borrower_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `borrowers`
--

LOCK TABLES `borrowers` WRITE;
/*!40000 ALTER TABLE `borrowers` DISABLE KEYS */;
INSERT INTO `borrowers` VALUES (4,'Patricia Lyca','3rd Year','BS Information Technology','2025-10-12 16:00:00'),(5,'Daniela Avanzini','1st Year','BS Information Technology','2025-10-12 16:00:00');
/*!40000 ALTER TABLE `borrowers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `returned_books`
--

DROP TABLE IF EXISTS `returned_books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `returned_books` (
  `return_id` int NOT NULL AUTO_INCREMENT,
  `borrow_id` int NOT NULL,
  `returned_date` date DEFAULT NULL,
  `violation` enum('None','Late Return','Damaged','Lost Book') DEFAULT 'None',
  `penalty` decimal(10,2) DEFAULT '0.00',
  `amount_paid` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`return_id`),
  KEY `borrow_id` (`borrow_id`),
  CONSTRAINT `returned_books_ibfk_1` FOREIGN KEY (`borrow_id`) REFERENCES `borrowed_books` (`borrow_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `returned_books`
--

LOCK TABLES `returned_books` WRITE;
/*!40000 ALTER TABLE `returned_books` DISABLE KEYS */;
/*!40000 ALTER TABLE `returned_books` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `userid` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `account_type` enum('admin','librarian') DEFAULT 'librarian',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`userid`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'pcastro17','12345678','Patricia Castro','patriciacastro@gmail.com','admin',NULL,NULL),(2,'daniela07','daniela07','Daniela Avanzini','daniela.a@gmail.com','librarian',NULL,NULL),(3,'poonamkaur','poonamkaur','Poonam','poonam09talwar@gmail.com','admin',NULL,NULL),(4,'rafrafraf','rafrafraf','raf','testtests@gmail.com','admin',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-13 11:40:52
