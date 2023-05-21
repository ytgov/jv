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
			t.string("description");			
		});
};

exports.down = function (knex: knex.Knex, Promise: any) {
	return knex.schema
		.alterTable("ItemCategory", function (t) {			
			t.dropColumn("description");
		})
		.dropTable('ItemCategoryDocs');
};
