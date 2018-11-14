let entries72 = window.vsIssueTrackerDataPoints.slice(0, 72);
let entries720 = window.vsIssueTrackerDataPoints;

let timesArr = [];
let openIssueArr = [];

const nowEntry = entries72[0];
const dayAgoEntry = entries72[23];

const threeDaysAgoUnix = moment
  .unix(nowEntry.timestamp)
  .subtract(3, "days")
  .unix();

entries72 = entries72
  .reverse()
  .filter(entry => entry.timestamp > threeDaysAgoUnix);

let now = moment.unix(entries72[0].timestamp);
let nextDayOne = now
  .add(1, "day")
  .startOf("day")
  .unix();
let nextDayTwo = now
  .add(1, "days")
  .startOf("day")
  .unix();
let nextDayThree = now
  .add(1, "days")
  .startOf("day")
  .unix();
let nextDayFour = now
  .add(1, "days")
  .startOf("day")
  .unix();

const gridLines = [
  {
    value: nextDayOne,
    text: moment.unix(nextDayOne).format("ddd, MMMM Do")
    // position: "end"
  },
  {
    value: nextDayTwo,
    text: moment.unix(nextDayTwo).format("ddd, MMMM Do")
    // position: "end"
  },
  {
    value: nextDayThree,
    text: moment.unix(nextDayThree).format("ddd, MMMM Do")
    // position: "end"
  },
  {
    value: nextDayFour,
    text: moment.unix(nextDayFour).format("ddd, MMMM Do")
    // position: "end"
  }
];

for (let entry of entries72) {
  const { timestamp, openIssues } = entry;

  timesArr.push(timestamp);
  openIssueArr.push(openIssues);
}

var chart = c3.generate({
  bindto: "#hourChart",
  data: {
    x: "x",
    columns: [["x", ...timesArr], ["open issues", ...openIssueArr]]
  },
  subchart: {
    show: true
  },
  axis: {
    y: {
      tick: {
        format: function(x) {
          return x === Math.floor(x) ? x : "";
        }
      }
    },
    x: {
      tick: {
        format: function(d) {
          return moment.unix(d).format("llll");
        }
      }
    }
  },
  tooltip: {
    format: {
      title: function(d) {
        return moment.unix(d).format("llll");
      }
    }
  },
  padding: {
    right: 100,
    left: 100
  },
  size: {
    height: 400
  },
  grid: {
    x: {
      lines: gridLines
    }
  }
});

fillDiffs(nowEntry, dayAgoEntry);

timesArr = [];
openIssueArr = [];

const firstTimestamp = entries720[entries720.length - 1].timestamp;
const lastTimestamp = entries720[0].timestamp;

const gridlines = getGridLines(firstTimestamp, lastTimestamp);

const monthAgoUnix = moment
  .unix(lastTimestamp)
  .subtract(1, "month")
  .unix();

entries720 = entries720
  .reverse()
  .filter(entry => entry.timestamp > monthAgoUnix)
  .filter((_, idx) => idx % 4 === 0);

for (let entry of entries720) {
  const { timestamp, openIssues } = entry;

  timesArr.push(timestamp);
  openIssueArr.push(openIssues);
}

var chart = c3.generate({
  bindto: "#tenDayChart",
  data: {
    x: "x",
    columns: [["x", ...timesArr], ["open issues", ...openIssueArr]]
  },
  subchart: {
    show: true
  },
  axis: {
    y: {
      tick: {
        format: function(x) {
          return x === Math.floor(x) ? x : "";
        }
      }
    },
    x: {
      tick: {
        format: function(d) {
          return moment.unix(d).format("llll");
        }
      }
    }
  },
  tooltip: {
    format: {
      title: function(d) {
        return moment.unix(d).format("llll");
      }
    }
  },
  padding: {
    right: 100,
    left: 100
  },
  size: {
    height: 400
  },
  grid: {
    x: {
      lines: gridlines
    }
  }
});

function fillDiffs(nowEntry, dayAgoEntry) {
  let diff = nowEntry.openIssues - dayAgoEntry.openIssues;
  let colorClass;
  let symbol;

  if (diff > 0) {
    colorClass = "red";
    symbol = "▲";
  } else {
    colorClass = "green";
    symbol = "▼";
  }

  diff = Math.abs(diff);

  const diffElement = document.getElementById("diff");

  diffElement.className = "color-" + colorClass;

  diffElement.innerText = `${symbol} ${diff} ${
    colorClass === "red" ? "more" : "less"
  } issues compared to a day ago (${dayAgoEntry.openIssues} to ${
    nowEntry.openIssues
  })`;

  const totalDiffElement = document.getElementById("totalDiff");

  totalDiffElement.innerHTML = `
    On Sept 10, 2018 at 8:41PM EST, there were 49,181 closed issues. Now there
    are ${nowEntry.closedIssues.toLocaleString()} closed issues, for a total difference of
    <b>${(
      nowEntry.closedIssues - 49181
    ).toLocaleString()} issues</b> that have been closed since I started tracking this.
  `;
}

function getGridLines(firstTimestamp, lastTimestamp) {
  const gridlines = [];

  let firstDay = moment
    .unix(firstTimestamp)
    .add(1, "days")
    .startOf("day");
  let lastDay = moment.unix(lastTimestamp).startOf("day");

  let numOfDays = lastDay.diff(firstDay, "days");

  for (let i = 0; i < numOfDays + 1; i++) {
    gridlines.push({
      value: firstDay.unix(),
      text: firstDay.format("ddd, MMMM Do")
    });

    firstDay = firstDay.add(1, "day").startOf("day");
  }

  console.log(gridlines);

  return gridlines;
}
