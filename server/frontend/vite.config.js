
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';


// https://vite.dev/config/
export default defineConfig({
	plugins: [tailwindcss(), react()],
	resolve: {
		alias: {
			'@bs': path.resolve(__dirname, '../../bs'),
		},
	},
	server: {
		fs: {
			// ALLOWS ACCESS TO DIRECTORIES OUTSIDE /server/frontend/
			allow: [
				'..', // enables access to the parent directory
				path.resolve(__dirname, '../../bs'),
			],
		},
	},
})
