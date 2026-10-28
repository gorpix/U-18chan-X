// ==UserScript==
// @name         U-18Chan Viewport Fit + OP Comments
// @namespace    local.codex.u18chan
// @version      1.3
// @description  Cleans U-18Chan, fits images, adds index/thread tools, inline quotes, backlinks, and E-Hentai matching.
// @homepageURL  https://github.com/gorpix/U-18chan-X
// @updateURL    https://raw.githubusercontent.com/gorpix/U-18chan-X/main/u18chan-viewport-fit.user.js
// @downloadURL  https://raw.githubusercontent.com/gorpix/U-18chan-X/main/u18chan-viewport-fit.user.js
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

    img.ThumbnailImage[is-expanded][data-u18vf-original],
    img.ThumbnailImageReply[is-expanded][data-u18vf-original] {
      max-width: none !important;
      max-height: none !important;
    }

    .ad_banner,
    .ad_banner2 {
      display: none !important;
    }

    /* Hidden but still rendered, so the ad iframe keeps loading (display:none can stop it). Also covers anything
       the ad script inserts next to the slot, in the header (index pages) or in <body> before the nav (threads). */
    #ad-header-slot,
    #ad-header-slot ~ :has(~ .BoardList),
    .u18vf-site-header > :not(.BoardList, .Title, .Description) {
      position: fixed !important;
      top: 0 !important;
      left: -10000px !important;
      width: 728px !important;
      opacity: 0 !important;
      pointer-events: none !important;
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
      cursor: pointer;
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
    }

    .u18vf-hover-preview {
      position: fixed;
      z-index: 2147483646;
      max-width: min(600px, calc(100vw - 24px));
      max-height: calc(100vh - 24px);
      margin: 0;
      overflow: hidden;
      border: 1px solid #666;
      background: rgba(20, 20, 20, 0.97);
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.6);
      pointer-events: none;
    }

    /* Subtly lighten the post's own background: an inset shadow tints whatever colour the theme uses and is drawn
       beneath the content, so text and images are unaffected. */
    .u18vf-quote-target {
      box-shadow: inset 0 0 0 100vmax rgba(255, 255, 255, 0.07) !important;
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
      /* One black box behind the title, thumbnail and comment. */
      background: rgba(0, 0, 0, 0.58);
      border-radius: 4px;
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
      margin: 0 !important; /* the site's 10px bottom margin shifts the centered image up into the title */
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
        } catch (error) {
          cache.delete(url); // don't cache failures, so the card can retry later
          throw error;
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
      // Place it below the thumbnail (Subject, then .layoutHeight), falling back to under the subject.
      (item.querySelector('.layoutHeight') || subject).insertAdjacentElement('afterend', output);
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

  // Board id from either URL form: /gc/topic/123 or /board/u18chan/gc/topic/123.
  function currentBoard() {
    const parts = location.pathname.split('/').filter(Boolean).map((part) => part.toLowerCase());
    const topicAt = parts.indexOf('topic');
    if (topicAt > 0) return parts[topicAt - 1];
    if (parts[0] === 'board') return parts[2] || null;
    return parts[0] || null;
  }

  function ehFurryFilter() {
    const board = currentBoard();
    // Comics boards only (and their indexes): /gc/ is gay comics, /c/ is straight comics.
    if (['igc', 'gc'].includes(board)) return 'm:furry$';
    if (['ic', 'c'].includes(board)) return 'f:furry$';
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
    for (const match of subject.matchAll(/\[([^\]]{2,60})\]/g)) artists.push(match[1].trim());
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
    let failures = 0;
    let retryAfter = 0;
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
      if (!enabled || loading || reachedEnd || Date.now() < retryAfter || !nearBottom()) return;
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
        failures = 0;
      } catch (error) {
        // Back off exponentially (2s, 4s, ... capped at 30s) instead of retrying on every scroll event.
        failures += 1;
        retryAfter = Date.now() + Math.min(30000, 1000 * 2 ** failures);
        console.debug('[U18 Viewport Fit] Could not load next index page:', error);
      } finally {
        clearTimeout(timeout);
        loading = false;
        updateButton();
      }
      // A short page can leave us near the bottom with no further scroll event to trigger the next load.
      if (!failures) setTimeout(maybeLoadNextPage, 300);
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
    const postsByContainer = new Map();

    for (const message of document.querySelectorAll('span[id^="post_"][id$="_message_div"]')) {
      const match = message.id.match(/^post_(\d+)_message_div$/);
      if (!match) continue;
      const id = match[1];
      const container = document.getElementById(`replybox_${id}`) || message.closest('#FirstPost');
      if (!container) continue;
      if (!container.id) container.id = `u18vf-post-${id}`;
      const post = {
        id,
        message,
        container,
        userDetails: container.querySelector('.UserDetails')
      };
      posts.set(id, post);
      postsByContainer.set(container, post);
    }

    // A quote (>>123 in a message) or one of our backlinks, pointing at a post on this page.
    const quoteTarget = (link) => {
      if (!(link instanceof Element) || !link.matches('a.PostLink, .u18vf-backlinks a')) return null;
      const match = (link.textContent || '').trim().match(/^>>(\d+)$/);
      return match ? posts.get(match[1]) || null : null;
    };
    const linkFromEvent = (event) => (event.target instanceof Element ? event.target.closest('a') : null);

    const jumpToPost = (post, event) => {
      event.preventDefault();
      event.stopPropagation();
      const hash = `#${post.container.id}`;
      history.pushState(null, '', hash);
      post.container.scrollIntoView({ block: 'start' });
    };

    const detailsText = (post) => {
      if (!post.userDetails) return '';
      const copy = post.userDetails.cloneNode(true);
      copy.querySelectorAll('.u18vf-backlinks').forEach((node) => node.remove());
      return (copy.textContent || '').replace(/\s+/g, ' ').trim();
    };

    // Builds a preview of a post from its live markup, so the quotes and backlinks inside it stay clickable and
    // previews can nest. Used both inline (click) and as the hover bubble.
    const buildPreview = (referenced) => {
      const preview = document.createElement('span');
      preview.className = 'u18vf-inline-quote';
      preview.dataset.target = referenced.id;

      const header = document.createElement('span');
      header.className = 'u18vf-inline-quote-header';
      header.textContent = `${detailsText(referenced)} `;
      const jump = document.createElement('a');
      jump.href = `#${referenced.container.id}`;
      jump.textContent = `#${referenced.id}`;
      header.appendChild(jump);
      const backlinks = referenced.userDetails?.querySelector('.u18vf-backlinks');
      if (backlinks) header.appendChild(backlinks.cloneNode(true));
      preview.appendChild(header);

      const thumbnail = referenced.container.querySelector(`img[id="post_${referenced.id}_image"]`);
      const sourceUrl = thumbnail?.getAttribute('data-collapsed-original')
        || thumbnail?.getAttribute('data-original')
        || thumbnail?.getAttribute('src');
      if (sourceUrl) {
        const image = document.createElement('img');
        image.className = 'u18vf-inline-quote-thumb';
        image.src = sourceUrl;
        image.alt = '';
        preview.appendChild(image);
      }

      const body = document.createElement('span');
      body.className = 'u18vf-inline-quote-body';
      const messageCopy = referenced.message.cloneNode(true);
      messageCopy.querySelectorAll('.u18vf-inline-quote').forEach((inline) => inline.remove());
      messageCopy.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
      body.append(...messageCopy.childNodes);
      preview.appendChild(body);
      return preview;
    };

    // Where a clicked link's preview goes: inside the preview it was clicked in, otherwise under its post's message.
    const previewOwner = (link) => {
      const parentPreview = link.closest('.u18vf-inline-quote');
      if (parentPreview) return parentPreview.querySelector(':scope > .u18vf-inline-quote-body');
      const container = link.closest('[id^="replybox_"], #FirstPost');
      return postsByContainer.get(container)?.message || null;
    };

    const togglePreview = (owner, referenced) => {
      const existing = Array.from(owner.children)
        .find((child) => child.matches('.u18vf-inline-quote') && child.dataset.target === referenced.id);
      if (existing) {
        existing.remove();
        return;
      }
      owner.appendChild(buildPreview(referenced));
    };

    // Hover: highlight the referenced post when it's on screen, otherwise show it in a bubble next to the pointer.
    let hovered = null;
    let pointer = { x: 0, y: 0 };

    const hideHover = () => {
      if (!hovered) return;
      hovered.target.container.classList.remove('u18vf-quote-target');
      hovered.bubble?.remove();
      hovered = null;
    };

    // The fixed nav/header covers the top of the viewport; a post hidden under it isn't really on screen.
    const coveredTop = () => Math.max(0, ...['.u18vf-site-header', '.BoardList'].map((selector) => {
      const element = document.querySelector(selector);
      return element && getComputedStyle(element).position === 'fixed' ? element.getBoundingClientRect().bottom : 0;
    }));

    const onScreen = (element) => {
      const rect = element.getBoundingClientRect();
      const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, coveredTop());
      return visible >= Math.min(rect.height, 120);
    };

    const positionBubble = (bubble) => {
      const gap = 12;
      const offset = 16;
      const { width, height } = bubble.getBoundingClientRect();
      let left = pointer.x + offset;
      if (left + width > window.innerWidth - gap) left = Math.max(gap, pointer.x - offset - width);
      let top = pointer.y + offset;
      if (top + height > window.innerHeight - gap) top = Math.max(gap, window.innerHeight - gap - height);
      bubble.style.left = `${left}px`;
      bubble.style.top = `${top}px`;
    };

    document.addEventListener('mouseover', (event) => {
      const link = linkFromEvent(event);
      const referenced = quoteTarget(link);
      if (!referenced) return;
      // Capture phase on document runs before the site's delegated jQuery handler; stopping here keeps its bubble away.
      event.stopPropagation();
      pointer = { x: event.clientX, y: event.clientY };
      if (hovered?.link === link) return;
      hideHover();
      hovered = { link, target: referenced, bubble: null };
      if (onScreen(referenced.container)) {
        referenced.container.classList.add('u18vf-quote-target');
        return;
      }
      const bubble = buildPreview(referenced);
      bubble.classList.add('u18vf-hover-preview');
      document.body.appendChild(bubble);
      positionBubble(bubble);
      bubble.querySelector('img')?.addEventListener('load', () => {
        if (hovered?.bubble === bubble) positionBubble(bubble);
      });
      hovered.bubble = bubble;
    }, true);

    document.addEventListener('mousemove', (event) => {
      if (!hovered?.bubble) return;
      pointer = { x: event.clientX, y: event.clientY };
      positionBubble(hovered.bubble);
    }, { capture: true, passive: true });

    document.addEventListener('mouseout', (event) => {
      if (!hovered) return;
      const link = linkFromEvent(event);
      if (link !== hovered.link || link.contains(event.relatedTarget)) return;
      event.stopPropagation();
      hideHover();
    }, true);

    window.addEventListener('scroll', hideHover, { passive: true });

    // Delegated so links inside previews (at any depth) work too.
    document.addEventListener('click', (event) => {
      const link = linkFromEvent(event);
      const referenced = quoteTarget(link);
      if (!referenced) return;
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      hideHover();
      const owner = previewOwner(link);
      if (owner) togglePreview(owner, referenced);
    });

    document.addEventListener('auxclick', (event) => {
      if (event.button !== 1) return;
      const referenced = quoteTarget(linkFromEvent(event));
      if (referenced) jumpToPost(referenced, event);
    });

    const backlinks = new Map();
    for (const source of posts.values()) {
      for (const quote of source.message.querySelectorAll('a.PostLink')) {
        const target = quoteTarget(quote);
        if (!target) continue;
        quote.classList.add('u18vf-inline-quote-link');
        if (!backlinks.has(target.id)) backlinks.set(target.id, new Set());
        backlinks.get(target.id).add(source.id);
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
        link.className = 'u18vf-inline-quote-link';
        link.href = `#${source.container.id}`;
        link.textContent = `>>${sourceId}`;
        holder.appendChild(link);
      }
      target.userDetails.appendChild(holder);
    }
  }

  function installTabTitle() {
    const boardId = currentBoard();
    const boardLabel = boardId && boardId !== 'topic' ? `/${boardId}/` : 'U-18Chan';
    const subject = (document.querySelector('#FirstPost .Subject')?.textContent || '').replace(/\s+/g, ' ').trim();
    if (/\/topic\/\d+/i.test(location.pathname) && subject) {
      document.title = `${boardLabel} - ${subject}`;
      return;
    }

    let boardTitle = (document.querySelector('.Title')?.textContent || '').replace(/\s+/g, ' ').trim();
    if (boardId) {
      const escapedBoard = boardId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      boardTitle = boardTitle.replace(new RegExp(`^/${escapedBoard}/\\s*[-–—:]\\s*`, 'i'), '');
    }
    document.title = boardTitle ? `${boardLabel} - ${boardTitle} - U-18Chan` : `${boardLabel} - U-18Chan`;
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

    // The <br>s above the ad slot only exist to make room for it. On thread pages the slot sits directly in <body>,
    // so the header handling below bails out and they would leave a gap above the nav bar. (<meta>s are kept.)
    const adSlot = document.getElementById('ad-header-slot');
    for (let prev = adSlot?.previousElementSibling; prev?.matches('br, meta');) {
      const next = prev.previousElementSibling;
      if (prev.matches('br')) prev.remove();
      prev = next;
    }
    if (adSlot) {
      // Inline !important styles from the ad script would beat the stylesheet, so pin ours inline and re-apply them
      // whenever the slot's style attribute changes.
      const stashed = { position: 'fixed', top: '0', left: '-10000px', width: '728px', opacity: '0', 'pointer-events': 'none' };
      const stash = () => {
        for (const [property, value] of Object.entries(stashed)) {
          if (adSlot.style.getPropertyValue(property) !== value || adSlot.style.getPropertyPriority(property) !== 'important') {
            adSlot.style.setProperty(property, value, 'important');
          }
        }
      };
      stash();
      new MutationObserver(stash).observe(adSlot, { attributes: true, attributeFilter: ['style'] });
    }

    // "Page generated in ..." line, the stray number printed beside it, and the empty spacer paragraphs that
    // used to make room for the header ad and push everything down.
    for (const span of document.querySelectorAll('body > div > span')) {
      if (/^Page generated in/i.test((span.textContent || '').trim())) span.parentElement.remove();
    }
    for (const node of Array.from(document.body.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE && /^\s*\d+\s*$/.test(node.textContent || '')) node.remove();
    }
    for (const spacer of document.querySelectorAll('body > p[style*="padding-top"]')) {
      if (!spacer.textContent.trim() && !spacer.children.length) spacer.remove();
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

  function installOriginalSizeToggle() {
    // Shift-click toggles original (unfitted) size. On an expanded image we swallow the click so the site doesn't
    // collapse it; on a collapsed thumbnail we let the site's handler expand it, then mark it unfitted.
    document.addEventListener('click', (event) => {
      if (event.button !== 0) return;
      const image = event.target instanceof Element
        ? event.target.closest('img.ThumbnailImage, img.ThumbnailImageReply')
        : null;
      if (!image) return;
      if (!event.shiftKey) {
        image.removeAttribute('data-u18vf-original'); // plain click: next expansion fits the viewport again
        return;
      }
      event.preventDefault(); // stop shift+click on the wrapping link from opening a new window
      if (image.hasAttribute('is-expanded')) {
        event.stopImmediatePropagation();
        image.toggleAttribute('data-u18vf-original');
      } else {
        image.setAttribute('data-u18vf-original', '');
      }
    }, true);
  }

  function start() {
    installOriginalSizeToggle();
    installTabTitle();
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
