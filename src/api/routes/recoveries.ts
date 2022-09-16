import express, { Request, Response } from 'express';
import { ReturnValidationErrors } from '../middleware';
import { DB_CONFIG } from '../config';
import knex from 'knex';
import { UserService } from '../services';
import { v4 as uuid } from 'uuid';
import { auth } from 'express-openid-connect';

const db = knex(DB_CONFIG);

export const formRouter = express.Router();
const userService = new UserService();

//Need to get items as well
formRouter.get(
	'/',
	ReturnValidationErrors,
	async function (req: Request, res: Response) {
		try {
			let recovery = await db('Recovery').select('*');
			//get items from db for each recovery
			for (let i = 0; i < recovery.length; i++) {
				let recovery[i].items = await db('Item')
					.select('*')
					.where('recid', recovery[i].recid);
			}

			res.status(200).json({ data: recovery });
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);

formRouter.get(
	'/:recid',
	ReturnValidationErrors,
	async function (req: Request, res: Response) {
		try {
			let recovery = await db('Recovery')
				.select('*')
				.where('recid', req.params.recid).first();

			recovery.items = await db('Item')
				.select('*')
				.where('recid', recovery.recid);

			res.status(200).json({ data: recovery });
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);

formRouter.post(
	'/',
	ReturnValidationErrors,
	async function (req: Request, res: Response) {
		try {
			await db.transaction(async (trx) => {
				let items = req.body.items;
				delete req.body.items;
				let recovery = await db('Recovery')
					.insert(req.body)
					.returning('recid')
					.transacting(trx);

				for (let index = 0; index < items.length; index++) {
					items[index].recid = recovery[0];
					await db('Items').insert(items[index]).transacting(trx);
				}
			});
			res.status(200).json({ data: 'Recovery created' });
		} catch (error: any) {
			console.log(error);
			res.status(500).json({ Message: 'Insert failed', Error: error });
		}
	}
);

formRouter.put(
	'/:recid',
	ReturnValidationErrors,
	async function (req: Request, res: Response) {
		try {
			await db.transaction(async (trx) => {
				let items = req.body.items;
				delete req.body.items;
				let recovery = await db('Recovery')
					.update(req.body)
					.where('Recovery.recid', req.params.recid)
					.returning('recid')
					.transacting(trx);

				await db('Items')
					.delete()
					.where('recid', '=', recovery[0].recid)
					.transacting(trx);

				for (let index = 0; index < items.length; index++) {
					await db('Items').insert(items[index]).transacting(trx);
				}
			});
			res.status(200).json({ data: 'Recovery created' });
		} catch (error: any) {
			console.log(error);
			res.status(500).json({ Message: 'Insert failed', Error: error });
		}
	}
);