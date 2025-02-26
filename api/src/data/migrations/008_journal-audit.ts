import * as knex from 'knex';

export const up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('JournalAudit', function (t) {
		t.increments('auditID').notNullable().primary();

		t.integer("journalID").unsigned().notNullable();
    	t.foreign("journalID").references("journalID").inTable("JournalVoucher").onDelete("CASCADE");
		
		t.dateTime('date');
		t.string('user', 50).notNullable();
		t.string('action', 50).notNullable();
	});
};

export const down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('JournalAudit');
};
