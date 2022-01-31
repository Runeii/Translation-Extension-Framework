const translatePage = (tabId) => {
	browser.tabs.executeScript(tabId, {
		file: '/translator.js'
	});
}

const getTab = () => new Promise(resolve => browser.tabs.query({ active: true }, ([tab]) => resolve(tab)));

const isPageTranslatable = async (url) => {
	if (await getSetting('isAutomaticTranslationEnabled') === false) {
		return false;
	}

	if (url.includes('chrome://')) {
		return false;
	}

	const currentHostname = new URL(url).hostname;
	const exceptions = await getSetting('exceptions', []);

	if (exceptions.includes(currentHostname)) {
		return false;
	}

	return true;
}

browser.tabs.onUpdated.addListener(async (id, _, { status, url }) => {
	if (status !== 'complete') {
		return;
	}
	if (await isPageTranslatable(url)) {
		translatePage(id);
	}
})

const handleMessage = async ({ message, userRequested }) => {
	if (message !== 'requestTranslation') {
		return;
	}

	const tab = await getTab()
	if (userRequested || await isPageTranslatable(tab.url)) {
		translatePage(tab.id);
	}
}

browser.runtime.onMessage.addListener(handleMessage);
