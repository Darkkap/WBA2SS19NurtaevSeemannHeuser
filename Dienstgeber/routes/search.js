let express = require('express');
let router = express.Router();
let request = require('request');
let mysql = require('mysql');
let connection = mysql.createConnection({
  host: 'exo.ovh',
  user: 'wbauser',
  password: 'wba-user',
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
  id = id.replace(":","");
  let sucheobj = {};
  connection.query("Select * from suche where suche_id='"+id+"'" , function (error, results, fields) {
    if(results.length < 1) {
      res.status(404).json({"Suche":"Error. Keine Details gefunden"});
      next();
      res.end();
    } else {
      sucheobj.suche = results;
      res.status(200).json(sucheobj);
      next();
      res.end();
    }
  });

});

router.put('/id:id', function(req, res, next) {      //Bearbeiten der Daten der Suche ID
  let id = req.params.id;

  let position=req.body.gps;
  console.log(parseInt(position));
  if (position === undefined) {
    res.status(404).json({"parkhaus":"Invalid Dataset"});
    next();
    res.end();
  } else if(isNaN(parseInt(position))) {
    res.status(500).write("Data Error");
    next();
    res.end();
  }
  else {
    request_winkel(position,function (data) {
      //console.log(data);
      console.log(parseInt(data));
      if(isNaN(data)) {
        res.status(500).write("Data Error");
      } else {
        res.status(200).write("Data OK");
      }
      //res.status(200).write(""+data);
      next();
      res.end();
    });
  }
});


//http://boulter.com/gps/distance/?from=50.7319997%2C7.0956021%2C17.25z&to=50.7322552%2C7.0853128%2C16.25z&units=k
//RESTAURANT BEI 50.735674,7.097160

function request_winkel(position,callback) {
  request('http://boulter.com/gps/distance/?from=50.735674,7.097160,17.25z&to='+position+'&units=k', function (error, response, body) {
    let helper = body;
    helper = helper.split("\n");
    //let pure_distance = 0;
    let ausrichtung = 0;
    for (let i = 0; i < helper.length; i++) {
      if (helper[i].includes("kilometers") === true) {

        let reverse_helper = helper[i];
        reverse_helper = reverse_helper.split(">");
        reverse_helper = reverse_helper[8].split(" ");
        //pure_distance = reverse_helper[0];
        ausrichtung = reverse_helper[3];
        ausrichtung = ausrichtung.replace("(", ' ');
        ausrichtung = ausrichtung.replace("%", ' ');
        ausrichtung = ausrichtung.replace("&", " ");
        ausrichtung = ausrichtung.replace("d", " ");
        ausrichtung = ausrichtung.replace("e", " ");
        ausrichtung = ausrichtung.replace("g", " ");
        ausrichtung = ausrichtung.replace("g", " ");
        ausrichtung = ausrichtung.replace(";", " ");
        ausrichtung = ausrichtung.replace(")", " ");
        i = helper.length; // Stop the Loop.
      }
    }
    callback(ausrichtung);
  });
}





module.exports = router;
