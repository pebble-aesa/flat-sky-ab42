import { Ai } from '@cloudflare/ai';
import Cache from './cache';
import { items } from './util';
import Data from './data';

export interface Env {
	AI: any;
	UPSTASH_REDIS_REST_URL: string;
	UPSTASH_REDIS_REST_TOKEN: string;
}

const prompt = async (item: string) =>
	`Provide an analysis for ${item === 'cpi' ? 'Consumer Price Index' : item}. (ticker ${
		items[item as keyof typeof items]
	}}. The given data is not of a companies, but of a basket to help consumers analyze overall conditions. Give an analysis tailored towards a layperson, telling them what they need to know for personal finances. The date is ${new Date()}. Keep your response short. Do not explain terms at all. Jump straight into analysis. This is the last year of data: ${(await new Data().get(items[item as keyof typeof items], 'M'))
		.slice(0, 12)
		.map((x, i) => `${i} months ago\n$${x.close} at end of month\n$${x.min} min and $${x.max} max during month`)
		.join('\n\n')}`;

export default {
	async fetch(request: Request, env: Env, ctx: any) {
		const path = new URL(request.url).pathname;
		const params = new URL(request.url).searchParams;
		const item = (params.get('item') ?? '').toLowerCase();
		const cache = new Cache(env);

		if (!Object.keys(items).includes(item)) {
			return new Response('Invalid item', { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
		}

		if (path === '/cached') {
			const cache = new Cache(env);
			const cached = await cache.get(item);

			return new Response(
				JSON.stringify({
					cached: !!cached,
				}),
				{
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				}
			);
		} else if (path === '/ai') {
			const streamed = params.has('streamed');

			if (streamed) {
				const ai = new Ai(env.AI, { sessionOptions: { ctx } });

				const stream: ReadableStream = await ai.run('@cf/mistral/mistral-7b-instruct-v0.1', {
					prompt: await prompt(item),
					stream: true,
				});

				return new Response(stream, {
					headers: {
						'Content-Type': 'text/event-stream',
						'Access-Control-Allow-Origin': '*',
					},
				});
			}

			const nocache = params.has('nocache');

			if (!nocache) {
				const cached = await cache.get(item);

				if (cached) {
					return new Response(
						JSON.stringify({
							cached: true,
							response: cached,
						}),
						{
							headers: {
								'Content-Type': 'application/json',
								'Access-Control-Allow-Origin': '*',
							},
						}
					);
				}
			}

			const ai = new Ai(env.AI, { sessionOptions: { ctx } });

			const { response } = await ai.run('@cf/mistral/mistral-7b-instruct-v0.1', {
				prompt: await prompt(item),
			});

			await cache.set(item, response);
			await cache.expire(item, 1 * 60 * 60 * 24 * 7);

			return new Response(
				JSON.stringify({
					cached: false,
					response,
				}),
				{
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				}
			);
		} else if (path === '/cache') {
			const value = params.get('value');

			if (!value) {
				return new Response('Invalid value', { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
			}

			await cache.set(item, value);
			await cache.expire(item, 1 * 60 * 60 * 24 * 7);

			return new Response('OK', { headers: { 'Access-Control-Allow-Origin': '*' } });
		} else {
			return new Response('Not found', { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } });
		}
	},
};
