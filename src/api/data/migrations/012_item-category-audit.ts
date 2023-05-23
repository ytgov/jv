import * as knex from 'knex';

export const up = function (knex: knex.Knex, Promise: any) {
	return knex.schema
		.createTable('ItemCategoryAudit', function (t) {
			t.increments('auditID').notNullable().primary();

			t.integer("itemCatID").unsigned().notNullable();
			t.foreign("itemCatID").references("itemCatID").inTable("ItemCategory").onDelete("CASCADE");
			
			t.dateTime('date');
			t.string('user', 200).notNullable();
			t.string('action', 255).notNullable();
		})
		.alterTable("Recovery", function (t) {
			t.string("mailcode", 50);
			t.string("employeeBranch", 100);
			t.string("description", 255);			
		})
		.alterTable("JournalVoucher", function (t) {
			t.date("jvDate");
			t.string("fiscalYear", 10);
			t.string("description", 255);
			t.string("orgDepartment", 100);
			t.string("odCompletedBy", 100);
			t.string("recvDepartment", 100);
			t.string("rdCompletedBy", 100);
			t.string("explanation", 200); 
		});
};

export const down = function (knex: knex.Knex, Promise: any) {
	return knex.schema
		.alterTable("JournalVoucher", function (t) {
			t.dropColumn("jvDate");
			t.dropColumn("fiscalYear");
			t.dropColumn("description");
			t.dropColumn("orgDepartment");
			t.dropColumn("odCompletedBy");
			t.dropColumn("recvDepartment");
			t.dropColumn("rdCompletedBy");
			t.dropColumn("explanation"); 
		})
		.alterTable("Recovery", function (t) {
			t.dropColumn("employeeBranch");			
			t.dropColumn("mailcode");
			t.dropColumn("description");
		})
		.dropTable('ItemCategoryAudit');
};
