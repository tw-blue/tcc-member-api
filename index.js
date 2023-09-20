import express from 'express';
import session from "express-session";
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import fs, {readFileSync} from 'fs';
import firebase from "firebase-admin";
import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import { getDatabase } from 'firebase-admin/database';
import connectSessionFirebase from 'connect-session-firebase';
const FirebaseStore=connectSessionFirebase(session);

const importJson = (filename)=>JSON.parse(
  readFileSync(
    new URL(filename, import.meta.url)
  )
);

const firebaseConfig= importJson('./static/firebase-config.json');
const serviceAccount=importJson('./tcc-1-ev-intern-firebase-adminsdk-ejvxt-302d83270e.json');//TODO use secret manager for (both of) this
/* TODO use this as soon as import assertion stabilizes!
import firebaseConfig from './static/firebase-config.json' assert { type: 'json' };
import serviceAccount from './tcc-1-ev-intern-firebase-adminsdk-ejvxt-302d83270e.json' assert { type: 'json' };//TODO use secret manager for (both of) this
*/
firebaseConfig["credential"]=firebase.credential.cert(serviceAccount);

// Initialize Firebase Admin SDK
initializeApp(firebaseConfig);



const app = express();
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(session({
  store: new FirebaseStore({database: getDatabase()}),
  secret: 'keyboard cat',//TODO use secret manager for this
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: true, maxAge: 1000 * 60 * 60 * 24, sameSite: 'strict' }
}));
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(csrf());


const authenticateJWT = (req, res, next) => {
  const sessionCookie = req.cookies.session || '';
  getAuth()
  .verifySessionCookie(sessionCookie, true)
  .then((decodedToken) => {
    req.token = decodedToken;
    next();
  })
  .catch(error => res.redirect('/login'));
}

const verifyClaims = (...claims) => {
  return verifyClaimsIntern.bind(null, claims);
}

const verifyClaimsIntern = (claims, req, res, next) => {
  if (req.token) {
    if (claims.every(requiredToken => req.token[requiredToken] === true)) {
      next();
    } else {
      console.log(`Missing 1 or more claims of the following: ${claims.toString()}`);
      return res.sendStatus(403);
    }
  } else {
    return res.sendStatus(401);
  }
}

app.use(express.static("static", { index: false, extensions: ['html'] }));

const formPages=[
  "login","auth","neu"
];
formPages.forEach(name=>{
    app.get("/"+name, (req,res)=>{
      res.render(name, { csrfToken: req.csrfToken() });
    })
});

app.post("/neu", authenticateJWT, verifyClaims("viewMembers"), (req,res)=>{
  console.dir(req.body);
  res.send("OK");
  //TODO transfer data into firestore
})

app.get('/', (req, res) => {
  res.redirect('/login')
});

app.post("/rights", authenticateJWT, (req, res) => {
  if (req.query.action) {
    switch (req.query.action) {
      case "promote":
        getAuth().setCustomUserClaims(req.token.uid, { viewMembers: true, manageUsers: true });
        logout(req, res);
        break;
      case "demote":
        getAuth().setCustomUserClaims(req.token.uid, null);
        logout(req, res);
        break;
    }
  }
});

app.post("/vote", authenticateJWT, verifyClaims('viewMembers'), (req, res) => {
  res.send("Permitted");
});

app.get("/users", authenticateJWT, verifyClaims('manageUsers'), (req, res) => {
  //TODO implement pagination if there are ever more than 50 users
  getAuth().listUsers(50).then((result) => {
    const userData = [];
    result.users.map
    result.users.forEach(userRecord => {
      userRecord.customClaims ??= [];
      userRecord.customClaims.manageUsers ??= false;
      userRecord.customClaims.viewMembers ??= false;
      userData.push({
        name: userRecord.displayName,
        email: userRecord.email,
        viewMembers: userRecord.customClaims.viewMembers,
        manageUsers: userRecord.customClaims.manageUsers
      });
    });
    res.render("users", { users: userData });
  }).catch((error) => {
    console.log('Error listing users:', error);
  });

});

app.post('/sessionLogin', (req, res) => {
  const idToken = req.body.idToken.toString();

  getAuth().verifyIdToken(idToken).then((decodedIdToken) => {
    //Only accept recent id tokens to avoid stolen tokens
    if (new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) {
      const expiresIn = 60 * 60 * 24 * 5 * 1000;
      getAuth().createSessionCookie(idToken, { expiresIn }).then((sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true, secure: true };
        res.cookie('session', sessionCookie, options);
        res.status(200).end(JSON.stringify({ status: 'success' }));
      },
        (error) => {
          res.status(401).send('UNAUTHROIZED REQUEST!');
        });
    } else {
      res.status(401).send('Recent sign in required!');
    }
  });
});

function logout(req, res){
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
}

app.post('/sessionLogout', (req, res) => {
  logout(req, res);
});

const port = parseInt(process.env.PORT) || 8080;
if (!process.env.LOCAL_DEV) {
  app.listen(port, () => {
    console.log(`server listening on port ${port}`);
  });
} else {
  //enable direct https when developing locally
  import('https').then((https)=>{
    const credentials = {
      key: fs.readFileSync('./localhost-key.pem', 'utf-8'),
      cert: fs.readFileSync('./localhost.pem', 'utf-8'),
    };
  
    https.createServer(credentials, app).listen(port, () => {
      console.log(`server listening on port ${port}`);
    });
  })
}


//TODO check email verification?
//TODO look into CORS & OWASP Checklist