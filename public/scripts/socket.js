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

        //currently, I still have no clue what socket is required for now
        socket.on('word-result', (value) => {
            // console.log(value)
            // console.log(JSON.parse(value));

            //TODO : ADD UI CALL
            //to edit the current word displayed
            //based on the username and result
            console.log(value)
            console.log(JSON.parse(value));
        })

        socket.on("update", (value) => {
            //TODO : Update game result and time
            //FORMAT
            /**
             * {
             *  gameId : string,
             *  update : [{
             *      player : <player name>,
             *      currentWord : <player current word>,
             *      score : <player score>
             *      }]
             * }
            */
             console.log('Update')
             console.log(JSON.parse(value))
        })

        socket.on("over", (value) => {
            //Insert UI when game over
            console.log("GAME IS OVER")
        })

        socket.on("room", value => {
            console.log("room update")
            console.log(value)
        })

        //TODO : Connect to UI
        // Add socket.emit to keydown enter function

        // socket.emit("word-sent", $("#word").val());
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
