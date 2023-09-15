import express from 'express';
const app = express();

import firebase from "firebase-admin";

import { readFile } from 'fs/promises';
const firebaseConfig = JSON.parse(
  await readFile(
    new URL('./static/firebase-config.json', import.meta.url)
  )
);
// Initialize Firebase Admin SDK
firebase.initializeApp(firebaseConfig);

// Extract and verify Id Token from header
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    // If the provided ID token has the correct format, is not expired, and is
    // properly signed, the method returns the decoded ID token
    firebase
      .auth()
      .verifyIdToken(token)
      .then(decodedToken => {
        const uid = decodedToken.uid;
        req.uid = uid;
        next();
      })
      .catch(err => {
        console.log(`Error with authentication: ${err}`);
        return res.sendStatus(403);
      });
  } else {
    return res.sendStatus(401);
  }
};

import { Firestore } from '@google-cloud/firestore';

const firestore = new Firestore({
  projectId: 'tcc-1-ev-intern'
});

async function getDocuments(uid) {
  const entries = (await firestore.collection("AccessControl").where('uid', '==', uid).where('viewMemberData', '==', true).count().get()).data().count;
  if (entries === 1) {
    return true;
  } else {
    //No Permission or error
    return false;
  }
}

app.use(express.urlencoded({ extended: false }));
app.use(express.static("static", { index: false, extensions: ['html'] }));

app.get('/', (req, res) => {
  res.redirect('/login')
});


app.use("/vote", authenticateJWT);
app.post("/vote", (req, res) => {
  getDocuments(req.uid).then((permitted)=>{
    if(permitted){
      res.send("Permitted");
    }else{
      res.send("Denied");
    }
  });
});

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});