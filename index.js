// Requiring the packages
const express = require("express");
const bodyParser = require("body-parser");
const {
  Pool
} = require("pg");

// Creating a instance of POOL
const pool = new Pool({
  user: process.env.user,
  password: process.env.password,
  host: "192.168.1.100",
  port: 5432,
  database: "notification",
  max: 5,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
})

const app = express();

// Setting up middle-wares
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

// Get to render the Home page.
app.get('/', async (req, res) => {
  const view_result = await pool.query(
    "SELECT * FROM notification"
  );
  const rows = view_result.rows;
  console.log(rows);
  res.render('home', {
    table: rows
  });
});

// Get to render the page
app.get('/add', (req, res) => {
  res.render('add');
})

// Post request for adding the notification in postgres DB
app.post('/add', async (req, res) => {

  try {
    //Creat a table in DataBase is not present
    await pool.query(
      "CREATE TABLE IF NOT EXISTS notification (title VARCHAR(50) NOT NULL, body VARCHAR(50) NOT NULL)"
    );
    // Inserting the values got from user into table
    await pool.query(
      "INSERT INTO notification (title, body) VALUES ($1,$2)",
      [req.body.title, req.body.body]
    );

  } catch (e) {
    console.log("ERROR OCCURED: " + e);
    return false;
  } finally {
    console.log("INSERTION  EXECUTED");
  }
  res.redirect("/");
})

// Starting the server
app.listen(process.env.PORT || 3000, () => {
  console.log("Server Started Successfully...");
})
