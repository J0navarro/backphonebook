const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://J0navarro:${password}@cluster0.v6y95.mongodb.net/personApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set('strictQuery', false);

mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB');

    const personSchema = new mongoose.Schema({
      name: String,
      number: String,
    });

    const Person = mongoose.model('Person', personSchema);

    // Obtener los argumentos de nombre y número
    const name = process.argv[3]; // Suponiendo que el nombre es el tercer argumento
    const number = process.argv[4]; // Suponiendo que el número es el cuarto argumento

    if (!name || !number) {
      // Si faltan parámetros, buscar todas las personas
      return Person.find({}).then(result => {
        result.forEach(person => {
          console.log(person);
        });
      });
    }

    // Si ambos parámetros están presentes, guardar la nueva persona
    const person = new Person({
      name: name,
      number: number,
    });

    return person.save().then(result => {
      console.log('Person saved!');
    });
  })
  .catch(err => {
    console.error(err);
  })
  .finally(() => {
    mongoose.connection.close(); // Cerrar la conexión al final
  });
