CREATE DATABASE IF NOT EXISTS warmd;
USE warmd;
GRANT USAGE ON *.* TO travis@localhost;
GRANT ALL PRIVILEGES ON warmd TO travis@localhost;
FLUSH PRIVILEGES;

-- MySQL dump 10.13  Distrib 5.5.35, for debian-linux-gnu (i686)
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `AlbumGenres`
--

DROP TABLE IF EXISTS `AlbumGenres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AlbumGenres` (
  `AlbumID` mediumint(9) NOT NULL DEFAULT '0',
  `SubGenreID` smallint(6) NOT NULL DEFAULT '0',
  `AlbumGenreID` mediumint(9) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`AlbumGenreID`),
  KEY `AlbumID` (`AlbumID`),
  KEY `SubGenreID` (`SubGenreID`)
) ENGINE=MyISAM AUTO_INCREMENT=31141 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Albums`
--

DROP TABLE IF EXISTS `Albums`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Albums` (
  `AlbumID` mediumint(9) NOT NULL AUTO_INCREMENT,
  `LabelID` mediumint(9) DEFAULT NULL,
  `GenreID` smallint(6) DEFAULT NULL,
  `ArtistID` mediumint(9) NOT NULL DEFAULT '0',
  `FormatID` tinyint(4) DEFAULT NULL,
  `Album` varchar(255) NOT NULL DEFAULT '',
  `Year` year(4) DEFAULT NULL,
  `HighestChartPosition` tinyint(4) DEFAULT NULL,
  `DateAdded` date DEFAULT NULL,
  `DateRemoved` date DEFAULT NULL,
  `Status` enum('Bin','N&WC','NIB','TBR','OOB','Missing','Library','NBNB') DEFAULT NULL,
  `Comp` enum('Yes','No') DEFAULT NULL,
  `ReviewPic` blob,
  `ReleaseNum` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`AlbumID`),
  KEY `Status` (`Status`),
  KEY `Status_2` (`Status`)
) ENGINE=MyISAM AUTO_INCREMENT=47275 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Artists`
--

DROP TABLE IF EXISTS `Artists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Artists` (
  `ArtistID` mediumint(9) NOT NULL AUTO_INCREMENT,
  `Artist` varchar(255) NOT NULL DEFAULT '',
  `ShortName` varchar(255) NOT NULL DEFAULT '',
  `Comment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ArtistID`)
) ENGINE=MyISAM AUTO_INCREMENT=64405 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Formats`
--

DROP TABLE IF EXISTS `Formats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Formats` (
  `FormatID` tinyint(4) NOT NULL AUTO_INCREMENT,
  `Format` varchar(40) NOT NULL DEFAULT '',
  PRIMARY KEY (`FormatID`)
) ENGINE=MyISAM AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Genres`
--

DROP TABLE IF EXISTS `Genres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Genres` (
  `GenreID` smallint(6) NOT NULL AUTO_INCREMENT,
  `Genre` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`GenreID`)
) ENGINE=MyISAM AUTO_INCREMENT=29 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Labels`
--

DROP TABLE IF EXISTS `Labels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Labels` (
  `LabelID` mediumint(9) NOT NULL AUTO_INCREMENT,
  `Label` varchar(80) NOT NULL DEFAULT '',
  `ContactPerson` varchar(80) DEFAULT NULL,
  `Email` varchar(80) DEFAULT NULL,
  `Address` varchar(80) DEFAULT NULL,
  `City` varchar(80) DEFAULT NULL,
  `State` char(2) DEFAULT NULL,
  `Zip` varchar(10) DEFAULT NULL,
  `Country` varchar(80) DEFAULT NULL,
  `Fax` varchar(80) DEFAULT NULL,
  `Phone` varchar(80) DEFAULT NULL,
  `Comment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`LabelID`)
) ENGINE=MyISAM AUTO_INCREMENT=10235 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PlayLists`
--

DROP TABLE IF EXISTS `PlayLists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PlayLists` (
  `PlayListID` smallint(6) NOT NULL AUTO_INCREMENT,
  `StartTime` datetime DEFAULT NULL,
  `EndTime` datetime DEFAULT NULL,
  `UserID` smallint(6) NOT NULL DEFAULT '0',
  `ProgramID` smallint(6) DEFAULT NULL,
  `PlayList` varchar(4) DEFAULT 'View',
  `Comment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`PlayListID`)
) ENGINE=MyISAM AUTO_INCREMENT=21975 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Plays`
--

DROP TABLE IF EXISTS `Plays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Plays` (
  `Time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PlayID` int(32) unsigned NOT NULL AUTO_INCREMENT,
  `Ordering` int(10) unsigned zerofill DEFAULT NULL,
  `PlayListID` smallint(6) NOT NULL DEFAULT '0',
  `ArtistID` mediumint(9) NOT NULL DEFAULT '0',
  `AlbumID` mediumint(9) DEFAULT NULL,
  `AltAlbum` varchar(255) DEFAULT NULL,
  `TrackName` varchar(255) DEFAULT NULL,
  `Mark` enum('Yes','No') DEFAULT 'No',
  `B` enum('Yes','No') DEFAULT 'No',
  `R` enum('Yes','No') DEFAULT 'No',
  PRIMARY KEY (`PlayID`),
  UNIQUE KEY `PlayID` (`PlayID`)
) ENGINE=MyISAM AUTO_INCREMENT=413138 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ProgramGenres`
--

DROP TABLE IF EXISTS `ProgramGenres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ProgramGenres` (
  `ProgramGenreID` smallint(6) NOT NULL AUTO_INCREMENT,
  `ProgramGenre` varchar(255) DEFAULT NULL,
  `SubGenreID` smallint(6) DEFAULT NULL,
  `ProgramID` smallint(6) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ProgramGenreID`)
) ENGINE=MyISAM AUTO_INCREMENT=722 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Programs`
--

DROP TABLE IF EXISTS `Programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Programs` (
  `ProgramID` smallint(6) NOT NULL AUTO_INCREMENT,
  `Program` varchar(80) NOT NULL DEFAULT '',
  `UserID` smallint(6) NOT NULL DEFAULT '0',
  `StartTime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `EndTime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `Promo` text,
  `Promocode` varchar(12) DEFAULT NULL,
  `Type` enum('show','pa') DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL,
  `DJName` varchar(80) DEFAULT NULL,
  `Website` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`ProgramID`)
) ENGINE=MyISAM AUTO_INCREMENT=720 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Reviews`
--

DROP TABLE IF EXISTS `Reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Reviews` (
  `ReviewID` int(32) unsigned NOT NULL AUTO_INCREMENT,
  `UserID` smallint(6) NOT NULL DEFAULT '0',
  `AlbumID` mediumint(9) NOT NULL DEFAULT '0',
  `Review` text NOT NULL,
  `Time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ReviewID`)
) ENGINE=MyISAM AUTO_INCREMENT=32770 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SubGenres`
--

DROP TABLE IF EXISTS `SubGenres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SubGenres` (
  `SubGenreID` smallint(6) NOT NULL AUTO_INCREMENT,
  `GenreID` smallint(11) NOT NULL DEFAULT '0',
  `SubGenre` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`SubGenreID`)
) ENGINE=MyISAM AUTO_INCREMENT=103 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Users` (
  `UserID` smallint(6) NOT NULL AUTO_INCREMENT,
  `User` varchar(40) NOT NULL DEFAULT '',
  `FName` varchar(40) NOT NULL DEFAULT '',
  `LName` varchar(40) NOT NULL DEFAULT '',
  `DJName` varchar(40) DEFAULT NULL,
  `Password` varchar(100) NOT NULL DEFAULT '',
  `Phone` varchar(80) DEFAULT NULL,
  `Email` varchar(80) DEFAULT NULL,
  `AuthLevel` enum('None','Trainee','User','Exec','Admin') DEFAULT NULL,
  `DateTrained` date DEFAULT NULL,
  `WRCTUser` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `User` (`User`)
) ENGINE=MyISAM AUTO_INCREMENT=698 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

/* insert some things to test against*/

/* Users */
INSERT INTO  `warmd`.`Users` (
`UserID` ,
`User` ,
`FName` ,
`LName` ,
`DJName` ,
`Password` ,
`Phone` ,
`Email` ,
`AuthLevel` ,
`DateTrained` ,
`WRCTUser`
)
VALUES
('40' ,  'Tom',  'Tom',  'TOM', NULL ,  '405cb660517215b80487f363001c8fd2c2b829f4', NULL , NULL , 'Admin' , NULL ,  ''),
('35', 'matt', 'Matt', NULL, 'matt', NULL, NULL, NULL, 'Exec', NULL, ''),
('61', 'matthewk', 'Matt', NULL, '', NULL, NULL, NULL, 'Exec', NULL, ''),
('152', 'mtheisz', 'Matt', NULL, 'other', NULL, NULL, NULL, 'Exec', NULL, ''),
('178', 'matth', 'Matthew', NULL, NULL, NULL, NULL, NULL, 'User', NULL, ''),
('278', 'mreid', 'matt', NULL, NULL, 'trainee', NULL, NULL, 'Trainee', NULL, ''),
('323', 'msiko', 'Matt', NULL, NULL, NULL, NULL, NULL, 'Admin', NULL, ''),
('332', 'mtoups', 'Matt', NULL, NULL, NULL, NULL, NULL, 'Admin', NULL, ''),
('364', 'mmerewit', 'Matt', NULL, NULL, NULL, NULL, NULL, 'Admin', NULL, ''),
('399', 'mmckee1', 'Matt', NULL, NULL, NULL, NULL, NULL, 'Exec', NULL, ''),
('444', 'mattk', 'Matthew', NULL, NULL, NULL, NULL, NULL, 'User', NULL, ''),
('455', 'mbwbk', 'Matt', NULL, NULL, NULL, NULL, NULL, 'None', NULL, ''),
('460', 'mattt', 'Matt', NULL, NULL, NULL, NULL, NULL, 'User', NULL, ''),
('476', 'msandle', 'Matt', NULL, NULL, NULL, NULL, NULL, 'User', NULL, ''),
('485', 'mtthomps', 'Mattt', NULL, NULL, NULL, NULL, NULL, 'Admin', NULL, ''),
('517', 'mbiegler', 'Matt', NULL, NULL, NULL, NULL, NULL, 'User', NULL, ''),
('568', 'mgyrich', 'Matt', NULL, NULL, NULL, NULL, NULL, 'User', NULL, ''),
('571', 'mcbaron', 'Matthew', NULL, NULL, NULL, NULL, NULL, 'None', NULL, 'mcbaron@WRCT.ORG'),
('575', 'mmastric', 'Matt', NULL, NULL, NULL, NULL, NULL, 'Exec', NULL, ''),
('639', 'mpowellp', 'Matt', NULL, NULL, NULL, NULL, NULL, 'User', NULL, ''),
('683', 'mgoodnight', 'Matthew', NULL, NULL, NULL, NULL, NULL, 'Trainee', NULL, '');

/* Artists */

NSERT INTO `Artists` (`ArtistID`, `Artist`, `ShortName`, `Comment`) VALUES
(429, 'Daft Punk', 'daft', NULL);


