const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

//game library
const Game = require("./backend-class/gameClass")
const Player = require("./backend-class/playerClass")

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

const gameDictionary = {};
const playerDictionary = {};

// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 999999999 }
});
app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}
// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const { username, avatar, name, password } = req.body;

    
    let msg = ""

    if (!username){
        msg += "username "
    }
    if (!avatar){
        msg += "avatar "
    } 
    if (!name){
        msg += "name "
    }
    if (!password){
        msg += "password "
    }

    msg += "is empty."

    if (!username || !avatar || !name || !password){
        res.json({ status: "error", error: msg });
    }
    else if (!containWordCharsOnly(username)){
        res.json({ status: "error", error: "username can only contains underscore, letters or numbers" });
    } else {
    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("data/users.json"))
    //
    // E. Checking for the user data correctness
    //
    if (!(username in users)){
    //
    // G. Adding the new user account
    //
    users[username] =  {
            avatar, 
            name, 
            password: bcrypt.hashSync(password, 10)
        }
    //
    // H. Saving the users.json file
    //
    fs.writeFileSync(
        "data/users.json", 
        JSON.stringify(
            users, 
            null, 
            ""
        )
    )
    //
    // I. Sending a success response to the browser
    //
    res.json({status: 'success'})
    } else {
    res.json({ status: "error", error: "username already exist" });
    }
    }

    



});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const { username, password } = req.body;

    let msg = ""
    if (!username){
        msg += "username "
    }
    if (!password){
        msg += "password "
    }

    msg += "is empty"
    
    if (!username || !password){
        res.json({ status: "error", error: msg });
    }
    
    else {
 //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("data/users.json"))
    //
    // E. Checking for username/password
    //
    if (username in users){
        if (bcrypt.compareSync(password, users[username]['password'])){
            const {avatar, name} = users[username]
            req.session.user = {username, avatar, name}
            res.json({status: 'success', user: {username, avatar, name}})
        } else {
            res.json({status: 'error', error: 'password invalid'})
        }
    } else {
        res.json({status: 'error', error: "username does not exist"})
    }
    //
    // G. Sending a success response with the user account
    //
    }

   
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    //
    // B. Getting req.session.user
    //
    user = req.session.user
    //
    // D. Sending a success response with the user account
    //
    if (user){
        res.json({status: "success", user: user})
    } else {
        res.json({ status: "error", error: "no user in session, please re login" });
    }
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    //
    // Deleting req.session.user
    //
    delete req.session.user
    //
    // Sending a success response
    //
 
    // Delete when appropriate
    res.json({ status: "success"});
});

//
// ***** Please insert your Lab 6 code here *****
//
const {createServer} = require('http');
const {Server} = require("socket.io");
const httpServer = createServer(app)
const io = new Server(httpServer);

// Prototying Function for gameplay
app.post("/addData", (req, res) => {
    console.log("enter adddata")
    console.log(req.body.name)
    req.session.name  = req.body.name;
    console.log(req.session.name)
    res.json({
        success : true,
        name : req.body.name
    })
})
 app.post("/createGame", (req, res) => {
     
     console.log(playerDictionary);
    if(!playerDictionary[req.body.name]){
        res.json({
            success : false
        })
    }

    //create the game here
    //Assumption -> playerDictionary contains the playerClass

    // const gameId = makeid(6);
    console.log("creating game")
    gameDictionary[req.body.gameId] = new Game(
        playerDictionary[req.body.name],
        req.body.gameId,
        io
    )


    console.log(`Game with ${req.body.gameId} created with player ${req.body.name}`)
    res.json({success: false})
 })

 app.post("/joinGame", (req, res) => {

    const {gameId, name} = req.body

    if(!gameDictionary[gameId]){
        res.json({
            success : false,
            reason : "No game"
        })
        return;
    }

    if(!playerDictionary[name]){
        res.json({
            success : false,
            reason : "No person - login error"
        })
        return;
    }

    gameDictionary[gameId].addPlayer(playerDictionary[name]);

    res.json({
        success : true,
    })

    

 })

 app.post("/startGame", (req, res) => {
     if(gameDictionary[req.body.gameId]){
        gameDictionary[req.body.gameId].startGame()
        res.send("yay?")
        return;
     }
    
    res.send("no?")
 })

 io.use((socket, next) => {
    chatSession(socket.request, {}, next);
})

 io.on("connection", (socket) => {
    console.log(`Connected with name ${socket.request.session.name}`)

    playerDictionary[socket.request.session.name] = 
    new Player( 
        socket.request.session.name,
        socket,
        () => {console.log("idk")}
    )
    
 })

// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The wordle server has started...");
});
