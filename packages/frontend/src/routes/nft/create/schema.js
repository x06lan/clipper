import { z } from 'zod';

export const formSchema = z.object({
    nftName: z.string().min(1),
    description: z.string().optional(),
    externalLink: z.string().url().optional(),
    clips: z.array(z.object({
        name: z.string().min(1),
        url: z.string().url(),
    })),
    thumbnail: z.string().url(),
});
