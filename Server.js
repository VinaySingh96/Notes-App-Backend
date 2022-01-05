const expresss = require('express')
const connectToMongoose = require("./database")
const bcrypt = require('bcrypt');
var cors = require('cors')

connectToMongoose();

const app = expresss();
const port = 8000;
app.use(cors())
const hostname = 'localhost';
app.use(expresss.json());

// Available Routes -- use this type of endpoint for better readability
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.listen(port, hostname, () => {
    console.log(`App is Listning at http://${hostname}:${port}`);
})