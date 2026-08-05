/* Serialises a rendered component into SVG.
 *
 * icons/svg-export.js handles single glyphs: it already has the artwork as an
 * SVG body and only has to repaint it. That is not what the component pages
 * are. Buttons, badges, switches, feed rows and the top bar are real DOM — CSS
 * boxes, borders, rounded corners, text runs and pseudo-elements — and there is
 * no artwork to repaint, only a rendering to read back.
 *
 * The rule this follows is the same one collectIconSheetCategories() states: no
 * CSS is reimplemented here. Every position, colour, radius and font arrives
 * already computed from the page, so a tone table or a layout rule in the
 * stylesheet cannot drift away from what the export draws. Concretely that means
 * geometry comes from getBoundingClientRect() — the browser has already resolved
 * flexbox, grid, text wrapping and inheritance, and none of it is modelled here.
 *
 * Two places need the browser to answer a question it does not expose:
 *
 *   Pseudo-elements have styles but no geometry. getComputedStyle(el, '::after')
 *   returns width and height, but ::before on .pk-switch is an in-flow flex item
 *   whose position no amount of style reading will give you. So the pseudo is
 *   suppressed, a real span carrying its computed style is put in its place, and
 *   the browser is asked to lay that out instead. In-flow, absolute and rotated
 *   all fall out of the same trick.
 *
 *   Transforms are not baked into the geometry. getBoundingClientRect() on a
 *   rotated box returns its axis-aligned bounds, which would turn the checkbox
 *   tick from a rotated corner into an upright L. So every box is measured with
 *   transforms suppressed — one flat layout space — and each transform is
 *   re-applied as an SVG transform about the element's own centre, which nests
 *   correctly without any coordinate rebasing.
 *
 * Both mutations are synchronous and reverted inside the same task, so no paint
 * happens in between and React never reconciles against them.
 */
(function () {
  'use strict';

  /* Ratio of font-size from the top of the glyph box down to the baseline. SVG
     positions text by baseline; CSS hands back a line box. dominant-baseline
     would move the problem into the renderer, and Illustrator ignores it, so the
     baseline is computed as a number here and both tools agree. */
  var ASCENT = 0.8;

  var SHEET = {
    pad: 32,
    labelWidth: 168,
    gutter: 24,
    minCellWidth: 68,
    headerHeight: 34,
    captionHeight: 18,
    titleHeight: 30,
    rowPad: 16,
    blockGap: 40,
  };

  function api() {
    var e = window.__parkieSvgExport;
    if (!e || !e.paintAttrs) throw new Error('icons/svg-export.js must load first');
    return e;
  }

  function num(value) {
    var n = parseFloat(value);
    return isFinite(n) ? n : 0;
  }

  /* ---- measuring ------------------------------------------------------- */

  var MEASURE_ATTR = 'data-pk-measure';
  var PSEUDO_ATTR = 'data-pk-pseudo';

  /* Properties copied onto the stand-in span. Layout comes first — those are what
     decide where the browser puts it — then the paint, so the same style object
     can be read again when the box is drawn. */
  var PSEUDO_PROPS = [
    'position', 'display', 'top', 'right', 'bottom', 'left', 'width', 'height',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'box-sizing', 'flex', 'align-self', 'order', 'overflow', 'overflow-x',
    'background-color', 'border-radius',
    'border-top-left-radius', 'border-top-right-radius',
    'border-bottom-right-radius', 'border-bottom-left-radius',
    'border-top-width', 'border-right-width', 'border-bottom-width',
    'border-left-width', 'border-top-color', 'border-right-color',
    'border-bottom-color', 'border-left-color',
    'border-top-style', 'border-right-style', 'border-bottom-style',
    'border-left-style', 'box-shadow', 'opacity',
    'transform', 'transform-origin', 'font-size', 'font-family', 'font-weight',
    'color', 'line-height', 'letter-spacing',
  ];

  /* A frozen copy that answers like a CSSStyleDeclaration, so the drawing code
     cannot tell a pseudo-element from a real one. It has to be a copy: the live
     object reports content:none once the measuring stylesheet is in, and every
     other property would then be read out of a suppressed state. */
  function styleView(map) {
    return {
      getPropertyValue: function (prop) { return map[prop] || ''; },
      backgroundColor: map['background-color'],
      boxShadow: map['box-shadow'],
      opacity: map.opacity,
      overflow: map.overflow,
      overflowX: map['overflow-x'],
      color: map.color,
      fontSize: map['font-size'],
      fontFamily: map['font-family'],
      fontWeight: map['font-weight'],
      letterSpacing: map['letter-spacing'],
    };
  }

  /* Suppressing transforms on the whole subtree puts every box in one flat layout
     space. content:none is what actually removes a pseudo-element — visibility or
     opacity would leave its box in the flow and the stand-in would be measured
     next to it rather than in its place. */
  function measuringCss() {
    return '[' + MEASURE_ATTR + '] *, [' + MEASURE_ATTR + '] { transform: none !important;'
      + ' animation: none !important; transition: none !important; }\n'
      + '[' + MEASURE_ATTR + '] *::before, [' + MEASURE_ATTR + '] *::after,'
      + '[' + MEASURE_ATTR + ']::before, [' + MEASURE_ATTR + ']::after'
      + ' { content: none !important; }\n'
      + '[' + PSEUDO_ATTR + '] { transform: none !important; }';
  }

  /* Read while the page is untouched — see styleView. */
  function pseudoSnapshot(host, which) {
    var style = window.getComputedStyle(host, '::' + which);
    if (!style) return null;
    var content = style.content;
    if (!content || content === 'none' || content === 'normal') return null;

    var map = {};
    for (var i = 0; i < PSEUDO_PROPS.length; i += 1) {
      map[PSEUDO_PROPS[i]] = style.getPropertyValue(PSEUDO_PROPS[i]);
    }
    var text = content.replace(/^["'](.*)["']$/, '$1');
    return {
      which: which,
      map: map,
      style: styleView(map),
      transform: map.transform,
      transformOrigin: map['transform-origin'],
      text: text !== content ? text : '',
    };
  }

  function plantPseudo(host, snap) {
    var span = document.createElement('span');
    span.setAttribute(PSEUDO_ATTR, snap.which);
    span.setAttribute('aria-hidden', 'true');
    Object.keys(snap.map).forEach(function (prop) {
      if (snap.map[prop]) span.style.setProperty(prop, snap.map[prop], 'important');
    });
    /* content:"" paints a box and no text, so the stand-in must not pick up a line
       box from the host and grow taller than the pseudo it stands for. */
    if (snap.text) span.textContent = snap.text;
    else span.style.setProperty('font-size', '0', 'important');

    if (snap.which === 'before') host.insertBefore(span, host.firstChild);
    else host.appendChild(span);
    return span;
  }

  /* One walk that records what the page says, then one measured walk. They are
     separate because reading transforms has to happen before they are suppressed. */
  function describe(root) {
    var nodes = [];

    var visit = function (el, depth) {
      var style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return null;

      var entry = {
        el: el,
        depth: depth,
        style: style,
        transform: style.transform,
        transformOrigin: style.transformOrigin,
        pseudos: [pseudoSnapshot(el, 'before'), pseudoSnapshot(el, 'after')].filter(Boolean),
        children: [],
        texts: [],
      };

      for (var i = 0; i < el.childNodes.length; i += 1) {
        var child = el.childNodes[i];
        if (child.nodeType === 3) {
          if (/\S/.test(child.data)) entry.texts.push(child);
        } else if (child.nodeType === 1) {
          if (child.localName === 'svg') {
            entry.children.push({ svg: child, depth: depth + 1 });
          } else {
            var sub = visit(child, depth + 1);
            if (sub) entry.children.push(sub);
          }
        }
      }

      nodes.push(entry);
      return entry;
    };

    var tree = visit(root, 0);
    return { tree: tree, nodes: nodes };
  }

  function measure(root, described) {
    var style = document.createElement('style');
    style.textContent = measuringCss();
    document.head.appendChild(style);
    root.setAttribute(MEASURE_ATTR, '');

    var planted = [];
    try {
      /* Plant every stand-in before measuring anything: a later pseudo can change
         the position of an earlier one when both are in flow. */
      described.nodes.forEach(function (entry) {
        entry.pseudos.forEach(function (snap) {
          snap.span = plantPseudo(entry.el, snap);
          planted.push(snap.span);
        });
      });

      var base = root.getBoundingClientRect();
      var origin = { left: base.left, top: base.top };

      var box = function (target) {
        var r = target.getBoundingClientRect();
        return {
          x: r.left - origin.left, y: r.top - origin.top,
          w: r.width, h: r.height,
        };
      };

      described.nodes.forEach(function (entry) {
        entry.box = box(entry.el);
        entry.pseudos.forEach(function (snap) {
          var measured = box(snap.span);
          snap.box = measured.w > 0 || measured.h > 0
            ? measured
            : pseudoFallbackBox(entry, snap);
        });
        entry.texts = entry.texts.map(function (node) {
          return { lines: textLines(node, origin), style: entry.style };
        });
        entry.children.forEach(function (child) {
          if (child.svg) child.box = box(child.svg);
        });
      });

      return { width: base.width, height: base.height };
    } finally {
      planted.forEach(function (span) { span.remove(); });
      root.removeAttribute(MEASURE_ATTR);
      style.remove();
    }
  }

  /* An <input> is a replaced element: it renders ::before and ::after once
     appearance is none, but it will not lay out a real child, so the stand-in
     measures 0x0 and the browser cannot be asked where the pseudo went. Every
     pseudo on one in this system is absolutely positioned with explicit offsets
     and a size — the checkbox tick and the radio dot — which is exactly the case
     that can be computed instead of measured.

     Offsets resolve against the host's padding box, and getComputedStyle always
     reports width and height as the content box, so the padding and border are
     added back to get the border box the drawing code expects. */
  function pseudoFallbackBox(entry, snap) {
    var host = entry.style;
    var get = function (prop) { return num(snap.map[prop]); };
    var hostPad = {
      left: num(host.paddingLeft) + num(host.borderLeftWidth),
      top: num(host.paddingTop) + num(host.borderTopWidth),
    };
    var extraX = get('padding-left') + get('padding-right')
      + get('border-left-width') + get('border-right-width');
    var extraY = get('padding-top') + get('padding-bottom')
      + get('border-top-width') + get('border-bottom-width');

    return {
      x: entry.box.x + hostPad.left + get('left'),
      y: entry.box.y + hostPad.top + get('top'),
      w: get('width') + extraX,
      h: get('height') + extraY,
    };
  }

  /* Per-line strings and their painted left edge, grouped character by character.
     Splitting on spaces would lose Korean, which wraps without them; grouping by
     the rect the browser reports works for both scripts and needs no knowledge of
     where the break was allowed. */
  function textLines(node, origin) {
    var range = document.createRange();
    var lines = [];
    var current = null;
    var data = node.data;

    for (var i = 0; i < data.length; i += 1) {
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      var r = range.getBoundingClientRect();
      if (!r.width && !r.height) continue;

      var top = Math.round(r.top * 10) / 10;
      if (!current || Math.abs(current.top - top) > 0.6) {
        current = { top: top, y: r.top - origin.top, x: r.left - origin.left, h: r.height, text: '' };
        lines.push(current);
      }
      current.text += data[i];
      current.h = Math.max(current.h, r.height);
    }

    return lines.filter(function (line) { return /\S/.test(line.text); })
      .map(function (line) {
        var lead = line.text.length - line.text.replace(/^\s+/, '').length;
        return { x: line.x, y: line.y, h: line.h, text: line.text.trim(), lead: lead };
      });
  }

  /* ---- drawing --------------------------------------------------------- */

  /* border-radius keeps its percentage in the computed value, so it has to be
     resolved against the box — and the box is why this takes one. CSS resolves the
     two halves of a corner against width and height separately, which makes an
     ellipse on a non-square box; a single radius per corner cannot say that, so
     the extent is the shorter side. Every percentage radius in this system is a
     circle (--parkie-radius-round on dots, knobs, the spinner and avatars), where
     the two agree exactly. */
  function radii(style, box) {
    var extent = Math.min(box.w, box.h);
    var read = function (prop) {
      var raw = style.getPropertyValue(prop).split(' ')[0];
      if (/%$/.test(raw)) return (num(raw) / 100) * extent;
      return num(raw);
    };
    return {
      tl: read('border-top-left-radius'),
      tr: read('border-top-right-radius'),
      br: read('border-bottom-right-radius'),
      bl: read('border-bottom-left-radius'),
    };
  }

  /* A rect when every corner agrees, a path when they do not. The radius is
     clamped the way CSS clamps it, so a pill written as 999px does not draw an arc
     wider than the box. */
  function boxShape(box, r, inset) {
    var x = box.x + inset;
    var y = box.y + inset;
    var w = Math.max(0, box.w - inset * 2);
    var h = Math.max(0, box.h - inset * 2);
    var lim = Math.min(w, h) / 2;
    var tl = Math.max(0, Math.min(r.tl - inset, lim));
    var tr = Math.max(0, Math.min(r.tr - inset, lim));
    var br = Math.max(0, Math.min(r.br - inset, lim));
    var bl = Math.max(0, Math.min(r.bl - inset, lim));
    var R = api().round;

    if (tl === tr && tr === br && br === bl) {
      return '<rect x="' + R(x) + '" y="' + R(y) + '" width="' + R(w) + '" height="' + R(h) + '"'
        + (tl ? ' rx="' + R(tl) + '"' : '');
    }
    return '<path d="M' + R(x + tl) + ' ' + R(y)
      + 'H' + R(x + w - tr) + (tr ? 'a' + R(tr) + ' ' + R(tr) + ' 0 0 1 ' + R(tr) + ' ' + R(tr) : '')
      + 'V' + R(y + h - br) + (br ? 'a' + R(br) + ' ' + R(br) + ' 0 0 1 ' + R(-br) + ' ' + R(br) : '')
      + 'H' + R(x + bl) + (bl ? 'a' + R(bl) + ' ' + R(bl) + ' 0 0 1 ' + R(-bl) + ' ' + R(-bl) : '')
      + 'V' + R(y + tl) + (tl ? 'a' + R(tl) + ' ' + R(tl) + ' 0 0 1 ' + R(tl) + ' ' + R(-tl) : '')
      + 'Z"';
  }

  var SIDES = [
    ['top', 'border-top-width', 'border-top-color', 'border-top-style'],
    ['right', 'border-right-width', 'border-right-color', 'border-right-style'],
    ['bottom', 'border-bottom-width', 'border-bottom-color', 'border-bottom-style'],
    ['left', 'border-left-width', 'border-left-color', 'border-left-style'],
  ];

  function borders(box, style, r) {
    var e = api();
    var R = e.round;
    var sides = SIDES.map(function (side) {
      return {
        name: side[0],
        width: num(style.getPropertyValue(side[1])),
        color: style.getPropertyValue(side[2]),
        style: style.getPropertyValue(side[3]),
      };
    }).filter(function (s) {
      return s.width > 0 && s.style !== 'none' && s.style !== 'hidden' && !e.isTransparent(s.color);
    });
    if (!sides.length) return '';

    var uniform = sides.length === 4 && sides.every(function (s) {
      return s.width === sides[0].width && s.color === sides[0].color;
    });

    /* One stroked outline when all four sides agree, drawn on the centre line so
       the painted edge lands where CSS puts it. Otherwise each side separately —
       which is what draws the checkbox tick, two edges of a box and nothing else. */
    if (uniform) {
      var w = sides[0].width;
      return '  ' + boxShape(box, r, w / 2) + ' fill="none" '
        + e.paintAttrs('stroke', sides[0].color) + ' stroke-width="' + R(w) + '"/>\n';
    }

    /* A round box with per-side colours is a ring split into quadrants, which is
       how the loading spinner is built: three sides in a track colour and
       border-top-color set to currentColor. Drawn as rects it comes out a square,
       so the round case draws four 90-degree arcs instead. */
    if (isRound(box, r)) return arcSides(box, sides);

    return sides.map(function (s) {
      var x = box.x;
      var y = box.y;
      var w = box.w;
      var h = box.h;
      if (s.name === 'top') h = s.width;
      if (s.name === 'bottom') { y = box.y + box.h - s.width; h = s.width; }
      if (s.name === 'left') w = s.width;
      if (s.name === 'right') { x = box.x + box.w - s.width; w = s.width; }
      return '  <rect x="' + R(x) + '" y="' + R(y) + '" width="' + R(w) + '" height="' + R(h)
        + '" ' + e.paintAttrs('fill', s.color) + '/>\n';
    }).join('');
  }

  function isRound(box, r) {
    var lim = Math.min(box.w, box.h) / 2;
    return lim > 0 && [r.tl, r.tr, r.br, r.bl].every(function (v) { return v >= lim - 0.5; });
  }

  /* Screen coordinates, so y grows downward and the angle runs clockwise from
     east. Each side owns the quadrant centred on its own direction — top spans
     225 to 315 degrees, through straight up. */
  var QUADRANTS = { top: 225, right: 315, bottom: 45, left: 135 };

  function arcSides(box, sides) {
    var e = api();
    var R = e.round;
    var cx = box.x + box.w / 2;
    var cy = box.y + box.h / 2;

    return sides.map(function (s) {
      var radius = Math.min(box.w, box.h) / 2 - s.width / 2;
      if (radius <= 0) return '';
      var from = QUADRANTS[s.name];
      var at = function (deg) {
        var rad = (deg * Math.PI) / 180;
        return R(cx + radius * Math.cos(rad)) + ' ' + R(cy + radius * Math.sin(rad));
      };
      return '  <path d="M' + at(from) + 'A' + R(radius) + ' ' + R(radius)
        + ' 0 0 1 ' + at(from + 90) + '" fill="none" '
        + e.paintAttrs('stroke', s.color) + ' stroke-width="' + R(s.width) + '"/>\n';
    }).join('');
  }

  /* getComputedStyle hands back every box-shadow layer in one string. Splitting on
     commas outside parentheses keeps rgba() and color() intact — --parkie-ring is
     two layers and a naive split would cut it in the middle of a colour. */
  function shadowLayers(value) {
    if (!value || value === 'none') return [];
    var out = [];
    var depth = 0;
    var start = 0;
    for (var i = 0; i < value.length; i += 1) {
      var c = value[i];
      if (c === '(') depth += 1;
      else if (c === ')') depth -= 1;
      else if (c === ',' && depth === 0) { out.push(value.slice(start, i)); start = i + 1; }
    }
    out.push(value.slice(start));
    return out.map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function rings(box, style, r) {
    var e = api();
    var R = e.round;
    return shadowLayers(style.boxShadow).map(function (layer) {
      var ring = e.ringOf(layer);
      if (!ring) return '';
      var inset = /\binset\b/i.test(layer);
      /* An outset ring grows away from the box, an inset one eats into it, and the
         stroke sits on the centre line of the band either way. */
      var offset = inset ? ring.spread / 2 : -ring.spread / 2;
      return '  ' + boxShape(box, r, offset) + ' fill="none" '
        + e.paintAttrs('stroke', ring.color) + ' stroke-width="' + R(ring.spread) + '"/>\n';
    }).join('');
  }

  function textMarkup(lines, style) {
    var e = api();
    var R = e.round;
    var fs = num(style.fontSize);
    return lines.map(function (line) {
      var baseline = line.y + (line.h - fs) / 2 + fs * ASCENT;
      var spacing = style.letterSpacing;
      return '  <text x="' + R(line.x) + '" y="' + R(baseline) + '"'
        + ' font-family="' + e.esc(style.fontFamily) + '"'
        + ' font-size="' + R(fs) + '"'
        + ' font-weight="' + e.esc(style.fontWeight) + '"'
        + (spacing && spacing !== 'normal' ? ' letter-spacing="' + R(num(spacing)) + '"' : '')
        + ' ' + e.paintAttrs('fill', style.color) + '>'
        + e.esc(line.text) + '</text>\n';
    }).join('');
  }

  /* An inline <svg> is artwork the page already owns, so it is embedded rather
     than redrawn: var() and currentColor are resolved against the element's own
     computed colour, then the root is unwrapped and scaled into its measured box. */
  function svgMarkup(node, box, resolveToken) {
    var e = api();
    var R = e.round;
    var colour = window.getComputedStyle(node).color;
    var paint = e.splitColor(colour);
    var doc = new DOMParser().parseFromString(
      e.resolveVars(node.outerHTML, paint.color, resolveToken), 'image/svg+xml');
    if (doc.querySelector('parsererror')) throw new Error('inline svg is not well-formed XML');

    var root = e.repaint(doc.documentElement, paint);
    var vb = (root.getAttribute('viewBox') || '0 0 24 24').split(/[\s,]+/).map(Number);
    var vw = vb[2] || 24;
    var vh = vb[3] || 24;
    var sx = box.w / vw;
    var sy = box.h / vh;

    var inner = '';
    for (var i = 0; i < root.childNodes.length; i += 1) {
      inner += new XMLSerializer().serializeToString(root.childNodes[i]);
    }

    /* Unwrapping the <svg> throws away whatever it was carrying for its children,
       and in this catalogue that is everything: the icon buttons are authored as
       <svg fill="none" stroke="currentColor" stroke-width="2"><path/></svg>, so a
       bare unwrap yields paths with no paint at all and the glyph disappears
       without erroring. repaint() only walks descendants — the root's own
       currentColor has to be resolved here. */
    var carried = '';
    for (var a = 0; a < CARRY_ATTRS.length; a += 1) {
      var name = CARRY_ATTRS[a];
      if (!root.hasAttribute(name)) continue;
      var value = root.getAttribute(name);
      if (value === 'currentColor') {
        carried += ' ' + e.paintAttrs(name, colour);
      } else {
        carried += ' ' + name + '="' + e.esc(value) + '"';
      }
    }

    /* stroke-width travels in viewBox units, so a uniform scale keeps line weight
       even; the specimens are square-ish and this never visibly distorts. */
    return '  <g' + carried + ' transform="translate(' + R(box.x) + ' ' + R(box.y)
      + ') scale(' + R(sx) + ' ' + R(sy) + ')">' + inner + '</g>\n';
  }

  var CARRY_ATTRS = [
    'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
    'stroke-miterlimit', 'stroke-dasharray', 'stroke-dashoffset', 'fill-rule',
    'clip-rule', 'fill-opacity', 'stroke-opacity', 'opacity',
  ];

  var clipSeq = 0;

  function emit(entry, opts, defs) {
    var e = api();
    var R = e.round;
    var style = entry.style;
    var box = entry.box;
    var r = radii(style, box);
    var body = '';

    body += rings(box, style, r);

    if (!e.isTransparent(style.backgroundColor)) {
      body += '  ' + boxShape(box, r, 0) + ' ' + e.paintAttrs('fill', style.backgroundColor) + '/>\n';
    }

    body += borders(box, style, r);

    entry.texts.forEach(function (run) { body += textMarkup(run.lines, run.style); });

    entry.pseudos.forEach(function (made) {
      body += emitPseudo(made, opts, defs);
    });

    entry.children.forEach(function (child) {
      if (child.svg) body += svgMarkup(child.svg, child.box, opts.resolveToken);
      else body += emit(child, opts, defs);
    });

    return wrapGroup(body, entry, opts, defs);
  }

  function emitPseudo(made, opts, defs) {
    var e = api();
    var style = made.style;
    var box = made.box;
    var r = radii(style, box);
    var body = '';

    body += rings(box, style, r);
    if (!e.isTransparent(style.backgroundColor)) {
      body += '  ' + boxShape(box, r, 0) + ' ' + e.paintAttrs('fill', style.backgroundColor) + '/>\n';
    }
    body += borders(box, style, r);
    if (made.text) {
      body += textMarkup([{ x: box.x, y: box.y, h: box.h, text: made.text }], style);
    }

    return wrapGroup(body, { box: box, style: style, transform: made.transform,
      transformOrigin: made.transformOrigin }, opts, defs);
  }

  /* opacity, clipping and the CSS transform all apply to the element and its
     descendants together, which is exactly what an SVG group does. The transform
     is expressed about the element's own centre so the flat layout coordinates
     underneath it never have to be rebased. */
  function wrapGroup(body, entry, opts, defs) {
    if (!body) return '';
    var e = api();
    var R = e.round;
    var style = entry.style;
    var box = entry.box;
    var attrs = '';

    var opacity = parseFloat(style.opacity);
    if (isFinite(opacity) && opacity < 1) attrs += ' opacity="' + R(opacity) + '"';

    if (style.overflow === 'hidden' || style.overflowX === 'hidden') {
      clipSeq += 1;
      var id = 'pk-clip-' + clipSeq;
      defs.push('  <clipPath id="' + id + '">' + boxShape(box, radii(style, box), 0) + '/></clipPath>\n');
      attrs += ' clip-path="url(#' + id + ')"';
    }

    var t = entry.transform;
    if (t && t !== 'none') {
      var m = t.match(/matrix\(([^)]+)\)/);
      if (m) {
        var v = m[1].split(',').map(function (x) { return num(x); });
        var origin = (entry.transformOrigin || '50% 50%').split(' ').map(num);
        var cx = box.x + (isFinite(origin[0]) ? origin[0] : box.w / 2);
        var cy = box.y + (isFinite(origin[1]) ? origin[1] : box.h / 2);
        attrs += ' transform="translate(' + R(cx) + ' ' + R(cy) + ') matrix('
          + v.map(R).join(' ') + ') translate(' + R(-cx) + ' ' + R(-cy) + ')"';
      }
    }

    if (!attrs) return body;
    return '  <g' + attrs + '>\n' + body + '  </g>\n';
  }

  /* ---- public ---------------------------------------------------------- */

  function serialize(root, options) {
    var opts = options || {};
    var described = describe(root);
    if (!described.tree) return { markup: '', width: 0, height: 0, defs: '' };

    var size = measure(root, described);
    var defs = [];
    var markup = emit(described.tree, opts, defs);
    return {
      markup: markup,
      defs: defs.join(''),
      width: size.width,
      height: size.height,
    };
  }

  function standalone(root, options) {
    var opts = options || {};
    var e = api();
    var R = e.round;
    var out = serialize(root, opts);
    var pad = opts.pad === undefined ? 8 : opts.pad;
    var w = out.width + pad * 2;
    var h = out.height + pad * 2;

    /* The dark plate is deliberate and matches the icon sheets: hover greys and
       disabled washes are invisible on a design tool's white artboard, and a
       specimen you cannot see is not a specimen. */
    var plate = opts.background
      ? '  <rect width="' + R(w) + '" height="' + R(h) + '" ' + e.paintAttrs('fill', opts.background) + '/>\n'
      : '';

    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + R(w) + '" height="' + R(h)
      + '" viewBox="0 0 ' + R(w) + ' ' + R(h) + '" fill="none">\n'
      + (out.defs ? '  <defs>\n' + out.defs + '  </defs>\n' : '')
      + plate
      + '  <g transform="translate(' + R(pad) + ' ' + R(pad) + ')">\n' + out.markup + '  </g>\n'
      + '</svg>\n';
  }

  /* blocks: [{ id, title, columns, rows: [{ id, ko, en, cells }] }]
     cells: [{ state, markup, defs, width, height }]
     A sibling of svg-export's buildSheet rather than a change to it: that one
     centres a 24px glyph in a fixed 68px cell, and its geometry and group nesting
     are pinned by tests. Here every cell is a different size, so the column width
     and row height are measured rather than declared. */
  function buildBoxSheet(blocks, options) {
    var opts = options || {};
    var e = api();
    var R = e.round;
    var font = opts.font || 'Pretendard, sans-serif';
    var line = opts.gridLine || 'rgba(255,255,255,0.09)';
    var primary = opts.textPrimary || 'rgba(255,255,255,0.95)';
    var secondary = opts.textSecondary || 'rgba(255,255,255,0.60)';

    var columnWidths = [];
    blocks.forEach(function (block) {
      block.rows.forEach(function (row) {
        row.cells.forEach(function (cell, i) {
          var want = Math.max(SHEET.minCellWidth, cell.width + SHEET.gutter);
          columnWidths[i] = Math.max(columnWidths[i] || 0, want);
        });
      });
    });
    var gridLeft = SHEET.pad + SHEET.labelWidth;
    var width = gridLeft + columnWidths.reduce(function (a, b) { return a + b; }, 0) + SHEET.pad;
    var columnX = [];
    columnWidths.reduce(function (x, w, i) { columnX[i] = x; return x + w; }, gridLeft);

    var defs = [];
    var body = [];
    var y = SHEET.pad;

    blocks.forEach(function (block) {
      var captioned = !block.columns;
      var out = ['<g id="' + e.esc(block.id) + '">'];

      out.push('<text x="' + SHEET.pad + '" y="' + R(y + 14) + '" font-family="' + e.esc(font)
        + '" font-size="13" font-weight="600" ' + e.paintAttrs('fill', primary) + '>'
        + e.esc(block.title) + '</text>');
      y += SHEET.titleHeight;

      if (block.columns) {
        block.columns.forEach(function (label, i) {
          out.push('<text x="' + R(columnX[i] + columnWidths[i] / 2) + '" y="' + R(y + 20)
            + '" text-anchor="middle" font-family="' + e.esc(font) + '" font-size="10" '
            + e.paintAttrs('fill', secondary) + '>' + e.esc(label) + '</text>');
        });
        y += SHEET.headerHeight;
      }

      block.rows.forEach(function (row) {
        var tallest = row.cells.reduce(function (m, c) { return Math.max(m, c.height); }, 0);
        var rowHeight = tallest + SHEET.rowPad * 2 + (captioned ? SHEET.captionHeight : 0);
        var mid = y + (tallest + SHEET.rowPad * 2) / 2;
        var group = ['<g id="' + e.esc(row.id) + '">'];

        group.push('<text x="' + SHEET.pad + '" y="' + R(mid - 1) + '" font-family="' + e.esc(font)
          + '" font-size="11" ' + e.paintAttrs('fill', primary) + '>' + e.esc(row.ko) + '</text>');
        group.push('<text x="' + SHEET.pad + '" y="' + R(mid + 12) + '" font-family="' + e.esc(font)
          + '" font-size="9" ' + e.paintAttrs('fill', secondary) + '>' + e.esc(row.en) + '</text>');

        row.cells.forEach(function (cell, i) {
          var cx = columnX[i] + (columnWidths[i] - cell.width) / 2;
          var cy = y + SHEET.rowPad + (tallest - cell.height) / 2;
          if (cell.defs) defs.push(cell.defs);
          group.push('<g id="' + e.esc(row.id + '-' + (e.slug(cell.state) || String(i + 1)))
            + '" transform="translate(' + R(cx) + ' ' + R(cy) + ')">\n' + cell.markup + '</g>');
          if (captioned) {
            group.push('<text x="' + R(columnX[i] + columnWidths[i] / 2) + '" y="'
              + R(y + SHEET.rowPad * 2 + tallest + 8) + '" text-anchor="middle" font-family="'
              + e.esc(font) + '" font-size="8" ' + e.paintAttrs('fill', secondary) + '>'
              + e.esc(cell.state) + '</text>');
          }
        });

        group.push('<line x1="' + SHEET.pad + '" y1="' + R(y + rowHeight) + '" x2="'
          + R(width - SHEET.pad) + '" y2="' + R(y + rowHeight) + '" '
          + e.paintAttrs('stroke', line) + ' stroke-width="1"/>');
        group.push('</g>');
        out.push(group.join('\n  '));
        y += rowHeight;
      });

      y += SHEET.blockGap;
      out.push('</g>');
      body.push(out.join('\n  '));
    });

    var height = y - SHEET.blockGap + SHEET.pad;
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + R(width) + '" height="'
      + R(height) + '" viewBox="0 0 ' + R(width) + ' ' + R(height) + '" fill="none">\n'
      + (defs.length ? '  <defs>\n' + defs.join('') + '  </defs>\n' : '')
      + '  <rect width="' + R(width) + '" height="' + R(height) + '" '
      + e.paintAttrs('fill', opts.background || '#131315') + '/>\n  '
      + body.join('\n  ') + '\n</svg>\n';
  }

  window.__parkieDomSvg = {
    serialize: serialize,
    standalone: standalone,
    buildBoxSheet: buildBoxSheet,
  };
}());
