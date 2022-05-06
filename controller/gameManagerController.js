const GameManager = require("../backend-class/gameManagerClass");

let gameManager = null; 
// CAREFUL - NEED PROPER IMPORT PROCEDURE
// ILL ADD CHECKING IN THE FUTURE JUST IN CASE
// I HAVE NO CLUE ON IMPROVING THIS CONTROLLER SETUP
// DUE TO THE IO DEPENDENCY

// I have no clue how MVC principle in express
// So this is what google showed me

const instantiate = () => {
    if(gameManager == null){
        gameManager = GameManager.getInstance(); 
    }
}

const createGameFunction = (req, res) => {
    instantiate();
console.log("creating game")
    const result = gameManager.createGame(req.session.user);
console.log(result)
    res.json(result);

}

const joinGameFunction = (req, res) => {
    instantiate();

    const result = gameManager.joinGame(req.session.user, req.body.gameId);

    res.json(result);

}

const startGameFunction = (req, res) => {
    instantiate();
    console.log("game starting?")

    const result = gameManager.startGame(req.session.user, req.body.gameId);
    console.log(result)
    res.json(result);

}

const randomGameFunction = (req, res) => {
    instantiate();

    const result = gameManager.randomGame(req.session.user);

    res.json(result);

}

const leaveGameFunction = (req, res) => {
    instantiate();

    const result = gameManager.leaveGame(req.session.user, req.body.gameId);

    res.json(result);

}

module.exports = {
    createGameFunction,
    joinGameFunction,
    startGameFunction,
    randomGameFunction,
    leaveGameFunction
}