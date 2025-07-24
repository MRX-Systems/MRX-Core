import { describe, expect, test } from 'bun:test';
import Elysia from 'elysia';

import { microservicePlugin } from '#/modules/elysia/microservicePlugin/microservice';
import { author, description, name, version } from '#/root/package.json';

describe('Microservice Plugin', () => {
	const app = new Elysia().use(microservicePlugin);

	test('ping - should return pong with correct status', async () => {
		const response = await app.handle(new Request('http://localhost/microservice/ping'));
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json).toEqual({
			message: 'pong'
		});
	});

	test('info - should return microservice information', async () => {
		const response = await app.handle(new Request('http://localhost/microservice/info'));
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json).toEqual({
			message: 'Microservice Information',
			content: {
				author,
				description,
				name,
				version
			}
		});
	});

	test('should return 404 for non-existent endpoints', async () => {
		const response = await app.handle(new Request('http://localhost/microservice/nonexistent'));

		expect(response.status).toBe(404);
	});

	test('should handle different HTTP methods on ping endpoint', async () => {
		// POST should return 404 (method not found)
		const postResponse = await app.handle(new Request('http://localhost/microservice/ping', {
			method: 'POST'
		}));

		expect(postResponse.status).toBe(404);
	});

	test('should have correct content-type headers', async () => {
		const response = await app.handle(new Request('http://localhost/microservice/ping'));

		expect(response.headers.get('content-type')).toContain('application/json');
	});

	describe('Package.json validation', () => {
		test('info endpoint should have all required package.json fields', async () => {
			const response = await app.handle(new Request('http://localhost/microservice/info'));
			const json = await response.json() as { content: { name: string; version: string; description: string; author: string } };

			expect(json.content.name).toBeDefined();
			expect(json.content.version).toBeDefined();
			expect(json.content.description).toBeDefined();
			expect(json.content.author).toBeDefined();

			// Validate types
			expect(typeof json.content.name).toBe('string');
			expect(typeof json.content.version).toBe('string');
			expect(typeof json.content.description).toBe('string');
		});
	});
});
