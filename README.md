# flat-sky-ab42

Cloudflare AI worker for Aesa's Pebble Winter Hackathon submission.

## Documentation

All responses are cached in an [Upstash](https://upstash.com/) Redis database (N. California region). Cached data automatically expires a week after it is created.

### `GET /cached?item={item}`

`item` must be one of: `housing`, `cpi`, `inflation`, `food`, `energy`, `gasoline`, `apparel`, `airline`, `vehicles`, `medical`, `rent`. If `item` is not present or is not one of the listed values, the request will return a 400 error.

Returns a JSON object with the following fields:

- `cached`: `true` if the cache is populated, `false` otherwise

### `GET /ai?item={item}&nocache&streamed`

`item` must be one of: `housing`, `cpi`, `inflation`, `food`, `energy`, `gasoline`, `apparel`, `airline`, `vehicles`, `medical`, `rent`. If `item` is not present or is not one of the listed values, the request will return a 400 error.

`nocache` is an optional query parameter that, if present, will cause the request to bypass the cache.

`streamed` is an optional query parameter that, if present, will cause the response to be streamed to the client instead of being returned all at once.

Response if not streamed:

- `cached`: `true` if `response` was retrieved from cache, `false` otherwise
- `response`: string containing the response

Response if streamed: events are sent as JSON objects (`text/event-stream` content type) with the following fields:

- `response`: string containing the next chunk (usually a word) of the response

### `GET /cache?item={item}&value={value}`

`item` must be one of: `housing`, `cpi`, `inflation`, `food`, `energy`, `gasoline`, `apparel`, `airline`, `vehicles`, `medical`, `rent`. If `item` is not present or is not one of the listed values, the request will return a 400 error.

`value` must be a string containing the value to cache.
