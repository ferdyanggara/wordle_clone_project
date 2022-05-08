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
- Game ID : game Id specified
##### Button
- start game -> start game with specified id
- leave game -> leave game with specified id
- Words -> send the word to the game
### API
- POST /createGame -> Create a game (Currently use own ID for easier debugging)
Body : `{}` . Not required, will use session user to create the game.

- POST /joinGame -> Join a game (Currently use own ID for easier debugging)
Body : `{gameId : <gameID>}`. Will use session user to join the game

- POST /startGame -> Start a game with Game ID
Body : `{gameId : <gameID>}`. Anyone can start the game currently ( Do I need to make a host identifier? )

- POST /leaveGame -> leave a game with Game ID
Body : `{gameId : <gameID>}`.

- GET /randomGame -> return one available Game ID to enter

##### Return Message for API
- If successful : `{success : true}`
- If fail : `{success : false, message : <error message>}`

### Sockets (Frontend side)

Currently, socket is still under heavy development since I don't know if we will need more sockets.
This is the list of socket.on() need to be handled on the UI

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
            status : string <"found", "wrong", "correct">
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

- 'start-game'
Return which game starts
```
{
    gameId : <game id>
}
```

- 'leave-game'
Return which player leave game (For debugging purposes)
```
`Player ${name} disconnected`
```

### Socket (Backend side)

This is the list of socket.on() on the server side

- 'word-sent'
This is the socket on backend listening for the word sent from the game to check validity of the word sent
```
<word sent> - the word to check on the game
```
This socket only works when the game start. Once over, the socket event will be removed


## REQUIRE
- Require Gameplay UI