# Riox Gateway

The gateway provides the single entry point to access Riox from the outside world.

The gateway currently provides three main features:

1. **reverse proxy**: map frontend requests to backend requests
1. **access control**: block unauthenticated requests 
1. **error page**: display an information page to the user if the backend is not operational

## Implementation

The gateway implementation is based on `openresty`/`nginx`. We use https://github.com/rstudio/redx which is an extension to `openresty`, using Lua language extensions, to dynamically load gateway rules for the reverse proxy functionality.

## Reverse Proxy

The gateway rules define a **mapping** from **frontend requests** (arriving at the gateway) to **backend requests** (forwarded to our services). Redx stores the mapping rules in *Redis*, and the rules can be accessed via an API (port 8082) which is only accessible from within our infrastructure.

To manage the gateway rules in Riox, we use our `gateway-service` microservice. It contains all necessary mapping rules for different users and tenants. The `gateway-service` is responsible for applying all rules to Redx via the API on gateway port 8082. That is, **the `gateway-service` is our "single source of truth"** and as a developer you should manage the rules there, never access the gateway port 8082  directly.

## Access Control

In addition to reverse proxying, the gateway is responsible for basic access control. In particular, we want to ensure that random requests from spam bots are not forwarded to our services. We achieve this by checking whether there is a **valid JWT authorization token** in any request to `/api/...`. This is achieved using the following Lua code in `nginx.conf`:

```
local token = headers["authorization"]
if token then
	token = token:gsub("Bearer ", "", 1)
	local key = "riox-secret"
	local ok, err = require("luajwt").decode(token, key)
	if not ok then
		ngx.log(0, "Invalid authentication.")
		return ngx.exit(ngx.HTTP_UNAUTHORIZED)
	end
else
	return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end
```

Importantly, there are **two exceptions** which we need to take care of. We do **not** require a valid JWT token for two types of requests:
* **Sign in**: requests to `/api/v1/users/auth/local`
* **Sign up**: `POST` requests to `/api/v1/users`

In summary, we use the following expression in `nginx.conf` to decide whether to check the authentication token for an incoming request:

```
local check_auth =
	ngx.var.uri:match("^/api/") and 												-- require auth token for /api/....
	not (
		ngx.var.uri:match("^/api/v1/users/auth/local") or 							-- no auth token for login
		(ngx.var.uri:match("^/api/v1/users") and ngx.req.get_method() == "POST")	-- no auth token for signup
	)
```

### Performance

The JWT token check is a *very fast* operation, Lua uses just-in-time compilation for high performance. Our tests have shown that checking the JWT token slows down the gateway by only an insignificant fraction (in the order of 995 req./sec versus 1000 req./sec without token checks). Yet, a detailed performance evaluation is still missing.

## Error Page

If the gateway determines that requests cannot be forwarded because parts of the backend are not operational (e.g., if Redis becomes unavailable), an HTTP `502 Bad Gateway` error is raised. In this case we display a nice error page, informing the user that we are working on the issue etc. The 502 error handler is defined in `nginx.conf` and the HTML code for the error page is maintained in our fork of Redx: https://github.com/whummer/redx . Keeping it there has the advantage that we can easily share the same error page for production and local dev. mode with our local nginx/openresty installations.

## Notes, TODOs

### Rebuilding the gateway on changes:

We distinguish "reverse proxy" (RP) and "access control" (AC) functionality. 
* For RP, it is not necessary to re-build the gateway image in case of changes. In particular, if the gateway mapping rules are changed in the `pipes-service`, they are fed into the Redx API and stored in Redis. The gateway automatically picks up the new rules (after a short caching timeout).
* For AC, it is sometimes necessary to build a new version of the gateway image. The reason is that the AC functionality (JWT token checks) is directly baked into the gateway image without depending on any external service, to achieve fast performance. However, we can anticipate that the basic AC logic should hardly ever change, so it should not be a big issue.

### User Limits, Statistics, Throttling:

TODO for the future: 
* **user limits**: we may want to enforce user limits (e.g., number of data points pushed into a pipeline) directly at the gateway. TBD.
* **statistics**: collect statistics of all API calls, possibly on a per-user basis
* **throttling**: there is decent support for throttling in nginx, should be easy to integrate