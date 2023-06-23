import {z} from 'zod';

export const folderSchema = z.object({
    name: z.string().max(20)
});