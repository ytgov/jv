import express, { Request, Response } from 'express';
import { ReturnValidationErrors, RequiresRoleAdmin } from '../middleware';
import { DB_CONFIG } from '../config';
import knex from 'knex';
import { UserService } from '../services';
import { v4 as uuid } from 'uuid';
import { auth } from 'express-openid-connect';

const db = knex(DB_CONFIG);

export const administrationRouter = express.Router();
const userService = new UserService();

//get item categories
administrationRouter.get(
	'/itemcategories',
	ReturnValidationErrors,
	async function (req: Request, res: Response) {
		try {
			let itemcategories = await db('ItemCategory').select('*');
			res.status(200).json({ data: itemcategories });
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);

//add item category
administrationRouter.post(
	'/itemcategories',
	ReturnValidationErrors,
	RequiresRoleAdmin,
	async function (req: Request, res: Response) {
		try {
			let itemcategory = await db('ItemCategory').insert({
				category: req.body.category,
			});
			res.status(200).json({ data: itemcategory });
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);

//update item category
administrationRouter.put(
	'/itemcategories/:id',
	ReturnValidationErrors,
	RequiresRoleAdmin,
	async function (req: Request, res: Response) {
		try {
			let itemcategory = await db('ItemCategory')
				.where('id', req.params.id)
				.update({
					category: req.body.category,
				});
			res.status(200).json({ data: itemcategory });
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);

//delete item category
administrationRouter.delete(
	'/itemcategories/:id',
	ReturnValidationErrors,
	RequiresRoleAdmin,
	async function (req: Request, res: Response) {
		try {
			let itemcategory = await db('ItemCategory')
				.where('id', req.params.id)
				.del();
			res.status(200).json({ data: itemcategory });
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);
