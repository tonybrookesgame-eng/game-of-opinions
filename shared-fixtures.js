(function () {
  const fixtureData = [
    {
      date: "Friday 21st August",
      games: [
        { home: "Arsenal", away: "Coventry", time: "20:00" }
      ]
    },
    {
      date: "Saturday 22nd August",
      games: [
        { home: "Hull", away: "Man Utd", time: "12:30" },
        { home: "Ipswich", away: "Sunderland", time: "15:00" },
        { home: "Everton", away: "Crystal Palace", time: "15:00" },
        { home: "Nottingham Forest", away: "Leeds", time: "15:00" },
        { home: "Brentford", away: "Spurs", time: "17:30" }
      ]
    },
    {
      date: "Sunday 23rd August",
      games: [
        { home: "Man City", away: "Bournemouth", time: "14:00" },
        { home: "Brighton", away: "Aston Villa", time: "14:00" },
        { home: "Newcastle", away: "Liverpool", time: "16:30" },
        { home: "Fulham", away: "Chelsea", time: "16:30" }
      ]
    }
  ];

  function getGameweekFixtures() {
    return fixtureData;
  }

  function getGameweekDeadlineInfo(fixtures = fixtureData) {
    const allTimes = [];

    fixtures.forEach((day) => {
      const dateMatch = day.date.match(/(\d+)(?:st|nd|rd|th)\s+([A-Za-z]+)/);
      if (!dateMatch) return;

      const dayOfMonth = parseInt(dateMatch[1], 10);
      const monthName = dateMatch[2];
      const monthIndex = new Date(Date.parse(`${monthName} 1`)).getMonth();
      const year = new Date().getFullYear();

      day.games.forEach((game) => {
        const [hours, minutes] = (game.time || "00:00").split(':').map(Number);
        if (Number.isNaN(hours) || Number.isNaN(minutes)) return;

        allTimes.push(new Date(year, monthIndex, dayOfMonth, hours, minutes));
      });
    });

    if (allTimes.length === 0) return null;

    const firstKickOff = new Date(Math.min(...allTimes));
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
  window.renderFixtureList = renderFixtureList;
})();
