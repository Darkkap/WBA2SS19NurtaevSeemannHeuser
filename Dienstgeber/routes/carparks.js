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

  let position = 0;
  if(req.body.position !== undefined) {
    position = req.body.position;
  }
  let parkhaus_id =0;
  if(req.body.parkhaus_id !== undefined) {
    parkhaus_id = req.body.parkhaus_id;
  }
  let winkel = 0;
  if(req.body.winkel !== undefined) {
    winkel = req.body.winkel;
  }




  connection.query("Insert into  parkhaus_info values ('','"+position+"','"+parkhaus_id+"','"+winkel+"')", function (error, results, fields) {
    if (error) {
      res.status(404).json({"Parkhaus": "Error. Fehler beim anlegen"});
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

router.get('/:id', function(req, res, next) {//Abruf Parkhaus ID
  let id = req.params.id;
  id = id.replace(":", "");
  let sucheobj = {};
  connection.query("Select * from parkhaus_info where parkhaus_id='" + id + "'", function (error, results, fields) {
    if (results.length < 1) {
      res.status(404).json({"Parkhaus_info": "Error. Keine Details gefunden"});
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

router.put('/:id', function(req, res, next) { //Bearbeiten des Parkhaus X

  /*

    {
            "position": "50.7319997,7.0956021,17.25z",
            "parkhaus_id": 1,
            "winkel": 195
    }

  **/
  let id = req.params.id;
  id = id.replace(":", "");
  let position = req.body.position;
  let parkhaus_id =req.body.parkhaus_id;
  let winkel = req.body.winkel;
  if(position !== undefined) {
    connection.query("update parkhaus_info set position='"+position+"'  where id='" + id + "'", function (error, results, fields) {
    });
  }
  if(parkhaus_id !== undefined) {
    connection.query("update parkhaus_info set parkhaus_id='"+parkhaus_id+"'  where id='" + id + "'", function (error, results, fields) {
    });
  }
  if(winkel !== undefined) {
    connection.query("update parkhaus_info set winkel='"+winkel+"'  where id='" + id + "'", function (error, results, fields) {
    });
  }
  res.status(200).write("Änderung abgeschlossen.");
  next();
  res.end();

});

router.delete('/:id', function(req, res, next) {  // Löschen des Parkhaus X
  let id = req.params.id;
  id = id.replace(":", "");
  connection.query("delete from parkhaus_info where parkhaus_id ='" + id + "'", function (error, results, fields) {
    if (error) {
      res.status(500).write("Internal Error");
    } else {
      res.status(200).write("OK, ID: " + id + " gelöscht.");
    }
    next();
    res.end();
  });
});

module.exports = router;
