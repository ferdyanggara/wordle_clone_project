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
    var characters       = '0123456789';
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
    const { username, name, password } = req.body;

    let msg = ""

    if (!username){
        msg += "username "
    }
    if (!name){
        msg += "name "
    }
    if (!password){
        msg += "password "
    }

    msg += "is empty."

    if (!username || !name || !password){
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
    console.log("yay")
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
            const {name} = users[username]
            req.session.user = {username, name}
            res.json({status: 'success', user: {username, name}})
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

// app.post("/addData", (req, res) => {
//     console.log("enter adddata")
//     console.log(req.body.name)
//     req.session.name  = req.body.name;
//     console.log(req.session.name)
//     res.json({
//         success : true,
//         name : req.body.name
//     })
// })

 app.post("/createGame", (req, res) => {
    console.log("current player dict")
    console.log(playerDictionary);
    // if(!req.session.user){
    //     res.json({
    //         success : false,
    //         message : "unexpected - no session"
    //     })
    // }

    if (req.session.user){
        if(!playerDictionary[req.session.user.username]){
            res.json({
                success : false,
                message : "no player"
            })
            return;
        }
    }
    


    //create the game here
    //Assumption -> playerDictionary contains the playerClass

    let gameId;
    while(true){
        const temp =makeid(3);
        if(!gameDictionary[gameId]){
            gameId = temp;
            break;
        }
    }
    // const {gameId} = req.body
    gameDictionary[gameId] = new Game(
        playerDictionary[req.session.user.username],
        gameId,
        io
    )


    // console.log(`Game with ${req.body.gameId} created with player ${req.body.name}`)
    res.json({success: true, gameId : gameId})
 })

 app.post("/joinGame", (req, res) => {

    const {gameId} = req.body
    if(!req.session.user){
        res.json({
            success : false,
            message : "unexpected - no session"
        })
        return;
    }

    if(!gameDictionary[gameId]){
        res.json({
            success : false,
            message : "No game"
        })
        return;
    }

    if(!playerDictionary[req.session.user.username]){
        res.json({
            success : false,
            message : "No person - login error"
        })
        return;
    }

    if(gameDictionary[gameId].getPlayerNum() < 2){
        let result = gameDictionary[gameId].addPlayer(playerDictionary[req.session.user.username]);
        res.json(result ? {
            success : true,
            message: req.session.user.username
        } : {
            success : false,
            message : "game started"
        })
    } else {
        res.json({
            success : false,
            message : "room full"
        })
    }


    
 })

 app.post("/startGame", (req, res) => {

     if(gameDictionary[req.body.gameId]){
        if(gameDictionary[req.body.gameId].startGame()){
            res.json({
                success : true,
            })
            return;
        }
     }
    
    res.json({
        success : false,
        message : "game has already started"
    })
 })

 app.post("/leaveGame", (req, res) => {
    const { gameId } = req.body;

    if(!req.session.user){
        res.json({
            success : false,
            message : "unexpected - no session"
        })
        return;
    }

    if(!gameDictionary[gameId]){
        res.json({
            success : false,
            message : "No Game exists"
        })
        return;
    }

    console.log(`Disconnecting player ${req.session.user.name}`)
    console.log(`Currently on gameId ${ gameId}`)

    gameDictionary[gameId].removePlayer(req.session.user.name);
    if(gameDictionary[gameId].getPlayerNum() <= 0){
        gameDictionary[gameId].destroyRoom();
        delete gameDictionary[gameId]; //clear memory
    }

    res.json({
        success : true
    })
    
 })

 app.get("/randomGame", (req, res) => {
    let gameId = -1;
    
    let gameIdKeys = Object.keys(gameDictionary);

    console.log('gameidkeys: ', gameIdKeys)

    for(let i = 0; i < gameIdKeys.length; i++){
        if(gameDictionary[gameIdKeys[i]] && gameDictionary[gameIdKeys[i]].getPlayerNum() < 2){
            gameId = gameIdKeys[i];
            break;
        }
    }

    res.json({
        success : gameId != -1 ? true : false,
        gameId : gameId
    })
 })

 io.use((socket, next) => {
    chatSession(socket.request, {}, next);
})

 io.on("connection", (socket) => {
    if(socket.request.session.user == undefined){
        console.log("Unexpected error - No session before io connection");
        return;
    }

    console.log(`Connected with name ${socket.request.session.user.username}`)
    // console.log(`Connected with name ${socket.request.session.name}`)

    playerDictionary[socket.request.session.user.username] = //temp modif for faster debug
    new Player( 
        socket.request.session.user.name,
        socket,
        () => {console.log("idk")}
    )

    console.log(`Current players`);
    console.log(Object.keys(playerDictionary));

    socket.on("disconnect", () => {
        const gameId = playerDictionary[socket.request.session.user.username].currentGameId;
        console.log(`Disconnecting player ${socket.request.session.user.name}`)
        console.log(`Currently on gameId ${ gameId}`)
        if(gameDictionary[gameId]){
            gameDictionary[gameId].removePlayer(socket.request.session.user.name);
            if(gameDictionary[gameId].getPlayerNum() <= 0){
                gameDictionary[gameId].destroyRoom();
                delete gameDictionary[gameId]; //clear memory
            }
        }
        delete playerDictionary[socket.request.session.user.username];
        console.log(`Player deleted`)
    })
    
 })

// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The wordle server has started...");
});
