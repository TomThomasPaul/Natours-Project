const mongoose = require('mongoose');

const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/../../config.env` });

const Tour = require(`${__dirname}/../../models/tourModel`);
const User = require(`${__dirname}/../../models/userModel`);
const Review = require(`${__dirname}/../../models/reviewModel`);

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
    console.log(`Import Data Connection Successful`);
  });

//Read tours from file

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//Import tours from file to database

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Tours imported to database form json file');
    await User.create(users, {validateBeforeSave : false });//to avoid passwordConfirmerror
    console.log('Users imported to database form json file');
    await Review.create(reviews);
    console.log('Reviews imported to database form json file');
  } catch (err) {
    console.log(
      `Error importing all data into database . The error details are ${err}`
    );
  }

  process.exit();
};

//Delete Existing Data

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Tours deleted from database form json file');
    await User.deleteMany();
    console.log('Users deleted from database form json file');
    await Review.deleteMany();
    console.log('Reviews deleted from database form json file');
  } catch (err) {
    console.log(
      `Error deleting all records from database. The error details are ${err}`
    );
  }

  process.exit();
};

console.log(process.argv);

process.argv[2]
  ? process.argv[2] === '--import'
    ? importData()
    : deleteData()
  : null;

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
// const app = require(`./app`);
// //console.log(app.get('env'));
// //console.log('just after require app');
// const port = process.env.PORT || 1440;
// app.listen(port, '127.0.0.1', () => {
//   console.log(`Server is listening now on port ${port}`);
// });
