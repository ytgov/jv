import * as knex from 'knex';

export const up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('Recovery', function (t) {
		t.increments('recoveryID').notNullable().primary();
		t.string('firstName', 50).notNullable();
		t.string('lastName', 50).notNullable();
		t.string('department', 50).notNullable();
		t.string('branch', 50);
		t.string('refNum', 20);
		t.date('createDate').notNullable().defaultTo(knex.fn.now());
		t.string('createUser', 100).notNullable();
		t.string('modUser', 100)
		t.string('status', 50);//Draft, Routed For Approval, Re-Draft, Purchase Approved, Partially Fullfilled, Fullfilled, Complete
		t.date('completeDate');
		t.string('completeUser', 10);
	});
};

export const down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('Recovery');
};
