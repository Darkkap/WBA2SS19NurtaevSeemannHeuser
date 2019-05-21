var express = require('express');
var router = express.Router();
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
  res.status(200).write("Abruf aller Parkhäuser.");
  next();
  res.end();
});

router.post('/', function(req, res, next) { // Anlegen eines neuen Parkhaus
  res.status(200).write("Anlegen eines Neuen Parkhauses.");
  next();
  res.end();
});

router.get('/:id', function(req, res, next) {//Abruf Parkhaus ID
  let id = req.query.id;
  res.status(200).write("Abruf Parkhaus. ID: "+id);
  next();
  res.end();
});

router.put('/:id', function(req, res, next) { //Bearbeiten des Parkhaus X
  let id = req.query.id;
  res.status(200).write("Bearbeiten Parkhaus. ID: "+id);
  next();
  res.end();
});

router.delete('/:id', function(req, res, next) {  // Löschen des Parkhaus X
  let id = req.query.id;
  res.status(200).write("Abruf Parkhaus. ID: "+id);
  next();
  res.end();
});


module.exports = router;
