import * as knex from 'knex';

exports.up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('JournalDocs', function (t) {
		t.increments('documentID').notNullable().primary();
		
		t.integer("journalID").unsigned().notNullable();
    	t.foreign("journalID").references("journalID").inTable("JournalVoucher").onDelete("CASCADE");
		t.string("docName", 200);
		t.binary('document');		
	});
};

exports.down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('JournalDocs');
};
