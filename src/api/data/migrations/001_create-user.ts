import * as knex from 'knex';

export const up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('user', function (t) {
		t.increments('id').notNullable().primary();
		t.string('email', 200).notNullable().unique();
		t.string('first_name', 100);
		t.string('last_name', 100);
		t.string('display_name', 200);
		t.dateTime('create_date').notNullable();
		t.string('preferredBuilding', 200);
		t.string('department', 200);
		t.string('branch', 200);
		t.string('roles', 1000);
		t.string('status', 20).notNullable().defaultTo("Inactive");
		t.string('mailcode', 20);
	});
};

export const down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('user');
};
