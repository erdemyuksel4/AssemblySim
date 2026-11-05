import fs from 'fs';
import path from 'path';

const version = Date.now().toString(36);

// Clean HTML template with cache-busting to prevent GitHub Pages / browser stale cache
const htmlContent = `<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <title>8086 Compiler & AssemblySim</title>
    <link rel="stylesheet" href="./style.css?v=${version}" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./app.js?v=${version}"></script>
  </body>
</html>
`;

// Ensure directories exist
if (!fs.existsSync('docs')) fs.mkdirSync('docs', { recursive: true });
if (!fs.existsSync('dist')) fs.mkdirSync('dist', { recursive: true });

// 1. Write docs/
fs.writeFileSync('docs/index.html', htmlContent, 'utf8');
fs.copyFileSync('src/style.css', 'docs/style.css');
fs.writeFileSync('docs/.nojekyll', '', 'utf8');

// 2. Sync to dist/ as well
fs.writeFileSync('dist/index.html', htmlContent, 'utf8');
fs.copyFileSync('src/style.css', 'dist/style.css');
fs.writeFileSync('dist/.nojekyll', '', 'utf8');
if (fs.existsSync('docs/app.js')) {
  fs.copyFileSync('docs/app.js', 'dist/app.js');
}
if (fs.existsSync('docs/app.js.map')) {
  fs.copyFileSync('docs/app.js.map', 'dist/app.js.map');
}

console.log(`✓ Clean build ready (version: ${version}) in both docs/ and dist/`);
