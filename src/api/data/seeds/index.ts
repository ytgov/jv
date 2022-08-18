import { sqldb } from '..';

export async function seedUp() {
	console.log('Seeding');

	await sqldb('user').delete().whereRaw('1=1');
	await sqldb('user').insert([
		{
			email: 'diedre.davidson@gov.yk.ca',
			first_name: 'Diedre',
			last_name: 'Davidson',
			mailcode: '111222',
			status: 'Active',
			roles: '',
			create_date: '2021-08-01',
		},
		{
			email: 'michael@icefoganalytics.com',
			first_name: 'Michael',
			last_name: 'Johnson',
			mailcode: '111222',
			status: 'Active',
			roles: '',
			create_date: '2021-08-01',
		},
	]);
}
