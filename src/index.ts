import { Ai } from '@cloudflare/ai';

export interface Env {
	// If you set another name in wrangler.toml as the value for 'binding',
	// replace "AI" with the variable name you defined.
	AI: any;
}

export default {
	async fetch(request: Request, env: Env) {
		const prompt = new URL(request.url).searchParams.get('prompt') ?? '';
		const ai = new Ai(env.AI);

		const response = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
			prompt,
		});

		return new Response(JSON.stringify(response));
	},
};
