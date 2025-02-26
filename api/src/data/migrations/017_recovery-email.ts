import * as knex from 'knex';

exports.up = function (knex: knex.Knex, Promise: any) {
	return knex.schema
		.createTable('RecoveryEmail', function (t) {
			t.increments('emailID').notNullable().primary();

			t.integer("recoveryID").unsigned().notNullable();
    		t.foreign("recoveryID").references("recoveryID").inTable("Recovery").onDelete("CASCADE");
			
			t.string('emailType', 50); //Routed For Approval, Routed For Approval Reminder, Re-Draft, Purchase Approved
			t.dateTime('sentDate');			
			t.string('sendingUser', 100);
			t.string('recipients', 255);
		});
};

exports.down = function (knex: knex.Knex, Promise: any) {
	return knex.schema		
		.dropTable('RecoveryEmail');;
};
