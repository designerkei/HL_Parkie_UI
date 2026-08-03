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
    var rgba = text.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)$/i);
    if (!rgba) return { color: text || '#000000', alpha: 1 };
    var hex = [rgba[1], rgba[2], rgba[3]].map(function (part) {
      var n = Math.max(0, Math.min(255, Math.round(parseFloat(part)))).toString(16);
      return n.length < 2 ? '0' + n : n;
    }).join('');
    return { color: '#' + hex.toUpperCase(), alpha: rgba[4] === undefined ? 1 : parseFloat(rgba[4]) };
  }

  var PAINT_ATTRS = [['fill', 'fill-opacity'], ['stroke', 'stroke-opacity']];

  /* One state of one icon. Only currentColor picks up the state paint; literal
     colours in the body (semantic battery fills, the white charging bolt) are
     what they are and stay put. Alpha multiplies into any opacity the element
     already carries, which is how the browser composites it on the page. */
  function buildStateSvg(data, stateValue, resolveToken) {
    var paint = splitColor(stateValue);
    var body = resolveVars(data.body, paint.color, resolveToken);
    var doc = new DOMParser().parseFromString(wrap(data.viewBox, body), 'image/svg+xml');
    if (doc.querySelector('parsererror')) throw new Error('icon body is not well-formed XML');

    var nodes = doc.documentElement.querySelectorAll('*');
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

    return new XMLSerializer().serializeToString(doc.documentElement) + '\n';
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
    splitColor: splitColor,
    save: save,
    crc32: crc32,
  };
}());
