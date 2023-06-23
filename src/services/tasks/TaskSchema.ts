import {z} from 'zod';

import { subtaskSchema, subtaskUpdateSchema } from './SubTaskSchema';

const taskFolderId = z.number().optional().refine(async (val) => {
    // TODO: Need to change this
    return val != null;
}, {
    message: "Folder does not exist"
});

const taskProps = {
    content: z.string().max(100),
    deadline: z.date(),
    completed: z.boolean()
}

const taskSchema = z.object({
    folder_id: taskFolderId,
    subtasks: z.array(subtaskSchema),
    ...taskProps,
}).strip();

const taskUpdateSchema = z.object({
    ...taskProps
}).partial();

export {taskSchema, taskUpdateSchema};

export type taskPayload = z.infer<typeof taskSchema>
export type taskUpdatePayload = z.infer<typeof taskUpdateSchema>
