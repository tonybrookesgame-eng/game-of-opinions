(function () {
  const fixtureData = [
    {
      date: "Friday 28th August",
      games: [
        { home: "Crystal Palace", away: "Man City", time: "20:00" }
      ]
    },
    {
      date: "Saturday 29th August",
      games: [
        { home: "Liverpool", away: "Nottingham Forest", time: "12:30" },
        { home: "Coventry", away: "Hull", time: "15:00" },
        { home: "Bournemouth", away: "Everton", time: "15:00" },
        { home: "Spurs", away: "Newcastle", time: "17:30" },
      ]
    },
    {
      date: "Sunday 30th August",
      games: [
        { home: "Leeds", away: "Brentford", time: "14:00" },
        { home: "Sunderland", away: "Fulham", time: "14:00" },
        { home: "Chelsea", away: "Brighton", time: "14:00" },
        { home: "Man Utd", away: "Ipswich", time: "16:30" }
        ]
    },
    {
      date: "Monday 31st August",
      games: [
        { home: "Aston Villa", away: "Arsenal", time: "20:00" }
      ]
    }
  ];

  function getGameweekFixtures() {
    return fixtureData;
  }

  function toDateOrNull(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // Centralized lock/open decision used by both MyXI and Admin screens.
  function getGameweekStatusFromTimes(deadlineInput, reopenInput, now = new Date()) {
    const deadlineDate = toDateOrNull(deadlineInput);
    const reopenDate = toDateOrNull(reopenInput);

    if (deadlineDate && reopenDate && now >= deadlineDate && now < reopenDate) {
      return 'locked';
    }

    if (deadlineDate && !reopenDate && now >= deadlineDate) {
      return 'locked';
    }

    return 'open';
  }

  function getGameweekDeadlineInfo(fixtures = fixtureData) {
    const now = new Date();
    const allTimes = [];

    fixtures.forEach((day) => {
      const dateMatch = day.date.match(/(\d+)(?:st|nd|rd|th)\s+([A-Za-z]+)/);
      if (!dateMatch) return;

      const dayOfMonth = parseInt(dateMatch[1], 10);
      const monthName = dateMatch[2];
      const monthIndex = new Date(Date.parse(`${monthName} 1`)).getMonth();
      if (Number.isNaN(monthIndex)) return;

      let year = now.getFullYear();
      // If fixture month/day already passed this year, treat it as next season year.
      const candidateThisYear = new Date(year, monthIndex, dayOfMonth, 23, 59, 59, 999);
      if (candidateThisYear < now) {
        year += 1;
      }

      day.games.forEach((game) => {
        const [hours, minutes] = (game.time || "00:00").split(':').map(Number);
        if (Number.isNaN(hours) || Number.isNaN(minutes)) return;

        allTimes.push(new Date(year, monthIndex, dayOfMonth, hours, minutes));
      });
    });

    if (allTimes.length === 0) return null;

  const sortedTimes = [...allTimes].sort((a, b) => a - b);
  const nextKickOff = sortedTimes.find(kickOff => kickOff > now) || sortedTimes[0];
  const firstKickOff = new Date(nextKickOff);
    const lastKickOff = new Date(Math.max(...allTimes));

    const deadline = new Date(firstKickOff);
    deadline.setHours(deadline.getHours() - 2);

    const reopenTime = null;

    return { fixtures, allTimes, firstKickOff, lastKickOff, deadline, reopenTime };
  }

  function renderFixtureList(listEl, modalListEl, fixtures = fixtureData) {
    if (!listEl && !modalListEl) return;

    if (listEl) listEl.innerHTML = '';
    if (modalListEl) modalListEl.innerHTML = '';

    fixtures.forEach((day) => {
      const dateHeader = `<div class="fixture-date-header">${day.date}</div>`;
      if (listEl) listEl.innerHTML += dateHeader;
      if (modalListEl) modalListEl.innerHTML += dateHeader;

      day.games.forEach((game) => {
        const gameHtml = `
          <div class="fixture-item">
            <div class="fixture-team" style="text-align:right;">${game.home}</div>
            <div class="fixture-time">${game.time}</div>
            <div class="fixture-team" style="text-align:left;">${game.away}</div>
          </div>
        `;
        if (listEl) listEl.innerHTML += gameHtml;
        if (modalListEl) modalListEl.innerHTML += gameHtml;
      });
    });
  }

  window.gameweekFixtures = fixtureData;
  window.getGameweekFixtures = getGameweekFixtures;
  window.getGameweekDeadlineInfo = getGameweekDeadlineInfo;
  window.getGameweekStatusFromTimes = getGameweekStatusFromTimes;
  window.renderFixtureList = renderFixtureList;
})();
