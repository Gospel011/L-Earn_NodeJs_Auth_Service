

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message, err.stack);
// console.log('ERROR STACK', err.stack)
  process.exit(1);
});

const axios = require('axios');
axios.get('https://l-earn.onrender.com').then(result => console.log(result.data)).catch(err => {
  console.log('network error')
})

const app = require('./app.js');

const keepAlive = ()=> {

  setTimeout(()=> {
    console.log("inside set timeout");
    axios.get('https://l-earn.onrender.com').then(result => console.log(result.data)).catch(err => {
      console.log('network error')
    })
    keepAlive();
  }, 14 * 60 * 1000)

}

keepAlive();

const mongoose = require('mongoose');




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
  console.log(`L-Earn is running on port ${port} and current environment is ${process.env.CURRENT_ENV == 'dev' ? 'development' : 'production'}`);
});
