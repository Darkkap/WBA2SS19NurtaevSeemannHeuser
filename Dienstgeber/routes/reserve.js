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
    let postobject = {};
    postobject.req = req.body;
    /*

      {
        "anzahl_personen": 2,
        "datum": "22.05.2019",
        "uhrzeit": "18.15"
    }

    **/
    let anzahl = 0;
    let datum = 0;
    let uhrzeit = 0;
    if(req.body.anzahl_personen === undefined) {
        anzahl =0;
    } else {
        anzahl =req.body.anzahl_personen;
    }

    if(req.body.datum === undefined) {
        datum = "02.07.2019"
    } else {
        datum = req.body.datum;
    }

    if(req.body.uhrzeit === undefined) {
        uhrzeit = 0;
    } else {
        uhrzeit = req.body.uhrzeit;
    }


    connection.query("Insert into reservierung values ('','"+anzahl+"','"+datum+"','"+uhrzeit+"','0')", function (error, results, fields) {
        if (error) {
            res.status(404).json({"Reservierung": "Error. Fehler beim anlegen der Reservierung"});
            next();
            res.end();
        } else {
            connection.query("SELECT LAST_INSERT_ID() as id", function (error, results, fields) {
                let lastid= results[0].id;
                console.log(lastid);
                connection.query("SELECT * from reservierung where reservierungs_id ='"+lastid+"' ", function (error, resultee, fields) {
                    console.log(error);
                    res.status(200).json(resultee);
                    next();
                    res.end();
                });

            });
        }
    });
});

router.get('/', function (req, res, next) {      //Ausgabe aller Reservierungen BZW. Abfragen-status
    /*
    Hier muss vor Ausgabe gefiltert werden, ob der Status mitangegeben wird.
     */
    let sql_query = "";
    if (req.query.state === "created") {
        sql_query = "Select * from reservierung where state='0'";
    } else if (req.query.state === "processing") {
        sql_query = "Select * from reservierung where state='1'";
    } else if (req.query.state === "failed") {
        sql_query = "Select * from reservierung where state='2'";
    } else if (req.query.state === "cancelled") {
        sql_query = "Select * from reservierung where state='3'";
    } else if (req.query.state === "accepted") {
        sql_query = "Select * from reservierung where state='4'";
    } else if (req.query.state === undefined) {
        sql_query = "Select * from reservierung";
        // DEFAULT ausgeben (alle Reservierungen)
    }
    let reservierungobj = {};
    reservierungobj.reservierung = [];
    connection.query(sql_query, function (error, results, fields) {
        if (results.length === 0) {
            res.status(200).json({"reservierung": "Keine Datensätze vorhanden"});
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
    });
});

router.post('/cancellations', function (req, res, next) {      //Erstellen einer Stornierung
    var stornierung = {};
    connection.query("Insert into stornierung values ('','','')", function (error, results, fields) {
        if (error) {
            res.status(404).json({"stornierung": "Error. Fehler beim anlegen der Stornierung"});
            next();
            res.end();
        } else {
            connection.query("SELECT LAST_INSERT_ID() as id", function (error, results, fields) {
                res.status(200).json(results);
                next();
                res.end();
            });
        }
    });
});

router.get('/cancellations:id', function (req, res, next) {      //Abruf der Stornierten Reserveriungen ID
    let id = req.params.id;
    id = id.replace(":", "");
    let sucheobj = {};
    connection.query("Select * from stornierung where cancel_id='" + id + "'", function (error, results, fields) {
        if (results.length < 1) {
            res.status(404).json({"Stornierungs_suche": "Error. Keine Details gefunden"});
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

router.put('/cancellations:id', function (req, res, next) {

        /*

          {
            "reservierungs_id": 3,
            "status": 1
        }

        **/
        let id = req.params.id;
        id = id.replace(":", "");
        let reservierungs_id = req.body.reservierungs_id;
        let status =req.body.status;
        let add_obj= {};
        add_obj.sqlstring=[];
        let sqlstring1="";
        let sqlstring2="";
        add_obj.sqlstring[0]=false;
        add_obj.sqlstring[1]=false;
        if(status !== undefined) {
            sqlstring1= "status='"+status+"'";
            add_obj.sqlstring[0] =true;
        }
        if(reservierungs_id !== undefined) {
            sqlstring2="reservierungsid='"+reservierungs_id+"'";
            add_obj.sqlstring[1] =true;
        }

        if(add_obj.sqlstring[0]=== false && add_obj.sqlstring[1] === false) { //ALLES false
            console.log("TEST");
            datadone(0,res);
        } else if(add_obj.sqlstring[0]=== true && add_obj.sqlstring[1] === false ) {// Nur status ändern
            connection.query("update stornierung set "+sqlstring1+"  where cancel_id='" + id + "'", function (error, results, fields) {
                if (error) {
                    console.log(error);
                    datadone(0,res);
                } else {
                    datadone(1,res);
                }
            });
        } else if(add_obj.sqlstring[0]=== false && add_obj.sqlstring[1] === true ) {// Nur reservierungs_id ändern
            connection.query("update stornierung set "+sqlstring2+"  where cancel_id='" + id + "'", function (error, results, fields) {
                if (error) {
                    console.log(error);
                    datadone(0,res);
                } else {
                    datadone(1,res);
                }
            });
        } else if(add_obj.sqlstring[0]=== true && add_obj.sqlstring[1] === true ) {// Beides ändern
            connection.query("update stornierung set "+sqlstring1+", "+sqlstring2+"  where cancel_id='" + id + "'", function (error, results, fields) {
                if (error) {
                    console.log(error);
                    datadone(0,res);
                } else {
                    datadone(1,res);
                }
            });
        }
});


//einfache Aufrufe auf /reserve/:id müssen zuletzt kommen, da sie sonst /cancellations blocken. Dies ist zu beheben, indem man /reserve/id:id als Url nimmt.

router.get('/id:id', function (req, res, next) {      //Abruf der Reservierung mit ID
    let id = req.params.id;
    id = id.replace(":", "");
    let sucheobj = {};
    connection.query("Select * from reservierung where reservierungs_id='" + id + "'", function (error, results, fields) {
        if (results.length < 1) {
            res.status(404).json({"Reservierung_Suche": "Error. Keine Details gefunden"});
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
    /*

          {
            "anzahl_personen": 2,
            "datum": "22.05.2019",
            "uhrzeit": "18.15"
        }

        **/
    let id = req.params.id;
    id = id.replace(":", "");
    let anzahl = req.body.anzahl_personen;
    let datum = req.body.datum;
    let uhrzeit = req.body.uhrzeit;
    let add_obj= {};
    add_obj.sqlstring= [];
    let sqlstring1="";
    let sqlstring2="";
    let sqlstring3="";
    add_obj.sqlstring[0]=false;
    add_obj.sqlstring[1]=false;
    add_obj.sqlstring[2]=false;
    if(anzahl !== undefined) {
        sqlstring1= "anzahl_personen='"+anzahl+"'";
        add_obj.sqlstring[0] =true;
    }
    if(datum !== undefined) {
        sqlstring2="datum='"+datum+"'";
        add_obj.sqlstring[1] =true;
    }
    if(uhrzeit !== undefined) {
        sqlstring3="uhrzeit='"+uhrzeit+"'";
        add_obj.sqlstring[2] =true;
    }

    console.log("test");
    if(add_obj.sqlstring[0]=== false && add_obj.sqlstring[1] === false && add_obj.sqlstring[2] === false) { //ALLES false
        console.log("tesssst");
        datadone(0,res);
    } else if(add_obj.sqlstring[0]=== true && add_obj.sqlstring[1] === false && add_obj.sqlstring[2] === false) {// Nur anzahl ändenr
        connection.query("update reservierung set "+sqlstring1+"  where reservierungs_id='" + id + "'", function (error, results, fields) {
            if (error) {
                datadone(0,res);
                console.log(error);
            } else {
                datadone(1,res);
            }
        });
    } else if(add_obj.sqlstring[0]=== true && add_obj.sqlstring[1] === true && add_obj.sqlstring[2] === false) {    //anzahl & datum ändern
        connection.query("update reservierung set "+sqlstring1+","+sqlstring2+"  where reservierungs_id='" + id + "'", function (error, results, fields) {
            if (error) {
                datadone(0,res);
                console.log(error);
            } else {
                datadone(1,res);
            }
        });

    } else if(add_obj.sqlstring[0]=== true && add_obj.sqlstring[1] === true && add_obj.sqlstring[2] === true) { // alles ändern
        connection.query("update reservierung set "+sqlstring1+","+sqlstring2+","+sqlstring3+"  where reservierungs_id='" + id + "'", function (error, results, fields) {
            if (error) {
                datadone(0,res);
                console.log(error);
            } else {
                datadone(1,res);
            }
        });

    } else if(add_obj.sqlstring[0]=== false && add_obj.sqlstring[1] === true && add_obj.sqlstring[2] === false) {  //datum ändern
        connection.query("update reservierung set "+sqlstring2+"  where reservierungs_id='" + id + "'", function (error, results, fields) {
            if (error) {
                datadone(0,res);
                console.log(error);
            } else {
                datadone(1,res);
            }
        });

    } else if(add_obj.sqlstring[0]=== false && add_obj.sqlstring[1] === true && add_obj.sqlstring[2] === true) {    //datum und uhrzeit ändern
        connection.query("update reservierung set "+sqlstring2+","+sqlstring3+"  where reservierungs_id='" + id + "'", function (error, results, fields) {
            if (error) {
                datadone(0,res);
                console.log(error);
            } else {
                datadone(1,res);
            }
        });

    } else if(add_obj.sqlstring[0]=== false && add_obj.sqlstring[1] === false && add_obj.sqlstring[2] === true) {   //uhrzeit ändern
        connection.query("update reservierung set "+sqlstring3+"  where reservierungs_id='" + id + "'", function (error, results, fields) {
            if (error) {
                console.log(error);
                datadone(0,res);
            } else {
                datadone(1,res);
            }
        });

    } else if(dd_obj.sqlstring[0]=== true && add_obj.sqlstring[1] === false && add_obj.sqlstring[2] === true) { //anzahl & uhrzeit ändern
        connection.query("update reservierung set "+sqlstring1+","+sqlstring3+"  where reservierungs_id='" + id + "'", function (error, results, fields) {
            if (error) {
                console.log(error);
                datadone(0,res);
            } else {
                datadone(1,res);
            }
        });
    }

});


function datadone(done_obj,res) {
    if (done_obj===0) {
        res.status(500).write("Error on Changing Data/ NO Data given");
        res.end();
    } else {
        res.status(200).write("Data has been changed");
        res.end();
    }

}

module.exports = router;
