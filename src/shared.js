const getGlobal = () => {
	if (typeof chrome !== 'undefined') {
		return chrome;
	}
}

const getSetting = (key, fallback = null) => new Promise(resolve => {
	try {
		browser.storage.local.get(key, (keys) => {
			resolve(keys?.[key] ?? fallback);
		})
	} catch (error) {
		return fallback;
	}
});

const setSetting = (key, value) => new Promise(resolve => browser.storage.local.set({ [key]: value }, resolve));

browser = typeof browser === 'undefined' ? getGlobal() : browser;