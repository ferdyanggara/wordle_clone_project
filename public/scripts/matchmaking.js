const GamePortal = (function() {
  // This function sends a register request to the server
  // * `username`  - The username for the sign-in
  // * `avatar`    - The avatar of the user
  // * `name`      - The name of the user
  // * `password`  - The password of the user
  // * `onSuccess` - This is a callback function to be called when the
  //                 request is successful in this form `onSuccess()`
  // * `onError`   - This is a callback function to be called when the
  //                 request fails in this form `onError(error)`
  const quickJoin = () => {
    console.log("quickjoin called")
    let tempGameId = null;
    fetch("/randomGame", {
        method : "GET",
        headers: {
            'Content-Type': 'application/json'
          }
        })
        .then( res => res.json())
        .then( value => {
            if(value.success){
                console.log("Game found with: ", value.gameId);
                tempGameId = value.gameId
                $("#matchmaking-message").text("join game with room id: ", tempGameId);
                MatchMaking.hide();
                Room.show();
            }
            else{
                $("#matchmaking-message").text("No random game found");
            }
        })
  }


  const createGame = () => {
    console.log("create game called")
    fetch("/createGame", {
        method : "POST",
        headers: {
            'Content-Type': 'application/json'
          },
        body :  JSON.stringify({})
        })
        .then( res => res.json())
        .then( value => {
            if(value.success){
                console.log("Game successfully created");
                console.log(value)
                $('#game').val(value.gameId);
                MatchMaking.hide();
                addUserToTable(Authentication.getUser().username, true)
                Room.show();
            }
            else{
                $("#matchmaking-message").text(value.message);
            }
        })
  }

  const joinGame = (gameId) => {
    console.log('join called')
    fetch("/joinGame", {
      method : "POST",
      headers: {
          'Content-Type': 'application/json'
        },
      body :  JSON.stringify({
          gameId : gameId
      })
      })
      .then( res => res.json())
      .then( value => {
        console.log(value);
          if(value.success){
              console.log(value)
              $('#game').val(gameId);
              $("#matchmaking-message").text("succesfully join");
              addUserToTable(value.message,false)
              console.log('hide matchmaking')
              MatchMaking.hide();
              Room.show();
          }
          else{
              $("#matchmaking-message").text(value.message);
          }
      })
  }


// TODO: STILL NOT SURE WHETHER WE ARE GOING TO MAKE MULTIPLE ROOM, SINCE 1 ROOM ALAS multiplayer will suffice. 
  const addUserToTable = (name, host) => {
      isHost = host ? "host" : "guest";
        markup = "<tr><td>" 
            + name + " (" + isHost +") </td><td><button id='leave-submit'>leave</button></td></tr>";
        tableBody = $("table tbody");
        tableBody.append(markup);
  }

  return { quickJoin, createGame, joinGame, addUserToTable};
})();
