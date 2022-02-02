let currentHostname = null;
let isTranslated = false;

const requestTranslation = (userRequested = false) => {
	browser.runtime.sendMessage(null, { message: 'requestTranslation', userRequested });
}

const setupPage = async () => {
	const exceptions = await getSetting('exceptions', []);

	browser.tabs.query({
		active: true,
		currentWindow: true
	}, async ([tab]) => {
		currentHostname = new URL(tab.url).hostname;
		document.getElementById('domain').textContent = currentHostname;
		document.getElementById('isAutomaticTranslationEnabled').checked = await getSetting('isAutomaticTranslationEnabled') !== false
		document.getElementById('disableForDomain').checked = exceptions.includes(currentHostname);
	});
}

const updateSettings = async ({ currentTarget: { checked, id } }) => {
	if (id === 'isAutomaticTranslationEnabled') {
		await setSetting('isAutomaticTranslationEnabled', checked);
	}
	if (id === 'disableForDomain') {
		const exceptionsWithoutCurrent = (await getSetting('exceptions', [])).filter(domain => domain !== currentHostname);
		await setSetting('exceptions', checked ? [...exceptionsWithoutCurrent, currentHostname] : exceptionsWithoutCurrent);
	}
	requestTranslation(false);
}

document.querySelectorAll('input').forEach(el => el.addEventListener('change', updateSettings));
document.querySelector('button').addEventListener('click', () => requestTranslation(true))

setupPage();
