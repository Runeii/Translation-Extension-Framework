let cachedTranslations = {}

const getAllTextNodes = (root = document.body) => {
	var n, a = [], walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
	while (n = walk.nextNode()) a.push(n);
	return a;
}

const dummied = jsonMap => JSON.stringify(Object.keys(JSON.parse(jsonMap)).reduce((output, current) => ({ ...output, [current]: 'transalted' }), {}))

const translate = async jsonMap => {
	return dummied(jsonMap)
	const res = await fetch("https://libretranslate.com/translate", {
		method: "POST",
		body: JSON.stringify({
			q: node.textContent,
			source: "nl",
			target: "en"
		}),
		headers: { "Content-Type": "application/json" }
	});

	const { error, translatedText } = await res.json();

	if (error) {
		throw new Error(error);
	}

	return translatedText;
}

const translateText = async map => {
	const jsonMap = JSON.stringify(map);
	const translationString = await translate(jsonMap);

	const translations = JSON.parse(translationString);
	cachedTranslations = { ...cachedTranslations, ...translations };
	return cachedTranslations;
}

const filterNodes = nodes => {
	const alphaRegex = new RegExp(/[a-zA-Z]+/);
	return [...nodes].filter(({ data, parentNode }) =>
		data &&
		parentNode.nodeName !== 'SCRIPT' &&
		data.match(alphaRegex)
	).sort((a, b) => b.length - a.length)
}

const createTranslationMapFromNodes = nodes => nodes.reduce((result, node) => {
	if (cachedTranslations[node.textContent]) {
		return result;
	}

	return {
		...result,
		[node.textContent]: ''
	};
}, {})

const translateNodes = async nodes => {
	const filteredNodes = filterNodes(nodes);
	const translationMap = createTranslationMapFromNodes(filteredNodes);

	const translations = await translateText(translationMap);
	nodes.forEach((node, i) => {
		node.textContent = translations[node.textContent]
	});
}

translateNodes(getAllTextNodes());

const observer = new MutationObserver(([mutation]) => {
	translateNodes([...mutation.addedNodes].reduce((result, current) => [...result, ...getAllTextNodes(current)], []));
});

observer.observe(document.body, { subtree: true, childList: true });