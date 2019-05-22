//http://boulter.com/gps/distance/?from=50.7319997%2C7.0956021%2C17.25z&to=50.7322552%2C7.0853128%2C16.25z&units=k
//RESTAURANT BEI 50.735674,7.097160
let request = require('request');
function request_winkel(position,callback) {
    request('http://boulter.com/gps/distance/?from=50.735674,7.097160,17.25z&to='+position+'&units=k', function (error, response, body) {

        let test = body;
        test = test.split("\n");
        //let pure_distance = 0;
        let ausrichtung = 0;
        for (let i = 0; i < test.length; i++) {
            if (test[i].includes("kilometers") === true) {

                let reverse_helper = test[i];
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
                i = test.length; // Stop the Loop.
            }
        }
        callback(ausrichtung);
    });
}

let posi="50.7213248,7.1357444,14z";
request_winkel(posi,function (data) {
    console.log(data);
});