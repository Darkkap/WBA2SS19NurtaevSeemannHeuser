/**
 * Created by tobiasseemann on 15.04.19.
 */

let xml2js = require('xml2js');
let parser = new xml2js.Parser();
let request = require('request');
let replaceall = require("replaceall");
let date = require('date-and-time');
let mysql = require('mysql');
let weekNumber = require("weeknumber/lib/index.js").weekNumber;
let connection = mysql.createConnection({
    host: 'exo.ovh',
    user: 'root',
    password: 'xxxxxxxx',
    database: 'wba_data'
});
connection.connect();


setInterval(function () {
    request('http://www.bcp-bonn.de/stellplatz/bcpext.xml', function (error, response, body) {  // Parkhäuser Bonn
        if (response.statusCode === 200 && body.length > 0) {
            parser.parseString(body, function (err, result) {
                let d = new Date(); // new Date
                let n = d.getDay(); // Tag
                let h = d.getHours();  // Stunde
                let m = d.getMinutes(); // Minute
                for (let i = 0; i < result.parkhaeuser.parkhaus.length; i++) {
                    let curr_data = result.parkhaeuser.parkhaus[i];
                    if (parseInt(curr_data.lfdnr) === 5) {  // Skip des 5. Parkhaus, weil geschlossen/existiert nicht mehr
                        //Skipping
                        /*<parkhaus>
                         <lfdnr>5</lfdnr>
                         <bezeichnung>karstadt</bezeichnung>
                         <gesamt>99</gesamt>
                         <frei>071</frei>
                         <status>0</status>
                         <zeitstempel>25.07.2018 09:13</zeitstempel>
                         <tendenz>3</tendenz>
                         */
                    } else {
                        connection.query("Insert into parkhaus_data values('0','" + curr_data.lfdnr + "','" + curr_data.gesamt + "','" + curr_data.frei + "','" + curr_data.status + "','" + curr_data.tendenz + "','" + n + "','" + h + "','" + m + "','" + weekNumber(new Date()) + "')", function (error, results, fields) {
                            if (error) console.log(error);  // IF ERROR POST ERROR;
                        });
                    }

                }
            });
            console.log("data collecting done");
        } else {
            console.log('error:', error);
        } // Print the error if one occurred
    });
}, 60000); // Run every 60 Seconds