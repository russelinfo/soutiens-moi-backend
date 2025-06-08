// seedSubjects.js
const mongoose = require('mongoose');
const Subject = require('../models/Subject'); // Assurez-vous que le chemin est correct depuis seedSubjects.js vers models/Subject.js

// VOTRE URI DE BASE DE DONNÉES
const dbURI = 'mongodb+srv://yemelirussel:jaSGCaOzm0c3ea0V@cluster0.pcuknou.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI)
  .then(async () => {
    console.log('Connecté à MongoDB Atlas pour le seeding.');

    const subjectsToSeed = [
      { name: 'Analyse I' },
      { name: 'Analyse II' },
      { name: 'Programmation c' },
      { name: 'Algebre I' },
      { name: 'Algebre II' },
      { name: 'Compilation' },
      { name: 'Base de données' },
      { name: 'Data Analysis' },
      { name: 'Java 2EE' },
      { name: 'Reseau/SE' },
      { name: 'Programmation mobile' },
      { name: 'Probabilités et statistiques' },
      { name: 'Systemes Informatiques' },
      { name: 'Genie logiciel' },
      { name: 'Anglais' },
    ];

    try {
      // Supprime tous les documents existants dans la collection 'subjects'
      console.log('Suppression des sujets existants...');
      await Subject.deleteMany({});
      console.log('Sujets existants supprimés.');

      // Insère les nouveaux sujets définis dans subjectsToSeed
      console.log('Insertion des nouveaux sujets...');
      const result = await Subject.insertMany(subjectsToSeed);
      console.log(`${result.length} sujets insérés avec succès.`);
      console.log('Détails des sujets insérés (avec leurs _id générés) :');
      result.forEach(subject => {
        console.log(`  - ${subject.name} (ID: ${subject._id})`);
      });

    } catch (error) {
      console.error('Erreur lors de l\'insertion ou de la suppression des sujets:', error.message);
    } finally {
      // Déconnecte Mongoose de la base de données
      mongoose.disconnect();
      console.log('Déconnecté de MongoDB Atlas.');
    }
  })
  .catch(err => {
    console.error('Erreur de connexion à MongoDB Atlas:', err);
    // Ajoutez un process.exit(1) ici pour indiquer un échec si la connexion échoue
    process.exit(1);
  });