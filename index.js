import express from 'express';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
var csrfProtect = csrf({ cookie: true });

const app = express();
app.use(cookieParser());

import firebase from "firebase-admin";

import { readFile } from 'fs/promises';
const firebaseConfig = JSON.parse(
  await readFile(
    new URL('./static/firebase-config.json', import.meta.url)
  )
);
// Initialize Firebase Admin SDK
firebase.initializeApp(firebaseConfig);



// Update project config with password policy config
/*firebase.auth().projectConfigManager().updateProjectConfig({
  passwordPolicyConfig: {
    enforcementState: 'ENFORCE',
    forceUpgradeOnSignin: true,
    constraints: {
      requireUppercase: true,
      requireLowercase: true,
      requireNonAlphanumeric: true,
      requireNumeric: true,
      minLength: 12
    },
  },
})
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);*/

/*const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    // If the provided ID token has the correct format, is not expired, and is
    // properly signed, the method returns the decoded ID token
    firebase
      .auth()
      .verifyIdToken(token)
      .then(decodedToken => {
        req.token = decodedToken;
        next();
      })
      .catch(err => {
        console.log(`Error with authentication: ${err}`);
        return res.sendStatus(403);
      });
  } else {
    return res.sendStatus(401);
  }
};*/

const authenticateJWT=(req,res,next)=>{
  const sessionCookie = req.cookies.session || '';
  firebase.auth()
    .verifySessionCookie(sessionCookie, true)
    .then((decodedToken) => {
      req.token=decodedToken;
      next();
    })
    .catch((error) => {
      // Session cookie is unavailable or invalid. Force user to login.
      res.redirect('/login');
    });
}

const verifyClaims = (claims, req, res, next) => {
  if (req.token) {
    if (claims.every(requiredToken => req.token[requiredToken] === true)) {
      next();
    } else {
      console.log(`Error with authentication: missing required claim(s)`);
      return res.sendStatus(403);
    }
  } else {
    return res.sendStatus(401);
  }
}

/*import { Firestore } from '@google-cloud/firestore';

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
}*/

app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.use("/login", csrfProtect);
app.use(express.static("static", { index: false, extensions: ['html'] }));

app.get('/', (req, res) => {
  res.redirect('/login')
});


app.get("/promote", authenticateJWT, (req, res) => {
  firebase.auth().setCustomUserClaims(req.token.uid, { viewMembers: true, manageUsers: true });
  res.send("Ok");
});
app.get("/demote", authenticateJWT, (req, res) => {
  firebase.auth().setCustomUserClaims(req.token.uid, null);
  res.send("OK");
});

app.post("/vote", authenticateJWT, verifyClaims.bind(null, ['viewMembers']), (req, res) => {
  res.send("Permitted");
});

app.get("/users", authenticateJWT, verifyClaims.bind(null, ['manageUsers']), (req, res) => {
  //TODO implement pagination if there are ever more than 50 users
  firebase.auth().listUsers(50).then((result) => {
    const userData = [];
    result.users.forEach(userRecord => {
      let viewMembers=false;
      let manageUsers=false;
      if(userRecord.customClaims){
        if(userRecord.customClaims.manageUsers &&userRecord.customClaims.manageUsers===true){
          manageUsers=true;
        }
        if(userRecord.customClaims.viewMembers &&userRecord.customClaims.viewMembers===true){
          viewMembers=true;
        }
      }
      userData.push({
        name:userRecord.displayName,
        email:userRecord.email,
        viewMembers:viewMembers,
        manageUsers:manageUsers});
    });
    res.render("users", {users:userData});
  }).catch((error) => {
    console.log('Error listing users:', error);
  });

});

app.post('/sessionLogin', (req, res) => {
  const idToken = req.body.idToken.toString();
  const csrfToken = req.body.csrfToken.toString();
  if (csrfToken !== req.cookies._csrf) {
    res.status(401).send('UNAUTHORIZED REQUEST!');
    return;
  }

  firebase.auth().verifyIdToken(idToken).then((decodedIdToken) => {
    //Only accept recent id tokens to avoid stolen tokens
    if (new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) {
      const expiresIn = 60 * 60 * 24 * 5 * 1000;
      firebase.auth().createSessionCookie(idToken, { expiresIn }).then((sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true, secure: true };
        res.cookie('session', sessionCookie, options);
        res.end(JSON.stringify({ status: 'success' }));
      },
        (error) => {
          res.status(401).send('UNAUTHROIZED REQUEST!');
        });
    }else{
      res.status(401).send('Recent sign in required!');
    }
  });
});

app.get('/profile', (req, res) => {
  const sessionCookie = req.cookies.session || '';
  // Verify the session cookie. In this case an additional check is added to detect
  // if the user's Firebase session was revoked, user deleted/disabled, etc.
  firebase.auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((decodedClaims) => {
      res.send(JSON.stringify(decodedClaims));
      //serveContentForUser('/profile', req, res, decodedClaims);
    })
    .catch((error) => {
      // Session cookie is unavailable or invalid. Force user to login.
      res.redirect('/login');
    });
});

app.post('/sessionLogout', (req, res) => {
  const sessionCookie = req.cookies.session || '';
  res.clearCookie('session');
  getAuth()
    .verifySessionCookie(sessionCookie)
    .then((decodedClaims) => {
      return getAuth().revokeRefreshTokens(decodedClaims.sub);
    })
    .then(() => {
      res.redirect('/login');
    })
    .catch((error) => {
      res.redirect('/login');
    });
});

import https from 'https';
import fs from 'fs';

const port = parseInt(process.env.PORT) || 8080;
if (!process.env.LOCAL_DEV) {
  app.listen(port, () => {
    console.log(`server listening on port ${port}`);
  });
} else {
  //enable direct https when developing locally
  const credentials = {
    key: fs.readFileSync('./localhost-key.pem', 'utf-8'),
    cert: fs.readFileSync('./localhost.pem', 'utf-8'),
  };

  https.createServer(credentials, app).listen(port, () => {
    console.log(`server listening on port ${port}`);
  });
}