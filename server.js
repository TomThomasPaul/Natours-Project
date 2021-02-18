console.log('ServerJs');//test comment
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/config.env` });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  //.connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    //console.log(conn.connections);
    console.log(`Connection Successful`);
  });

/****************Testing Document creation** 
const testTour = new Tour({
  name: 'The Forest Hiker',
  rating: 6.7,
  price: 5000,
});

testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log(err);
  }); 
  
  *********************************************************************/
//console.log(process.env.NODE_ENV);
const app = require(`./app`);
//console.log(app.get('env'));
//console.log('just after require app');
const port = process.env.PORT || 1440;
app.listen(port, '127.0.0.1', () => {
  console.log(`Server is listening now on port ${port}`);
});
