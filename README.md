# Soutiens-moi : Backend API

Ce dépôt contient le code source de l'API Backend de la plateforme "Soutiens-moi". Il gère la logique métier, l'authentification des utilisateurs et la communication avec la base de données. Il est conçu pour être une API RESTful et est déployé en tant que fonction serverless sur **Vercel**.

## Technologies Utilisées

* **Node.js**
* **Express.js**
* **MongoDB Atlas**
* **Mongoose**
* **`dotenv`**
* **`cors`**
* **`jsonwebtoken`**

## Démarrage Local

### Prérequis
* Node.js, npm, Git
* Compte MongoDB Atlas avec URL de connexion.

### Configuration
1.  Cloner le dépôt: `git clone https://github.com/votre_utilisateur/soutiens-moi-backend.git && cd soutiens-moi-backend`
2.  Installer les dépendances: `npm install`
3.  Créer un fichier `.env` à la racine avec:
    ```env
    PORT=5000
    MONGODB_URI=mongodb+srv://<votre_nom_utilisateur_mongodb>:<votre_mot_de_passe_mongodb>@cluster0.pcuknou.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
    JWT_SECRET=votre_clé_secrète_jwt_très_longue_et_aléatoire
    ```
4.  Sur MongoDB Atlas, dans **Network Access**, ajouter une règle IP pour `0.0.0.0/0`.

### Lancer le serveur
```bash
npm start

Déploiement sur Vercel
Ce backend est optimisé pour être déployé sur Vercel.

Variables d'environnement pour Vercel
Sur Vercel, pour le projet soutiens-moi-backend, aller dans Settings > Environment Variables.
Ajouter les variables: MONGODB_URI et JWT_SECRET avec leurs valeurs exactes.
Fichier vercel.json
S'assurer que vercel.json à la racine du dépôt est configuré ainsi pour le déploiement Vercel:
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
