var config = {
  apiKey: "AIzaSyDZftC_QmBNEQy3t2glQ-vu0GS0gqLL2IU",
  authDomain: "vscodeissuetracker.firebaseapp.com",
  databaseURL: "https://vscodeissuetracker.firebaseio.com",
  projectId: "vscodeissuetracker",
  storageBucket: "vscodeissuetracker.appspot.com"
};
firebase.initializeApp(config);
var db = firebase.firestore();

const settings = {
  timestampsInSnapshots: true
};

db.settings(settings);

getData(3 * 24).then(entries => {
  let timesArr = [];
  let openIssueArr = [];

  const nowEntry = entries[0].data();
  const dayAgoEntry = entries[23].data();

  entries = entries.reverse();

  let now = moment.unix(entries[0].data().timestamp);
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

  console.log(gridLines);

  for (let entry of entries) {
    const { timestamp, openIssues } = entry.data();

    timesArr.push(timestamp);
    openIssueArr.push(openIssues);
  }

  var chart = c3.generate({
    bindto: "#hourChart",
    data: {
      x: "x",
      columns: [["x", ...timesArr], ["open issues", ...openIssueArr]]
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

  getData(720).then(entries => {
    let timesArr = [];
    let openIssueArr = [];

    entries = entries.reverse().filter((_, idx) => idx % 4 === 0);

    for (let entry of entries) {
      const { timestamp, openIssues } = entry.data();

      timesArr.push(timestamp);
      openIssueArr.push(openIssues);
    }

    var chart = c3.generate({
      bindto: "#tenDayChart",
      data: {
        x: "x",
        columns: [["x", ...timesArr], ["open issues", ...openIssueArr]]
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
      }
    });
  });
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
    On Sept 10, 2018 at 8:41PM EST, There was 5299 issues, now there
    are ${nowEntry.openIssues} for a total difference of
    <b>${5299 - nowEntry.openIssues} issues</b> since I started tracking this.
  `;
}

function getData(hours) {
  return new Promise(resolve => {
    db.collection("entries")
      .orderBy("timestamp", "desc")
      .limit(hours)
      .get()
      .then(querySnapshot => resolve(querySnapshot.docs));
  });
}
