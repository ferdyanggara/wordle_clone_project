const Socket = (function() {
    // This stores the current Socket.IO socket
    let socket = null;

    //gamestate data since I am too lazy to create another
    let currentGameId;
    let currentPlayer;
    let currentOpponent;



    // This function gets the socket from the module
    const getSocket = function() {
        console.log('creating socket')
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function() {
        socket = io();

        //currently, I still have no clue what socket is required for now
        socket.on('word-result', (value) => {
            // console.log(value)
            // console.log(JSON.parse(value));

            //to edit the current word displayed
            //based on the username and result
            const {gameId, player,result,data,tries} = JSON.parse(value);
            console.log(JSON.parse(value))
            GameUI.updateBoard(gameId, player, data.data ? data.data : {}, tries, result);
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
            //  console.log('Update')
            //  console.log(JSON.parse(value))
            const {gameId, time, update} = JSON.parse(value);
           
            if(currentGameId == gameId){
                let seconds = Math.round(parseInt(time)/1000);
                let minutes = Math.floor(seconds/60);
                $("#min").text(minutes);
                $("#sec").text(seconds%60);

                update.forEach(value => {
                    if(value.player == $("#user-panel .user-name").text()){
                        $("#user-score text").text(value.score)
                        if(value.score > 0) {
                            $("#user-score").css("animation-name", "shake")
                        }
                        $("#cheat").text(value.currentWord)
                    }
                    else{
                        $("#opp-score text").text(value.score)
                        if(value.score > 0){
                            $("#opp-score").css("animation-name", "shake")
                        }
                    }
                })
            }
        })

        socket.on("start-game", (value) => {
            //TODO : Event to start game
            // When emitted by the backend, it help indicate that game starts
            // Logically, close the matchmaking room
            /**
             * {
             *  gameId : string
             * }
             */
            console.log(value)
            const {gameId, start} = JSON.parse(value);
            if(gameId == currentGameId){
                start.forEach(value => {
                    if(value.player == $("#user-panel .user-name").text()){
                        currentPlayer = value.player;
                    }
                    else{
                        currentOpponent = value.player;
                    }
                })
                console.log(`GameId ${currentGameId} - ${currentPlayer} vs ${currentOpponent}`)
                Room.hide();
                GameUI.startGame(currentGameId, currentPlayer, currentOpponent);
            }
        } )

        socket.on("reset", (value) => {
            //TODO (If this is required to indicate which UI to reset)
            // Cases : Finish all chances / get the right words 
            /**
             * {
             *  gameId : string,
             *  player : string <player name>
             * }
             */
            console.log("Resetting")
            console.log(JSON.parse(value))
        })

        socket.on("over", (value) => {
            /**
             * 
             * {
            gameId : <game id>
            result : [{
                player : <player name>,
                currentWord : string,
                score : int
            }]
            }
             */
            //currently there is no fix area for the gameId so yes 

            const {gameId, result} = JSON.parse(value);

            console.log('GAME ENDS WHAT IS RESULT: ', result)

            if( gameId == currentGameId ){
                //update the highscore
                fetch("/score", {
                    method : "GET",
                    headers: {
                        'Content-Type': 'application/json'
                      }
                    })
                    .then( res => res.json())
                    .then( value => {
                        HighScore.update(value.data);
                    })
                //leave the game
                fetch("/leaveGame", {
                    method : "POST",
                    headers: {
                        'Content-Type': 'application/json'
                      },
                    body :  JSON.stringify({
                        gameId : currentGameId
                    })
                    })
                    .then( res => res.json())
                    .then(value => {
                        //logically it quit already
                        if(value.success){
                            currentGameId = "";
                        }
                    })

                //end the game
                GameUI.endGame();
                console.log("entered")
                $("#game-over").show();
                UserStatistics.update(result)
                let score1 = $("#user-statistics tr")[0].children[2].textContent;
                let score2 = $("#user-statistics tr")[1].children[2].textContent;
                if (parseInt(score1) > parseInt(score2)) {
                    $("#winner").html($("#user-statistics tr")[0].children[0].textContent);
                }
                else if (parseInt(score1) < parseInt(score2)){
                    $("#winner").html($("#user-statistics tr")[1].children[0].textContent);
                }
                else {
                    $("#winner").html("Both player");
                }
                
                // const gameOverTable = $("#game-over-result");
                // gameOverTable.empty();

                // result.forEach(value => {
                //     gameOverTable.append(`<tr>
                //     <th>${value.player}</th>
                //     <th>${value.score}</th>
                //     </tr>`)
                // });

            }
            //temp hide
            // $("#game-over").hide();
            console.log("GAME IS OVER");
        })

        socket.on("room", value => {
            console.log("room update")
            const host = Authentication.getUser().name;
            console.log(JSON.parse(value));
            const {gameId, players} = JSON.parse(value)
            console.log(`${players} in ${host} on socket`)
            console.log(players);

            // if (!(players.includes(host))){
            //     console.log("why?")
            //     Room.hide() 
            //     MatchMaking.show()
            // } else {
            //     console.log("modify")
            //     GamePortal.addTableWithSocket(players)
            // }

            if(gameId == currentGameId){
                if(!(players.includes(host))){
                    Room.hide();
                    MatchMaking.show();
                    currentGameId = '';
                }
                GamePortal.addTableWithSocket(players)
            }

        })
        
        socket.on("roomList", (value) => {
            MatchMaking.updateList(JSON.parse(value))
        })
    };



    // This function disconnects the socket from the server
    const disconnect = function() {
        socket.disconnect();
        socket = null;
        currentGameId = null;
        currentPlayer = null;
        currentOpponent = null;
    };

    // // This function sends a post message event to the server
    // const postMessage = function(content) {
    //     if (socket && socket.connected) {
    //         // just want to make sure that the content is not blank (better ui improvement)
    //         if (content){
    //             socket.emit("post message", content);
    //         }
    //     }
    // };

    const setGameId = function(gameId){
        currentGameId = gameId;
        console.log(`Updated currentGameId ${currentGameId}`);
    }

    const setPlayer = function(player){
        currentPlayer = player
        console.log(`Updated player name ${currentPlayer}`)
    }

    const getGameId = function(){
        return currentGameId;
    }

    const getPlayer = function(){
        return currentPlayer
    }

    return { getSocket, connect, disconnect, setGameId, setPlayer, getGameId, getPlayer };
})();
