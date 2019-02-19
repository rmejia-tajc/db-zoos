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

// get a list of all zoos
server.get('/api/zoos', async (req, res) => {

  try {
    const zoos = await db('zoos');
    
    res.status(200).json(zoos);
  } catch (error) {
    res.status(500).json(error);
  }  
});

// get a zoo by id
server.get('/api/zoos/:id', async (req, res) => {
  try {
    const zoo = await db('zoos')
      .where({ id: req.params.id })
      .first();

    if (zoo) {
      res.status(200).json(zoo);
    } else {
      res.status(404).json({ message : 'The entry with that specified ID does not exist'});
    }

  } catch (error) {
    res.status(500).json(error);
  }
});

// delete a zoo
server.delete('/api/zoos/:id', async (req, res) => {
  try {
    const count = await db('zoos')
      .where({ id: req.params.id })
      .del();

    if (count > 0) {
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'The entry with that specified ID does not exist' });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// update a zoo
server.put('/api/zoos/:id', async (req, res) => {
  try {
    const count = await db('zoos')
      .where({ id: req.params.id })
      .update(req.body);

    if (count > 0) {
      const role = await db('zoos')
        .where({ id: req.params.id })
        .first();

      res.status(200).json(role);
    } else {
      res.status(404).json({ message: 'The entry with that specified ID does not exist' });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});





const port = process.env.PORT || 3300;
server.listen(port, () => console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`));
