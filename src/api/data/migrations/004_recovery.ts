import * as knex from 'knex';

// create table Recoveries.Recovery(
//     recid smallint identity (1,1) primary key,
//     FirstName varchar (50) not null, --autocompete using Directory API or OAuth
//     LastName varchar (50) not null, --autocompete using Directory API or OAuth
//     Department varchar (50) not null, --maybe there is an api we can use
//     Branch varchar (50) not null, -- maybe there is an api we can use
//     RefNum varchar (20), --reference identifier from other system
//     RequestDesc varchar (140), -- short name of request so can find
//     CreateDate date,
//     CreateUser varchar (10), --ynet id of enterer
//     reqStatID smallint, -- pull text from Recoveries.RequestStatusLUP
//     CompleteDate date,
//     CompleteUser varchar (10), --ynet id
//     )

export const up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('Recovery', function (t) {
		t.increments('recid').notNullable().primary();
		t.string('FirstName', 50).notNullable();
		t.string('LastName', 50).notNullable();
		t.string('Department', 50).notNullable();
		t.string('Branch', 50).notNullable();
		t.string('RefNum', 20).nullable();
		t.string('RequestDesc', 140).nullable();
		t.date('CreateDate').notNullable();
		t.string('CreateUser', 100).notNullable();
		t.integer('reqStatID').nullable();
		t.date('CompleteDate').nullable();
		t.string('CompleteUser', 10).nullable();
	});
};

export const down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('Recovery');
};
