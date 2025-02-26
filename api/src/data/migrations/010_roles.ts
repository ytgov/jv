import * as knex from 'knex';

export const up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('Role', function (t) {
		t.increments("id").notNullable().primary();
		t.string("name").notNullable();		
		t.string('role').notNullable();
	});
};

export const down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('Role');
};
