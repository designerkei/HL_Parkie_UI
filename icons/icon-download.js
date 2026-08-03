import { PARKIE_ICONS, PARKIE_ICON_SECTIONS, PARKIE_ICON_STATES, STATE_COLORS } from './parkie-icon-data.js';

const CANVAS = 40, OFFSET = 8, BG = '#131315', R = 8;

export function generateSVG(icon, stateId) {
  const sc = STATE_COLORS[stateId];
  const bg = `<rect width="40" height="40" fill="${BG}"/>`;
  const overlay = sc.bg ? `<rect width="40" height="40" rx="${R}" fill="${sc.bg}"/>` : '';
  const ring = sc.ring ? `<rect x="2" y="2" width="36" height="36" rx="${R - 1}" fill="none" stroke="${sc.ring}" stroke-width="2.5" stroke-opacity="0.5"/>` : '';
  const body = icon.body.replace(/currentColor/g, sc.icon);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}" width="${CANVAS}" height="${CANVAS}">\n  ${bg}${overlay}${ring}\n  <g transform="translate(${OFFSET},${OFFSET})">${body}</g>\n</svg>`;
}

export function generatePreviewDataUrl(icon, stateId) {
  return 'data:image/svg+xml,' + encodeURIComponent(generateSVG(icon, stateId));
}

function iconById(iconId) {
  return PARKIE_ICONS.find(i => i.id === iconId);
}

function categoryFolder(category) {
  if (category === 'navigation') return 'navigation';
  if (category === 'robot-parking') return 'robot-parking';
  return 'control';
}

export function downloadSingleSVG(iconId, stateId) {
  const icon = iconById(iconId);
  if (!icon) return;
  const svg = generateSVG(icon, stateId);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${icon.id}-${stateId}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadIconFamily(iconId) {
  const icon = iconById(iconId);
  if (!icon) return;
  const zip = new window.JSZip();
  for (const state of PARKIE_ICON_STATES) {
    zip.file(`${icon.id}-${state.id}.svg`, generateSVG(icon, state.id));
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `parkie-icon-${icon.id}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadAllIcons() {
  const zip = new window.JSZip();
  for (const section of PARKIE_ICON_SECTIONS) {
    const folder = zip.folder(categoryFolder(section.category));
    for (const icon of section.icons) {
      for (const state of PARKIE_ICON_STATES) {
        folder.file(`${icon.id}-${state.id}.svg`, generateSVG(icon, state.id));
      }
    }
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'parkie-icons.zip';
  a.click();
  URL.revokeObjectURL(url);
}

if (typeof window !== 'undefined') {
  window.parkieIconDownload = { downloadIconFamily, downloadAllIcons, downloadSingleSVG };
}
