import * as knex from 'knex';

// create table Recoveries.JournalVoucher(
//     id smallint not null identity(1,1) primary key,
//     JVNum varchar (15),
//     Period smallint not null,
//     Department varchar (10),
//     JVamount smallint not null,
//     )

export const up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('JournalVoucher', function (t) {
		t.increments('id').notNullable().primary();
		t.string('JVNum', 15).notNullable();
		t.integer('Period').notNullable();
		t.string('Department', 10).notNullable();
		t.integer('JVamount').notNullable();
	});
};
