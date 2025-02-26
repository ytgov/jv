import * as knex from 'knex';

export const up = function (knex: knex.Knex, Promise: any) {
	return knex.schema
		.alterTable('DepartmentInfo', function (t) {			
			t.string('ictBranch', 250);		
			t.string('ictUnit', 250);			
		})
		.alterTable("Recovery", function (t) {
			t.string("glCode", 50);			
		});
};

export const down = function (knex: knex.Knex, Promise: any) {
	return knex.schema
		.alterTable('DepartmentInfo', function (t) {
			t.dropColumn('ictBranch');
			t.dropColumn('ictUnit');
		})
		.alterTable("Recovery", function (t) {			
			t.dropColumn("glCode");			
		});
};
