import * as knex from 'knex';

export const up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('Recovery', function (t) {
		t.increments('recoveryID').notNullable().primary();

		t.integer("journalID").unsigned();
    	t.foreign("journalID").references("journalID").inTable("JournalVoucher").onDelete("SET NULL");

		t.string('firstName', 50).notNullable();
		t.string('lastName', 50).notNullable();
		t.string('department', 50).notNullable();
		t.string('branch', 150);
		t.string('refNum', 20);
		t.date('createDate').notNullable().defaultTo(knex.fn.now());
		t.string('createUser', 100).notNullable();
		t.string('modUser', 100)
		t.string('status', 50);//Draft, Routed For Approval, Re-Draft, Purchase Approved, Partially Fulfilled, Fulfilled, Complete
		t.date('submissionDate');
		t.date('completeDate');
		t.string('completeUser', 100);
		t.float("totalPrice");
	});
};

export const down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('Recovery');
};
