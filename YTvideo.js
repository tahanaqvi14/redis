const express=require('express');
const session=require('express-session');
const redis=require('redis');
const connectRedis=require('connect-redis');

const app=express();

//1. Connect/configure Redis
const redisStore=connectRedis(session);

const redisClient=redis.createClient({
    host:'localhost',
    port:6379 //default port
});


//2. Configuring the session middleware
app.use(session({
    //what kind of store to save our session & what cliet u will be using.
    store:new redisStore({client:redisClient}),
    secret:'my-secret',

    saveUninitialized:false,     // What it means: "Don't save empty sessions"
    // Why set to false:
    // Complies with privacy laws (GDPR)
    // Saves storage space
    // Prevents session flooding attacks
    // When it saves: Only when you modify req.session (e.g., req.session.user = ...)

    resave:false,
    cookie:{
        secure:false,
        maxAge:1000*60*60*24*30,
        httpOnly:true,
    }
}))

//3. creating login endpoint
app.post('/login',(req,res)=>{
    const {username,password}=req.body;

    //checking wheather credentials are valid
    //we will suppose everything is valid

    req.session.client='123acb';
    req.session.mynum=5;
    
    res.json('You are logged in');
})

//4. plug in another middleware that will check if the user is authenticated or not
//all requests are plugged in after this middleware will only be accessible if the user is logged in

app.use((req,res,next)=>{
    if(!req.session || req.session.client){
        const err=new Error('You are not logged in');
        err.statusCode=401;
        next(err);
    }
    next();
})

//plug in all the routes that the user can only access when logged in

app.use('/profile',(req,res)=>{
    res.join(req.session)
})

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
})
