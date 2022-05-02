

const RoomPortal = (function() {

  const startRoom = () => {
    $('#start-submit').click( (e) => {
      e.preventDefault();
      console.log("start submit")
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
          console.log(value);
      })
    })
  }


  const leaveRoom = () => {
    $('#leave-submit').click( (e) => {
      e.preventDefault();
      console.log("game submit")
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
          console.log(value);
      })
    })
  }


  return { startRoom,  leaveRoom };
})();
