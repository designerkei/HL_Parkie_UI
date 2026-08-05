/* Standalone SVG export for the Parkie icon catalog.
 *
 * The runtime bodies paint with currentColor and var(--parkie-*), neither of
 * which survives outside the page — design tools render currentColor as an
 * arbitrary default and drop custom properties entirely. Both are resolved to
 * literal values here so a downloaded file opens correctly in Illustrator,
 * Figma or Sketch.
 *
 * The archive is written with the STORE method rather than DEFLATE. The whole
 * catalog is a few tens of KB of text, so compression buys nothing worth a
 * vendored dependency, and this repo serves every asset locally with no build
 * step. Timestamps are fixed so the same catalog always produces the same
 * bytes.
 *
 * Exposes window.__parkieSvgExport.
 */
(function () {
  'use strict';

  var DOS_TIME = 0;
  var DOS_DATE = 23585; // 2026-01-01, fixed so archives are byte-stable.

  var CRC_TABLE = (function () {
    var table = new Uint32Array(256);
    for (var n = 0; n < 256; n += 1) {
      var c = n;
      for (var k = 0; k < 8; k += 1) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
    return table;
  }());

  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i += 1) {
      c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    }
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function utf8(text) {
    return new TextEncoder().encode(text);
  }

  function writer(size) {
    var buffer = new Uint8Array(size);
    var view = new DataView(buffer.buffer);
    var at = 0;
    return {
      bytes: buffer,
      offset: function () { return at; },
      u16: function (value) { view.setUint16(at, value, true); at += 2; },
      u32: function (value) { view.setUint32(at, value >>> 0, true); at += 4; },
      raw: function (chunk) { buffer.set(chunk, at); at += chunk.length; },
    };
  }

  /* files: [{ name, text }] -> Blob (application/zip) */
  function zip(files) {
    var entries = files.map(function (file) {
      var nameBytes = utf8(file.name);
      var dataBytes = utf8(file.text);
      return { nameBytes: nameBytes, dataBytes: dataBytes, crc: crc32(dataBytes) };
    });

    var localSize = entries.reduce(function (sum, e) {
      return sum + 30 + e.nameBytes.length + e.dataBytes.length;
    }, 0);
    var centralSize = entries.reduce(function (sum, e) {
      return sum + 46 + e.nameBytes.length;
    }, 0);

    var out = writer(localSize + centralSize + 22);
    var offsets = [];

    entries.forEach(function (e) {
      offsets.push(out.offset());
      out.u32(0x04034B50);
      out.u16(20);      // version needed
      out.u16(0x0800);  // UTF-8 filename
      out.u16(0);       // stored
      out.u16(DOS_TIME);
      out.u16(DOS_DATE);
      out.u32(e.crc);
      out.u32(e.dataBytes.length);
      out.u32(e.dataBytes.length);
      out.u16(e.nameBytes.length);
      out.u16(0);
      out.raw(e.nameBytes);
      out.raw(e.dataBytes);
    });

    var centralStart = out.offset();
    entries.forEach(function (e, index) {
      out.u32(0x02014B50);
      out.u16(20);      // version made by
      out.u16(20);      // version needed
      out.u16(0x0800);
      out.u16(0);
      out.u16(DOS_TIME);
      out.u16(DOS_DATE);
      out.u32(e.crc);
      out.u32(e.dataBytes.length);
      out.u32(e.dataBytes.length);
      out.u16(e.nameBytes.length);
      out.u16(0);       // extra
      out.u16(0);       // comment
      out.u16(0);       // disk
      out.u16(0);       // internal attrs
      out.u32(0);       // external attrs
      out.u32(offsets[index]);
      out.raw(e.nameBytes);
    });

    out.u32(0x06054B50);
    out.u16(0);
    out.u16(0);
    out.u16(entries.length);
    out.u16(entries.length);
    out.u32(centralSize);
    out.u32(centralStart);
    out.u16(0);

    return new Blob([out.bytes], { type: 'application/zip' });
  }

  function resolveVars(body, fallback, resolveToken) {
    return String(body).replace(/var\((--[a-zA-Z0-9-]+)\)/g, function (whole, token) {
      var value = resolveToken ? resolveToken(token) : '';
      return value || fallback;
    });
  }

  function wrap(viewBox, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="'
      + (viewBox || '0 0 24 24') + '" fill="none">\n  '
      + body.trim().replace(/\s*\n\s*/g, '\n  ')
      + '\n</svg>\n';
  }

  /* data: { viewBox, body } -> standalone SVG text with no unresolved paint. */
  function buildSvg(data, color, resolveToken) {
    var body = resolveVars(data.body, color, resolveToken).replace(/currentColor/g, color);
    return wrap(data.viewBox, body);
  }

  /* rgba(255,255,255,0.7) -> { color: '#FFFFFF', alpha: 0.7 }
     SVG 1.1 paint attributes take no alpha channel, so the two halves have to
     travel separately or design tools reject the value outright. */
  function splitColor(value) {
    var text = String(value || '').trim();

    var pack = function (parts, alpha) {
      var hex = parts.map(function (part) {
        var n = Math.max(0, Math.min(255, Math.round(parseFloat(part)))).toString(16);
        return n.length < 2 ? '0' + n : n;
      }).join('');
      return { color: '#' + hex.toUpperCase(), alpha: alpha === undefined ? 1 : parseFloat(alpha) };
    };

    var rgba = text.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)$/i);
    if (rgba) return pack([rgba[1], rgba[2], rgba[3]], rgba[4]);

    /* color-mix() against transparent is how the icon focus specimen carries its
       alpha, and Chromium is free to serialise the result as color(srgb ...) on
       0–1 channels instead of rgba(). Same colour, different spelling — without
       this branch the ring resolves to #000000 and disappears into the canvas. */
    var srgb = text.match(/^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/i);
    if (srgb) return pack([srgb[1] * 255, srgb[2] * 255, srgb[3] * 255], srgb[4]);

    return { color: text || '#000000', alpha: 1 };
  }

  var PAINT_ATTRS = [['fill', 'fill-opacity'], ['stroke', 'stroke-opacity']];

  /* Only currentColor picks up the state paint; literal colours in the body
     (semantic battery fills, the white charging bolt) are what they are and stay
     put. Alpha multiplies into any opacity the element already carries, which is
     how the browser composites it on the page. */
  function repaint(root, paint) {
    var nodes = root.querySelectorAll('*');
    for (var i = 0; i < nodes.length; i += 1) {
      for (var a = 0; a < PAINT_ATTRS.length; a += 1) {
        var attr = PAINT_ATTRS[a][0];
        var opacityAttr = PAINT_ATTRS[a][1];
        if (nodes[i].getAttribute(attr) !== 'currentColor') continue;
        nodes[i].setAttribute(attr, paint.color);
        if (paint.alpha >= 1) continue;
        var existing = parseFloat(nodes[i].getAttribute(opacityAttr));
        var combined = (isNaN(existing) ? 1 : existing) * paint.alpha;
        nodes[i].setAttribute(opacityAttr, String(Math.round(combined * 1000) / 1000));
      }
    }
    return root;
  }

  /* One state of one icon, as a standalone file. */
  function buildStateSvg(data, stateValue, resolveToken) {
    var paint = splitColor(stateValue);
    var body = resolveVars(data.body, paint.color, resolveToken);
    var doc = new DOMParser().parseFromString(wrap(data.viewBox, body), 'image/svg+xml');
    if (doc.querySelector('parsererror')) throw new Error('icon body is not well-formed XML');
    return new XMLSerializer().serializeToString(repaint(doc.documentElement, paint)) + '\n';
  }

  /* ---- state sheet ----------------------------------------------------- */

  var SHEET = {
    pad: 32,
    labelWidth: 168,
    cellWidth: 68,
    cellHeight: 64,
    headerHeight: 34,
    captionHeight: 16,
    titleHeight: 30,
    blockGap: 40,
    glyph: 24,
  };

  function esc(text) {
    return String(text === undefined || text === null ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function round(value) {
    return Math.round(value * 100) / 100;
  }

  /* Group ids become layer names in Illustrator, and state labels carry things
     that read badly there — "Selected / On", "정상 26% 이상". Keep the label for
     the caption, slug it for the id. */
  function slug(text) {
    return String(text === undefined || text === null ? '' : text)
      .replace(/[^0-9A-Za-zㄱ-ㆎ가-힣]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /* A paint the sheet can draw: hex plus a separate opacity, because SVG paint
     attributes carry no alpha and design tools reject rgba() outright. */
  function paintAttrs(attr, value) {
    var paint = splitColor(value);
    var out = attr + '="' + paint.color + '"';
    if (paint.alpha < 1) out += ' ' + attr + '-opacity="' + round(paint.alpha) + '"';
    return out;
  }

  function isTransparent(value) {
    if (!value) return true;
    if (/^transparent$/i.test(value)) return true;
    return splitColor(value).alpha === 0;
  }

  /* getComputedStyle reports box-shadow as "<colour> 0px 0px 0px 3px". The last
     length is the spread, which is the whole of the focus ring. The colour is
     lifted off the front and then stripped, because scraping digits naively
     reads rgba()'s alpha as the first offset — and color() carries three more
     numbers of its own. */
  function ringOf(boxShadow) {
    if (!boxShadow || boxShadow === 'none') return null;
    var colour = (boxShadow.match(/^(rgba?\([^)]*\)|color\([^)]*\)|#[0-9a-f]+)/i) || [])[0];
    var lengths = boxShadow.replace(/(?:rgba?|color)\([^)]*\)/i, '').match(/-?[\d.]+px/g);
    if (!colour || !lengths || !lengths.length) return null;
    var spread = parseFloat(lengths[lengths.length - 1]);
    if (!spread) return null;
    return { color: colour, spread: spread };
  }

  /* One cell: the plate behind the glyph, the ring around it, then the glyph.
     Every visual property arrives already computed from the page, so the tone
     tables in the stylesheet are never reimplemented here and cannot drift. */
  function cellMarkup(cell, resolveToken) {
    var parts = [];
    var cx = SHEET.cellWidth / 2;
    var cy = SHEET.cellHeight / 2;
    var w = cell.width || SHEET.glyph;
    var h = cell.height || SHEET.glyph;
    var r = cell.radius || 0;

    var ring = ringOf(cell.boxShadow);
    if (ring) {
      var rw = w + ring.spread;
      var rh = h + ring.spread;
      parts.push('<rect x="' + round(cx - rw / 2) + '" y="' + round(cy - rh / 2) + '"'
        + ' width="' + round(rw) + '" height="' + round(rh) + '"'
        + ' rx="' + round(r + ring.spread / 2) + '" fill="none" '
        + paintAttrs('stroke', ring.color) + ' stroke-width="' + ring.spread + '"/>');
    }

    if (!isTransparent(cell.background)) {
      parts.push('<rect x="' + round(cx - w / 2) + '" y="' + round(cy - h / 2) + '"'
        + ' width="' + round(w) + '" height="' + round(h) + '"'
        + ' rx="' + round(r) + '" ' + paintAttrs('fill', cell.background) + '/>');
    }

    var doc = new DOMParser().parseFromString(
      resolveVars(cell.svg, splitColor(cell.color).color, resolveToken), 'image/svg+xml');
    if (doc.querySelector('parsererror')) throw new Error('cell glyph is not well-formed XML');
    var glyph = repaint(doc.documentElement, splitColor(cell.color));
    var box = (glyph.getAttribute('viewBox') || '0 0 24 24').split(/[\s,]+/).map(Number);
    var scale = SHEET.glyph / (box[2] || 24);
    var inner = '';
    for (var i = 0; i < glyph.childNodes.length; i += 1) {
      inner += new XMLSerializer().serializeToString(glyph.childNodes[i]);
    }
    parts.push('<g transform="translate(' + round(cx - SHEET.glyph / 2) + ' '
      + round(cy - SHEET.glyph / 2) + ') scale(' + round(scale) + ')">' + inner + '</g>');

    return parts.join('');
  }

  /* blocks: [{ id, title, columns, rows: [{ id, ko, en, cells }] }]
     A block with `columns` gets one shared header; without it each cell carries
     its own caption, which the semantic rows need because battery and connection
     label their four cells differently from warning and error. */
  function buildSheet(blocks, options) {
    var opts = options || {};
    var resolveToken = opts.resolveToken;
    var font = opts.font || 'Pretendard, sans-serif';
    var line = opts.gridLine || 'rgba(255,255,255,0.09)';
    var primary = opts.textPrimary || 'rgba(255,255,255,0.95)';
    var secondary = opts.textSecondary || 'rgba(255,255,255,0.60)';

    var widest = 0;
    blocks.forEach(function (block) {
      block.rows.forEach(function (row) { widest = Math.max(widest, row.cells.length); });
    });
    var width = SHEET.pad * 2 + SHEET.labelWidth + widest * SHEET.cellWidth;

    var body = [];
    var y = SHEET.pad;

    blocks.forEach(function (block) {
      var captioned = !block.columns;
      var rowHeight = SHEET.cellHeight + (captioned ? SHEET.captionHeight : 0);
      var out = ['<g id="' + esc(block.id) + '">'];

      out.push('<text x="' + SHEET.pad + '" y="' + round(y + 14) + '" font-family="' + esc(font)
        + '" font-size="13" font-weight="600" ' + paintAttrs('fill', primary) + '>'
        + esc(block.title) + '</text>');
      y += SHEET.titleHeight;

      var gridLeft = SHEET.pad + SHEET.labelWidth;
      if (block.columns) {
        block.columns.forEach(function (label, index) {
          out.push('<text x="' + round(gridLeft + index * SHEET.cellWidth + SHEET.cellWidth / 2)
            + '" y="' + round(y + 20) + '" text-anchor="middle" font-family="' + esc(font)
            + '" font-size="10" ' + paintAttrs('fill', secondary) + '>' + esc(label) + '</text>');
        });
        y += SHEET.headerHeight;
      }

      block.rows.forEach(function (row, rowIndex) {
        var top = y + rowIndex * rowHeight;
        var group = ['<g id="' + esc(row.id) + '">'];

        group.push('<text x="' + SHEET.pad + '" y="' + round(top + SHEET.cellHeight / 2 - 1)
          + '" font-family="' + esc(font) + '" font-size="11" ' + paintAttrs('fill', primary)
          + '>' + esc(row.ko) + '</text>');
        group.push('<text x="' + SHEET.pad + '" y="' + round(top + SHEET.cellHeight / 2 + 12)
          + '" font-family="' + esc(font) + '" font-size="9" ' + paintAttrs('fill', secondary)
          + '>' + esc(row.en) + '</text>');

        row.cells.forEach(function (cell, cellIndex) {
          var x = gridLeft + cellIndex * SHEET.cellWidth;
          group.push('<g id="' + esc(row.id + '-' + (slug(cell.state) || String(cellIndex + 1)))
            + '" transform="translate('
            + round(x) + ' ' + round(top) + ')">' + cellMarkup(cell, resolveToken) + '</g>');
          if (captioned) {
            group.push('<text x="' + round(x + SHEET.cellWidth / 2) + '" y="'
              + round(top + SHEET.cellHeight + 10) + '" text-anchor="middle" font-family="'
              + esc(font) + '" font-size="8" ' + paintAttrs('fill', secondary) + '>'
              + esc(cell.state) + '</text>');
          }
        });

        group.push('<line x1="' + SHEET.pad + '" y1="' + round(top + rowHeight) + '" x2="'
          + round(width - SHEET.pad) + '" y2="' + round(top + rowHeight) + '" '
          + paintAttrs('stroke', line) + ' stroke-width="1"/>');
        group.push('</g>');
        out.push(group.join(''));
      });

      y += block.rows.length * rowHeight + SHEET.blockGap;
      out.push('</g>');
      body.push(out.join('\n  '));
    });

    var height = y - SHEET.blockGap + SHEET.pad;
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + round(width) + '" height="'
      + round(height) + '" viewBox="0 0 ' + round(width) + ' ' + round(height) + '" fill="none">\n'
      + '  <rect width="' + round(width) + '" height="' + round(height) + '" '
      + paintAttrs('fill', opts.background || '#131315') + '/>\n  '
      + body.join('\n  ') + '\n</svg>\n';
  }

  function save(blob, filename) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
  }

  window.__parkieSvgExport = {
    zip: zip,
    buildSvg: buildSvg,
    buildStateSvg: buildStateSvg,
    buildSheet: buildSheet,
    splitColor: splitColor,
    save: save,
    crc32: crc32,
  };
}());
