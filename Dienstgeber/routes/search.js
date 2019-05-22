let express = require('express');
let router = express.Router();
let request = require('request');
let date = require('date-and-time');
let weekNumber = require("weeknumber/lib/index.js").weekNumber;
let mysql = require('mysql');
let connection = mysql.createConnection({
    host: 'exo.ovh',
    user: 'wbauser',
    password: 'wba-user',
    database: 'wba_data'
});
connection.connect();
//Hier muss noch MYSQL für die Abfragen etc rein. Danach kann man daraus ein JSON Objekt dazu bauen.


router.get('/', function (req, res, next) {  // Alle Suchanfragen
    let sucheobj = {};
    connection.query("Select * from suche", function (error, results, fields) {
        sucheobj.parkhaus = [];
        for (let i = 0; i <= results.length - 1; i++) {
            sucheobj.parkhaus.push(results[i]);
        }
        if (error) {
            res.status(500).json({"Suche": "Error"});
        } else {
            res.status(200).json(sucheobj);
            console.log(sucheobj);
        }

        next();
        res.end();
    });
});

router.post('/', function (req, res, next) {  // Neue Suchanfrage anlegen
    let insertobj = {};
    connection.query("Insert into  suche values ('','','','','','')", function (error, results, fields) {
        if (error) {
            res.status(404).json({"Suche": "Error. Fehler beim anlegen gefunden"});
            next();
            res.end();
        } else {
            connection.query("SELECT LAST_INSERT_ID()", function (error, results, fields) {
                console.log(results);
                insertobj.ID = results;
                res.status(200).json(insertobj);
                next();
                res.end();
            });
        }
    });


});


router.get('/carparks', function (req, res, next) {      //Ausgabe der Suchanfragen/ Bearbeiten/ Fehlgeschlagene Anfragen etc....
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
    } else {
        // DEFAULT ausgeben (alle Reservierungen)
        res.status(404).write("Unbekannt");
    }
    next();
    res.end();
});

//einfache Aufrufe auf /search/:id müssen zuletzt kommen, da sie sonst /search/carparks?state blocken. Dies ist zu beheben, indem man /search/id:id als Url nimmt.

router.get('/id:id', function (req, res, next) {      //Abruf daten der Suche ID
    let id = req.params.id;
    id = id.replace(":", "");
    let sucheobj = {};
    connection.query("Select * from suche where suche_id='" + id + "'", function (error, results, fields) {
        if (results.length < 1) {
            res.status(404).json({"Suche": "Error. Keine Details gefunden"});
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

router.put('/id:id', function (req, res, next) {      //Bearbeiten der Daten der Suche ID
    /*

          {
              "suche_id": 1,
              "reservierungsid": 1,
              "datum": "22.05.19",
              "uhrzeit": "18.15",
              "gps": "50.7511915,7.1013477,12.75",
              "advice": 1
          }

    **/
    let id = req.params.id;
    id = id.replace(":", "");
    let position = req.body.gps;
    let datum = req.body.datum;
    let uhrzeit = req.body.uhrzeit;
    let reservierungsid = req.body.reservierungsid;

    if (position === undefined) {
        res.status(404).json({"parkhaus": "Invalid Dataset"});
        next();
        res.end();
    } else if (isNaN(parseInt(position))) {
        res.status(500).write("Data Error");
        next();
        res.end();
    } else {
        request_winkel(position, function (data) {
            if (isNaN(data)) {
                res.status(500).write("Data Error");
                next();
                res.end();
            } else {
                connection.query("update suche set reservierungsid= '" + reservierungsid + "', datum= '" + datum + "', uhrzeit='" + uhrzeit + "', gps_coordinate='" + data + "' where suche_id='" + id + "'", function (error, results, fields) {
                    if (error) {
                        res.status(500).write("Error on Changing Data.");
                    } else {
                        doAdvice(data, id, function () {
                            res.status(200).write("Changed Data.");
                        });
                    }
                });
            }

        });
    }
});


//http://boulter.com/gps/distance/?from=50.7319997%2C7.0956021%2C17.25z&to=50.7322552%2C7.0853128%2C16.25z&units=k
//RESTAURANT BEI 50.735674,7.097160

function request_winkel(position, callback) {
    request('http://boulter.com/gps/distance/?from=50.735674%2C7.097160&to=' + position + '&units=k', function (error, response, body) {
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

function doAdvice(data, id, callback) {
    let advice_data;
    let parkhaus_data = {};
    parkhaus_data.parkhaus = [];
    connection.query("Select * from suche where suche_id='" + id + "'", function (error, results, fields) {
        advice_data = results;
        connection.query("Select * from parkhaus_info", function (error, results, fields) {
            for (let x = 0; x <= results.length - 1; x++) {
                parkhaus_data.parkhaus.push(results[x]);
            }
            let helper_array = [];
            let user_winkel = data;
            for (let i = 0; i <= parkhaus_data.parkhaus.length - 1; i++) {
                parkhaus_data.parkhaus[i].winkel -= user_winkel;
                if (parkhaus_data.parkhaus[i].winkel < 0) parkhaus_data.parkhaus[i].winkel * -1; //Wenn negativ +360
                helper_array.push({
                    "winkel": parkhaus_data.parkhaus[i].winkel,
                    "parkhaus_id": parkhaus_data.parkhaus[i].parkhaus_id
                });
            }
            helper_array.sort(function (a, b) {
                let keyA = a.winkel,
                    keyB = b.winkel;
                // Compare the 2 dates
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
            });
            let mathobject = {};
            mathobject.amount = [];
            mathobject.total = [];
            mathobject.max = [];
            let helper = advice_data[0].datum;
            helper = helper.split(".");
            helper = helper[2] + "-" + helper[1] + "-" + helper[0];
            let uhrzeithelper = advice_data[0].uhrzeit;
            uhrzeithelper = uhrzeithelper.split(".");
            let d = new Date("" + helper); // new Date
            let week = weekNumber(d);
            let n = d.getDay(); // Tag
            let h = uhrzeithelper[0];  // Stunde
            let m = uhrzeithelper[1]; // Minute
            for (let y = 0; y <= helper_array.length - 1; y++) {
                mathobject.amount[y] = 0;
                mathobject.max[y] = 0;
                mathobject.total[y] = 0;
                mathobject.specsearch_free= [];
                mathobject.specsearch_parkhaus= [];
                connection.query("select * from parkhaus_data where tag='" + n + "' and hour='" + h + "' and lfdnr='" + helper_array[y].parkhaus_id + "' and (weeknumber='" + (week-3) + "' or weeknumber ='" + (week - 1) + "' or weeknumber='" + (week - 2) + "') order by id desc", function (error, resulte, fields) {
                    mathobject.max[y] = resulte[0].gesamt;
                    for (let ic = 0; ic <= resulte.length - 1; ic++) {
                        mathobject.amount[y] += parseInt(resulte[ic].frei);
                        mathobject.total[y] += 1;
                    }
                    if (y === helper_array.length - 1) {
                        for (let iy = 0; iy <= mathobject.amount.length - 1; iy++) {
                            console.log("Parkhaus ID " + helper_array[iy].parkhaus_id + " totalfreespaces counted " + mathobject.amount[iy]);
                            console.log("Parkhaus ID " + helper_array[iy].parkhaus_id + " counter_var " + mathobject.total[iy]);
                            console.log("Parkhaus ID " + helper_array[iy].parkhaus_id + " Average Free " + mathobject.amount[iy] / mathobject.total[iy]);
                            console.log("Parkhaus ID " + helper_array[iy].parkhaus_id + " max_possible " + mathobject.max[iy]);
                            m=new Date().getMinutes();
                            h=new Date().getHours();
                                connection.query("select * from parkhaus_data where tag='" + n + "' and hour='" + h + "' and min='"+m+"' and lfdnr='" + helper_array[iy].parkhaus_id + "' and (weeknumber='" + (week-3) + "' or weeknumber ='" + (week - 1) + "' or weeknumber='" + (week - 2) + "') order by id desc", function (error, result, fields) {
                                    console.log("select * from parkhaus_data where tag='" + n + "' and hour='" + h + "' and min='"+m+"' and lfdnr='" + helper_array[iy].parkhaus_id + "' and (weeknumber='" + (week-3) + "' or weeknumber ='" + (week - 1) + "' or weeknumber='" + (week - 2) + "') order by id desc")
                                    mathobject.specsearch_free[y] = 0;
                                    mathobject.specsearch_parkhaus[y] = 0;
                                    /* NEEDS FIX HERE
                                    *
                                    * */

                                    let free = 0;
                                    for (let ix = 0; ix <= result.length - 1; ix++) {
                                        free += result[ix];
                                    }
                                    mathobject.specsearch_free[iy] = free/result.length;
                                    mathobject.specsearch_parkhaus[iy] = helper_array[iy].parkhaus_id;
                                    if(iy === helper_array.length - 1) {
                                        for(let ixy=0; ixy <= mathobject.specsearch_parkhaus.length-1;ixy++) {
                                            console.log("Spec Search: ID "+mathobject.specsearch_parkhaus[ixy]);
                                            console.log("Spec Search: Frei "+mathobject.specsearch_free[ixy]);
                                        }
                                    }

                                });


                        }
                    }
                });
            }

        });
    });

    callback(1);
}

module.exports = router;
