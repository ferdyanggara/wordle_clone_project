const WordDictionary = require("./wordClass")

class Game{
    // This class handle the whole setup and gamestate itself
    // When the game start all player must be initialized

    gameId;
    player1Data;
    //player2Data;

    gameState; //START, END, WAITING

    wordDictionary  = WordDictionary.getDictionary();

    totalTime = 30 * 1000;
    lastTime;

    gameTimeout;
    updateTimeout;

    constructor(host, gameId, io){
        this.io = io;
        this.gameId = gameId;
        
        this.player1Data = {
            player : host, //containing the player data and socket
            currentWord : "",
            score : 0,
            tries : 0,
            maxTries : 5
        }

    }

    initializeSocket(playerData){
        //This will setup the socket events required
        //during the game

        /**
         * Required Sockets so far:
         * - receive a word
         * 
         */
        console.log(playerData);
        playerData.player.socket.on("word-sent", (word) => {
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

        })

    }

    removeSocketListener(socket){
        //When the game ends, remove the listener
        socket.removeListener("word-sent");
    }

    startGame(){
        console.log(`Game ${this.gameId} starting`)
        const playerData = [this.player1Data]

        playerData.forEach(value => {
            this.initializeSocket(value)
            value.currentWord = this.wordDictionary.getRandomWord();
            value.score = 0;
            value.tries = 0;
        })

        totalTime = 30 * 1000
        lastTime = new Date();
        //set timeout here
        this.gameTimeout = setTimeout( () => {
            console.log("Game ends");

        }, totalTime)
        //set event call that game start
        this.updateTimeout = setTimeout ( () => { //idk if this will be required?
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
        clearTimeout(updateTimeout);

        const playerData = [player1Data]

        playerData.forEach(value => {
            this.removeSocketListener(value.player.socket)
        })

        this.io.emit("over", JSON.stringify({
            gameId: this.gameId
        }))

    }

    formatResult(){
        const playerData = [this.player1Data]
        const result = [];

        playerData.forEach(value => {
            result.push({
                player : value.player,
                currentWord : value.currentWord,
                score : value.score
            })
        })

        return result;
    }

}

module.exports = Game