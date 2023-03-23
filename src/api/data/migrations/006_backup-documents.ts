import * as knex from 'knex';

exports.up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('BackUpDocs', function (t) {
		t.increments('documentID').notNullable().primary();
		
		t.integer("recoveryID").unsigned().notNullable();
    	t.foreign("recoveryID").references("recoveryID").inTable("Recovery").onDelete("CASCADE");
		t.string("docName", 200);
		t.binary('document');		
	});
};

exports.down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('BackUpDocs');
};
