const Socket = (function() {
    // This stores the current Socket.IO socket
    let socket = null;

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function() {
        socket = io();

        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // Get the online user list
            socket.emit("get users");

            // Get the chatroom messages
            socket.emit("get messages");
        });

        // Set up the users event
        socket.on("users", (onlineUsers) => {
            onlineUsers = JSON.parse(onlineUsers);
            // Show the online users
            OnlineUsersPanel.update(onlineUsers);
        });

        // Set up the add user event
        socket.on("add user", (user) => {
            user = JSON.parse(user);

            // Add the online user
            OnlineUsersPanel.addUser(user);
        });

        // Set up the remove user event
        socket.on("remove user", (user) => {
            user = JSON.parse(user);

            // Remove the online user
            OnlineUsersPanel.removeUser(user);
        });

        // Set up the messages event
        socket.on("messages", (chatroom) => {
            chatroom = JSON.parse(chatroom);

            // Show the chatroom messages
            ChatPanel.update(chatroom);
        });

        // Set up the add message event
        socket.on("add message", (message) => {
            message = JSON.parse(message);
            // console.log('do i receive the message: ', message)
            // Add the message to the chatroom
            ChatPanel.addMessage(message);
        });

        // HERE IS THE PLACE TO ADD THE TYPING... IMPROVEMENT 
        

        $("#chat-input-form").on("keydown", ()=> {
            // console.log('THERE IS KEYDOWN AFFECT')
            socket.emit('typing')
        })

        // listen for server sending
        socket.on("typing-notification", (message) => {
            msg = JSON.parse(message)

            // console.log('what is msg: ', msg)   

            // insert message to notif area
            $("#notif-area").html(
                `<p>${message}</p>`
                )
            })

        socket.on("finish typing", () => {
            $("#notif-area").html(
                ""
                )
        })
    };

    // This function disconnects the socket from the server
    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };

    // This function sends a post message event to the server
    const postMessage = function(content) {
        if (socket && socket.connected) {
            // just want to make sure that the content is not blank (better ui improvement)
            if (content){
                socket.emit("post message", content);
            }
        }
    };

    return { getSocket, connect, disconnect, postMessage };
})();
