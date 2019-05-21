let express = require('express');
let router = express.Router();

let mysql = require('mysql');
let connection = mysql.createConnection({
  host: 'exo.ovh',
  user: 'wbauser',
  password: 'wba_user',
  database: 'wba_data'
});
connection.connect();
//Hier muss noch MYSQL für die Abfragen etc rein. Danach kann man daraus ein JSON Objekt dazu bauen.


router.get('/', function(req, res, next) {  // Alle Suchanfragen
  res.status(200).write("Abruf aller Suchanfragen.");
  next();
  res.end();
});

router.post('/', function(req, res, next) {  // Neue Suchanfrage anlegen
  res.status(200).write("Neue Suchanfrage anlegen.");
  next();
  res.end();
});



router.get('/carparks', function(req, res, next) {      //Ausgabe der Suchanfragen/ Bearbeiten/ Fehlgeschlagene Anfragen etc....
  /*
     Hier muss vor Ausgabe gefiltert werden, ob der Status mitangegeben wird.
      */
  if(req.query.state === "created") {
    res.status(200).write("Created Objekt ausgeben.");
  } else if(req.query.state === "processing") {
    res.status(200).write("In Bearbeitung Objekt ausgeben.");
  } else if(req.query.state === "failed") {
    res.status(200).write("Failed Objekt ausgeben.");
  } else if(req.query.state === "cancelled") {
    res.status(200).write("Cancel Objekt ausgeben.");
  } else if(req.query.state === "accepted") {
    res.status(200).write("Accepted Objekt ausgeben");
  } else {
    // DEFAULT ausgeben (alle Reservierungen)
    res.status(404).write("Unbekannt");
  }
  next();
  res.end();
});

//einfache Aufrufe auf /search/:id müssen zuletzt kommen, da sie sonst /search/carparks?state blocken. Dies ist zu beheben, indem man /search/id:id als Url nimmt.

router.get('/id:id', function(req, res, next) {      //Abruf daten der Suche ID
  let id = req.params.id;
  res.status(200).write("Ausgabe der Daten bzgl. Suche ID: "+id);
  next();
  res.end();
});

router.put('/id:id', function(req, res, next) {      //Bearbeiten der Daten der Suche ID
  let id = req.params.id;
  res.status(200).write("Ausgabe bearbeitung okay ja/nein ");
  next();
  res.end();
});

module.exports = router;
