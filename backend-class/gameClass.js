const WordDictionary = require("./wordClass")

class Game{
    // This class handle the whole setup and gamestate itself
    // When the game start all player must be initialized

    gameId;
    playerData = {};

    gameState; //START, END, WAITING

    wordDictionary  = WordDictionary.getDictionary();

    totalTime = 5 * 1000;
    lastTime;

    gameTimeout;
    updateTimeout;

    constructor(host, gameId, io){
        this.io = io;
        this.gameId = gameId;

        this.addPlayer(host);
    }

    initializeSocket(playerData){
        //This will setup the socket events required
        //during the game

        /**
         * Required Sockets so far:
         * - receive a word
         * 
         */
        playerData.player.socket.on("word-sent",(word) => {
            this.playerWordCheck(playerData, word);
        } )

    }

    removeSocketListener(socket){
        //When the game ends, remove the listener
        socket.removeAllListeners("word-sent");
    }

    playerWordCheck = (playerData, word) => {
        if(!this.wordDictionary.checkIfWordExist(word)){
            this.io.emit("word-result", JSON.stringify({
                gameId : this.gameId,
                player : playerData.player.data,
                result : false,
                data : []
            }))
        }

        else{
            let result = this.wordDictionary.checkDifferences(word, playerData.currentWord)
            let final = {
                gameId : this.gameId,
                player : playerData.player.data,
                result : true,
                data : result
            };
            this.io.emit("word-result", JSON.stringify(final));

            //alter current player gamestate here
            if(result.correct){
                console.log(`Player input the right word ${word}`)
                //player input the correct word
                playerData.score += 1;
                playerData.tries = 0;
                playerData.currentWord = this.wordDictionary.getRandomWord();
            }

            //failed to input the right word
            else{
                console.log(`Wrong input for word ${word} against ${playerData.currentWord}`)
                playerData.tries += 1
                if(playerData.tries == playerData.maxTries){
                    //TODO : Call io to reset this player
                    playerData.currentWord = this.wordDictionary.getRandomWord();
                    playerData.tries = 0;
                }
            }
        }

    }

    startGame(){
        console.log(`Game ${this.gameId} starting`)

        Object.values(this.playerData).forEach(value => {
            this.initializeSocket(value)
            value.currentWord = this.wordDictionary.getRandomWord();
            value.score = 0;
            value.tries = 0;
        })

        this.totalTime = 5 * 1000
        this.lastTime = new Date();
        //set timeout here
        this.gameTimeout = setTimeout( () => {
            console.log("Game ends");
            this.endGame();
        }, this.totalTime)
        //set event call that game start
        this.updateTimeout = setInterval ( () => { //idk if this will be required?
            // just for time and score update

            const now = new Date();
            this.totalTime -= (now.getTime() - this.lastTime.getTime());
            this.lastTime = now;

            this.io.emit("update", JSON.stringify({
                gameId: this.gameId,
                update : this.formatResult()
            }))

        }, 500)

    }

    endGame(){
        clearTimeout(this.gameTimeout);
        clearInterval(this.updateTimeout);

        Object.values(this.playerData).forEach(value => {
            this.removeSocketListener(value.player.socket)
        })

        this.io.emit("over", JSON.stringify({
            gameId : this.gameId,
            result : this.formatResult()
        }))

    }

    destroyRoom(){
        this.endGame();
        this.wordDictionary = null;
        this.io = null;
    }

    // Helper Functions

    addPlayer(player){ //adding player
        console.log("Adding player")
        
        player.setGameId(this.gameId);

        this.playerData[player.data] = {
            player : player, //containing the player data and socket
            currentWord : "",
            score : 0,
            tries : 0,
            maxTries : 5
        };

        console.log(`Current number of player ${this.playerData.length}`);
        console.log(this.playerData);

        let currentOccupant = Object.values(this.playerData).map(value => value.player.data)

        this.io.emit("room", JSON.stringify({
            gameId : this.gameId,
            players : currentOccupant
        }));
    }

    removePlayer(name){

        if(!this.playerData[name]){
            return false;
        }
        console.log(`Player ${name} leaving room`);
        this.io.emit("leave-room", `Player ${name} disconnected`);

        this.removeSocketListener(this.playerData[name].player.socket);
        this.playerData[name].player.removeGameId();
        delete this.playerData[name];
        
        console.log(this.playerData)
        return true;
    }

    formatResult(){
        const result = [];

        Object.values(this.playerData).forEach(value => {
            result.push({
                player : value.player.data,
                currentWord : value.currentWord,
                score : value.score
            })
        })

        return result;
    }

    getPlayerNum(){
        return Object.value(this.playerData).length;
    }

}

module.exports = Game