import { z } from 'zod';

export const URLSchema = z.object({
    url: z
        .string({ message: 'URL is required.' })
        .url({ message: 'Invalid URL' })
        .max(100, { message: 'URL is too long.'}),
});