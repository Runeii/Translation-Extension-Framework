const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
	"Access-Control-Max-Age": "86400",
}

const USER_AGENTS = [
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36", // 13.5%
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36", // 6.6%
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0", // 6.4%
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0", // 6.2%
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36", // 5.2%
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.55 Safari/537.36" // 4.8%
];

// TKK_TOKEN From Chrome source: https://translate.googleapis.com/translate_a/element.js

function Ap(a, b) { for (var c = 0; c < b.length - 2; c += 3) { var d = b.charAt(c + 2); d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d); d = "+" == b.charAt(c + 1) ? a >>> d : a << d; a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d } return a }
function generateTk(a, b) {
	var c = b.split(".");
	b = Number(c[0]) || 0;
	for (var d = [], e = 0, f = 0; f < a.length; f++) {
		var h = a.charCodeAt(f);
		128 > h ? d[e++] = h : (2048 > h ? d[e++] = h >> 6 | 192 : (55296 == (h & 64512) && f + 1 < a.length && 56320 == (a.charCodeAt(f + 1) & 64512) ? (h = 65536 + ((h & 1023) << 10) + (a.charCodeAt(++f) & 1023), d[e++] = h >> 18 | 240, d[e++] = h >> 12 & 63 | 128) : d[e++] = h >> 12 | 224, d[e++] = h >> 6 & 63 | 128), d[e++] = h & 63 | 128)
	}
	a = b;
	for (e = 0; e < d.length; e++) a += d[e], a = Ap(a, "+-a^+6");
	a = Ap(a, "+-3^+b+-f");
	a ^= Number(c[1]) || 0;
	0 > a && (a = (a & 2147483647) + 2147483648);
	c = a % 1E6;
	return c.toString() +
		"." + (c ^ b)
}

const regexExecAll = (str, regex) => {
	let lastMatch = null;
	const matches = [];

	while ((lastMatch = regex.exec(str))) {
		matches.push(lastMatch[1]);

		if (!regex.global) break;
	}

	return matches;
};

const fetchTranslations = async (text, from = 'nl', to = 'en') => {
	const params = new URLSearchParams({
		anno: 3,
		client: 'te_lib',
		format: 'html',
		v: '1.0',
		key: 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw',
		logld: 'vTE_20220130',
		sl: from,
		tl: to,
		sp: 'nmt',
		tc: 2,
		sr: 1,
		tk: generateTk(text, TKK_TOKEN),
		mode: 1,
	})

	const body = new URLSearchParams({
		q: text
	})

	const url = `https://translate.googleapis.com/translate_a/t?${params.toString()}`
	//return;
	const res = await fetch(url, {
		headers: {
			'authority': 'translate.googleapis.com',
			'pragma': 'no-cache',
			'cache-control': 'no-cache',
			'sec-ch-ua': '"(Not(A:Brand";v="8", "Chromium";v="100", "Google Chrome";v="100"',
			'sec-ch-ua-mobile': '?1',
			'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4861.0 Mobile Safari/537.36',
			'sec-ch-ua-platform': 'Android"',
			'content-type': 'application/x-www-form-urlencoded',
			'accept': '*/*',
			'origin': 'https://nos.nl',
			//'x-client-data': 'CIi2yQEIpbbJAQirncoBCKf5ywEI4oTMAQini8wBCNOPzAEIzpLMAQidlcwBCLWVzAEIvZfMARiEnssB',
			'sec-fetch-site': 'cross-site',
			'sec-fetch-mode': 'cors',
			'sec-fetch-dest': 'empty',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
		},
		body,
		method: 'POST'
	});

	const asJson = await res.json();
	const values = regexExecAll(asJson, (/<b>([^<]*)<\/b>/g));
	return values;
	const keys = regexExecAll(asJson, (/<i>([^<]*)<\/i>/g));

	return Object.fromEntries(keys.map((key, i) => [key, values[i]]));
	const json = await res.json();
	console.log(text, json)
	return json[0][0][0];
}


function handleOptions(request) {
	// Make sure the necessary headers are present
	// for this to be a valid pre-flight request
	let headers = request.headers;
	if (
		headers.get("Origin") !== null &&
		headers.get("Access-Control-Request-Method") !== null &&
		headers.get("Access-Control-Request-Headers") !== null
	) {
		// Handle CORS pre-flight request.
		// If you want to check or reject the requested method + headers
		// you can do that here.
		let respHeaders = {
			...corsHeaders,
			// Allow all future content Request headers to go back to browser
			// such as Authorization (Bearer) or X-Client-Name-Version
			"Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers"),
		}

		return new Response(null, {
			headers: respHeaders,
		})
	}
	else {
		// Handle standard OPTIONS request.
		// If you want to allow other HTTP Methods, you can do that here.
		return new Response(null, {
			headers: {
				Allow: "GET, HEAD, POST, OPTIONS",
			},
		})
	}
}

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
	const body = await request.json();
	const string = body.map(s => `<p>${s}</p>`).join('')
	let translations = await fetchTranslations(string);

	return new Response(JSON.stringify(translations), {
		headers: corsHeaders,
	})
}

addEventListener('fetch', event => {
	const { request } = event;
	if (request.method === "OPTIONS") {
		// Handle CORS preflight requests
		event.respondWith(handleOptions(request))
		return;
	}

	event.respondWith(handleRequest(request))
})
