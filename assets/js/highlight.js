// Highlighting for the languages Chroma does not know: Sol, Dandelion,
// Aleph, Soroban, Tangram, Kintsugi and Omikuji, and drawing for Shoji.
// Each grammar is an ordered list of rules; at every position the first
// rule that matches wins, as in an Emacs font-lock list.

(function () {
  "use strict";

  // Sol, after editors/emacs/sol-mode.el in the Sol repository.
  var sol = [
    ["comment", /%[^\n]*/y],
    ["string", /"(?:[^"\\\n]|\\.)*"/y],
    ["sol-keyword", /(?:Relation|Rule|Query)\b/y, "lineStart"],
    ["sol-combinator", /:(?:and|or|not)\b/y],
    ["sol-reference", /#[A-Za-z][A-Za-z0-9_]*/y],
    ["sol-builtin-label", /(?:named|schema|name|head|body|expression|domain|variable|quantifier)(?=:)/y],
    ["sol-relation", /[A-Za-z][A-Za-z0-9_]*/y, "afterBracket"],
    ["sol-label", /[A-Za-z_][A-Za-z0-9_]*(?=:)/y],
    ["sol-variable", /[A-Z][A-Za-z0-9_]*\b/y],
    ["sol-number", /-?[0-9]+(?:\/[0-9]+)?\b/y],
    ["sol-bracket", /[\[\]{}|]/y]
  ];

  // Dandelion: stems, bundles and the links between them.
  var dandelion = [
    ["comment", /--[^\n]*/y],
    ["string", /'(?:[^'\\\n]|\\.)*'/y],
    ["dl-bundle", /\?[^\n:]*:|[A-Za-z][A-Za-z0-9_-]*:(?=\s*$)/my, "lineStart"],
    ["dl-answer", /\?[A-Za-z][A-Za-z0-9_]*/y],
    ["dl-hidden", /_[A-Za-z][A-Za-z0-9_]*/y],
    ["dl-builtin", /(?:key|from|to|isnt|below)\b/y],
    ["dl-closure", /~?[A-Za-z][A-Za-z0-9_-]*[+*]/y],
    ["dl-reverse", /~[A-Za-z][A-Za-z0-9_-]*/y],
    ["sol-number", /-?[0-9]+\b/y],
    ["dl-period", /\.(?=\s|$)/y]
  ];

  // Aleph: statements, temporal operators and relation atoms.
  var aleph = [
    ["comment", /--[^\n]*/y],
    ["string", /'(?:[^'\\\n]|\\.)*'/y],
    ["al-statement", /(?:require|promise|ask|at)\b/y],
    ["al-temporal", /(?:previously|once|historically|since|next|eventually|always|until)(?:<=[0-9]+)?\b/y],
    ["al-logic", /(?:and|or|not)\b|->/y],
    ["al-relation", /[A-Z][A-Z0-9_]*(?=\()/y],
    ["al-label", /[a-z][a-z0-9_]*(?=:)/y],
    ["al-hash", /#[0-9a-f]+…?|~[0-9]+/y],
    ["sol-number", /-?[0-9]+\b/y]
  ];

  // Soroban: columns, primitives and adverbs, read right to left.
  var soroban = [
    ["comment", /--[^\n]*/y],
    ["string", /'(?:[^'\\\n]|\\.)*'/y],
    ["so-name", /[A-Za-z][A-Za-z0-9_]*:/y, "lineStart"],
    ["so-column", /[A-Z][A-Z0-9_]*\.[A-Z][A-Z0-9_]*/y],
    ["al-hash", /[a-z]+~[0-9]+(?:\.\.[a-z]+(?:~[0-9]+)?)?/y],
    ["so-adverb", /(?:[-+*%]|max|min)[\/\\]/y],
    ["so-word", /(?:avg|asc|desc|where|by|over|deltas)\b/y],
    ["so-op", /[-+*%<>=#]+/y],
    ["sol-number", /[0-9]+(?:\.[0-9]+)?\b/y]
  ];

  // Tangram: choose, forbid, prefer and solve around Aleph-style atoms.
  var tangram = [
    ["comment", /--[^\n]*/y],
    ["string", /'(?:[^'\\\n]|\\.)*'/y],
    ["tg-statement", /(?:choose|forbid|prefer|solve)\b/y],
    ["tg-modifier", /(?:for each|exactly|at least|at most|from|into|fewest|most|within)\b/y],
    ["al-logic", /(?:and|or|not)\b|!=/y],
    ["al-relation", /[A-Z][A-Z0-9_]*(?=\()/y],
    ["al-label", /[a-z][a-z0-9_]*(?=:)/y],
    ["sol-number", /(?<![\w-])[0-9]+s?\b/y]
  ];

  // Kintsugi: lenses, their steps and the versions they join.
  var kintsugi = [
    ["comment", /--[^\n]*/y],
    ["string", /'(?:[^'\\\n]|\\.)*'/y],
    ["ki-statement", /(?<![\w-])(?:lens|retire)\b/y],
    ["ki-step", /(?<![\w-])(?:rename|add|drop|split|move|convert)\b/y],
    ["ki-word", /(?<![\w-])(?:for|from|to|of|into|on|by|default)\b/y],
    ["ki-version", /v[0-9]+\b/y],
    ["ki-name", /[A-Z][A-Z0-9_]*\b/y]
  ];

  // Omikuji: weights, worlds and the questions asked across them.
  var omikuji = [
    ["comment", /--[^\n]*/y],
    ["string", /'(?:[^'\\\n]|\\.)*'/y],
    ["al-relation", /[A-Z][A-Z0-9_]*:/y, "lineStart"],
    ["om-statement", /(?:weigh|either|ask|draw)\b/y],
    ["om-modifier", /(?:or|otherwise|given|chance|likeliest|as|by|for each)\b/y],
    ["al-logic", /(?:and|not)\b/y],
    ["al-relation", /[A-Z][A-Z0-9_]*(?=\()/y],
    ["al-label", /[a-z][a-z0-9_]*(?=:)/y],
    ["om-chance", /[0-9]+(?:\.[0-9]+)?\b/y]
  ];

  var grammars = { sol: sol, dandelion: dandelion, aleph: aleph, soroban: soroban, tangram: tangram, kintsugi: kintsugi, omikuji: omikuji };
  var word = /[A-Za-z0-9_]+/y;

  function escape(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function highlight(text, rules) {
    var out = "", i = 0, lineStart = true, afterBracket = false;
    while (i < text.length) {
      var matched = null;
      for (var r = 0; r < rules.length && !matched; r++) {
        var rule = rules[r];
        if (rule[2] === "lineStart" && !lineStart) continue;
        if (rule[2] === "afterBracket" && !afterBracket) continue;
        rule[1].lastIndex = i;
        var m = rule[1].exec(text);
        if (m && m[0].length) matched = [rule[0], m[0]];
      }
      if (matched) {
        out += '<span class="hl-' + matched[0] + '">' + escape(matched[1]) + "</span>";
        i += matched[1].length;
        afterBracket = matched[1] === "[";
        lineStart = false;
        continue;
      }
      // A plain word is copied whole, so rules never match inside one.
      word.lastIndex = i;
      var w = word.exec(text);
      var plain = w ? w[0] : text[i];
      out += escape(plain);
      i += plain.length;
      if (plain === "\n") lineStart = true;
      else if (!/\s/.test(plain)) lineStart = false;
      if (!/\s/.test(plain)) afterBracket = plain === "[";
    }
    return out;
  }

  // Shoji has no text syntax: a block is drawn as the skeleton windows it
  // describes. Each paragraph is one window; its first line is the heading,
  // "relation | attribute | …", and each line after it is a row. A paragraph
  // without bars is a condition box.
  function entry(text) {
    return text.split(/(\s+)/).map(function (t) {
      if (/^_[A-Za-z0-9]+$/.test(t)) return '<span class="shoji__ex">' + escape(t.slice(1)) + "</span>";
      if (/^[A-Z]+\.$/.test(t)) return '<span class="shoji__cmd">' + escape(t) + "</span>";
      var op = /^(<>|<=|>=|<|>|=)(.+)$/.exec(t);
      if (op) return '<span class="shoji__op">' + escape(op[1]) + "</span>" + entry(op[2]);
      return escape(t);
    }).join("");
  }

  function skeletons(text) {
    return text.trim().split(/\n\s*\n/).map(function (block) {
      var lines = block.split("\n");
      if (lines[0].indexOf("|") < 0) {
        return '<div class="shoji__win shoji__win--cond"><p class="shoji__title">' + escape(lines[0].trim()) +
          '</p><p class="shoji__cond">' + lines.slice(1).map(function (l) { return entry(l.trim()); }).join("<br>") + "</p></div>";
      }
      var rows = lines.map(function (l) { return l.split("|").map(function (c) { return c.trim(); }); });
      var head = "<tr>" + rows[0].map(function (c, i) {
        return (i ? "<th scope=\"col\">" : '<th class="shoji__rel" scope="col">') + escape(c) + "</th>";
      }).join("") + "</tr>";
      var body = rows.slice(1).map(function (r) {
        return "<tr>" + r.map(function (c) { return "<td>" + entry(c) + "</td>"; }).join("") + "</tr>";
      }).join("");
      return '<div class="shoji__win"><table class="shoji__grid"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>";
    }).join("");
  }

  document.querySelectorAll("code[data-lang]").forEach(function (code) {
    if (code.dataset.lang === "shoji") {
      var box = code.closest(".src") || code.parentNode;
      var desk = document.createElement("div");
      desk.className = "shoji";
      desk.innerHTML = skeletons(code.textContent);
      box.replaceWith(desk);
      return;
    }
    var rules = grammars[code.dataset.lang];
    if (rules) code.innerHTML = highlight(code.textContent, rules);
  });
})();
