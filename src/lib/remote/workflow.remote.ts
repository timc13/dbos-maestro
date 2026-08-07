import type { WorkflowStatus } from '@dbos-inc/dbos-sdk';
import * as v from 'valibot';

import { command, query } from '$app/server';
import { getDbosClient } from '#lib/server/dbos';
import {
	isDeletableStatus,
	MAX_PAGE_SIZE,
	WORKFLOW_STATUSES,
	type WorkflowStatusName
} from '#lib/workflow-status';
import { error } from '@sveltejs/kit';

export interface WorkflowSummary {
	workflowID: string;
	status: WorkflowStatusName;
	workflowName: string;
	workflowClassName: string;
	queueName?: string;
	scheduleName?: string;
	authenticatedUser?: string;
	applicationVersion?: string;
	executorId?: string;
	createdAt: number;
	updatedAt?: number;
	completedAt?: number;
	dequeuedAt?: number;
	recoveryAttempts?: number;
	priority: number;
	deduplicationID?: string;
	forkedFrom?: string;
	parentWorkflowID?: string;
}

export interface WorkflowPage {
	items: WorkflowSummary[];
	page: number;
	pageSize: number;
	hasMore: boolean;
}

function toSummary(wf: WorkflowStatus): WorkflowSummary {
	return {
		workflowID: wf.workflowID,
		status: wf.status as WorkflowStatusName,
		workflowName: wf.workflowName,
		workflowClassName: wf.workflowClassName,
		queueName: wf.queueName,
		scheduleName: wf.scheduleName,
		authenticatedUser: wf.authenticatedUser,
		applicationVersion: wf.applicationVersion,
		executorId: wf.executorId,
		createdAt: wf.createdAt,
		updatedAt: wf.updatedAt,
		completedAt: wf.completedAt,
		dequeuedAt: wf.dequeuedAt,
		recoveryAttempts: wf.recoveryAttempts,
		priority: wf.priority,
		deduplicationID: wf.deduplicationID,
		forkedFrom: wf.forkedFrom,
		parentWorkflowID: wf.parentWorkflowID
	};
}

// Queries

const ListWorkflowsSchema = v.object({
	page: v.pipe(v.number(), v.integer(), v.minValue(0)),
	pageSize: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(MAX_PAGE_SIZE)),
	status: v.optional(v.pipe(v.array(v.picklist(WORKFLOW_STATUSES)), v.minLength(1))),
	workflowName: v.optional(v.pipe(v.string(), v.trim()))
});
export type ListWorkflowsInput = v.InferOutput<typeof ListWorkflowsSchema>;

export const listWorkflows = query(ListWorkflowsSchema, async (input): Promise<WorkflowPage> => {
	const client = await getDbosClient();
	// Fetch one extra row to detect whether another page exists.
	const workflows = await client.listWorkflows({
		status: input.status,
		workflowName: input.workflowName || undefined,
		limit: input.pageSize + 1,
		offset: input.page * input.pageSize,
		sortDesc: true,
		loadInput: false,
		loadOutput: false
	});
	return {
		items: workflows.slice(0, input.pageSize).map(toSummary),
		page: input.page,
		pageSize: input.pageSize,
		hasMore: workflows.length > input.pageSize
	};
});

// Mutations

const WorkflowIdSchema = v.pipe(v.string(), v.nonEmpty());

export const cancelWorkflow = command(WorkflowIdSchema, async (workflowID) => {
	const client = await getDbosClient();
	await client.cancelWorkflow(workflowID);
});

export const deleteWorkflow = command(WorkflowIdSchema, async (workflowID) => {
	const client = await getDbosClient();
	const workflow = await client.getWorkflow(workflowID);
	if (!workflow) {
		error(404, `Workflow ${workflowID} not found`);
	}
	if (!isDeletableStatus(workflow.status)) {
		error(
			400,
			`Workflow ${workflowID} is ${workflow.status}; only CANCELLED, SUCCESS, or ERROR workflows can be deleted`
		);
	}
	await client.deleteWorkflow(workflowID);
});

const ForkWorkflowSchema = v.object({
	workflowID: WorkflowIdSchema,
	startStep: v.pipe(v.number(), v.integer(), v.minValue(0))
});

export const forkWorkflow = command(ForkWorkflowSchema, async ({ workflowID, startStep }) => {
	const client = await getDbosClient();
	const newWorkflowID = await client.forkWorkflow(workflowID, startStep);
	return { newWorkflowID };
});

// Workflows written in other DBOS languages store their input as a base64-encoded
// JSON blob that the TS SDK's deserializer doesn't recognize, so client.getWorkflow()
// returns it undecoded.
function tryDecodeBase64Json(value: unknown): unknown {
	if (typeof value !== 'string') return value;
	try {
		return JSON.parse(Buffer.from(value, 'base64').toString('utf-8'));
	} catch {
		return value;
	}
}

export const getWorkflowInput = query(WorkflowIdSchema, async (workflowID): Promise<string> => {
	const client = await getDbosClient();
	const workflow = await client.getWorkflow(workflowID);
	if (!workflow) {
		error(404, `Workflow ${workflowID} not found`);
	}
	const input = Array.isArray(workflow.input)
		? workflow.input.map(tryDecodeBase64Json)
		: tryDecodeBase64Json(workflow.input);
	return JSON.stringify(input ?? null, null, 2);
});
