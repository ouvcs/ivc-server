console.clear();

import express from "express";
import pkg from "pg";
import chalk from "chalk";
import dotenv from "dotenv";

console.log(chalk.bold.whiteBright("IVC Server v.0.1.0 is starting...\n"));

const { Client } = pkg;
dotenv.config();

const app = express();
const port = 3300;

const db = {
  host: process.env.POSTGRESQL_HOST,
  port: process.env.POSTGRESQL_PORT,
  user: process.env.POSTGRESQL_USER,
  password: process.env.POSTGRESQL_PASSWORD,
  database: process.env.POSTGRESQL_DBNAME,
};

const client = new Client(db);

client.connect()
  .then(() => {
    console.log(chalk.green(`Connection to ${chalk.italic.white(db.host)} successfully established`));
  })
  .catch((err) => {
    console.error(chalk.red("An error occurred during connection to the database:"), err);
  });

app.use(express.json());

app.get("/api/countries/get", async (req, res) => {
  const countries = await client.query("SELECT * FROM countries");
  res.status(200).json(countries.rows);
});

app.get("/api/country/get/:id", async (req, res) => {
  const { id } = req.params;

  const country = await client.query(`SELECT * FROM countries WHERE id = $1`, [id]);

  if (country.rowCount == 0) {
    return res.status(404).json({ message: "Country not found" });
  }
  res.status(200).json(country.rows[0]);
});

app.post("/api/country/create", async (req, res) => {
  const { id, name, flag } = req.body;
  
  if (!id || !name || !flag) {
    return res.status(400).json({ message: "Country ID and name are required" });
  }
  
  try {
    await client.query(`INSERT INTO countries (id, name, flag) VALUES ($1, $2, $3);`, [id, name, flag]);
    res.status(200).json({ message: "Country successfully created" });
  } catch (err) {
    res.status(500).json({ message: "An error occurred during country creation" });
  }
});

app.listen(port, () => {
  console.log(chalk.bold.bgGreen(`Server is running on ${port}`));
});