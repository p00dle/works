// @works-lock-file:false

import type { DatabasePoolType } from 'slonik';

import { sql, DataIntegrityError } from 'works';

interface ReadUserByUsernameQuery {
	managerId: string;
  username: string;
}

/** @internal */
export function isManagerOfFactory(pool: DatabasePoolType) {
  return async (query: ReadUserByUsernameQuery): Promise<boolean> => {
		try {
			await pool.one<any>(sql`
				WITH RECURSIVE "managers" AS (
					SELECT "managerId"
					FROM "users"
					WHERE "username" = ${query.username}
					UNION ALL
					SELECT "users"."managerId"
					FROM "users"
						INNER JOIN "managers" ON "managers"."managerId" = "users"."username"
				) 
				SELECT *
				FROM "managers"
				WHERE "managers"."managerId" = ${query.managerId}`
    	);
			return true;
		} catch (error) {
			if (error instanceof DataIntegrityError) {
				return false;
			} else {
				throw error;
			}
		}
  }
}