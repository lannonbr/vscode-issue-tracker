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

db.collection("entries")
  .orderBy("timestamp", "desc")
  .limit(3 * 24)
  .get()
  .then(querySnapshot => {
    let entries = querySnapshot.docs;

    let timesArr = [];
    let openIssueArr = [];

    entries = entries.reverse();

    for (let entry of entries) {
      const { timestamp, openIssues } = entry.data();

      timesArr.push(timestamp);
      openIssueArr.push(openIssues);
    }

    var chart = c3.generate({
      bindto: "#chart",
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
