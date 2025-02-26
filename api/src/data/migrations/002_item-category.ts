import * as knex from 'knex';

export const up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('ItemCategory', function (t) {
		t.increments('itemCatID').notNullable().primary();
		t.string('category', 60).notNullable();
		t.string('branch', 150);
		t.string('unit', 150);		
		t.float("price");
		t.date('createDate').notNullable().defaultTo(knex.fn.now());
		t.string('createUser', 100);
		t.date('modDate').notNullable().defaultTo(knex.fn.now());
		t.string('modUser', 100);
		t.boolean('active').notNullable().defaultTo(true);
	});
};

export const down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('ItemCategory');
};
