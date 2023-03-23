import * as knex from 'knex';

export const up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('DepartmentInfo', function (t) {
		t.increments('departmentID').notNullable().primary();		
		t.date('createDate').notNullable().defaultTo(knex.fn.now());
		t.string('createUser', 100);
		t.date('modDate').notNullable().defaultTo(knex.fn.now());
		t.string('modUser', 100);		
		t.string('department', 150).notNullable();
		t.string('glCode', 50).notNullable();
		t.string('contactName', 50).notNullable();
		t.string('contactEmail', 50).notNullable();
	});
};

export const down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('DepartmentInfo');
};
