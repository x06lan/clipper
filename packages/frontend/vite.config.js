import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			"/api/ipfs/add": {
				target: "http://api.ipfs.x06lan.com/api/v0/add",
				changeOrigin: true,
				rewrite: path => path.replace(/^\/api\/ipfs\/add/, "")
			},
			"/api/ipfs/get":
			{
				target: "https://ipfs.x06lan.com/ipfs/",
				changeOrigin: true,
				rewrite: path => path.replace(/^\/api\/ipfs\/get/, "")
			}

		}
	}
});
