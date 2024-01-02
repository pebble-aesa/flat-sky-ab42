import { Ai } from '@cloudflare/ai';
import Cache from './cache';
import { items } from './util';
import Data from './data';

export interface Env {
	AI: any;
	UPSTASH_REDIS_REST_URL: string;
	UPSTASH_REDIS_REST_TOKEN: string;
}

export default {
	async fetch(request: Request, env: Env) {
		const params = new URL(request.url).searchParams;
		const item = (params.get('item') ?? '').toLowerCase();
		const nocache = params.has('nocache');
		const cache = new Cache(env);
		const data = new Data();

		if (!Object.keys(items).includes(item)) {
			return new Response('Invalid item', { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
		}

		if (!nocache) {
			const cached = await cache.get(item);

			if (cached) {
				return new Response(cached, { headers: { 'Access-Control-Allow-Origin': '*' } });
			}
		}

		const ai = new Ai(env.AI);

		const prompt = `Provide an analysis for ${item === 'cpi' ? 'Consumer Price Index' : item}. This is the last year of data: ${(await data.get(items[item as keyof typeof items], 'M'))
			.slice(0, 12)
			.map((x, i) => `${i} months ago\n$${x.close} at end of month\n$${x.min} min and $${x.max} max during month`)
			.join('\n\n')}`;

		const { response } = await ai.run('@cf/mistral/mistral-7b-instruct-v0.1', {
			prompt,
		});

		await cache.set(item, response);
		await cache.expire(item, 1 * 60 * 60 * 24 * 7);

		return new Response(response, { headers: { 'Access-Control-Allow-Origin': '*' } });
	},
};
