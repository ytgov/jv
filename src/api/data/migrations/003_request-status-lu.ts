import * as knex from 'knex';

// create table Recoveries.RequestStatusLUP(
//     reqStatID smallint identity (1,1) not null primary key,
//     ReqStatus varchar (20) not null, --options in this order: draft, submitted, approved, reassigned, partially filled, complete, approve for recovery, recovered, partially recovered
//     )

export const up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('RequestStatusLUP', function (t) {
		t.increments('reqStatID').notNullable().primary();
		t.string('ReqStatus', 20).notNullable();
	});
};

export const down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('RequestStatusLUP');
};
