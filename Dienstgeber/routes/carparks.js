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

/* GET home page. */
router.get('/', function(req, res, next) {  // Alle Parkhäuser
  let parkhausobj = {};
  connection.query("Select * from parkhaus_info" , function (error, results, fields) {
    parkhausobj.parkhaus = [];
    for (let i = 0;i <= results.length-1;i++) {
      parkhausobj.parkhaus.push(results[i]);
    }
    if (error) {
      res.status(500).json({"parkhaus":"Error"});
    }  else {
      res.status(200).json(parkhausobj);
      console.log(parkhausobj);
    }
    next();
    res.end();
  });



});

router.post('/', function(req, res, next) { // Anlegen eines neuen Parkhaus
  res.status(200).write("Anlegen eines Neuen Parkhauses.");
  next();
  res.end();
});

router.get('/:id', function(req, res, next) {//Abruf Parkhaus ID
  let id = req.params.id;
  res.status(200).write("Abruf Parkhaus. ID: "+id);
  next();
  res.end();
});

router.put('/:id', function(req, res, next) { //Bearbeiten des Parkhaus X
  let id = req.params.id;
  res.status(200).write("Bearbeiten Parkhaus. ID: "+id);
  next();
  res.end();
});

router.delete('/:id', function(req, res, next) {  // Löschen des Parkhaus X
  let id = req.params.id;
  res.status(200).write("Abruf Parkhaus. ID: "+id);
  next();
  res.end();
});


module.exports = router;
