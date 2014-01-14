-- WRCT: A Database

CREATE DATABASE IF NOT EXISTS wrcttest;

USE wrcttest;

--GRANT ALL ON wrcttest.* TO wrct@localhost
--  IDENTIFIED BY 'freeform' WITH GRANT OPTION;

--GRANT CREATE, DELETE, INSERT, SELECT, UPDATE ON wrcttest.* TO www@localhost 
--  IDENTIFIED BY 'fuckyou';

-- SECTION 0: User Data

CREATE TABLE Users (
  UserID smallint NOT NULL AUTO_INCREMENT,
  User varchar(40) NOT NULL,
  FName varchar(40) NOT NULL,
  LName varchar(40) NOT NULL,
  DJName varchar(40),
  Password varchar(16) NOT NULL,
  Phone varchar(80),
  Email varchar(80),
  AuthLevel enum('None','User','Exec','Admin') default 'User',
  DateTrained date,
  PRIMARY KEY (UserID)
) TYPE = InnoDB;

-- SECTION 1: Library and Bin

CREATE TABLE Formats (
  FormatID tinyint NOT NULL AUTO_INCREMENT,
  Format varchar(40) NOT NULL,
  PRIMARY KEY (FormatID)
) TYPE = InnoDB;
INSERT INTO Formats (FormatID, Format)
            VALUES (-1, 'Format not in Database');

CREATE TABLE Labels (
  LabelID mediumint NOT NULL AUTO_INCREMENT,
  Label varchar(80) NOT NULL,
  ContactPerson varchar(80),
  Email varchar(80),
  Address varchar(80),
  City varchar(80),
  State char(2),
  Zip varchar(10),
  Country varchar(80),
  Fax varchar(80),
  Phone varchar(80),
  Comment varchar(255),
  PRIMARY KEY (LabelID)
) TYPE = InnoDB;
INSERT INTO Labels (LabelID, Label)
            VALUES (-1, 'Label not in Database');

-- Table definition for artists
-- ShortName is the 6-letter designation derived from the Name column
-- (e.g. "Brian Eno" -> "enobri", "Meshuggah" -> "meshug")
-- Its purpose is for alphabetization.

CREATE TABLE Artists (
  ArtistID mediumint NOT NULL AUTO_INCREMENT,
  Artist varchar(255) NOT NULL,
  ShortName char(6) NOT NULL,
  Comment varchar(255),
  PRIMARY KEY (ArtistID)
) TYPE = InnoDB;
INSERT INTO Artists (ArtistID, Artist, ShortName, Comment)
	     VALUES (1, 'Artist not in Database', '_',
		     'DO NOT REMOVE THIS ARTIST -- IT IS HERE FOR USE WITH PLAYLISTS');

CREATE TABLE Genres (
  GenreID smallint NOT NULL AUTO_INCREMENT,
  Genre varchar(255) NOT NULL,
  PRIMARY KEY (GenreID)
) TYPE = InnoDB;
INSERT INTO Genres (GenreID, Genre)
	     VALUES (-1, 'Unknown Genre');

CREATE TABLE SubGenres (
  SubGenreID smallint NOT NULL AUTO_INCREMENT,
  GenreID smallint NOT NULL,
  SubGenre varchar(255) NOT NULL,
  PRIMARY KEY (SubGenreID),
  INDEX (GenreID),
  FOREIGN KEY (GenreID) REFERENCES Genres(GenreID)
   ON DELETE RESTRICT ON UPDATE CASCADE
) TYPE = InnoDB;
INSERT INTO SubGenres (SubGenreID, GenreID, SubGenre)
	     VALUES (-1, -1, 'Unknown SubGenre');

CREATE TABLE Albums (
  AlbumID mediumint NOT NULL AUTO_INCREMENT,
  LabelID mediumint,
  GenreID smallint,
  ArtistID mediumint NOT NULL,
  FormatID tinyint,
  Album varchar(255) NOT NULL,
  Year year,
  HighestChartPosition tinyint,
  DateAdded date,
  DateRemoved date,
  Status enum('Bin', 'N&WC', 'NIB', 'TBR', 'OOB'),
  Comp enum('Yes', 'No'),
  ReviewPic blob,
  ReleaseNum varchar(20),
  PRIMARY KEY (AlbumID),
  INDEX (LabelID),
  FOREIGN KEY (LabelID) REFERENCES Labels(LabelID)
   ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX (GenreID),
  FOREIGN KEY (GenreID) REFERENCES Genres(GenreID)
   ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX (ArtistID),
  FOREIGN KEY (ArtistID) REFERENCES Artists(ArtistID)
   ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX (FormatID),
  FOREIGN KEY (FormatID) REFERENCES Formats(FormatID)
   ON DELETE RESTRICT ON UPDATE CASCADE
) TYPE = InnoDB;

-- rjs3 -> these entries are not in the main database
--INSERT INTO Albums (AlbumID, LabelID, GenreID, FormatID, ArtistID, Album)
--	    VALUES (-1, -1, 13, 1, -1, '');

--INSERT INTO Albums (AlbumID, LabelID, GenreID, FormatID, ArtistID, Album)
--	    VALUES (-1, -1, -1, -1, 1, '[Database Placeholder]');

CREATE TABLE AlbumGenres (
  AlbumID mediumint NOT NULL,
  SubGenreID smallint NOT NULL,
  INDEX (AlbumID),
  FOREIGN KEY (AlbumID) REFERENCES Albums(AlbumID)
   ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX (SubGenreID),
  FOREIGN KEY (SubGenreID) REFERENCES SubGenres(SubGenreID)
   ON DELETE RESTRICT ON UPDATE CASCADE
) TYPE = InnoDB;

CREATE TABLE Reviews (
  ReviewID smallint NOT NULL AUTO_INCREMENT,
  UserID smallint NOT NULL,
  AlbumID mediumint NOT NULL,
  Review text NOT NULL,
  PRIMARY KEY (ReviewID),
  INDEX (UserID),
  FOREIGN KEY (UserID) REFERENCES Users(UserID)
   ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX (AlbumID),
  FOREIGN KEY (AlbumID) REFERENCES Albums(AlbumID)
   ON DELETE RESTRICT ON UPDATE CASCADE
) TYPE = InnoDB;

-- SECTION 2: Infrastructure
--

-- Name changed from Shows to Programs to avoid a MySQL keyword.

CREATE TABLE Programs (
  ProgramID smallint NOT NULL AUTO_INCREMENT,
  Program varchar(80) NOT NULL,
  UserID smallint NOT NULL,
  StartTime datetime NOT NULL,
  EndTime datetime NOT NULL,
  Promo text,
  PromoCode varchar(10),
  PRIMARY KEY (ProgramID),
  INDEX (UserID),
  FOREIGN KEY (UserID) REFERENCES Users(UserID)
   ON DELETE RESTRICT ON UPDATE CASCADE
) TYPE = InnoDB;

-- This table is defined separately as opposed to being derived from 
-- Genres/Subgenres to allow for DJs to use those that are not in
-- the library (freeform, hiphop and other musics dedicated to the struggle,
-- countrypunkROKnewwavenoisejazzpsychedelicpopbluesfolkcelticsoulandmore,
-- etc.).

CREATE TABLE ProgramGenres (
  ProgramGenreID smallint DEFAULT '0' NOT NULL AUTO_INCREMENT,
  ProgramGenre varchar(255),
  SubGenreID smallint,
  ProgramID smallint NOT NULL,
  PRIMARY KEY (ProgramGenreID),
  INDEX (SubGenreID),
  FOREIGN KEY (SubGenreID) REFERENCES SubGenres(SubGenreID)
   ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX (ProgramID),
  FOREIGN KEY (ProgramID) REFERENCES Programs(ProgramID)
   ON DELETE RESTRICT ON UPDATE CASCADE
) TYPE = InnoDB;

-- Duplicates just enough info from Programs to be useful
-- for random schedules and extended shows, but not too much.
CREATE TABLE PlayLists (
  PlayListID smallint NOT NULL AUTO_INCREMENT,
  StartTime datetime,
  EndTime datetime,
  UserID smallint NOT NULL,
  ProgramID smallint,
  PRIMARY KEY (PlayListID),
  INDEX (UserID),
  FOREIGN KEY (UserID) REFERENCES Users(UserID)
   ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX (ProgramID),
  FOREIGN KEY (ProgramID) REFERENCES Programs(ProgramID)
   ON DELETE RESTRICT ON UPDATE CASCADE
) TYPE = InnoDB;

-- ArtistID is required, but user can choose between AlbumID, Album,
-- or even an unspecified album.
CREATE TABLE Plays (
  Time timestamp,
  PlayListID smallint NOT NULL,
  ArtistID mediumint NOT NULL,
  AlbumID mediumint,
  AltAlbum varchar(255),
  TrackName varchar(255),
  Mark enum('Yes', 'No') DEFAULT 'No',
  B enum('Yes', 'No') DEFAULT 'No',
  R enum('Yes', 'No') DEFAULT 'No',
  PRIMARY KEY (Time),
  INDEX (PlayListID),
  FOREIGN KEY (PlayListID) REFERENCES PlayLists(PlayListID)
   ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX (ArtistID),
  FOREIGN KEY (ArtistID) REFERENCES Artists(ArtistID)
   ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX (AlbumID),
  FOREIGN KEY (AlbumID) REFERENCES Albums(AlbumID)
   ON DELETE RESTRICT ON UPDATE CASCADE
) TYPE = InnoDB;

-- SECTION 3: Misc. Non-music data

CREATE TABLE Logs (
  LogID smallint NOT NULL AUTO_INCREMENT,
  StartTime datetime NOT NULL,
  EndTime datetime NOT NULL,
  PlayListID smallint NOT NULL,
  Source enum('L', 'REC', 'REM', 'AP'),
  Type enum('E', 'PA', 'PRO', 'PSA', 'N'),
  Log varchar(80) NOT NULL,
  PRIMARY KEY (LogID),
  INDEX (PlayListID),
  FOREIGN KEY (PlayListID) REFERENCES PlayLists(PlayListID)
   ON DELETE RESTRICT ON UPDATE CASCADE,  
) TYPE = InnoDB;

CREATE TABLE Venues (
  VenueID smallint NOT NULL AUTO_INCREMENT,
  Venue varchar(80),
  ContactPerson varchar(80),
  Email varchar(80),
  Address varchar(80),
  City varchar(80),
  State char(2),
  Zip varchar(10),
  Country varchar(80),
  Fax varchar(80),
  Phone varchar(80),
  Website varchar(255),
  PRIMARY KEY (VenueID)
) TYPE = InnoDB;

CREATE TABLE Events (
  EventID mediumint NOT NULL AUTO_INCREMENT,
  Event text,
  VenueID smallint,
  Type ENUM('Concert', 'Cultural'),
  ExpirDate date,
  PRIMARY KEY (EventID),
  INDEX (VenueID),
  FOREIGN KEY (VenueID) REFERENCES Venues(VenueID)
   ON DELETE CASCADE ON UPDATE CASCADE,    
) TYPE = InnoDB;

