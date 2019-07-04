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

    /*

         {
             "suche_id": 1,
             "reservierungsid": 1,
             "datum": "22.05.2019",
             "uhrzeit": "18.15",
             "gps": "50.7511915,7.1013477,12.75",
             "advice": 1
         }
   **/

    let position = 0;
    if(req.body.gps !== undefined){
        position = req.body.gps;
    }
    let datum = 0;
    if(req.body.datum !== undefined) {
        datum = req.body.datum;
    }
    let uhrzeit = 0;
    if(req.body.uhrzeit !== undefined){
        uhrzeit = req.body.uhrzeit;
    }
    let reservierungsid = 0;
    if(req.body.reservierungsid !== undefined) {
        reservierungsid = req.body.reserverierungsid;
    }
    if (position === 0) {
        connection.query("Insert into  suche values ('','"+reservierungsid+"','"+datum+"','"+uhrzeit+"','"+position+"','')", function (error, results, fields) {
            if (error) {
                res.status(404).json({"Suche": "Error. Fehler beim anlegen gefunden"});
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
    } else {

        connection.query("Insert into  suche values ('','"+reservierungsid+"','"+datum+"','"+uhrzeit+"','"+position+"','')", function (error, results, fields) {
            if (error) {
            } else {
                connection.query("SELECT LAST_INSERT_ID() as id", function (error, results, fields) {
                    let id=results[0].id;
                    request_winkel(position, function (data) {
                        if (isNaN(data)) {
                            res.status(500).write("Data Error");
                            next();
                            res.end();
                        } else {
                            doAdvice(data, id, function (advice,mathobject) {
                                connection.query("update suche set advice='"+advice+"' where suche_id='"+id+"'", function (error, results, fields) {});
                                res.status(200).json({"id":id,"advice":advice});
                                next();
                                res.end();
                            });
                        }
                    });
                });
            }
        });

    }



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
              "datum": "22.05.2019",
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
                        doAdvice(data, id, function (advice,mathobject) {
                            connection.query("update suche set advice='"+advice+"' where suche_id='"+id+"'", function (error, results, fields) {});
                            res.status(200).write("Changed Data.");
                            next();
                            res.end();
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
                ausrichtung = ausrichtung.replace("z", " ");
                ausrichtung = ausrichtung.replace("g", " ");
                ausrichtung = ausrichtung.replace(";", " ");
                ausrichtung = ausrichtung.replace(")", " ");
                i = helper.length; // Stop the Loop.
            }
        }
        callback(ausrichtung);
    });
}

function doAdvice(data, id, callback) {     //Advice Funktion
    let advice_data;
    let calculation_data = {};                 // Definierung von Daten
    calculation_data.parkhaus = [];
    connection.query("Select * from suche where suche_id='" + id + "'", function (error, results, fields) { //Aufruf der Informationen bzgl. der Suche
        advice_data = results;
        connection.query("Select * from parkhaus_info where winkel > 1 ", function (error, results, fields) {                 //Informationen bzgl. Parkhäuser lesen
            for (let x = 0; x <= results.length - 1; x++) {
                calculation_data.parkhaus.push(results[x]);
            }
            let helper_array = [];
            let user_winkel = data;
            for (let i = 0; i <= calculation_data.parkhaus.length - 1; i++) {
                calculation_data.parkhaus[i].winkel -= user_winkel;
                if (calculation_data.parkhaus[i].winkel < 0) calculation_data.parkhaus[i].winkel * -1; //Wenn negativ *-1
                helper_array.push({                                                                                     // Push ins Hilfsarray
                    "winkel": calculation_data.parkhaus[i].winkel,
                    "parkhaus_id": calculation_data.parkhaus[i].parkhaus_id
                });
            }
            helper_array.sort(function (a, b) {                                                              // Sortierung der Parkhäuser nach Winkel
                let keyA = a.winkel,
                    keyB = b.winkel;
                // Compare the 2 dates
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
            });
            let parkhaus_object = {};                                                                                        //Anlegen eines Objektes für die Berechnung der Parkhausdaten
            parkhaus_object.amount = [];
            parkhaus_object.total = [];
            parkhaus_object.max = [];
            let helper = advice_data[0].datum;                                                                          //Split der Eingegebenen Datums Infos
            helper = helper.split(".");
            helper = helper[2] + "-" + helper[1] + "-" + helper[0];
            let uhrzeithelper = advice_data[0].uhrzeit;
            uhrzeithelper = uhrzeithelper.split(".");
            let d = new Date("" + helper); // new Date
            let week = weekNumber(d);
            let n = d.getDay(); // Tag
            let h = uhrzeithelper[0];  // Stunde
            let m = uhrzeithelper[1]; // Minute
            for (let y = 0; y <= helper_array.length - 1; y++) {                                                        //Loop durch das Helper Array, da es die Infos bzgl. Parkhäuser enthält (auch Menge)
                parkhaus_object.amount[y] = 0;
                parkhaus_object.max[y] = 0;
                parkhaus_object.total[y] = 0;
                parkhaus_object.specsearch_free = [];                                                                        // Frei zur STUNDE & MINUTE Letzte Woche/2W./3W.
                parkhaus_object.specsearch_parkhaus = [];                                                                    // Parkhaus_ID zum Objekt zur Identifizierung
                parkhaus_object.specsearch_free_current = [];                                                                // FREI LIVE
                connection.query("select * from parkhaus_data where tag='" + n + "' and hour='" + h + "' and lfdnr='" + helper_array[y].parkhaus_id + "' and (weeknumber='" + (week - 3) + "' or weeknumber ='" + (week - 1) + "' or weeknumber='" + (week - 2) + "') order by id desc", function (error, resulte, fields) {
                    parkhaus_object.max[y] = resulte[0].gesamt;                                                              //Abruf der Daten der Letzten 3 Wochen zur Angegebenen Stunde & Tag
                    for (let ic = 0; ic <= resulte.length - 1; ic++) {                                                  // Werte Parsen, anzahl erhöhen.
                        parkhaus_object.amount[y] += parseInt(resulte[ic].frei);
                        parkhaus_object.total[y] += 1;
                    }
                    if (y === helper_array.length - 1) {
                        for (let iy = 0; iy <= parkhaus_object.amount.length - 1; iy++) {
                            m = new Date().getMinutes();
                            h = new Date().getHours();                                                                  //Abruf der Daten zur aktuellen Stunde & Minute der letzten 3 Wochen für jedes Parkhaus
                            connection.query("select * from parkhaus_data where tag='" + n + "' and hour='" + h + "' and min='" + m + "' and lfdnr='" + helper_array[iy].parkhaus_id + "' and (weeknumber='" + (week - 3) + "' or weeknumber ='" + (week - 1) + "' or weeknumber='" + (week - 2) + "') order by id desc", function (error, result, fields) {
                                //console.log("select * from parkhaus_data where tag='" + n + "' and hour='" + h + "' and min='" + m + "' and lfdnr='" + helper_array[iy].parkhaus_id + "' and (weeknumber='" + (week - 3) + "' or weeknumber ='" + (week - 1) + "' or weeknumber='" + (week - 2) + "') order by id desc");
                                parkhaus_object.specsearch_free[iy] = 0;
                                parkhaus_object.specsearch_parkhaus[iy] = 0;
                                let free = 0;
                                for (let ix = 0; ix <= result.length - 1; ix++) {                                       //Addieren der Datensätze
                                    free += result[ix].frei;
                                }
                                //Abruf Aktueller Datensatz                                                             //Live Datensatz abfragen
                                connection.query("select * from parkhaus_data where lfdnr='" + helper_array[iy].parkhaus_id + "' order by id desc limit 1", function (error, results, fields) {
                                    parkhaus_object.specsearch_free_current[iy] = 0;//Array INIT
                                    parkhaus_object.specsearch_free_current[iy] = results[0].frei;   //Current Free schreiben
                                    parkhaus_object.specsearch_free[iy] = free / result.length;      //Durchschnitt der letzten 3 Wochen bilden
                                    parkhaus_object.specsearch_parkhaus[iy] = helper_array[iy].parkhaus_id; //Setzen der ParkhausID
                                    if (iy === helper_array.length - 1) {                       //Loop am Ende -> Auswertung
                                        for (let ixy = 0; ixy <= parkhaus_object.specsearch_parkhaus.length - 1; ixy++) {
                                            console.log("Spec Search: ID " + parkhaus_object.specsearch_parkhaus[ixy]);
                                            console.log("Spec Search: Frei " + parkhaus_object.specsearch_free[ixy]);
                                            console.log("Spec Search: Frei_CURRENT " + parkhaus_object.specsearch_free_current[ixy]);
                                            console.log("Durchschnitt frei: " + parkhaus_object.amount[ixy] / parkhaus_object.total[ixy]);
                                            console.log("Faktor: " + parkhaus_object.specsearch_free_current[ixy] / parkhaus_object.specsearch_free[ixy]);
                                            console.log("Durchschnitt bearbeitet: " + parkhaus_object.amount[ixy] / parkhaus_object.total[ixy] * parkhaus_object.specsearch_free_current[ixy] / parkhaus_object.specsearch_free[ixy]);
                                            if (parkhaus_object.specsearch_free_current[ixy] / parkhaus_object.specsearch_free[ixy] <= 0.75 && (parkhaus_object.amount[ixy] / parkhaus_object.total[ixy] * parkhaus_object.specsearch_free_current[ixy] / parkhaus_object.specsearch_free[ixy]) <= 30 || isNaN(parkhaus_object.specsearch_free_current[ixy] / parkhaus_object.specsearch_free[ixy])) {
                                                //Wenn der Faktor der Abweichung über 25% entspricht anderes Parkhaus wählen, oder wenn die Mindestanzahl an Plätze im Parkhaus mit korrigiertem Wert <= 30 ist nächstes Parkhaus testen
                                                //console.log("differenz zu groß bei parkhausid: " + mathobject.specsearch_parkhaus[ixy] + " oder zu wenig freie plätze");
                                            } else if(parkhaus_object.specsearch_free_current[ixy] / parkhaus_object.specsearch_free[ixy] > 0.75 && (parkhaus_object.amount[ixy] / parkhaus_object.total[ixy] * parkhaus_object.specsearch_free_current[ixy] / parkhaus_object.specsearch_free[ixy]) > 30 || isNaN(parkhaus_object.specsearch_free_current[ixy] / parkhaus_object.specsearch_free[ixy] === false)){
                                                // Passendes Parkhaus gefunden, Callback ausführen mit Parkhaus_ID & Mathobject
                                                callback(parkhaus_object.specsearch_parkhaus[ixy], parkhaus_object);
                                                ixy = parkhaus_object.specsearch_parkhaus.length;
                                            } else if(ixy === parkhaus_object.specsearch_parkhaus.length - 1) { //Wenn kein passendes Parkhaus gefunden werden kann -> 0 zurückgeben.
                                                callback(0,0);
                                            }
                                        }
                                    }
                                });


                            });


                        }
                    }
                });
            }

        });
    });

}

module.exports = router;
