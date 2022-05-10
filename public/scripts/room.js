const RoomPortal = (function() {

  const startRoom = () => {
      console.log("start submit")
      // only host can start the game
        fetch("/startGame", {
          method : "POST",
          headers: {
              'Content-Type': 'application/json'
            },
          body :  JSON.stringify({
              gameId : $('#game').val()
          })
          })
          .then(res => res.json())
          .then( value => {
            console.log(value)
              if(!value.success){
                console.log(value);
                $("#room-message").text(value.message)
              }
              // Room.hide(); 
              // $("#game-over").show();
          })

  }


  const leaveRoom = () => {
      console.log("leave request submitted")
      fetch("/leaveGame", {
      method : "POST",
      headers: {
          'Content-Type': 'application/json'
        },
      body :  JSON.stringify({
          gameId : $('#game').val()
      })
      })
      .then( res => res.json())
      .then( value => {
         // UPDATE UI - should not be required
        // let leavedUser = Authentication.getUser().username
        // specificUser = $(`#${leavedUser}`);
        // specificUser.remove()
        Socket.setGameId("");
        Room.hide();
        MatchMaking.show();
      })

   
  }


  return { startRoom,  leaveRoom };
})();
