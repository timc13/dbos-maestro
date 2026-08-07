import * as v from 'valibot';

import { command, query } from '$app/server';
import { getDbosClient } from '#lib/server/dbos';

export interface ScheduleSummary {
	scheduleId: string;
	scheduleName: string;
	workflowName: string;
	workflowClassName: string;
	schedule: string;
	status: string;
	lastFiredAt: string | null;
	automaticBackfill: boolean;
	cronTimezone: string | null;
	queueName: string | null;
}

// Queries

export const listSchedules = query(async (): Promise<ScheduleSummary[]> => {
	const client = await getDbosClient();
	const schedules = await client.listSchedules();
	return schedules.map((s) => ({
		scheduleId: s.scheduleId,
		scheduleName: s.scheduleName,
		workflowName: s.workflowName,
		workflowClassName: s.workflowClassName,
		schedule: s.schedule,
		status: s.status,
		lastFiredAt: s.lastFiredAt,
		automaticBackfill: s.automaticBackfill,
		cronTimezone: s.cronTimezone,
		queueName: s.queueName
	}));
});

// Mutations

const ScheduleNameSchema = v.pipe(v.string(), v.nonEmpty());

export const deleteSchedule = command(ScheduleNameSchema, async (name) => {
	const client = await getDbosClient();
	await client.deleteSchedule(name);
	void listSchedules().refresh();
});
