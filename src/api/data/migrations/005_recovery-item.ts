import * as knex from "knex";

export const up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("RecoveryItem", function (t) {
    t.increments("itemID").notNullable().primary();    
    
    t.integer("recoveryID").unsigned().notNullable();
    t.foreign("recoveryID").references("recoveryID").inTable("Recovery").onDelete("CASCADE");    
    
    t.integer("itemCatID").unsigned().notNullable();
    t.foreign("itemCatID").references("itemCatID").inTable("ItemCategory").onDelete("CASCADE");
    
    t.string("description", 140);
    t.integer("quantity").notNullable();
    t.float("unitPrice").notNullable();
    t.float("totalPrice");
    
    t.boolean("orderFilled");
    t.string("filledBy", 100);
    t.string("clientChange");

  });
};

export const down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("RecoveryItem");
};
