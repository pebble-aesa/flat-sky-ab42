# flat-sky-ab42

Cloudflare AI worker for Aesa's Pebble Winter Hackathon submission.

## Documentation

All responses are cached in an [Upstash](https://upstash.com/) Redis database (N. California region). Cached data automatically expires a week after it is created.

### `GET /?item={item}&nocache`

`item` must be one of: `housing`, `cpi`, `inflation`, `food`, `energy`, `gasoline`, `apparel`, `airline`, `vehicles`, `medical`, `rent`. If `item` is not present or is not one of the listed values, the request will return a 400 error.

`nocache` is an optional query parameter that, if present, will cause the request to bypass the cache.

Returns a plaintext response with the LLM's analysis.
