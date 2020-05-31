use STAT;
CREATE TABLE Users (
	ID int AUTO_INCREMENT,
	device VARCHAR(255),
	requestAddr VARCHAR(255),
	requestTime DATETIME,
	PRIMARY KEY (ID)
);
CREATE TABLE Trials (
	ID int AUTO_INCREMENT,
	UserID int,
	TopTimeAvg double,
	BotTimeAvg double,
	TimeAvg double,
	Accuracy float,
	PRIMARY KEY (ID)
);