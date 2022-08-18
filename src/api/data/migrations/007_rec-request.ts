import * as knex from 'knex';

// create table Recoveries.RecRequest(
//     RecReqid smallint not null identity(1,1) primary key,
//     Recid smallint not null, --fk
//     RecAmount smallint, --make user either fill in amount or percentage and calculate the other
//     RecPercent smallint,
//     RecNote varchar (200),
//     RecApproveUser varchar(10), --ynet name
//     RecApproveDate date,
//     FOREIGN KEY (recid) REFERENCES Recoveries.Recovery(recid),
//     )

export const up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('RecRequest', function (t) {
		t.increments('RecReqid').notNullable().primary();
		t.integer('Recid').notNullable();
		t.integer('RecAmount').nullable();
		t.integer('RecPercent').nullable();
		t.string('RecNote', 200).nullable();
		t.string('RecApproveUser', 10).nullable();
		t.date('RecApproveDate').nullable();
		t.foreign('Recid').references('Recovery.id');
	});
};

export const down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('RecRequest');
};
