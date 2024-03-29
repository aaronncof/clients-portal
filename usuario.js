
module.exports = app => {
    const tutorials = require("../controllers/userController");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/crear", tutorials.create);
  
    // Retrieve all Tutorials
    router.get("/getAll", tutorials.findAll);

  
    // Retrieve a single Tutorial with id
    router.get("/:id", tutorials.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", tutorials.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", tutorials.delete);
  
    // Delete all Tutorials
    router.delete("/", tutorials.deleteAll);
  
    app.use('/api/tutorials', router);
  };

