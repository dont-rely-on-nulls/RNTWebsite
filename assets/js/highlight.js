// Highlighting for the languages Chroma does not know: Sol and Dandelion.
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

  var grammars = { sol: sol, dandelion: dandelion };
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

  document.querySelectorAll("code[data-lang]").forEach(function (code) {
    var rules = grammars[code.dataset.lang];
    if (rules) code.innerHTML = highlight(code.textContent, rules);
  });
})();
