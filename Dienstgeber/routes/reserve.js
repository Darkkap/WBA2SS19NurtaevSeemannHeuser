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


router.post('/', function (req, res, next) { //Hiermit wird eine neue Leere Reservierung angelegt
    res.status(200).write("Hier wird nur eine ID ausgegeben.");
    next();
    res.end();
});

router.get('/', function (req, res, next) {      //Ausgabe aller Reservierungen BZW. Abfragen-status
    console.log(req.query.state);
    /*
    Hier muss vor Ausgabe gefiltert werden, ob der Status mitangegeben wird.
     */
    if (req.query.state === "created") {
        res.status(200).write("Created Objekt ausgeben.");
    } else if (req.query.state === "processing") {
        res.status(200).write("In Bearbeitung Objekt ausgeben.");
    } else if (req.query.state === "failed") {
        res.status(200).write("Failed Objekt ausgeben.");
    } else if (req.query.state === "cancelled") {
        res.status(200).write("Cancel Objekt ausgeben.");
    } else if (req.query.state === "accepted") {
        res.status(200).write("Accepted Objekt ausgeben");
    } else if (req.query.state === undefined) {
        // DEFAULT ausgeben (alle Reservierungen)
        let reservierungobj = {};
        reservierungobj.reservierung = [];
        connection.query("Select * from reservierung", function (error, results, fields) {
            if (results.length === 0) {
                res.status(404).json({"reservierung": "Keine Datensätze vorhanden"});
            } else if (error) {
                res.status(500).json({"reservierung": "Error"});
            } else {
                for (let i = 0; i <= results.length - 1; i++) {
                    reservierungobj.reservierung.push(results[i]);
                }
                res.status(200).json(reservierungobj);
                console.log(reservierungobj);
            }
            next();
            res.end();
        });
    }
});

router.get('/cancellations', function (req, res, next) {      //Abruf Stornierter Reserveriungen
    let stornierungobj = {};
    stornierungobj.stornierung = [];
    connection.query("Select * from stornierung", function (error, results, fields) {
        if (results.length === 0) {
            res.status(404).json({"stornierung": "Keine Datensätze vorhanden"});
        } else if (error) {
            res.status(500).json({"stornierung": "Error"});
        } else {
            for (let i = 0; i <= results.length - 1; i++) {
                stornierungobj.stornierung.push(results[i]);
            }
            res.status(200).json(stornierungobj);
            console.log(stornierungobj);
        }
        next();
        res.end();
    })
});

router.post('/cancellations', function (req, res) {      //Erstellen einer Stornierung
    var stornierung = {};
    stornierung.resid = req.body.resid;
    connection.query("Insert into stornierung values ('','','')", function (error, results, fields) {
        if (error) {
            res.status(404).json({"stornierung": "Error. Fehler beim anlegen der Stornierung"});
            next();
            res.end();
        } else {
            connection.query("SELECT LAST_INSERT_ID()", function (error, results, fields) {
                console.log(results);
                stornierung.ID = results;
                res.status(200).json(stornierung);
                next();
                res.end();
            });
        }
    });
    res.status(200).json({"stornierung": "test"});
});

router.get('/cancellations:id', function (req, res, next) {      //Abruf der Stornierten Reserveriungen ID
    let id = req.params.id;
    res.status(200).write("Abruf Stornierte Reservierung ID: " + id);
    next();
    res.end();
});

router.put('/cancellations:id', function (req, res, next) {

});

//einfache Aufrufe auf /reserve/:id müssen zuletzt kommen, da sie sonst /cancellations blocken. Dies ist zu beheben, indem man /reserve/id:id als Url nimmt.

router.get('/id:id', function (req, res, next) {      //Abruf der Reservierung mit ID
    let id = req.params.id;
    id = id.replace(":", "");
    res.status(200).write("Reservierungsobjekt + ID: " + id);
    next();
    res.end();
});

router.delete('/id:id', function (req, res, next) {  //Löschen der Reservierung mit ID
    let id = req.params.id;
    id = id.replace(":", "");
    connection.query("delete from reservierung where reserveriungs_id ='" + id + "'", function (error, results, fields) {
        if (error) {
            res.status(500).write("Internal Error");
        } else {
            res.status(200).write("OK, ID: " + id + " gelöscht.");
        }
        next();
        res.end();
    });
});

router.put('/id:id', function (req, res, next) {  //Bearbeiten der Daten der Reservierung mit ID
    let id = req.params.id;
    id = id.replace(":", "");
    res.status(200).write("Daten der ID: " + id + " geändert.");
    next();
    res.end();
});


module.exports = router;
