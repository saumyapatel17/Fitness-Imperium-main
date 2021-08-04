const express = require("express");
const path = require("path");
const cookie = require('cookie-parser')

const hostname = '127.0.0.1';
const port = 80;

const app = express();

const publicDirectory = path.join(__dirname,'./');
app.use(express.static(publicDirectory));

app.use(express.urlencoded({extended: false}));  

app.use(cookie());

app.set('view engine', 'hbs');

app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));


app.listen(port,()=>{
    console.log(`Server running at http://${hostname}:${port}`);
})
