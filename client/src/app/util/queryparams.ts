// Get the query parameters (the ?foo=bar&bar=foo in the URL)
const QUERY_PARAMS = new Map<string, string>(window.location.search
    .slice(1)
    .split('&')
    .map(s => s.split('=', 2)
        .map(s2 => decodeURIComponent(s2)) as [string, string])
);

// Prevent accidental alteration of the parameters
QUERY_PARAMS.set = (key, value) => { throw new Error(`Cannot set ${key}=${value} in frozen map`); };
QUERY_PARAMS.delete = (key) => { throw new Error(`Cannot delete ${key} in frozen map`); };
QUERY_PARAMS.clear = () => { throw new Error(`Cannot clear frozen map`); };
Object.freeze(QUERY_PARAMS);

// Export the query params now that we have computed them... should this be another package?
export function getQueryParamsMap(): Map<string, string> {
    return QUERY_PARAMS;
}
