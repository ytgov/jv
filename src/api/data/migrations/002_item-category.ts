import * as knex from 'knex';

// Create Table Recoveries.ItemCategory(
//     ItemCatID smallint identity(1,1) not null primary key,
//     Category varchar (60), --examples desktop, monitor, printer, SLA
//     Branch varchar (10), -- from API (default to ynet logined users branch)
//     RecoveryType varchar(10) -- option Full only or Partial this defines if you can spit the recovery in pieces or if you need to recover the whole thing
//     CreateDate date,
//     CreateUser varchar (10),
//     ModDate date,
//     ModUser varchar(10),
//     )

export const up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('ItemCategory', function (t) {
		t.increments('ItemCatID').notNullable().primary();
		t.string('Category', 60).notNullable();
		t.string('Branch', 10).notNullable();
		t.string('RecoveryType', 10).notNullable();
		t.date('CreateDate').nullable();
		t.string('CreateUser', 10).nullable();
		t.date('ModDate').nullable();
		t.string('ModUser', 10).nullable();
	});
};

export const down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('ItemCategory');
};
