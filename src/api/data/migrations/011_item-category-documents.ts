import * as knex from 'knex';

exports.up = function (knex: knex.Knex, Promise: any) {
	return knex.schema
		.createTable('ItemCategoryDocs', function (t) {
			t.increments('documentID').notNullable().primary();
			
			t.integer("itemCatID").unsigned().notNullable();
			t.foreign("itemCatID").references("itemCatID").inTable("ItemCategory").onDelete("CASCADE");
			
			t.string("docName", 255);
			t.binary('document');		
		})
		.alterTable("ItemCategory", function (t) {
			t.string("description", 255);
			t.boolean("changeQuantity");
		})
		.alterTable("user", function (t) {
			t.string("unit", 100);
			t.string("employeeBranch", 100);				
		});
};

exports.down = function (knex: knex.Knex, Promise: any) {
	return knex.schema
		.alterTable("user", function (t) {
			t.dropColumn("unit");
			t.dropColumn("employeeBranch");
		})
		.alterTable("ItemCategory", function (t) {			
			t.dropColumn("description");
			t.dropColumn("changeQuantity");
		})
		.dropTable('ItemCategoryDocs');
};
