/**
 * Created by tobiasseemann on 13.05.19.
 */

let mysql = require('mysql');
let connection = mysql.createConnection({
    host: 'exo.ovh',
    user: 'wbauser',
    password: 'wba-user',
    database: 'wba_data'
});
connection.connect();

let park_haus_obj = {};

function init_parkhaus() {
    park_haus_obj.parkhaus = [];
    park_haus_obj.parkhaus_counter = [];
    park_haus_obj.parkhaus_max = [];
    park_haus_obj.parkhaus[1] = 0;
    park_haus_obj.parkhaus_counter[1]= 0;
    park_haus_obj.parkhaus_max[1] = 0;
    park_haus_obj.parkhaus[2] = 0;
    park_haus_obj.parkhaus_counter[2] = 0;
    park_haus_obj.parkhaus_max[2] = 0;
    park_haus_obj.parkhaus[3] = 0;
    park_haus_obj.parkhaus_counter[3]= 0;
    park_haus_obj.parkhaus_max[3] = 0;
    park_haus_obj.parkhaus[4] = 0;
    park_haus_obj.parkhaus_counter[4] = 0;
    park_haus_obj.parkhaus_max[4]= 0;
    park_haus_obj.parkhaus[5] = 0;
    park_haus_obj.parkhaus_counter[5] = 0;
    park_haus_obj.parkhaus_max[5] = 0;
    park_haus_obj.parkhaus[6] = 0;
    park_haus_obj.parkhaus_counter[6] = 0;
    park_haus_obj.parkhaus_max[6]= 0;
    park_haus_obj.parkhaus[7] = 0;
    park_haus_obj.parkhaus_counter[7] = 0;
    park_haus_obj.parkhaus_max[7] = 0;
    park_haus_obj.parkhaus[8] = 0;
    park_haus_obj.parkhaus_counter[8] = 0;
    park_haus_obj.parkhaus_max[8] = 0;
    park_haus_obj.parkhaus[9] = 0;
    park_haus_obj.parkhaus_counter[9]= 0;
    park_haus_obj.parkhaus_max [9]= 0;
    park_haus_obj.parkhaus[0] = 0;
    park_haus_obj.parkhaus_counter[0] = 0;
    park_haus_obj.parkhaus_max[0] = 0;
}

//Definierung des Objekt

// DEF ENDE
function average_week(weeknumber) {
    init_parkhaus();
    connection.query("Select * from parkhaus_data where weeknumber='" + weeknumber + "'", function (error, results) {
        if (error) {
            console.log(error);
        } else  // IF ERROR POST ERROR;
        {
            console.log(results[1].lfdnr);
            for (let i = 0; i <= results.length - 1; i++) {

                switch (parseInt(results[i].lfdnr)) {
                    case 1:
                        park_haus_obj.parkhaus[0] += parseInt(results[i].frei);
                        park_haus_obj.parkhaus_max[0] = parseInt(results[i].gesamt);
                        park_haus_obj.parkhaus_counter[0]++;
                        break;
                    case 2:
                        park_haus_obj.parkhaus[1] += parseInt(results[i].frei);
                        park_haus_obj.parkhaus_max[1] = parseInt(results[i].gesamt);
                        park_haus_obj.parkhaus_counter[1]++;
                        break;
                    case 3:
                        park_haus_obj.parkhaus[2] += parseInt(results[i].frei);
                        park_haus_obj.parkhaus_max[2] = parseInt(results[i].gesamt);
                        park_haus_obj.parkhaus_counter[2]++;
                        break;
                    case 4:
                        park_haus_obj.parkhaus[3] += parseInt(results[i].frei);
                        park_haus_obj.parkhaus_max[3] = parseInt(results[i].gesamt);
                        park_haus_obj.parkhaus_counter[3]++;
                        break;

                    case 5:
                        park_haus_obj.parkhaus[4] += parseInt(results[i].frei);
                        park_haus_obj.parkhaus_max[4] = parseInt(results[i].gesamt);
                        park_haus_obj.parkhaus_counter[4]++;
                        break;
                    case 6:
                        park_haus_obj.parkhaus[5] += parseInt(results[i].frei);
                        park_haus_obj.parkhaus_max[5] = parseInt(results[i].gesamt);
                        park_haus_obj.parkhaus_counter[5]++;
                        break;
                    case 7:
                        park_haus_obj.parkhaus[6] += parseInt(results[i].frei);
                        park_haus_obj.parkhaus_max[6] = parseInt(results[i].gesamt);
                        park_haus_obj.parkhaus_counter[6]++;
                        break;
                    case 8:
                        park_haus_obj.parkhaus[7] += parseInt(results[i].frei);
                        park_haus_obj.parkhaus_max[7] = parseInt(results[i].gesamt);
                        park_haus_obj.parkhaus_counter[7]++;
                        break;
                    case 9:
                        park_haus_obj.parkhaus[8] += parseInt(results[i].frei);
                        park_haus_obj.parkhaus_max[8] = parseInt(results[i].gesamt);
                        park_haus_obj.parkhaus_counter[8]++;
                        break;
                    case 10:
                        park_haus_obj.parkhaus[9] += parseInt(results[i].frei);
                        park_haus_obj.parkhaus_max[9] = parseInt(results[i].gesamt);
                        park_haus_obj.parkhaus_counter[9]++;
                        break;
                    default:
                        console.log("wrong dataset");
                        break;
                }


            }
            for(let i=0; i<=park_haus_obj.parkhaus.length-1;i++) {
                console.log("total count: " + park_haus_obj.parkhaus_counter[i]);
                console.log("total free space: " + park_haus_obj.parkhaus[i]);
                console.log("average free space " + parseInt(park_haus_obj.parkhaus[i] / park_haus_obj.parkhaus_counter[i]));
                console.log("max space: " + park_haus_obj.parkhaus_max[i]);
            }

        }
    });
}

average_week(18);