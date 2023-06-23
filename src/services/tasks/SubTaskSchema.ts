import {z} from 'zod';

const subtaskProps = {
    content: z.string().max(100),
    completed: z.boolean()
}

const subtaskSchema = z.object(subtaskProps).strip();
const subtaskUpdateSchema = z.object(subtaskProps).partial();

export {subtaskSchema, subtaskUpdateSchema}
export type subtaskPayload = z.infer<typeof subtaskSchema>
export type subtaskUpdatePayload = z.infer<typeof subtaskUpdateSchema> 