import { z } from "zod";

export const CreateIndexRequestSchema = z.object({
    index_command: z
        .string({ message: 'Index command is required.' })
        .min(5, { message: 'Index command must be at least 5 characters long.' })
        .max(300, { message: 'Index command must be at most 300 characters long.' }),
});