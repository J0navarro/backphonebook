const express = require('express')
const app = express()
app.use(express.static('dist'))
const bodyParser = require('body-parser');
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.json());

// Crear un nuevo token para registrar el cuerpo de las solicitudes POST
morgan.token('body', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : '';
});

// Configurar Morgan para mostrar el método, la URL y el cuerpo de las solicitudes POST
app.use(morgan(':method :url :body'));


let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
];

const generateId = () => {
    const maxId = persons.length > 0
      ? Math.max(...persons.map(n => n.id))
      : 0
    return maxId + 1
  }

app.get('/api/persons', (request, response) => {
    response.send(persons)
})

app.get('/info', (request, response) => {
    const cantPersons = persons.length; // Asegúrate de que 'persons' esté definido en el contexto
    const fhora = new Date(); // Usa 'new Date()' para obtener la fecha y hora actual
    response.send(`<h2>Cantidad de entradas en la agenda: ${cantPersons}</h2><p>${fhora}</p>`);
});

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    person = persons.find(preson => preson.id === id);

    if (person) {
        response.json(person)
    }else{
        response.status(404).end()
    }    
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    person = persons.filter(preson => preson.id !== id);

    if (person) {
        response.status(204).end();
    }else{
        response.status(404).end()
    }    
});

app.post('/api/persons/', (request, response) => {
    const id = generateId(); // Genera un nuevo ID
    const name = request.body.name; // Obtiene el nombre de los parámetros de la URL
    const number = request.body.number; // Obtiene el número de los parámetros de la URL

    // Verifica si el nombre o el número están vacíos
    if (!name || !number) {
        return response.status(400).send({ error: 'Nombre y número son obligatorios' });
    }

    // Crea un nuevo objeto persona
    const newPerson = {
        id,
        name,
        number
    };

    // Agrega la nueva persona a la lista
    persons = persons.concat(newPerson);

    // Responde con la lista actualizada de personas
    response.status(201).send(persons); // Usa el código de estado 201 para indicar creación exitosa
});


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})