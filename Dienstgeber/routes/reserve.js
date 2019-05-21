let express = require('express');
let router = express.Router();
let mysql = require('mysql');
let connection = mysql.createConnection({
    host: 'exo.ovh',
    user: 'wbauser',
    password: 'wba-user',
    database: 'wba_data'
});
connection.connect();


router.post('/', function(req, res, next) { //Hiermit wird eine neue Leere Reservierung angelegt
    res.status(200).write("Hier wird nur eine ID ausgegeben.");
    next();
    res.end();
});

router.get('/', function(req, res, next) {      //Ausgabe aller Reservierungen BZW. Abfragen-status
    console.log(req.query.state);
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
    } else if(req.query.state === undefined){
        // DEFAULT ausgeben (alle Reservierungen)
        res.status(200).write("Hier wird theoretisch das Objekt aller Reservierungen ausgegeben.");
    }
    next();
    res.end();
});

router.get('/cancellations', function(req, res, next) {      //Abruf Stornierter Reserveriungen
    res.status(200).write("Abruf aller Stornierten Reservierungen ");
    next();
    res.end();
});

router.post('/cancellations', function(req, res, next) {      //Erstellen einer Stornierung
    res.status(200).write("Stornierung erstellt.");
    next();
    res.end();
});

router.get('/cancellations:id', function(req, res, next) {      //Abruf der Stornierten Reserveriungen ID
    let id = req.params.id;
    res.status(200).write("Abruf Stornierte Reservierung ID: "+id);
    next();
    res.end();
});

//einfache Aufrufe auf /reserve/:id müssen zuletzt kommen, da sie sonst /cancellations blocken. Dies ist zu beheben, indem man /reserve/id:id als Url nimmt.

router.get('/:id', function(req, res, next) {      //Abruf der Reservierung mit ID
    let id = req.params.id;
    res.status(200).write("Reservierungsobjekt + ID: "+id);
    next();
    res.end();
});

router.delete('/:id',function(req, res, next){  //Löschen der Reservierung mit ID
    let id = req.params.id;
    res.status(200).write("OK, ID: "+id+" gelöscht.");
    next();
    res.end();
});

router.put('/:id',function(req, res, next){  //Bearbeiten der Daten der Reservierung mit ID
    let id = req.params.id;
    res.status(200).write("Daten der ID: "+id+" geändert.");
    next();
    res.end();
});



module.exports = router;
