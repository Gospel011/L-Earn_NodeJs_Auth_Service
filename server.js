const mongoose = require('mongoose');
const app = require('./app.js');




const DB = process.env.CURRENT_ENV == 'dev' ? process.env.LOCAL_DATABASE : process.env.DATABASE;




//? CONNECTING TO DATABASE
mongoose
  .connect(DB)
  .then((con) => {
    console.log('GOSPEL DATABASE CONNECTED!!');
  });


//! Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Lodgemate is running on port ${port}`);
});
