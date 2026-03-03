#!/usr/bin/env node
const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const HOST = '0.0.0.0';
const PORT = Number(process.env.PORT || 4173);
const ROOT = __dirname;

const TRACKING_PATTERNS = {
  yandexMetrika: [/mc\.yandex\.ru/i, /ym\(/i, /yandex\s*metrika/i],
  facebookPixel: [/connect\.facebook\.net/i, /fbq\(/i, /facebook\s*pixel/i],
  googleTagManager: [/googletagmanager\.com/i, /gtag\(/i, /GTM-[A-Z0-9]+/i],
};

const SIGNAL_PATTERNS = {
  funnelScript: [/location\.search/i, /URLSearchParams/i, /[?&](utm_|sub|clickid|campaign|source)=/i, /quiz|funnel|step/i],
  funnelTracking: [/ym\([^)]*reachGoal/i, /fbq\(['"]track/i, /gtag\(['"]event/i, /dataLayer\.push/i],
  paywall: [/paywall/i, /checkout/i, /payment/i, /credit\s*card/i, /paypal/i, /apple\s*pay/i, /google\s*pay/i],
  terms: [/terms\s*(and|&)\s*conditions/i, /terms\s*of\s*use/i, /услов(ия|иями)\s*использования/i],
  privacy: [/privacy\s*policy/i, /политик[аы]\s*конфиденциальности/i],
  confirmation: [/confirm/i, /success/i, /thank\s*you/i, /подтвержден/i, /подтверждени/i],
};

function hasAnyPattern(content, patterns) {
  return patterns.some((pattern) => pattern.test(content));
}

function isLandingDirectory(name) {
  if (name.startsWith('.')) return false;
  if (name === 'node_modules') return false;
  return true;
}

async function readFolderFiles(dirPath) {
  let totalSize = 0;
  let fileCount = 0;
  let latestMtime = 0;
  const textFiles = [];

  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      const stat = await fs.stat(fullPath);
      totalSize += stat.size;
      fileCount += 1;
      latestMtime = Math.max(latestMtime, stat.mtimeMs);

      if (/\.(html?|js)$/i.test(entry.name) && stat.size < 1_500_000) {
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          textFiles.push({ name: entry.name, content });
        } catch {
          // Ignore undecodable files.
        }
      }
    }
  }

  await walk(dirPath);
  return { totalSize, fileCount, latestMtime, textFiles };
}

function detectTracking(content) {
  const result = {};
  for (const [key, patterns] of Object.entries(TRACKING_PATTERNS)) {
    result[key] = hasAnyPattern(content, patterns);
  }
  return result;
}

function collectQuickStats(content) {
  const forms = (content.match(/<form\b/gi) || []).length;
  const externalScripts = (content.match(/<script[^>]+src=/gi) || []).length;
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(content);
  const hasTitle = /<title>[^<]+<\/title>/i.test(content);

  return { forms, externalScripts, hasViewport, hasTitle };
}

function detectSignals(textFiles) {
  const joined = textFiles.map((file) => file.content).join('\n');
  const paywallFiles = textFiles.filter((file) => hasAnyPattern(file.content, SIGNAL_PATTERNS.paywall));
  const termsFound = hasAnyPattern(joined, SIGNAL_PATTERNS.terms);
  const privacyFound = hasAnyPattern(joined, SIGNAL_PATTERNS.privacy);
  const confirmationFound = hasAnyPattern(joined, SIGNAL_PATTERNS.confirmation);

  return {
    funnelScript: hasAnyPattern(joined, SIGNAL_PATTERNS.funnelScript),
    funnelTracking: hasAnyPattern(joined, SIGNAL_PATTERNS.funnelTracking),
    paywall: paywallFiles.length > 0,
    paywallMetrika: paywallFiles.some((file) => hasAnyPattern(file.content, TRACKING_PATTERNS.yandexMetrika)),
    servicePages: termsFound && privacyFound && confirmationFound,
  };
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
}

async function loadLandings() {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const folders = entries
    .filter((entry) => entry.isDirectory() && isLandingDirectory(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'ru'));

  const landings = [];

  for (const folderName of folders) {
    const folderPath = path.join(ROOT, folderName);
    const indexPath = path.join(folderPath, 'index.html');

    let indexHtml = '';
    let hasIndex = true;
    try {
      indexHtml = await fs.readFile(indexPath, 'utf8');
    } catch {
      hasIndex = false;
    }

    const stats = await readFolderFiles(folderPath);
    const tracking = detectTracking(indexHtml);
    const quick = collectQuickStats(indexHtml);
    const signals = detectSignals(stats.textFiles);

    landings.push({
      folderName,
      hasIndex,
      previewUrl: hasIndex ? `/${folderName}/index.html` : null,
      openUrl: `/${folderName}/`,
      updatedAt: stats.latestMtime ? new Date(stats.latestMtime).toISOString() : null,
      files: stats.fileCount,
      size: formatBytes(stats.totalSize),
      tracking,
      quick,
      signals,
    });
  }

  return landings;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

async function serveFile(res, absolutePath) {
  try {
    const data = await fs.readFile(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const requestPath = decodeURIComponent(parsedUrl.pathname);

  if (requestPath === '/api/landings') {
    try {
      const landings = await loadLandings();
      return sendJson(res, 200, { generatedAt: new Date().toISOString(), landings });
    } catch (error) {
      return sendJson(res, 500, { error: 'Failed to scan landing folders', details: String(error) });
    }
  }

  if (requestPath === '/' || requestPath === '/index.html') {
    return serveFile(res, path.join(ROOT, 'index.html'));
  }

  const normalized = path.normalize(requestPath).replace(/^([.][.][/\\])+/, '');
  const targetPath = path.join(ROOT, normalized);

  if (!targetPath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }

  return serveFile(res, targetPath);
});

server.listen(PORT, HOST, () => {
  console.log(`Landing dashboard: http://${HOST}:${PORT}`);
});
