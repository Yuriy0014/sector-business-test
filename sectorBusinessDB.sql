-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: test
-- ------------------------------------------------------
-- Server version	8.0.36

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
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `timestamp` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,1705745437551,'Initial1705745437551'),(2,1705924874124,'IsSuper1705924874124');
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profiles`
--

DROP TABLE IF EXISTS `profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles` (
  `id` varchar(36) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `male` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `photoName` varchar(255) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `regDateId` datetime NOT NULL,
  `isSuper` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profiles`
--

LOCK TABLES `profiles` WRITE;
/*!40000 ALTER TABLE `profiles` DISABLE KEYS */;
INSERT INTO `profiles` VALUES ('5009593a-29d3-4e4f-86f6-4d202981c14c','Alan','Тьюринг','Мужской','alantuiringPNG1@yandex.ru','photo-1705946047581.png','$2b$10$G3Ilrj70XFohVX4DknozMOo04YNLBbwfCB8f/YW.9I3p2yfPBfwty','2024-01-22 20:54:08',0),('b5ea8295-8ee3-4df9-b5d9-9e7bea899148','Питер','Паркер','Мужской','parker2034@yandex.ru','photo-1705946050342.jpg','$2b$10$mm..0PTfz.94vs1hTUIoCeont2zJMTrcZS2XYZBi1pbiCZ4Q4BRC6','2024-01-01 00:00:00',1);
/*!40000 ALTER TABLE `profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(36) NOT NULL,
  `ip` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `lastActiveDate` datetime NOT NULL,
  `deviceId` varchar(255) NOT NULL,
  `deviceName` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `RFTokenIAT` datetime NOT NULL,
  `profileId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_72445b58af61b4241eb456a3fe1` (`profileId`),
  CONSTRAINT `FK_72445b58af61b4241eb456a3fe1` FOREIGN KEY (`profileId`) REFERENCES `profiles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('4a15ff1e-03bc-453d-b003-953ae14f5ff6','::ffff:127.0.0.1','Title session','2024-01-22 20:54:09','1705946049125','deviceName undefined','5009593a-29d3-4e4f-86f6-4d202981c14c','2024-01-22 20:54:09',NULL),('c19bca42-768c-4d6d-bb2f-3bf03d78546b','::ffff:127.0.0.1','Title session','2024-01-22 20:54:09','1705946049323','deviceName undefined','b5ea8295-8ee3-4df9-b5d9-9e7bea899148','2024-01-22 20:54:09',NULL);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'test'
--

--
-- Dumping routines for database 'test'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-01-22 21:02:59
