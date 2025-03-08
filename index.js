const express = require('express');
const app = express();
require('dotenv').config();
const Person = require('./models/persons');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

// Middleware
app.use(cors());
app.use(express.static('dist'));
app.use(bodyParser.urlencoded({ extended: true })); // Para manejar form-data
app.use(bodyParser.json()); // Para manejar JSON

// Configurar Morgan para registrar solicitudes
morgan.token('body', (req) => req.method === 'POST' ? JSON.stringify(req.body) : '');
app.use(morgan(':method :url :body'));

// Middleware para verificar parámetros requeridos
const verificarParametros = (parametrosRequeridos) => {
  return (req, res, next) => {
    const missingParams = parametrosRequeridos.filter(param => !req.body[param]);
    if (missingParams.length > 0) {
      return res.status(400).json({ error: `Faltan los parámetros requeridos: ${missingParams.join(', ')}` });
    }
    next();
  };
};

// Rutas
app.get('/api/persons', (req, res, next) => {
  Person.find({}).then(result => res.json(result))
  .catch(error => {
    console.log(error)
    next(error)
  });
});

app.get('/info', (req, res) => {
  const cantPersons = persons.length; // Asegúrate de que 'persons' esté definido en el contexto
  const fhora = new Date();
  res.send(`<h2>Cantidad de entradas en la agenda: ${cantPersons}</h2><p>${fhora}</p>`);
});

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  Person.findById(id).then(person => {
    if (person) {
      res.json(person);
    } else {
      res.status(404).end();
    }
  })
  .catch(error => {
    console.log(error)
    next(error)
  });
});

app.put('/api/persons/', (request, response, next) => {
  const { name, number, id } = request.body;

  // Crea un objeto solo con los campos que deseas actualizar
  const updateData = { name, number };

  Person.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        response.status(404).send({ error: 'Person not found' });
      }
    })
    .catch(error => {
      console.log(error);
      next(error);
    });
});


app.delete('/api/persons/:id', (req, res, next) => {
  const id = Number(req.params.id);
  Person.findByIdAndDelete(id).then(result => {
    if (result) {
      res.status(204).end();
    } else {
      res.status(404).end();
    }
  })
  .catch(error => {
    console.log(error)
    next(error)
  });
});

app.post('/api/persons', verificarParametros(['name', 'number']), (req, res) => {
  const { name, number } = req.body;

  const person = new Person({ name, number });
  person.save().then(savedPerson => res.status(201).json(savedPerson))
  .catch(error => {
    console.log(error)
    response.status(500).end()
  });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// controlador de solicitudes con endpoint desconocido
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

// este debe ser el último middleware cargado, ¡también todas las rutas deben ser registrada antes que esto!
app.use(errorHandler)

// Iniciar el servidor
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
