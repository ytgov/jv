import * as knex from 'knex';

// create table Recoveries.BackUpDocs (
//     id smallint not null identity(1,1) primary key,
//     recid smallint, --fk
//     document varbinary(max),
//     FOREIGN KEY (recid) REFERENCES Recoveries.Recovery(recid),
//     )

exports.up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('BackUpDocs', function (t) {
		t.increments('id').notNullable().primary();
		t.integer('recid').notNullable();
		t.binary('document').notNullable();
		t.foreign('recid').references('Recovery.recid');
	});
};

exports.down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('BackUpDocs');
};
