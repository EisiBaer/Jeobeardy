let games = [{
  id: "123456",
  hostId: 1,
  players: [],
}];

exports.listGames = (req, res) => {
  return games;
};

exports.findGameWithid = ( id ) => {
  return new Promise( (resolve, reject) =>{
    let game = games.find( x => x.id === id );
    if( game !== undefined ){
        resolve( game );
    }else{
        reject( "Not Found " );
    }
  });
};

exports.addGame = ( hostId ) => {
  return new Promise( ( resolve, reject ) => {
    let id = getIdForNewGame();
    if( id === false ){
      reject( "Too many games are being currently played. Try again later" );
    }
    let newGame = {
      id: id,
      host: hostId,
      board: null,
      players: [],
    };
    games.push( newGame );
    resolve(newGame);
});

function getIdForNewGame(){
  let newid;
  if( games.length <= 10000 ){
    newid = Math.floor(Math.random() * 1000000);
    while( games.findIndex( game => game.id !== newid ) ){
      newid = Math.floor(Math.random() * 1000000);
    }
  } else {
    if( games.length >= 899999 ){
      return false;
    } else {
      games.sort( (a, b) => a.id - b.id );
      newid = games[games.length-1].id + 1;
      if( newid >= 1000000 ){
        newid = 100000
      }
    }
  }
  return newid;
}
};
