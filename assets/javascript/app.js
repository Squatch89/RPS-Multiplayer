// Initialize Firebase
var config = {
    apiKey: "AIzaSyCBUmCDAvOqKxMe0Rbpu-5UZTrin1SGciU",
    authDomain: "multiplayer-rps-29165.firebaseapp.com",
    databaseURL: "https://multiplayer-rps-29165.firebaseio.com",
    projectId: "multiplayer-rps-29165",
    storageBucket: "",
    messagingSenderId: "667273371838"
};
firebase.initializeApp(config);

const database = firebase.database();
let player;



$("#start").on("click", function () {
    event.preventDefault();
    player = $("#playerName").val().trim();
    addPlayer();
    console.log(player);
    $("#playerName").val("");
});

//decide who is player1 or player2 by date added. earliest is player 1
database.ref("players").orderByChild("dateAdded").on("value", function (snapshot) {
    let sv = snapshot.val();
    console.log(sv);
    $("#playerOneName").text(sv.player1.name);
    $("#playerTwoName").text(sv.player2.name);
    
    // Wait until two players are logged in
    if ((snapshot.child("player1/name").exists()) && (snapshot.child("player2/name").exists())) {
        // Display rock paper sicscor choices
        $("#playerOneRPS").append("<p class = RPS> Rock</p>" + "<p class = RPS> Paper </p>" + "<p class = RPS> Scissors</p>");
        $("#playerTwoRPS").append("<p class = RPS> Rock</p>" + "<p class = RPS> Paper </p>" + "<p class = RPS> Scissors</p>");
    }
});

// Have user select choice
$(document).find("#playerOne").on("click", ".RPS", function(){
  let player1Choice = $(this).text();
  console.log(`player1 choice ${player1Choice}`);
});

$(document).find("#playerTwo").on("click", ".RPS", function(){
    let player2Choice = $(this).text();
    console.log(`player2 choice ${player2Choice}`);
});


function addPlayer() {
    const playersRef = database.ref("players");
    playersRef.once("value").then(function (snapshot) {
        console.log(snapshot.numChildren());
        if (snapshot.numChildren() === 0) {
            database.ref("/players/player1").set({
                name: player,
                dateAdded: firebase.database.ServerValue.TIMESTAMP
            });
            console.log(snapshot.numChildren());
        }
        else if (snapshot.numChildren() === 1) {
            database.ref("/players/player2").set({
                name: player,
                dateAdded: firebase.database.ServerValue.TIMESTAMP
            });
            console.log(snapshot.numChildren());
        }
    })
}


$("#chatSend").on("click", function() {
    event.preventDefault();
   let chatMessage = $("#chat").val();
   $("#chatBox").append(`<p> ${chatMessage} </p>`);
   $("#chat").val("");
});

// Check for connected players


// Do not let other player see the choice
// Store user choice in firebase
// Check firebase for user choices
// Display each players choice in the arena div
// Determine winner/loser/tie
// Reset box for new inputs
// Let player be able to log out