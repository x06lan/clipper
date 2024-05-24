import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    const form = await request.formData();
    const files = form.getAll('files');

    // Ensure the uploads directory exists
    const uploadDir = 'static/uploads';
    if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
    }

    try {
        const urls = [];

        for (const file of files) {
            const filePath = join(uploadDir, file.name);
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Save the file to the local directory
            writeFileSync(filePath, buffer);

            // Add file URL to the list
            urls.push(`/uploads/${file.name}`);
        }

        return json({ urls }, { status: 201 })
    } catch (error) {
        console.error('Error saving files:', error);

        return new Response(null, {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Error saving files' })
        });
    }
}
