import { z } from 'zod';

export const formSchema = z.object({
    // collection: z.string().min(1),
    nftName: z.string().min(1),
    // supply: z.number().min(1),
    description: z.string().optional(),
    externalLink: z.string().url().optional(),
});
