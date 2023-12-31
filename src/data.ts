export default class Data {
	public async get(symbol: string, timeframe: 'D' | 'W' | 'M'): Promise<SymbolData[]> {
		return ((await (await fetch(`https://aesa-finance-backend.deno.dev/data/${symbol}/${timeframe}`)).json()) as [string: SymbolData[]])[
			symbol as any
		]!;
	}
}

export interface SymbolData {
	time: number;
	open: number;
	close: number;
	max: number;
	min: number;
	volume: number;
}
