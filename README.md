# Wordle clone 


## project structure:
### public (scripts)
- contain logic of the game(logic.js)
- registration authentication from lab 
- words.js (contain list of words)
- socket.js (websocket from lab)

### public (root)
- index (main ui)
- style (style for boxes and virtual keyboard)

### node server 
- (server.js) -> main backend logic


## Gameplay side

### Prototype UI
##### Input
- Login name : name to login 
- Game ID : game Id specified
- Submit word game test : Assuming you start a game, this input the word to send using socket.emit('word-result')
##### Button
- Submit Name -> login with the specified name (simulate session)
- Submit game -> create game with specified id (can override so be careful)
- start game -> start game with specified id
- join game -> join game with specified id
- Words -> send the word to the game
- Full setup - Steven gameId - 1 -> Shortcut to login as Steven and create game with gameId 1
### API
- POST /addData -> simulate user login ( Add Session to server )
Body : `{name : <name>}`

- POST /createGame -> Create a game (Currently use own ID for easier debugging)
Body : `{gameId : <game ID>}`

- POST /joinGame -> Join a game (Currently use own ID for easier debugging)
Body : `{gameId : <gameID>}`

- POST /startGame -> Start a game with Game ID
Body : `{gameId : <gameID>}`

### Sockets (Frontend side)

Currently, socket is still under heavy development since I don't know if we will need more sockets

- 'word-result' 
Returns a JSON with the gameID, player name, and the result of each word given.
```
{
    gameId : <game id being played>,
    player : <player name>,
    result : bool //determine if the word sent is legal or not.
    data : {
        correct : bool,
        data : [
        letter : char,
        position : int (index),
        status : string
        ]
    }
}
```
For result, False indicate that the word does not exist on the dictionary.
For data.correct, it determines if the sent word equal the hidden word.
for data.data[i].status, found means the character exist in the word, but not the right position, wrong means word does not exist in the word and correct means that the character is on the right position

- 'update'
Return a json on the current gamestate on player
```
{
    gameId : <game id>
    update : [{
        player : <player name>,
        currentWord : string,
        score : int
    }]
}
```

- 'over'
Return a json to indicate game is over
```
{
    gameId : <game id>
    result : [{
        player : <player name>,
        currentWord : string,
        score : int
    }]
}
```

- 'room'
Return an json update on the room
```
{
    gameId : <game id>,
    players : [<player name>]
}
```
## REQUIRE
- UI function for sending the word typed on the screen that accepts callback for socket.emit
- Require a room UI

##TODO - Gameplay
- Create a static GameManager to handle all the games
- Create a static PlayerManager to handle all the players
-  Manage disconnect event