export * from './user-service';
export interface QueryStatement {
	field: string;
	operator: string;
	value: any;
}

export interface SortStatement {
	field: string;
	direction: SortDirection;
}

export enum SortDirection {
	ASCENDING = 'asc',
	DESCENDING = 'desc',
}
