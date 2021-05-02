const mongoose = require('mongoose');

require('dotenv').config();
require('./models/User');

// set the database connection
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection
.on('open', () => {
    //console.log('Mongoose connection open');
}).on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
});

const app = require('./app');

// start the local server on port 3000
const server = app.listen(3000, () => {
  //console.log(`Express is running on port ${server.address().port}`);
});