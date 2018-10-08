const fetch = require("node-fetch");
const moment = require("moment");

var admin = require("firebase-admin");

var serviceAccount = require("./accountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

db.settings({ timestampsInSnapshots: true });

const body = state =>
  JSON.stringify({
    query: `
        query {
            repository(owner: "Microsoft", name:"vscode") {
                issues(states:${state}) {
                  totalCount
                }
              }
        }`
  });

function getIssues(body) {
  const url = "https://api.github.com/graphql";
  const options = {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`
    }
  };
  
  return fetch(url, options)
    .then(resp => resp.json())
    .then(data => {
      return data.data.repository.issues.totalCount;
    });
}

function getOpenIssues() {
  return getIssues(body("OPEN"));
}

function getClosedIssues() {
  return getIssues(body("CLOSED"));
}

exports.handler = async (event, context) => {
  var openIssues = await getOpenIssues();
  var closedIssues = await getClosedIssues();

  let now = moment().unix();

  let docRef = db.collection("entries").doc(now.toString());

  await docRef.set({
    timestamp: now,
    openIssues: openIssues,
    closedIssues: closedIssues
  });

  return "DONE";
};
