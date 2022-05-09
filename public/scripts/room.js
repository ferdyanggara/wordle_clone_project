const RoomPortal = (function() {

  const startRoom = () => {
      console.log("start submit")



      // only host can start the game
      if (host == Authentication.getUser().username){
        fetch("/startGame", {
          method : "POST",
          headers: {
              'Content-Type': 'application/json'
            },
          body :  JSON.stringify({
              gameId : $('#game').val()
          })
          })
          .then( value => {
              console.log(value.message)
              Room.hide(); 
          })
      } else {
        console.log('only host can start the game')
      }
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
         // UPDATE UI
        let leavedUser = Authentication.getUser().username
        specificUser = $(`#${leavedUser}`);
        specificUser.remove()
      })

   
  }


  return { startRoom,  leaveRoom };
})();
