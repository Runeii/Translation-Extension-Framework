const getAllTextNodes = () => {
	var n, a = [], walk = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT, null, false);
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

	nodes.forEach((node, i) => {
		node.textContent = translations[node.textContent]
	});
}

const filterNodes = nodes => {
	const alphaRegex = new RegExp(/[a-zA-Z]+/);
	return nodes.filter(({ data, parentNode }) =>
		data &&
		parentNode.nodeName !== 'SCRIPT' &&
		data.match(alphaRegex)
	).sort((a, b) => b.length - a.length)
}

const createTranslationMapFromNodes = nodes => nodes.reduce((result, node) => ({ ...result, [node.textContent]: '' }), {})

const nodes = getAllTextNodes();
const filteredNodes = filterNodes(nodes);
const translationMap = createTranslationMapFromNodes(filteredNodes);

console.log('Executed!')
translateText(translationMap);
