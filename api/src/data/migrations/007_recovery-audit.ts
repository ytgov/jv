import * as knex from 'knex';

export const up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('RecoveryAudit', function (t) {
		t.increments('auditID').notNullable().primary();

		t.integer("recoveryID").unsigned().notNullable();
    	t.foreign("recoveryID").references("recoveryID").inTable("Recovery").onDelete("CASCADE");
		
		t.dateTime('date');
		t.string('user', 50).notNullable();
		t.string('action').notNullable();
	});
};

export const down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('RecoveryAudit');
};
