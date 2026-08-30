(function () {
  function extractObjectLiteral(source, constName) {
    const markerRegex = new RegExp("const\\s+" + constName + "\\s*=\\s*");
    const markerMatch = markerRegex.exec(source);
    if (!markerMatch) {
      throw new Error("Could not find const " + constName + " in myxi.html");
    }

    let i = markerMatch.index + markerMatch[0].length;
    while (i < source.length && source[i] !== "{") i++;
    if (i >= source.length) {
      throw new Error("Could not find opening brace for " + constName);
    }

    let depth = 0;
    let start = i;
    let inString = false;
    let stringQuote = "";
    let escaped = false;

    for (; i < source.length; i++) {
      const ch = source[i];

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === stringQuote) {
          inString = false;
          stringQuote = "";
        }
        continue;
      }

      if (ch === '"' || ch === "'" || ch === "`") {
        inString = true;
        stringQuote = ch;
        continue;
      }

      if (ch === "{") depth++;
      if (ch === "}") {
        depth--;
        if (depth === 0) {
          return source.slice(start, i + 1);
        }
      }
    }

    throw new Error("Could not parse object literal for " + constName);
  }

  function toPlayersPool(playersByPos) {
    const outfield = [];
    const byName = new Map();

    ["DEF", "MID", "FWD"].forEach((pos) => {
      (playersByPos[pos] || []).forEach((entry) => {
        if (!entry || typeof entry !== "object") return;
        const player = {
          name: entry.name,
          club: entry.club,
          pos,
          key: entry.name + "|" + entry.club
        };
        outfield.push(player);

        if (!byName.has(entry.name)) byName.set(entry.name, []);
        byName.get(entry.name).push(player);
      });
    });

    return {
      outfield,
      byName
    };
  }

  function dedupeSorted(array) {
    return Array.from(new Set(array)).sort((a, b) => a.localeCompare(b));
  }

  async function loadMyxiGameData() {
    // playersByPos now lives in players-data.js (shared with myxi.html and
    // admin.html), loaded as window.playersByPos before this runs - reading
    // it directly is simpler and safer than scraping it back out of
    // myxi.html's raw HTML, which no longer contains that literal at all.
    // clubAbbr isn't shared yet, so it's still scraped from myxi.html.
    if (!window.playersByPos) {
      throw new Error("window.playersByPos is not available - make sure players-data.js is loaded before myxi-data-loader.js");
    }

    const response = await fetch("myxi.html", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load myxi.html");
    }

    const html = await response.text();
    const clubAbbrLiteral = extractObjectLiteral(html, "clubAbbr");

    const clubAbbr = Function('"use strict"; return (' + clubAbbrLiteral + ');')();
    const playersByPos = window.playersByPos;

    const teams = dedupeSorted(playersByPos.GK || []);
    const { outfield, byName } = toPlayersPool(playersByPos);

    const allPlayerObjects = outfield.slice();
    const allPlayerKeys = dedupeSorted(allPlayerObjects.map((p) => p.key));

    return {
      clubAbbr,
      playersByPos,
      teams,
      allPlayerObjects,
      allPlayerKeys,
      playerNameIndex: byName,
      encodePlayer: (name, club) => name + "|" + club,
      decodePlayer: (value) => {
        if (!value || value === "Select") return { name: null, club: null, value };
        if (value.includes("|")) {
          const parts = value.split("|");
          return { name: parts[0], club: parts[1], value };
        }

        const matches = byName.get(value) || [];
        if (matches.length === 1) {
          return { name: matches[0].name, club: matches[0].club, value: matches[0].key };
        }

        return { name: value, club: null, value };
      }
    };
  }

  window.loadMyxiGameData = loadMyxiGameData;
})();
