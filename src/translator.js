let cachedTranslations = {}

const getAllTextNodes = (root = document.body) => {
	var n, a = [], walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
	while (n = walk.nextNode()) a.push(n);
	return a;
}

const dummied = jsonMap => JSON.stringify(Object.keys(JSON.parse(jsonMap)).reduce((output, current) => ({ ...output, [current]: 'transalted' }), {}))

const translate = async strings => {
	if (strings.length === 0) {
		return;
	}
	//https://proxy.workerify.workers.dev	
	const res = await fetch("http://127.0.0.1:8787/", {
		method: "POST",
		body: JSON.stringify(strings),
		headers: { "Content-Type": "application/json" }
	});

	return await res.json();
}

const translateText = async chunks => {
	const translations = await Promise.all(chunks.map(async chunk => translate(chunk)))
	const all = translations.flat();
	console.log(all)
	cachedTranslations = {
		...cachedTranslations,
		...(all.reduce((result, current) => ({ ...result, ...current }), {}))
	}
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

	return [
		...result,
		node.textContent
	];
}, []);

const split = array => array.reduce((resultArray, item, index) => {
	const chunkIndex = Math.floor(index / 50)

	if (!resultArray[chunkIndex]) {
		resultArray[chunkIndex] = []
	}

	resultArray[chunkIndex].push(item)

	return resultArray
}, []);

const translateNodes = async nodes => {
	const filteredNodes = filterNodes(nodes);
	if (filterNodes.length === 0) {
		return;
	}

	const translationMap = createTranslationMapFromNodes(filteredNodes);
	const translatableChunks = split(translationMap)
	const translations = await translateText(translatableChunks);

	filteredNodes.forEach((node, i) => {
		node.textContent = translations[node.textContent]
	});
}

translateNodes(getAllTextNodes());

const observer = new MutationObserver(([mutation]) => {
	translateNodes([...mutation.addedNodes].reduce((result, current) => [...result, ...getAllTextNodes(current)], []));
});

observer.observe(document.body, { subtree: true, childList: true });