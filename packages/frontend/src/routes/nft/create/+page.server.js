import { superValidate } from 'sveltekit-superforms/server';
import { formSchema } from './schema';
import { zod } from "sveltekit-superforms/adapters";

export const load = async () => {
    return {
        form: await superValidate(zod(formSchema)),
    };
};
