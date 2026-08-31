(function () {
  const fixtureData = [
    {
      date: "Friday 4th September",
      games: [
        { home: "Ipswich", away: "Liverpool", time: "20:00" }
      ]
    },
    {
      date: "Saturday 5th September",
      games: [
        { home: "Newcastle", away: "Bournemouth", time: "12:30" },
        { home: "Brentford", away: "Sunderland", time: "15:00" },
        { home: "Brighton", away: "Leeds", time: "15:00" },
        { home: "Fulham", away: "Crystal Palace", time: "15:00" },
        { home: "Man City", away: "Coventry", time: "15:00" },
        { home: "Nottingham Forest", away: "Tottenham", time: "15:00" },
        { home: "Hull", away: "Aston Villa", time: "17:30" },
      ]
    },
    {
      date: "Sunday 6th September",
      games: [
        { home: "Everton", away: "Man Utd", time: "14:00" },
        { home: "Arsenal", away: "Chelsea", time: "16:30" }
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
