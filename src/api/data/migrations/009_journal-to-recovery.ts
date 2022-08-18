import * as knex from 'knex';

// create table Recoveries.JournalToRecovery(
//     id smallint not null identity(1,1) primary key,
//     jvid smallint not null, --fk
//     recid smallint not null, --fk
//     FOREIGN KEY (jvid) REFERENCES Recoveries.JournalVoucher(jvid),
//     FOREIGN KEY (recid) REFERENCES Recoveries.Recovery(jvid),
//     )

exports.up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('JournalToRecovery', function (t) {
		t.increments('id').notNullable().primary();
		t.integer('jvid').notNullable();
		t.integer('recid').notNullable();
		t.foreign('jvid').references('JournalVoucher.id');
		t.foreign('recid').references('Recovery.recid');
	});
};

exports.down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('JournalToRecovery');
};
