let cachedTranslations = {}

const getAllTextNodes = (root = document.body) => {
	var n, a = [], walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
	while (n = walk.nextNode()) a.push(n);
	return a;
}

const translate = async strings => {
	if (strings.length === 0) {
		return;
	}
	//https://proxy.workerify.workers.dev	
	//http://127.0.0.1:8787/
	const res = await fetch("https://proxy.workerify.workers.dev", {
		method: "POST",
		body: JSON.stringify({ copy: strings, origin: window.location.origin }),
		headers: { "Content-Type": "application/json" }
	});

	return await res.json();
}

const filterNodes = nodes => {
	const alphaRegex = new RegExp(/[a-zA-Z]+/);
	return [...nodes].filter(({ data, parentNode }) =>
		data &&
		parentNode.nodeName !== 'SCRIPT' &&
		data.match(alphaRegex)
	).sort((a, b) => b.length - a.length)
}

const createTranslationMapFromNodes = nodes => nodes.map((node) => node.textContent);

const translateNodes = async nodes => {
	const filteredNodes = filterNodes(nodes);
	if (filterNodes.length === 0) {
		return;
	}

	const translationMap = createTranslationMapFromNodes(filteredNodes);
	const translations = await translate(translationMap)
	const div = document.createElement('div');
	filteredNodes.forEach((node, i) => {
		div.innerHTML = translations[i]
		node.textContent = div.textContent
	});
}

translateNodes(getAllTextNodes());

const observer = new MutationObserver(([mutation]) => {
	translateNodes([...mutation.addedNodes].reduce((result, current) => [...result, ...getAllTextNodes(current)], []));
});

observer.observe(document.body, { subtree: true, childList: true });