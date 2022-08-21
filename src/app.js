const express = require('express');
const mongoose = require('mongoose');
const path=require('path');
const app = express();
const cors = require('cors');
const User = require('./models/users');
const Exercise = require('./models/exercise');
require('./conn');
app.use(express.json());
app.use(express.urlencoded( {extended: true} ));
app.use(cors());
const staticPath=path.join(__dirname,'../public');
app.use(express.static('public'));
app.use((req, res, next) => {
  console.log("method: " + req.method + "  |  path: " + req.path + "  |  IP - " + req.ip);
  next();
});
app.get('/', (req, res) => {
  res.send('index');
});
app.route('/api/users').get((req, res) => {
  User.find({}, (error, data) => {
    //console.log(data);
    res.json(data);
  });
}).post((req, res) => {
  // Get username input into form
  const potentialUsername = req.body.username;
  console.log("potential username:", potentialUsername);

  // Check to see if the username has already been entered
  User.findOne({username: potentialUsername}, (error, data) => {
    if (error) {
      res.send("Unknown userID");
      return console.log(error);
    }

    if (!data) { // If username is not stored yet, create and save a User object
      const newUser = new User({
        username: potentialUsername
      });

      // Save the user
      newUser.save((error, data) => {
        if (error) return console.log(error);
        // Remove the key-value pair associated with the key __v
        const reducedData = {
          "username": data.username, 
          "_id": data._id
        };
        res.json(reducedData);
        console.log(reducedData);
      });
    } else { // If username is already stored, send a message to the user
      res.send(`Username ${potentialUsername} already exists.`);
      console.log(`Username ${potentialUsername} already exists.`);
    }
  });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  // Get data from form
  const userID = req.body[":_id"] || req.params._id;
  const descriptionEntered = req.body.description;
  const durationEntered = req.body.duration;
  const dateEntered = req.body.date;


  console.log(userID, descriptionEntered, durationEntered, dateEntered);
  if (!userID) {
    res.json("Path `userID` is required.");
    return;
  }
  if (!descriptionEntered) {
    res.json("Path `description` is required.");
    return;
  }
  if (!durationEntered) {
    res.json("Path `duration` is required.");
    return;
  }

  // Check if user ID is in the User model
  User.findOne({"_id": userID}, (error, data) => {
    if (error) {
      res.json("Invalid userID");
      return console.log(error);
    }
    if (!data) {
      res.json("Unknown userID");
      return;
    } else {
      console.log(data);
      const usernameMatch = data.username;
      
      // Create an Exercise object
      const newExercise = new Exercise({
        username: usernameMatch,
        description: descriptionEntered,
        duration: durationEntered
      });

      // Set the date of the Exercise object if the date was entered
      if (dateEntered) {
        newExercise.date = dateEntered;
      }

      // Save the exercise
      newExercise.save((error, data) => {
        if (error) return console.log(error);

        console.log(data);

        // Create JSON object to be sent to the response
        const exerciseObject = {
          "_id": userID,
          "username": data.username,
          "date": data.date.toDateString(),
          "duration": data.duration,
          "description": data.description
        };

        // Send JSON object to the response
        res.json(exerciseObject);

      });
    }
  });
});


// PATH /api/users/:_id/logs?[from][&to][&limit]
app.get('/api/users/:_id/logs', (req, res) => {
  const id = req.body["_id"] || req.params._id;
  var fromDate = req.query.from;
  var toDate = req.query.to;
  var limit = req.query.limit;

  console.log(id, fromDate, toDate, limit);

  // Validate the query parameters
  if (fromDate) {
    fromDate = new Date(fromDate);
    if (fromDate == "Invalid Date") {
      res.json("Invalid Date Entered");
      return;
    }
  }

  if (toDate) {
    toDate = new Date(toDate);
    if (toDate == "Invalid Date") {
      res.json("Invalid Date Entered");
      return;
    }
  }

  if (limit) {
    limit = new Number(limit);
    if (isNaN(limit)) {
      res.json("Invalid Limit Entered");
      return;
    }
  }

  // Get the user's information
  User.findOne({ "_id" : id }, (error, data) => {
    if (error) {
      res.json("Invalid UserID");
      return console.log(error);
    }
    if (!data) {
      res.json("Invalid UserID");
    } else {
      const usernameFound = data.username;
      var objToReturn = { "_id" : id, "username" : usernameFound };
      var findFilter = { "username" : usernameFound };
      var dateFilter = {};
      if (fromDate) {
        objToReturn["from"] = fromDate.toDateString();
        dateFilter["$gte"] = fromDate;
        if (toDate) {
          objToReturn["to"] = toDate.toDateString();
          dateFilter["$lt"] = toDate;
        } else {
          dateFilter["$lt"] = Date.now();
        }
      }

      if (toDate) {
        objToReturn["to"] = toDate.toDateString();
        dateFilter["$lt"] = toDate;
        dateFilter["$gte"] = new Date("1960-01-01");
      }
      if (toDate || fromDate) {
        findFilter.date = dateFilter;
      }
      Exercise.count(findFilter, (error, data) => {
        if (error) {
          res.json("Invalid Date Entered");
          return console.log(error);
        }

        var count = data;
        if (limit && limit < count) {
          count = limit;
        }
        objToReturn["count"] = count;
        Exercise.find(findFilter, (error, data) => {
          if (error) return console.log(error);
          var logArray = [];
          var objectSubset = {};
          var count = 0;
          data.forEach(function(val) {
            count += 1;
            if (!limit || count <= limit) {
              objectSubset = {};
              objectSubset.description = val.description;
              objectSubset.duration = val.duration;
              objectSubset.date = val.date.toDateString();
              console.log(objectSubset);
              logArray.push(objectSubset);
            }
          });

          // Add the log array of objects to the object to return
          objToReturn["log"] = logArray;

          // Return the completed JSON object
          res.json(objToReturn);
        });

      });

    }
  });
});

app.get('/api/exercises', (req, res) => {
  Exercise.find({}, (error, data) => {
    if (error) return console.log(error);
    res.json(data);
  })
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
})
