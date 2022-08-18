import * as knex from 'knex';

// -- create table Recoveries.RecApproval(
//     -- recappid smallint not null identity(1,1) primary key,
//     -- recid smallint not null, -- fk
//     -- status varchar (20), -- options create, approved or reassigned
//     -- approveuser varchar(10), --ynet name
//     -- approveDate date,
//     -- approveNote varchar(200),
//     -- reassignNote varchar (200),
//     -- FOREIGN KEY (recid) REFERENCES Recoveries.Recovery(recid),
//     -- )

export const up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('RecApproval', function (t) {
		t.increments('recappid').notNullable().primary();
		t.integer('recid').notNullable();
		t.string('status', 20).notNullable();
		t.string('approveuser', 10).nullable();
		t.date('approveDate').nullable();
		t.string('approveNote', 200).nullable();
		t.string('reassignNote', 200).nullable();
		t.foreign('recid').references('Recovery.id');
	});
};

export const down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('RecApproval');
};
