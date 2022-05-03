const Game = require("./gameClass");
const Player = require("./playerClass");

class GameManager{

    #gameDictionary = {};
    #playerDictionary = {};

    #io;

    static #instance = null;

    constructor(io){
        if(!(io)){
            throw "no socket";
        }
        this.#io = io;

        // logically i can init it here i think
        // I already have no clue how to implement a better method
        // especially when init this class with io dependency
        this.#io.on("connection", (socket) => {
            if(socket.request.session.user == undefined){
                console.log("User has not sign in, please sign in!");
                return;
            }

            console.log(`Connected with name ${socket.request.session.user.username}`)

            this.addPlayer(socket.request.session.user, socket);

            console.log(`Current players`);
            console.log(Object.keys(this.#playerDictionary));

            socket.on("disconnect", () => {
                const gameId = this.#playerDictionary[socket.request.session.user.username].currentGameId;
                console.log(`Disconnecting player ${socket.request.session.user.name}`)
                console.log(`Currently on gameId ${ gameId}`)
                if(this.#gameDictionary[gameId]){
                    this.leaveGame(socket.request.session.user, gameId)
                    // gameDictionary[gameId].removePlayer(socket.request.session.user.name);
                    // if(gameDictionary[gameId].getPlayerNum() <= 0){
                    //     gameDictionary[gameId].destroyRoom();
                    //     delete gameDictionary[gameId]; //clear memory
                    // }
                }
                this.removePlayer(socket.request.session.user);
                console.log(`Player deleted`)
            })


        })
    }

    static setup(io){
        if(this.#instance == null){
            this.#instance = new GameManager(io);
        }
        return this.#instance;
    }

    static getInstance(){
        if(this.#instance == null){
            throw "Not yet init!";
        }
        return this.#instance;
    }
    
    makeid(length) {
        var result           = '';
        var characters       = '0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * 
     charactersLength));
       }
       return result;
    }

    /// PLAYER FUNCTIONS ///

    //user means {user, username}

    addPlayer(user, socket){
        if(user == undefined || socket == undefined){
            return false;
        }
        this.#playerDictionary[user.username] = 
        new Player(user.name, socket, () => {console.log("idk")});
    }

    removePlayer(user){
        if(!this.#playerDictionary[user.username]){
            return false;
        }
        delete this.#playerDictionary[user.username];
        return true;
    }

    /// GAME FUNCTION ///

    createGame(user){
        if(user == undefined){
            return {
                success : false,
                message : "No user passed"
            };
        }
    
        if(!this.#playerDictionary[user.username]){
            return {
                success : false,
                message : "no player"
            };
        }

        let gameId;

        while(true){
            const temp = this.makeid(3);
            if(!this.#gameDictionary[temp]){
                gameId = temp;
                break;
            }
        }

        this.#gameDictionary[gameId] = new Game(
            this.#playerDictionary[user.username],
            gameId,
            this.#io
        )

        return {
            success : true,
            gameId : gameId
        }

    }

    joinGame(user, gameId){
        if(user == undefined){
            return {
                success : false,
                message : "No user passed"
            };
        }

        if(!this.#playerDictionary[user.username]){
            return {
                success : false,
                message : "Player does not exist in database"
            }
        }

        if(!this.#gameDictionary[gameId]){
            return {
                success : false,
                message : "No game found"
            };
        }

        if(this.#gameDictionary[gameId].addPlayer(
            this.#playerDictionary[user.username]
        )){
            return {
                success : true
            }
        }
        else{
            return {
                success : false,
                message : this.#gameDictionary[gameId].getPlayerNum() < 2 ?
                "Game has Started" : " Room Full "
            }
        }
    }

    startGame(user, gameId){
        //still idk need user or not lul
        if(!this.#playerDictionary[user.username] ||  
            this.#playerDictionary[user.username].currentGameId != gameId){
                return {
                    success : false,
                    message: `Player ${user.username} is not in game!`
                }
            }

        if(this.#gameDictionary[gameId]){
            return {
                success : false,
                message : "No game found"
            }
        }

        if(this.#gameDictionary[gameId].startGame()){
            return {
                success : true
            };
        }
        else{
            return {
                success : false,
                message : "Game has already started"
            }
        }
    }

    randomGame(user){
        let gameId = -1;
        const gameIdKeys = Object.keys(this.#gameDictionary);

        for(let i = 0; i < gameIdKeys.length; i++){
            if(this.#gameDictionary[gameIdKeys[i]] && this.#gameDictionary[gameIdKeys[i]].getPlayerNum() < 2){
                gameId = gameIdKeys[i];
                break;
            }
        }
        
        if(gameId == -1){
            return {
                success : false,
                message : "No open rooms!"
            }
        }
        
        return this.joinGame(user, gameId);
    }

    deleteGame(gameId){
        if(!this.#gameDictionary[gameId]){
            console.log(`No game ${gameId} found to delete!`)
            return;
        }

        if(this.#gameDictionary[gameId].getPlayerNum() >= 1){
            console.log(`Game ${gameId} still has players!`)
            return;
        }

        this.#gameDictionary[gameId].destroyRoom();
        delete this.#gameDictionary[gameId];
    }

    leaveGame(user, gameId){
        if(user == undefined){
            return {
                success : false,
                message : "No user passed"
            };
        }

        if(!this.#playerDictionary[user.username]){
            return {
                success : false,
                message : "Player does not exist in database"
            }
        }

        if(!this.#gameDictionary[gameId]){
            return {
                success : false,
                message : "No game found"
            };
        }

        if(this.#gameDictionary[gameId].removePlayer(user.name)){
            this.deleteGame(gameId);
            return {
                success : true
            }
        }
        else {
            return {
                success : false,
                message : `Player ${user.name} does not exist in this game!`
            }
        }
    }


};

module.exports = GameManager;