// server/controllers/authController.js

const User = require('../models/User'); // Importe votre modèle User
const Subject = require('../models/Subject'); // <-- NOUVEAU : Importe votre modèle Subject
const bcrypt = require('bcryptjs');     // Pour hacher les mots de passe
const jwt = require('jsonwebtoken');    // Pour générer les JSON Web Tokens

// Fonction d'inscription (Register)
exports.register = async (req, res) => {
    // Déstructurez tous les champs attendus du corps de la requête
    const { username, email, password, nom, prenom, level, role, bio, subjects } = req.body;

    try {
        // 1. Validation de base des champs requis
        if (!username || !email || !password || !nom || !prenom || !level || !role) {
            return res.status(400).json({ msg: 'Veuillez remplir tous les champs obligatoires (username, email, mot de passe, nom, prénom, niveau, rôle).' });
        }

        // 2. Vérifier si l'utilisateur existe déjà (par email ou username)
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(409).json({ msg: 'L\'utilisateur avec cet email ou nom d\'utilisateur existe déjà.' });
        }

        // 3. Valider et traiter les sujets si le rôle est 'tutor'
        let validSubjectIds = [];
        if (role === 'tutor') {
            if (!subjects || subjects.length === 0) {
                return res.status(400).json({ msg: 'Les enseignants doivent spécifier au moins un sujet enseigné.' });
            }
            // Chercher les sujets dans la base de données par leurs IDs
            const foundSubjects = await Subject.find({ _id: { $in: subjects } });

            // S'assurer que tous les IDs fournis correspondent à des sujets existants
            if (foundSubjects.length !== subjects.length) {
                return res.status(400).json({ msg: 'Un ou plusieurs sujets sélectionnés sont invalides.' });
            }
            validSubjectIds = foundSubjects.map(sub => sub._id); // Récupérer les _id Mongoose validés
        }


        // 4. Hacher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Créer un nouvel utilisateur avec tous les champs
        user = new User({
            username,
            email,
            password: hashedPassword, // Utilisez le mot de passe haché
            nom, // Inclure le nom si vous l'avez ajouté au modèle User
            prenom, // Inclure le prénom si vous l'avez ajouté au modèle User
            level, // Tableau de niveaux (ex: ['Licence1'])
            role, // 'student' ou 'tutor'
            // Champs spécifiques aux tuteurs, définis seulement si le rôle est 'tutor'
            bio: role === 'tutor' ? (bio || '') : undefined, // Assurez-vous que bio n'est pas envoyé si pas tuteur
            subjects: role === 'tutor' ? validSubjectIds : undefined // Assurez-vous que subjects n'est pas envoyé si pas tuteur
        });

        // 6. Sauvegarder l'utilisateur dans la base de données
        await user.save();

        // 7. Générer un JWT pour l'utilisateur fraîchement inscrit
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'supersecretjwtkey', // Utilisez votre secret JWT défini dans .env
            { expiresIn: '1h' }, // Le token expire en 1 heure
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token, msg: 'Inscription réussie.' }); // 201 Created
            }
        );

    } catch (err) {
        console.error(err.message);
        // Gérer les erreurs de validation Mongoose si nécessaire (ex: si 'level' n'est pas dans l'enum)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Erreur du serveur lors de l\'inscription.');
    }
};

// Fonction de connexion (Login) - Pas de changements majeurs ici
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Vérifier si l'utilisateur existe par email (ou username si vous le souhaitez)
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Identifiants invalides.' });
        }

        // 2. Comparer le mot de passe fourni avec le mot de passe haché
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Identifiants invalides.' });
        }

        // 3. Générer un JWT si les identifiants sont valides
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'supersecretjwtkey',
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, msg: 'Connexion réussie.' });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur lors de la connexion.');
    }
};