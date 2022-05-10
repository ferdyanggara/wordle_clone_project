const WordDictionary = require("./wordClass")
const ScoreDictionary = require("./scoreClass")

class Game{
    // This class handle the whole setup and gamestate itself
    // When the game start all player must be initialized

    gameId;
    playerData = {};

    gameState = 0; // 0 for wait, 1 for start

    wordDictionary  = WordDictionary.getDictionary();
    scoreDictionary = ScoreDictionary.getInstance();

    totalTime = 9999 * 1000;
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
                data : [],
                tries : playerData.tries + 1
            }))
        }

        else{
            let result = this.wordDictionary.checkDifferences(word, playerData.currentWord)
            let final = {
                gameId : this.gameId,
                player : playerData.player.data,
                result : true,
                data : result,
                tries : playerData.tries + 1
            };
            this.io.emit("word-result", JSON.stringify(final));

            playerData.attemptCount[playerData.tries] += 1;

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
                    this.io.emit("reset", JSON.stringify({ //idk i need to tell to reset or they will reset by itself
                        gameId : this.gameId,
                        player : playerData.player.data
                    }))
                    playerData.currentWord = this.wordDictionary.getRandomWord();
                    playerData.tries = 0;
                }
            }
        }

    }

    startGame(){
        if(this.gameState || this.getPlayerNum() < 2){
            return false;
        }
        console.log(`Game ${this.gameId} starting`)

        this.gameState = 1;

        Object.values(this.playerData).forEach(value => {
            this.initializeSocket(value)
            value.currentWord = this.wordDictionary.getRandomWord();
            value.score = 0;
            value.tries = 0;
            value.attemptCount = [0,0,0,0,0,0];
        })


        // TODO:TESTING FOR END GAME
        this.totalTime = 60 * 1000
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
                time : this.totalTime,
                update : this.formatResult()
            }))

        
            

        }, 500)

        this.io.emit("start-game", JSON.stringify({
            gameId: this.gameId,
            start : this.formatResult()
        }))

        return true;

    }

    endGame(){
        if(this.gameState == 0){
            return; //still matchmaking, nothing happened
        }
        this.gameState = 0;
        clearTimeout(this.gameTimeout);
        clearInterval(this.updateTimeout);

        Object.values(this.playerData).forEach(value => {
            this.removeSocketListener(value.player.socket)
        })

        const result = this.formatResult();
           // TODO: DUMP 
           let tempRes = [{
            player : "ferdy",
            currentWord : "yeeha",
            score : "20",
            stat : {
                attempt : [1,2,3,4,5,6], //hardcode
                count : [1,10,2,5,3,4]
            }
        },{
            player : "joan",
            currentWord : "damn",
            score : "100",
            stat : {
                attempt : [1,2,3,4,5,6], //hardcode
                count : [1,3,10,4,32,1]
            }
        }]

        this.io.emit("over", JSON.stringify({
            gameId : this.gameId,
            result : tempRes
        }))


        result.forEach(value => {
            this.scoreDictionary.addScoreData(value);
        })

        

    }

    destroyRoom(){
        console.log(`Destroy room ${this.gameId}`)
        this.endGame();
        this.wordDictionary = null;
        this.io = null;
    }

    // Helper Functions

    addPlayer(player){ //adding player
        if(this.gameState == 1 || this.getPlayerNum() >= 2){
            return false;
        }
        console.log("Adding player")
        
        player.setGameId(this.gameId);

        //TODO : Do we need to assume for same login?

        this.playerData[player.data] = {
            player : player, //containing the player data and socket
            currentWord : "",
            score : 0,
            tries : 0,
            maxTries : 6,
            attemptCount : [0,0,0,0,0,0] //hardcoding due to time
        };

        console.log(`Current number of player ${Object.keys(this.playerData).length}`);
        console.log(this.playerData);

        let currentOccupant = Object.values(this.playerData).map(value => value.player.data)

        // player.socket.broadcast.emit("room", JSON.stringify({
        //     gameId : this.gameId,
        //     players : currentOccupant
        // }))


        this.io.emit("room", JSON.stringify({
            gameId : this.gameId,
            players : currentOccupant
        }));

        return true;
    }

    removePlayer(name){

        if(!this.playerData[name]){
            return false;
        }
        console.log(`Player ${name} leaving room`);

        let currentOccupant = Object.values(this.playerData).map(value => value.player.data)

        this.playerData[name].player.socket.broadcast.emit("room", JSON.stringify({
            gameId : this.gameId,
            players : currentOccupant
        }))
        // this.io.emit("leave-game", `Player ${name} disconnected`);

        this.removeSocketListener(this.playerData[name].player.socket);
        this.playerData[name].player.removeGameId();
        delete this.playerData[name];
        
        console.log(this.playerData)

        let playerLeft = Object.values(this.playerData).map(value => value.player.data)


        this.io.emit("room", JSON.stringify({
            gameId : this.gameId,
            players : playerLeft
        }));


        return true;
    }

    formatResult(){
        const result = [];

        Object.values(this.playerData).forEach(value => {
            result.push({
                player : value.player.data,
                currentWord : value.currentWord,
                score : value.score,
                stat : {
                    attempt : [1,2,3,4,5,6], //hardcode
                    count : value.attemptCount
                }
            })
        })

        return result;
    }

    getPlayerNum(){
        return Object.values(this.playerData).length;
    }

    getRoomPlayers(){
        return Object.values(this.playerData).map(value => value.player.data);
    }

    getPlayer(){
        return Object.values(this.playerData);
    }

}

module.exports = Game