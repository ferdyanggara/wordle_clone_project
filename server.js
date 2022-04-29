const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});
app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
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

/* 
CONTENT FOR ONLINE USER: 
{
    "tony": { avatar: "Owl",    name: "Tony Lee" },
    "may":  { avatar: "Rabbit", name: "May Wong" }

    FILL: onlineUsers['username'] = {avatar, name}
}
*/

// const onlineUsers = {}

// io.use((socket, next) => {
//     chatSession(socket.request, {}, next);
// })

// io.on("connection", (socket) => {
//     // Add a new user to the online user list
//     if (socket.request.session.user){
//         const {username, avatar, name} = socket.request.session.user
//         onlineUsers[username] = {avatar, name}
//         io.emit("add user", JSON.stringify({username, avatar, name}))
//     }

//     socket.on('disconnect', () => {
//         if (socket.request.session.user){
//             const {username, avatar, name} = socket.request.session.user
//             delete onlineUsers[username]
//             io.emit("remove user", JSON.stringify({username, avatar, name}))
//             }
//     })

//     socket.on("get users", () => {
//         // Send the online users to the browser
//         socket.emit('users', JSON.stringify(onlineUsers))
//     });

//     socket.on("get messages", () => {
//         socket.emit("messages",fs.readFileSync("data/chatroom.json", "utf-8"))
//     })


//     socket.on("post message", (content) => {


//     if (socket.request.session.user){


//         const data = {
//             user: socket.request.session.user, 
//             datetime: new Date().toISOString(),
//             content: content
//         }
    
//         const chats = JSON.parse(fs.readFileSync("data/chatroom.json"))
    
//         chats.push(data)

    
//         fs.writeFileSync(
//             "data/chatroom.json", 
//             JSON.stringify(
//                 chats, 
//                 null, 
//                 ""
//             )
//         )

//         io.emit("add message", JSON.stringify(data))
//     }

//     })

//     let finishType = null
//     socket.on('typing', () => {
//         if (socket.request.session.user){
//             socket.broadcast.emit('typing-notification', JSON.stringify(`${socket.request.session.user.name} is typing..`));

//             if (finishType){
//                 clearTimeout(finishType);
//             } 
//             finishType = setTimeout( () => {
//                 socket.broadcast.emit('finish typing')
//             }, 3000);
//         }
//     })


// });

// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The wordle server has started...");
});
