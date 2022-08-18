--CREATE SCHEMA
CREATE SCHEMA Recoveries;
GO

--DELETE TABLES TO REBUILD 

--DELETE DATA TABLES(FK)

--DELETE PRIMARY TABLES



IF OBJECT_ID('[Recoveries].[RecApproval]', 'U') IS NOT NULL
DROP TABLE [Recoveries].[RecApproval]
GO

IF OBJECT_ID('[Recoveries].[Item]', 'U') IS NOT NULL
DROP TABLE [Recoveries].[Item]
GO

IF OBJECT_ID('[Recoveries].[RecRequest]', 'U') IS NOT NULL
DROP TABLE [Recoveries].[RecRequest]
GO

IF OBJECT_ID('[Recoveries].[JournalVoucher]', 'U') IS NOT NULL
DROP TABLE [Recoveries].[JournalVoucher]
GO

IF OBJECT_ID('[Recoveries].[JournalToRecovery]', 'U') IS NOT NULL
DROP TABLE [Recoveries].[JournalToRecovery]
GO

IF OBJECT_ID('[Recoveries].[BackUpDocs]', 'U') IS NOT NULL
DROP TABLE [Recoveries].[BackUpDocs]
GO

IF OBJECT_ID('[Recoveries].[Recovery]', 'U') IS NOT NULL
DROP TABLE [Recoveries].[Recovery]
GO


--DELETE LOOKUP TABLES
IF OBJECT_ID('[Recoveries].[ItemCategory]', 'U') IS NOT NULL
DROP TABLE [Recoveries].[ItemCategory]
GO

IF OBJECT_ID('[Recoveries].[RequestStatusLUP]', 'U') IS NOT NULL
DROP TABLE [Recoveries].[RequestStatusLUP]
GO



---CREATE TABLES
--BUILD LOOKUP TABLES
--LookUp Table to store the standard types of recoveries for reporting and consistancy
Create Table Recoveries.ItemCategory(
ItemCatID smallint identity(1,1) not null primary key,
Category varchar (60), --examples desktop, monitor, printer, SLA
Branch varchar (10), -- from API (default to ynet logined users branch)
RecoveryType varchar(10) -- option Full only or Partial this defines if you can spit the recovery in pieces or if you need to recover the whole thing
CreateDate date,
CreateUser varchar (10),
ModDate date,
ModUser varchar(10),
)
--This may not need to be a Look-up the status follows the request through the process (draft is accessible to anyone in branch, submitted spawns email to client, approved sends back to tech to agree to spend, 
-- partially filled automate when the item status has at least one filled, complete selected by tech when they are all done, approve for recovery review by manager to define all things are really complete
-- recovered a jv is against it with the full amount, partially recovered jv against the recovery but not full amount.
create table Recoveries.RequestStatusLUP(
reqStatID smallint identity (1,1) not null primary key,
ReqStatus varchar (20) not null, --options in this order: draft, submitted, approved, reassigned, partially filled, complete, approve for recovery, recovered, partially recovered
)


--BUILD PRIMARY TABLES
--Recovery is typically built by IT on behalf of a client

create table Recoveries.Recovery(
recid smallint identity (1,1) primary key,
FirstName varchar (50) not null, --autocompete using Directory API or OAuth
LastName varchar (50) not null, --autocompete using Directory API or OAuth
Department varchar (50) not null, --maybe there is an api we can use
Branch varchar (50) not null, -- maybe there is an api we can use
RefNum varchar (20), --reference identifier from other system
RequestDesc varchar (140), -- short name of request so can find
CreateDate date,
CreateUser varchar (10), --ynet id of enterer
reqStatID smallint, -- pull text from Recoveries.RequestStatusLUP
CompleteDate date,
CompleteUser varchar (10), --ynet id
)

create table Recoveries.Item(
itemId smallint identity (1,1) primary key,
recid smallint not null, --fk
itemCatID smallint not null, -- from Recoveries.ItemCategory
Description varchar(140),
Quantity smallint not null,
UnitPrice smallint not null,
OrigCost smallint not null,
OrigQuant smallint not null,
OrderStatus small in not null, -- yes/no fullfilled or not
StatusChangeDate date,
StatusNote varchar (140),
StatusChangeUser varchar (10),
FOREIGN KEY (recid) REFERENCES Recoveries.Recovery(recid),
)

create table Recoveries.RecApproval(
recappid smallint not null identity(1,1) primary key,
recid smallint not null, -- fk
status varchar (20), -- options create, approved or reassigned
approveuser varchar(10), --ynet name
approveDate date,
approveNote varchar(200),
reassignNote varchar (200),
FOREIGN KEY (recid) REFERENCES Recoveries.Recovery(recid),
)

create table Recoveries.RecRequest(
RecReqid smallint not null identity(1,1) primary key,
Recid smallint not null, --fk
RecAmount smallint, --make user either fill in amount or percentage and calculate the other
RecPercent smallint,
RecNote varchar (200),
RecApproveUser varchar(10), --ynet name
RecApproveDate date,
FOREIGN KEY (recid) REFERENCES Recoveries.Recovery(recid),
)

create table Recoveries.JournalVoucher(
id smallint not null identity(1,1) primary key,
JVNum varchar (15),
Period smallint not null,
Department varchar (10),
JVamount smallint not null,
)

create table Recoveries.JournalToRecovery(
id smallint not null identity(1,1) primary key,
jvid smallint not null, --fk
recid smallint not null, --fk
FOREIGN KEY (jvid) REFERENCES Recoveries.JournalVoucher(jvid),
FOREIGN KEY (recid) REFERENCES Recoveries.Recovery(jvid),
)


create table Recoveries.BackUpDocs (
id smallint not null identity(1,1) primary key,
recid smallint, --fk
document varbinary(max),
FOREIGN KEY (recid) REFERENCES Recoveries.Recovery(recid),
)