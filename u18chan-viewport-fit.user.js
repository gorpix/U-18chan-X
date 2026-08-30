// ==UserScript==
// @name         U-18Chan Viewport Fit + OP Comments
// @namespace    local.codex.u18chan
// @version      1.0
// @description  Cleans U-18Chan, fits images, adds index/thread tools, inline quotes, backlinks, and E-Hentai matching.
// @match        https://u18chan.com/*
// @match        https://www.u18chan.com/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @connect      e-hentai.org
// ==/UserScript==

(() => {
  'use strict';

  const css = `
    img.ThumbnailImage[is-expanded],
    img.ThumbnailImageReply[is-expanded] {
      width: auto !important;
      height: auto !important;
      max-width: 95vw !important;
      max-height: calc(100vh - 24px) !important;
      object-fit: contain !important;
      object-position: top left !important;
    }

    .ad_banner,
    .ad_banner2 {
      display: none !important;
    }

    body.u18vf-site-clean {
      padding-top: var(--u18vf-header-height, 64px) !important;
    }

    body.u18vf-site-clean > .u18vf-site-header {
      position: fixed !important;
      top: 0 !important;
      right: 0 !important;
      left: 0 !important;
      z-index: 2147483000 !important;
      box-sizing: border-box;
      width: 100% !important;
      background: rgba(20, 20, 20, 0.96);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.35);
    }

    .u18vf-site-header > br,
    .u18vf-site-header > p:empty {
      display: none !important;
    }

    .u18vf-site-header .BoardList {
      position: static !important;
      inset: auto !important;
      box-sizing: border-box;
      width: 100% !important;
    }

    .u18vf-site-header .Title,
    .u18vf-site-header .Description {
      box-sizing: border-box;
      width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 3px 8px !important;
      line-height: 1.2 !important;
    }

    .u18vf-op-comment {
      display: block;
      box-sizing: border-box;
      height: var(--u18vf-comment-height, 54px);
      margin: 4px 4px 6px;
      padding: 6px 8px;
      overflow-y: auto;
      color: #fff !important;
      background: rgba(0, 0, 0, 0.58);
      border-radius: 4px;
      text-align: left;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .u18vf-counts {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      gap: 4px;
      margin-bottom: 4px;
      color: #ddd;
      font-size: 0.82em;
      font-weight: 700;
      white-space: nowrap;
    }

    .u18vf-count-text {
      min-width: 0;
      margin-right: auto;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .u18vf-eh-control {
      box-sizing: border-box;
      padding: 2px 6px;
      border: 1px solid #888;
      border-radius: 3px;
      color: #fff !important;
      background: rgba(35, 35, 35, 0.9);
      font: inherit;
      font-weight: 700;
      line-height: 1.25;
      white-space: nowrap;
      text-decoration: none !important;
      cursor: pointer;
      flex: 0 0 auto;
    }

    .u18vf-eh-control:disabled {
      opacity: 0.72;
      cursor: default;
    }

    .u18vf-thread-eh {
      display: inline-flex;
      margin-left: 8px;
      vertical-align: middle;
      font-size: 0.82em;
    }

    .u18vf-backlinks {
      margin-left: 8px;
      font-size: 0.82em;
      font-weight: 700;
    }

    .u18vf-backlinks a {
      margin-left: 5px;
    }

    .u18vf-inline-quote-link {
      cursor: zoom-in;
    }

    .u18vf-inline-quote {
      display: block;
      clear: both;
      box-sizing: border-box;
      max-width: 720px;
      margin: 6px 0 3px 14px;
      padding: 6px 8px;
      border-left: 3px solid #888;
      color: #fff;
      background: rgba(0, 0, 0, 0.48);
      white-space: normal;
      overflow-wrap: anywhere;
    }

    .u18vf-inline-quote::after {
      display: block;
      clear: both;
      content: '';
    }

    .u18vf-inline-quote-header {
      display: block;
      margin-bottom: 4px;
      font-size: 0.9em;
      font-weight: 700;
    }

    .u18vf-inline-quote-body {
      display: block;
      white-space: pre-wrap;
    }

    .u18vf-inline-quote-thumb {
      float: left;
      width: auto;
      height: auto;
      max-width: 90px;
      max-height: 90px;
      margin: 0 7px 5px 0;
      object-fit: contain;
    }

    #gallery_body.u18vf-comments-enabled {
      --u18vf-card-min: 210px;
      --u18vf-card-height: 258px;
      --u18vf-thumb-height: 150px;
      --u18vf-comment-height: 72px;
      right: 20px !important;
      width: auto !important;
      display: grid !important;
      grid-template-columns: repeat(auto-fill, minmax(var(--u18vf-card-min), 1fr));
      grid-auto-rows: var(--u18vf-card-height);
      gap: 8px;
      align-content: start;
      box-sizing: border-box;
      top: calc(var(--u18vf-header-height, 64px) + 8px) !important;
    }

    #gallery_body.u18vf-comments-enabled[data-u18vf-size="large"] {
      --u18vf-card-min: 300px;
      --u18vf-card-height: 348px;
      --u18vf-thumb-height: 230px;
      --u18vf-comment-height: 82px;
    }

    #gallery_body.u18vf-comments-enabled .item {
      box-sizing: border-box;
      float: none !important;
      width: auto !important;
      height: var(--u18vf-card-height) !important;
      margin: 0 !important;
      padding: 4px !important;
      overflow: hidden;
    }

    #gallery_body.u18vf-comments-enabled .Subject {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #gallery_body.u18vf-comments-enabled .layoutHeight {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: var(--u18vf-thumb-height) !important;
    }

    #gallery_body.u18vf-comments-enabled .layoutHeight > a.thumbnail_link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    #gallery_body.u18vf-comments-enabled img.image {
      width: auto !important;
      height: auto !important;
      max-width: 100% !important;
      max-height: var(--u18vf-thumb-height) !important;
      object-fit: contain !important;
    }

    #u18vf-controls {
      position: fixed;
      right: 12px;
      bottom: 12px;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      pointer-events: none;
    }

    #u18vf-controls button {
      box-sizing: border-box;
      padding: 7px 11px;
      border: 1px solid #888;
      border-radius: 4px;
      color: #fff;
      background: rgba(20, 20, 20, 0.9);
      font: 13px/1.2 sans-serif;
      cursor: pointer;
      pointer-events: auto;
    }

    #u18vf-infinite-toggle[data-state="loading"] {
      opacity: 0.72;
      cursor: wait;
    }
  `;

  if (typeof GM_addStyle === 'function') {
    GM_addStyle(css);
  } else {
    const style = document.createElement('style');
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  const MAX_CONCURRENT_REQUESTS = 2;
  const CACHE_PREFIX = 'u18vf:topic:v1:';
  const SIZE_KEY = 'u18vf:index-size';
  const INFINITE_KEY = 'u18vf:infinite-scroll';
  const EH_CACHE_PREFIX = 'u18vf:eh:v2:';
  const EH_SEARCH_DELAY = 3200;
  const queue = [];
  const cache = new Map();
  const ehSearchQueue = [];
  let activeRequests = 0;
  let ehSearchActive = false;
  let lastEhSearchAt = 0;

  function messageText(message) {
    const copy = message.cloneNode(true);
    copy.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
    return (copy.textContent || '')
      .replace(/\r/g, '')
      .split('\n')
      .map((line) => line.replace(/[\t ]+/g, ' ').trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function topicInfo(item, baseUrl = location.href) {
    const subject = item.querySelector('.Subject');
    const link = item.querySelector('a.thumbnail_link[href*="/topic/"]');
    if (!subject || !link) return null;
    const url = new URL(link.getAttribute('href') || link.href, baseUrl);
    const match = url.pathname.match(/\/topic\/(\d+)/i);
    return match ? { subject, link, topicId: match[1], url: url.href } : null;
  }

  function readSessionCache(topicId) {
    try {
      const raw = sessionStorage.getItem(`${CACHE_PREFIX}${topicId}`);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return typeof data.comment === 'string' && Number.isInteger(data.replies) && Number.isInteger(data.imageReplies)
        ? data
        : null;
    } catch {
      return null;
    }
  }

  function writeSessionCache(topicId, data) {
    try {
      sessionStorage.setItem(`${CACHE_PREFIX}${topicId}`, JSON.stringify(data));
    } catch {
      // A full or disabled sessionStorage should not stop the userscript.
    }
  }

  async function getTopicData(url, topicId) {
    const stored = readSessionCache(topicId);
    if (stored) return stored;

    if (!cache.has(url)) {
      cache.set(url, (async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
          const response = await fetch(url, {
            credentials: 'same-origin',
            signal: controller.signal
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const html = await response.text();
          const page = new DOMParser().parseFromString(html, 'text/html');
          const message = page.getElementById(`post_${topicId}_message_div`);
          const postMessages = page.querySelectorAll('span[id^="post_"][id$="_message_div"]');
          const postImages = page.querySelectorAll('img[id^="post_"][id$="_image"]');
          const data = {
            comment: message ? messageText(message) : '',
            replies: Math.max(0, postMessages.length - 1),
            imageReplies: Math.max(0, postImages.length - (page.getElementById(`post_${topicId}_image`) ? 1 : 0))
          };
          writeSessionCache(topicId, data);
          return data;
        } finally {
          clearTimeout(timeout);
        }
      })());
    }
    return cache.get(url);
  }

  function countLabel(count, singular, plural) {
    return `${count} ${count === 1 ? singular : plural}`;
  }

  function ensureCommentBox(item, subject) {
    let output = item.querySelector('.u18vf-op-comment');
    if (!output) {
      output = document.createElement('div');
      output.className = 'u18vf-op-comment';
      subject.insertAdjacentElement('afterend', output);
    }
    let counts = output.querySelector('.u18vf-counts');
    if (!counts) {
      counts = document.createElement('div');
      counts.className = 'u18vf-counts';
      output.prepend(counts);
    }
    let countText = counts.querySelector('.u18vf-count-text');
    if (!countText) {
      countText = document.createElement('span');
      countText.className = 'u18vf-count-text';
      counts.prepend(countText);
    }
    return { output, counts, countText };
  }

  function ehFurryFilter() {
    const board = location.pathname.split('/').filter(Boolean)[0]?.toLowerCase();
    if (['igc', 'gc', 'igfur', 'gfur'].includes(board)) return 'm:furry$';
    if (['ic', 'c', 'ifur', 'fur'].includes(board)) return 'f:furry$';
    return null;
  }

  function normalizeForMatch(text) {
    return (text || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function titleData(subject, comment = '') {
    const artists = [];
    subject.replace(/\[([^\]]{2,60})\]/g, (_match, artist) => {
      artists.push(artist.trim());
      return _match;
    });
    for (const line of `${subject}\n${comment}`.split(/\r?\n/)) {
      const match = line.match(/(?:^|\s)by\s+([^,;|()[\]]{2,60})\s*$/i);
      if (match) artists.push(match[1].trim());
    }
    let title = subject
      .replace(/\[[^\]]+\]/g, ' ')
      .replace(/\s+by\s+[^,;|()[\]]{2,60}\s*$/i, ' ')
      .replace(/\((?:english|japanese|chinese|spanish|uncensored|censored)\)\s*$/i, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!title) title = subject.trim();
    return { title, artists: [...new Set(artists.filter(Boolean))] };
  }

  function titleSimilarity(left, right) {
    const a = normalizeForMatch(left);
    const b = normalizeForMatch(right);
    if (!a || !b) return 0;
    if (a === b) return 1;
    if ((a.includes(b) || b.includes(a)) && Math.min(a.length, b.length) >= 6) return 0.88;
    const aTokens = new Set(a.split(' ').filter((token) => token.length > 1));
    const bTokens = new Set(b.split(' ').filter((token) => token.length > 1));
    if (!aTokens.size || !bTokens.size) return 0;
    const overlap = [...aTokens].filter((token) => bTokens.has(token)).length;
    return (2 * overlap) / (aTokens.size + bTokens.size);
  }

  function ehCacheKey(filter, title) {
    return `${EH_CACHE_PREFIX}${filter}:${normalizeForMatch(title)}`;
  }

  function readEhCache(key) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || 'null');
      if (!data || !['match', 'none'].includes(data.status) || !Number.isFinite(data.savedAt)) return null;
      const lifetime = data.status === 'match' ? 30 * 86400000 : 7 * 86400000;
      return Date.now() - data.savedAt <= lifetime ? data : null;
    } catch {
      return null;
    }
  }

  function writeEhCache(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify({ ...data, savedAt: Date.now() }));
    } catch {
      // A full or disabled localStorage should not prevent manual searches.
    }
  }

  function requestEhHtml(url) {
    return new Promise((resolve, reject) => {
      const requester = typeof GM_xmlhttpRequest === 'function'
        ? GM_xmlhttpRequest
        : typeof GM !== 'undefined' && typeof GM.xmlHttpRequest === 'function'
          ? (options) => GM.xmlHttpRequest(options)
          : null;
      if (!requester) {
        reject(new Error('Cross-origin userscript requests are unavailable'));
        return;
      }
      requester({
        method: 'GET',
        url,
        timeout: 15000,
        headers: { Accept: 'text/html' },
        onload: (response) => response.status >= 200 && response.status < 300
          ? resolve(response.responseText)
          : reject(new Error(`HTTP ${response.status}`)),
        onerror: () => reject(new Error('Network error')),
        ontimeout: () => reject(new Error('Search timed out'))
      });
    });
  }

  function enqueueEhSearch(task) {
    return new Promise((resolve, reject) => {
      ehSearchQueue.push({ task, resolve, reject });
      drainEhSearchQueue();
    });
  }

  async function drainEhSearchQueue() {
    if (ehSearchActive || !ehSearchQueue.length) return;
    ehSearchActive = true;
    while (ehSearchQueue.length) {
      const wait = Math.max(0, EH_SEARCH_DELAY - (Date.now() - lastEhSearchAt));
      if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
      const job = ehSearchQueue.shift();
      lastEhSearchAt = Date.now();
      try {
        job.resolve(await job.task());
      } catch (error) {
        job.reject(error);
      }
    }
    ehSearchActive = false;
  }

  function parseEhSearch(html) {
    const page = new DOMParser().parseFromString(html, 'text/html');
    const galleryArea = page.querySelector('.itg');
    const noHits = /no hits found/i.test(page.body?.textContent || '');
    if (!galleryArea && !noHits) throw new Error('Unexpected E-Hentai response');
    const seen = new Set();
    const results = [];
    for (const anchor of page.querySelectorAll('.itg a[href*="/g/"]')) {
      const url = new URL(anchor.getAttribute('href'), 'https://e-hentai.org/');
      if (url.origin !== 'https://e-hentai.org' || !/^\/g\/\d+\/[a-f0-9]+\/?$/i.test(url.pathname) || seen.has(url.href)) continue;
      const container = anchor.closest('tr, .gl1t, .gl1e, .gl1m') || anchor.parentElement;
      const title = (container?.querySelector('.glink')?.textContent || anchor.querySelector('.glink')?.textContent || '').trim();
      const pageNode = Array.from(container?.querySelectorAll('div, span, td') || [])
        .find((node) => /^\d[\d,]*\s+pages?$/i.test((node.textContent || '').trim()));
      const pageMatch = (pageNode?.textContent || '').trim().match(/^(\d[\d,]*)\s+pages?$/i);
      const pages = pageMatch ? Number(pageMatch[1].replace(/,/g, '')) : 0;
      if (!title || !pages) continue;
      seen.add(url.href);
      results.push({ url: url.href, title, pages });
    }
    return results;
  }

  function bestEhMatch(results, wanted) {
    let best = null;
    for (const result of results) {
      const candidate = titleData(result.title);
      let score = titleSimilarity(wanted.title, candidate.title);
      const normalizedResult = normalizeForMatch(result.title);
      if (wanted.artists.some((artist) => normalizedResult.includes(normalizeForMatch(artist)))) score += 0.15;
      if (!best || score > best.score) best = { ...result, score };
    }
    return best?.score >= 0.62 ? best : null;
  }

  function applyEhResult(control, result) {
    if (result.status === 'none') {
      control.textContent = 'None matched';
      control.disabled = true;
      return control;
    }
    const link = document.createElement('a');
    link.className = 'u18vf-eh-control';
    link.href = result.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `E-Hentai · ${result.pages} ${result.pages === 1 ? 'page' : 'pages'}`;
    control.replaceWith(link);
    return link;
  }

  function attachEhControl(container, subjectReader, commentReader, filter) {
    if (!filter || container.querySelector('.u18vf-eh-control')) return;
    const control = document.createElement('button');
    control.type = 'button';
    control.className = 'u18vf-eh-control';
    control.textContent = 'Find E-Hentai';
    container.appendChild(control);

    const initial = titleData(subjectReader());
    const key = ehCacheKey(filter, initial.title);
    const cached = readEhCache(key);
    if (cached) {
      applyEhResult(control, cached);
      return;
    }

    control.addEventListener('click', async () => {
      control.disabled = true;
      control.textContent = 'Searching E-Hentai…';
      try {
        const wanted = titleData(subjectReader(), commentReader());
        const query = `title:"${wanted.title.replace(/"/g, ' ')}" ${filter}`;
        const url = `https://e-hentai.org/?f_search=${encodeURIComponent(query)}`;
        const results = await enqueueEhSearch(async () => parseEhSearch(await requestEhHtml(url)));
        const match = bestEhMatch(results, wanted);
        const result = match
          ? { status: 'match', url: match.url, title: match.title, pages: match.pages }
          : { status: 'none' };
        writeEhCache(key, result);
        applyEhResult(control, result);
      } catch (error) {
        control.disabled = false;
        control.textContent = 'Search failed — retry';
        control.title = error.message;
        console.debug('[U18 Viewport Fit] E-Hentai search failed:', error);
      }
    });
  }

  function installEhButton(item) {
    const filter = ehFurryFilter();
    const info = topicInfo(item);
    if (!filter || !info) return;
    const { counts } = ensureCommentBox(item, info.subject);
    attachEhControl(
      counts,
      () => info.subject.textContent || '',
      () => item.querySelector('.u18vf-comment-text')?.textContent || '',
      filter
    );
  }

  function installThreadEhButton() {
    if (!/\/topic\/\d+/i.test(location.pathname)) return;
    const filter = ehFurryFilter();
    const firstPost = document.getElementById('FirstPost');
    const subject = firstPost?.querySelector('.Subject');
    const userDetails = subject?.closest('.UserDetails');
    if (!filter || !subject || !userDetails || userDetails.querySelector('.u18vf-thread-eh')) return;
    const holder = document.createElement('span');
    holder.className = 'u18vf-thread-eh';
    subject.insertAdjacentElement('afterend', holder);
    const message = firstPost.querySelector('span[id^="post_"][id$="_message_div"]');
    attachEhControl(
      holder,
      () => subject.textContent || '',
      () => message ? messageText(message) : '',
      filter
    );
  }

  async function loadTopic(item) {
    const info = topicInfo(item);
    if (!info) return;
    try {
      const data = await getTopicData(info.url, info.topicId);
      if (!item.isConnected || item.dataset.u18vfCommentLoaded === 'true') return;
      const { output, countText } = ensureCommentBox(item, info.subject);
      countText.textContent = `${countLabel(data.replies, 'reply', 'replies')} · ${countLabel(data.imageReplies, 'image', 'images')}`;
      if (data.comment) {
        const comment = document.createElement('div');
        comment.className = 'u18vf-comment-text';
        comment.textContent = data.comment;
        output.appendChild(comment);
      }
      item.dataset.u18vfCommentLoaded = 'true';
    } catch (error) {
      console.debug('[U18 Viewport Fit] Could not load first-post comment:', error);
    }
  }

  function drainQueue() {
    while (activeRequests < MAX_CONCURRENT_REQUESTS && queue.length) {
      const item = queue.shift();
      if (!item?.isConnected || item.dataset.u18vfQueued !== 'true') continue;
      activeRequests += 1;
      loadTopic(item).finally(() => {
        activeRequests -= 1;
        drainQueue();
      });
    }
  }

  function enqueue(item) {
    if (item.dataset.u18vfQueued === 'true') return;
    item.dataset.u18vfQueued = 'true';
    queue.push(item);
    drainQueue();
  }

  function resizeGallery(gallery) {
    requestAnimationFrame(() => {
      let bottom = 0;
      gallery.querySelectorAll('.item').forEach((item) => {
        const marginBottom = Number.parseFloat(getComputedStyle(item).marginBottom) || 0;
        bottom = Math.max(bottom, item.offsetTop + item.offsetHeight + marginBottom);
      });
      if (bottom) gallery.style.height = `${Math.ceil(bottom)}px`;
    });
  }

  function readIndexSize() {
    try {
      return localStorage.getItem(SIZE_KEY) === 'large' ? 'large' : 'small';
    } catch {
      return 'small';
    }
  }

  function writeIndexSize(size) {
    try {
      localStorage.setItem(SIZE_KEY, size);
    } catch {
      // The layout still works when persistent storage is unavailable.
    }
  }

  function controlsContainer() {
    let controls = document.getElementById('u18vf-controls');
    if (!controls) {
      controls = document.createElement('div');
      controls.id = 'u18vf-controls';
      document.body.appendChild(controls);
    }
    return controls;
  }

  function installSizeToggle(gallery) {
    const button = document.createElement('button');
    button.id = 'u18vf-size-toggle';
    button.type = 'button';

    const applySize = (size) => {
      gallery.dataset.u18vfSize = size;
      button.textContent = `Thumbnails: ${size === 'large' ? 'Large' : 'Small'}`;
      button.setAttribute('aria-pressed', String(size === 'large'));
      writeIndexSize(size);
      resizeGallery(gallery);
    };

    applySize(readIndexSize());
    button.addEventListener('click', () => {
      applySize(gallery.dataset.u18vfSize === 'large' ? 'small' : 'large');
    });
    controlsContainer().appendChild(button);
  }

  function readInfiniteEnabled() {
    try {
      return localStorage.getItem(INFINITE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  function writeInfiniteEnabled(enabled) {
    try {
      localStorage.setItem(INFINITE_KEY, String(enabled));
    } catch {
      // Infinite scrolling still works when persistent storage is unavailable.
    }
  }

  function pageNumberFromUrl(url) {
    const parsed = new URL(url, location.href);
    for (const key of ['page', 'p']) {
      const value = parsed.searchParams.get(key);
      if (/^\d+$/.test(value || '')) return Number(value);
    }
    const lastPart = parsed.pathname.split('/').filter(Boolean).pop() || '';
    const match = lastPart.match(/^(\d+)(?:\.[a-z0-9]+)?$/i);
    return match ? Number(match[1]) : 0;
  }

  function boardPathPrefix(url) {
    const parsed = new URL(url, location.href);
    const withoutPage = parsed.pathname.replace(/\/\d+(?:\.[a-z0-9]+)?\/?$/i, '/');
    return withoutPage.endsWith('/') ? withoutPage : `${withoutPage}/`;
  }

  function validIndexUrl(url, pageUrl) {
    const candidate = new URL(url, pageUrl);
    const current = new URL(pageUrl, location.href);
    return candidate.origin === current.origin
      && candidate.pathname.startsWith(boardPathPrefix(pageUrl))
      && !candidate.pathname.includes('/topic/');
  }

  function findNextPageUrl(page, pageUrl) {
    const explicit = page.querySelector('a[rel~="next"], link[rel~="next"]');
    if (explicit?.getAttribute('href')) {
      const url = new URL(explicit.getAttribute('href'), pageUrl).href;
      if (validIndexUrl(url, pageUrl)) return url;
    }

    const expectedPage = pageNumberFromUrl(pageUrl) + 1;
    for (const link of page.querySelectorAll('a[href]')) {
      if (link.textContent.trim() !== String(expectedPage)) continue;
      const url = new URL(link.getAttribute('href'), pageUrl).href;
      if (validIndexUrl(url, pageUrl)) return url;
    }
    return null;
  }

  function absolutizeItemUrls(item, pageUrl) {
    for (const element of item.querySelectorAll('[href], [src]')) {
      for (const attribute of ['href', 'src']) {
        const value = element.getAttribute(attribute);
        if (!value || value.startsWith('#')) continue;
        try {
          const absolute = new URL(value, pageUrl);
          if (absolute.protocol === 'http:' || absolute.protocol === 'https:') {
            element.setAttribute(attribute, absolute.href);
          }
        } catch {
          // Leave malformed or non-URL attributes as the site supplied them.
        }
      }
    }
  }

  function appendIndexPage(page, pageUrl, gallery, cardObserver) {
    const sourceGallery = page.getElementById('gallery_body');
    if (!sourceGallery) return 0;

    const knownTopics = new Set(
      Array.from(gallery.querySelectorAll('.item'))
        .map((item) => topicInfo(item)?.topicId)
        .filter(Boolean)
    );
    const fragment = document.createDocumentFragment();
    const appended = [];

    for (const sourceItem of sourceGallery.querySelectorAll('.item')) {
      const info = topicInfo(sourceItem, pageUrl);
      if (!info || knownTopics.has(info.topicId)) continue;
      knownTopics.add(info.topicId);
      const item = document.importNode(sourceItem, true);
      absolutizeItemUrls(item, pageUrl);
      fragment.appendChild(item);
      appended.push(item);
    }

    gallery.appendChild(fragment);
    appended.forEach((item) => {
      installEhButton(item);
      cardObserver.observe(item);
    });
    resizeGallery(gallery);
    return appended.length;
  }

  function installInfiniteScroll(gallery, cardObserver) {
    const button = document.createElement('button');
    button.id = 'u18vf-infinite-toggle';
    button.type = 'button';

    let enabled = readInfiniteEnabled();
    let loading = false;
    let reachedEnd = false;
    let nextPageUrl = findNextPageUrl(document, location.href);
    const visitedPages = new Set([new URL(location.href).href]);

    const updateButton = () => {
      button.dataset.state = loading ? 'loading' : enabled ? 'on' : 'off';
      button.disabled = loading;
      button.setAttribute('aria-pressed', String(enabled));
      button.textContent = loading
        ? 'Infinite scroll: Loading…'
        : enabled && reachedEnd
          ? 'Infinite scroll: End'
          : `Infinite scroll: ${enabled ? 'On' : 'Off'}`;
    };

    const nearBottom = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 600;

    const maybeLoadNextPage = async () => {
      if (!enabled || loading || reachedEnd || !nearBottom()) return;
      if (!nextPageUrl || visitedPages.has(nextPageUrl)) {
        reachedEnd = true;
        updateButton();
        return;
      }

      loading = true;
      updateButton();
      const requestedUrl = nextPageUrl;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(requestedUrl, {
          credentials: 'same-origin',
          signal: controller.signal
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const pageUrl = response.url || requestedUrl;
        const page = new DOMParser().parseFromString(await response.text(), 'text/html');
        visitedPages.add(requestedUrl);
        const added = appendIndexPage(page, pageUrl, gallery, cardObserver);
        nextPageUrl = findNextPageUrl(page, pageUrl);
        reachedEnd = added === 0 || !nextPageUrl;
      } catch (error) {
        console.debug('[U18 Viewport Fit] Could not load next index page:', error);
      } finally {
        clearTimeout(timeout);
        loading = false;
        updateButton();
      }

    };

    button.addEventListener('click', () => {
      enabled = !enabled;
      writeInfiniteEnabled(enabled);
      updateButton();
      if (enabled) maybeLoadNextPage();
    });
    window.addEventListener('scroll', maybeLoadNextPage, { passive: true });
    controlsContainer().appendChild(button);
    updateButton();
    if (enabled) maybeLoadNextPage();
  }

  function installQuoteEnhancements() {
    if (!/\/topic\/\d+/i.test(location.pathname)) return;
    const posts = new Map();

    for (const message of document.querySelectorAll('span[id^="post_"][id$="_message_div"]')) {
      const match = message.id.match(/^post_(\d+)_message_div$/);
      if (!match) continue;
      const id = match[1];
      const container = document.getElementById(`replybox_${id}`) || message.closest('#FirstPost');
      if (!container) continue;
      if (!container.id) container.id = `u18vf-post-${id}`;
      posts.set(id, {
        id,
        message,
        container,
        userDetails: container.querySelector('.UserDetails')
      });
    }

    const backlinks = new Map();
    for (const source of posts.values()) {
      for (const quote of source.message.querySelectorAll('a.PostLink[href]')) {
        const match = (quote.textContent || '').trim().match(/^>>(\d+)$/);
        const target = match ? posts.get(match[1]) : null;
        if (!target) continue;
        const sources = backlinks.get(target.id) || new Set();
        sources.add(source.id);
        backlinks.set(target.id, sources);

        quote.classList.add('u18vf-inline-quote-link');
        quote.addEventListener('click', (event) => {
          if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          const existing = source.message.querySelector(`.u18vf-inline-quote[data-target="${target.id}"]`);
          if (existing) {
            existing.remove();
            return;
          }

          const preview = document.createElement('span');
          preview.className = 'u18vf-inline-quote';
          preview.dataset.target = target.id;
          const header = document.createElement('span');
          header.className = 'u18vf-inline-quote-header';
          header.textContent = `${(target.userDetails?.textContent || '').replace(/\s+/g, ' ').trim()} `;
          const jump = document.createElement('a');
          jump.href = `#${target.container.id}`;
          jump.textContent = `>>${target.id}`;
          header.appendChild(jump);
          preview.appendChild(header);

          const thumbnail = target.container.querySelector(`img[id="post_${target.id}_image"]`);
          const sourceUrl = thumbnail?.getAttribute('data-original') || thumbnail?.getAttribute('src');
          if (sourceUrl) {
            const image = document.createElement('img');
            image.className = 'u18vf-inline-quote-thumb';
            image.src = sourceUrl;
            image.alt = '';
            preview.appendChild(image);
          }

          const body = document.createElement('span');
          body.className = 'u18vf-inline-quote-body';
          const messageCopy = target.message.cloneNode(true);
          messageCopy.querySelectorAll('.u18vf-inline-quote').forEach((inline) => inline.remove());
          body.textContent = messageText(messageCopy);
          preview.appendChild(body);
          source.message.appendChild(preview);
        });
      }
    }

    for (const [targetId, sourceIds] of backlinks) {
      const target = posts.get(targetId);
      if (!target?.userDetails || target.userDetails.querySelector('.u18vf-backlinks')) continue;
      const holder = document.createElement('span');
      holder.className = 'u18vf-backlinks';
      holder.append('Replies: ');
      for (const sourceId of sourceIds) {
        const source = posts.get(sourceId);
        if (!source) continue;
        const link = document.createElement('a');
        link.href = `#${source.container.id}`;
        link.textContent = `>>${sourceId}`;
        holder.appendChild(link);
      }
      target.userDetails.appendChild(holder);
    }
  }

  function installSiteCleanup() {
    for (const notice of document.querySelectorAll('body > center')) {
      const text = (notice.textContent || '').replace(/\s+/g, ' ').trim();
      if (!/all content posted is responsibility/i.test(text) || !/not obligated to remove content/i.test(text)) continue;
      const before = notice.previousElementSibling;
      const after = notice.nextElementSibling;
      notice.remove();
      for (const spacer of [before, after]) {
        if (spacer?.matches('p:empty, br')) spacer.remove();
      }
    }

    const boardList = document.querySelector('.BoardList');
    const header = boardList?.parentElement;
    if (!header || header === document.body || !header.querySelector('.Title')) return;

    header.classList.add('u18vf-site-header');
    document.body.classList.add('u18vf-site-clean');

    const updateHeaderHeight = () => {
      const height = Math.ceil(header.getBoundingClientRect().height);
      if (height > 0) document.documentElement.style.setProperty('--u18vf-header-height', `${height}px`);
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight, { passive: true });
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(updateHeaderHeight).observe(header);
    }
  }

  function start() {
    installSiteCleanup();
    installThreadEhButton();
    installQuoteEnhancements();
    const gallery = document.getElementById('gallery_body');
    const items = gallery?.querySelectorAll('.item') || [];
    if (!items.length) return;
    gallery.classList.add('u18vf-comments-enabled');
    installSizeToggle(gallery);
    window.addEventListener('resize', () => resizeGallery(gallery), { passive: true });

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        enqueue(entry.target);
      }
    }, { rootMargin: '200px 0px' });

    items.forEach((item) => {
      installEhButton(item);
      observer.observe(item);
    });
    installInfiniteScroll(gallery, observer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
