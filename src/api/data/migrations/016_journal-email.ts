import * as knex from 'knex';

exports.up = function (knex: knex.Knex, Promise: any) {
	return knex.schema
		.createTable('JournalSentEmail', function (t) {
			t.increments('sentEmailID').notNullable().primary();

			t.integer("journalID").unsigned().notNullable();
			t.foreign("journalID").references("journalID").inTable("JournalVoucher").onDelete("CASCADE");
			
			t.dateTime('sentDate');
			t.string('sendingUser', 100);
			t.string('recipients', 255);
		})
		.alterTable("Recovery", function (t) {		
			t.boolean("declineRequest");
			t.string("reasonForDecline", 255);
			t.string("employeeUnit", 150);
			t.string("requastorEmail", 150);
		});
};

exports.down = function (knex: knex.Knex, Promise: any) {
	return knex.schema
		.alterTable("Recovery", function (t) {			
			t.dropColumn("declineRequest");
			t.dropColumn("reasonForDecline");
			t.dropColumn("employeeUnit");
			t.dropColumn("requastorEmail");
		})
		.dropTable('JournalSentEmail');;
};
