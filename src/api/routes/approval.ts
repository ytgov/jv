import express, { Request, Response } from 'express';
import { ReturnValidationErrors } from '../middleware';
import { DB_CONFIG } from '../config';
import knex from 'knex';
import { UserService } from '../services';
import { v4 as uuid } from 'uuid';
import { auth } from 'express-openid-connect';

const db = knex(DB_CONFIG);

export const approvalRouter = express.Router();
const userService = new UserService();

//get approval of recovery
approvalRouter.get(
	'/:recid',
	ReturnValidationErrors,
	async function (req: Request, res: Response) {
		try {
			let approval = await db('RecApproval')
				.select('*')
				.where('recid', req.params.recid)
				.first();

			res.status(200).json({ data: approval });
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);

//create approval of recovery
approvalRouter.post(
	'/',
	ReturnValidationErrors,
	async function (req: Request, res: Response) {
		try {
			let approval = await db('RecApproval').insert({
				recid: req.body.recid,
				status: req.body.status,
				approveuser: req.body.approveuser,
				approveDate: req.body.approveDate,
				approveNote: req.body.approveNote,
				reassignNote: req.body.reassignNote,
				action: req.body.action,
			});
			res.status(200).json({ data: approval });
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);

//update approval of recovery
approvalRouter.put(
	'/:recid',
	ReturnValidationErrors,
	async function (req: Request, res: Response) {
		try {
			let approval = await db('RecApproval')
				.where('recid', req.params.recid)
				.update({
					status: req.body.status,
					approveuser: req.body.approveuser,
					approveDate: req.body.approveDate,
					approveNote: req.body.approveNote,
					reassignNote: req.body.reassignNote,
					action: req.body.action,
				});
			res.status(200).json({ data: approval });
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);

//delete approval of recovery
approvalRouter.delete(
	'/:recid',
	ReturnValidationErrors,
	async function (req: Request, res: Response) {
		try {
			let approval = await db('RecApproval')
				.where('recid', req.params.recid)
				.del();
			res.status(200).json({ data: approval });
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);
