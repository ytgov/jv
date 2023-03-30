import * as knex from 'knex';

export const up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('JournalVoucher', function (t) {
		t.increments('journalID').notNullable().primary();
		t.date('submissionDate').notNullable();
		t.string('jvNum', 25).notNullable();
		t.string('department', 100).notNullable();
		t.integer('period').notNullable();		
		t.float('jvAmount').notNullable();
		t.string('status', 50); // Draft, Sent, Paid		
	});
};

export const down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('JournalVoucher');
};
