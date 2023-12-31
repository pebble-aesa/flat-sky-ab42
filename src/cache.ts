import { Env } from './index';

export default class Cache {
	private headers: { [key: string]: string };

	public constructor(private env: Env) {
		this.headers = {
			Authorization: `Bearer ${this.env.UPSTASH_REDIS_REST_TOKEN}`,
		};
	}

	public async set(key: string, value: string) {
		await fetch(`${this.env.UPSTASH_REDIS_REST_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`, {
			headers: this.headers,
		});
	}

	public async get(key: string): Promise<any> {
		const response = await fetch(`${this.env.UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(key)}`, {
			headers: this.headers,
		});

		return ((await response.json()) as any).result;
	}

	public async del(key: string) {
		await fetch(`${this.env.UPSTASH_REDIS_REST_URL}/del/${encodeURIComponent(key)}`, {
			headers: this.headers,
		});
	}

	public async expire(key: string, seconds: number) {
		await fetch(`${this.env.UPSTASH_REDIS_REST_URL}/expire/${encodeURIComponent(key)}/${encodeURIComponent(seconds)}`, {
			headers: this.headers,
		});
	}
}
