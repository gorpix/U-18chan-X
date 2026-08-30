'use strict';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'u18vf-eh-search') return false;

  let url;
  try {
    url = new URL(message.url);
    if (url.origin !== 'https://e-hentai.org' || url.pathname !== '/' || !url.searchParams.has('f_search')) {
      throw new Error('Rejected search URL');
    }
  } catch (error) {
    sendResponse({ ok: false, error: error.message });
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  fetch(url.href, {
    credentials: 'include',
    signal: controller.signal,
    headers: { Accept: 'text/html' }
  })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then((html) => sendResponse({ ok: true, html }))
    .catch((error) => sendResponse({ ok: false, error: error.message }))
    .finally(() => clearTimeout(timeout));

  return true;
});
