const express = require('express');
const helmet = require('helmet');
const knex = require('knex');

const knexConfig = {
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
      filename: './data/lambda.sqlite3'
  }
};

const db = knex(knexConfig);

const server = express();

server.use(express.json());
server.use(helmet());

// endpoints here

// error responses
const errors = {
  '19': 'Another record with that value exists',
};

// create zoo
server.post('/api/zoos', async (req, res) => {
  if (!req.body.name) {
    res.status(400).json({ message : 'Please enter a value for this entry'});
  } else {
      try {
        const [id] = await db('zoos').insert(req.body);

        const role = await db('zoos')
          .where({ id })
          .first();

        res.status(201).json(id);
      } catch (error) {
        const message = errors[error.errno] || 'We ran into an error creating that entry';
        res.status(500).json({ message, error });
      }
    }
});







const port = process.env.PORT || 3300;
server.listen(port, () => console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`));
