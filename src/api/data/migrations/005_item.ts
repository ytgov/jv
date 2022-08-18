import * as knex from 'knex';

// create table Recoveries.Item(
//     itemId smallint identity (1,1) primary key,
//     recid smallint not null,
//     itemCatID smallint not null,
//     Description varchar(140),
//     Quantity smallint not null,
//     UnitPrice smallint not null,
//     OrigCost smallint not null,
//     OrigQuant smallint not null,
//     OrderStatus small in not null,
//     StatusChangeDate date,
//     StatusNote varchar (140),
//     StatusChangeUser varchar (10),
//     FOREIGN KEY (recid) REFERENCES Recoveries.Recovery(recid),
//     )

export const up = function (knex: knex.Knex, Promise: any) {
	return knex.schema.createTable('Item', function (t) {
		t.increments('itemId').notNullable().primary();
		t.integer('recid').notNullable();
		t.integer('itemCatID').notNullable();
		t.string('Description', 140).nullable();
		t.integer('Quantity').notNullable();
		t.integer('UnitPrice').notNullable();
		t.integer('OrigCost').notNullable();
		t.integer('OrigQuant').notNullable();
		t.integer('OrderStatus').notNullable();
		t.date('StatusChangeDate').nullable();
		t.string('StatusNote', 140).nullable();
		t.string('StatusChangeUser', 10).nullable();
		t.foreign('recid').references('Recovery.id');
	});
};

export const down = function (knex: knex.Knex, Promise: any) {
	return knex.schema.dropTable('Item');
};
