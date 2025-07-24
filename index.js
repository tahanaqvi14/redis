import express from 'express';
import session from 'express-session';

import { RedisStore } from 'connect-redis';
//redis store importing

// Redis is like a super-fast memory-based storage where your app can temporarily save things like: “who is logged in,” “which users are in which game room,” or “what's in the cart.”


import { createClient } from 'redis';
//redis createclient importing from redis to create a client

//1.creating a client to connect to redis
const redisClient = createClient({
  //url is the address of the redis server
  url: 'redis://127.0.0.1:6379',
  socket: {
    host: 'localhost',
    port: 6379,
  }
});
// Connecting the redis client to the Redis server
await redisClient.connect();

const app = express();

app.use(express.json());
//for parsing json data when we use GET

//2. Configuring the session middleware
app.use(
  session({
    //what kind of store to save our session & what cliet u will be using.
    store: new RedisStore({ client: redisClient }),
    secret: 'my-secret',
    resave: false,
    saveUninitialized:false,     // What it means: "Don't save empty sessions"
    // Why set to false:
    // Complies with privacy laws (GDPR)
    // Saves storage space
    // Prevents session flooding attacks
    // When it saves: Only when you modify req.session (e.g., req.session.user = ...)

    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(express.json());


//3. creating login endpoint
app.post('/login', (req, res) => {
  const { username } = req.body;

  req.session.user = username;
  res.json({ message: `Logged in as ${username}` });
});


app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json({ user: req.session.user });
});


app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // remove session cookie from browser
    res.json({ message: 'Logged out' });
  });
});



app.listen(3000, () => {
  console.log('✅ Server running on port 3000');
});
