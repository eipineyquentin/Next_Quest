# Next Quest – Site statique

Ce dossier contient un site statique complet pour la plateforme **Next Quest**. Il inclut des pages pour les étudiants, les entreprises, les particuliers, les offres, la publication d'offres, un formulaire de contact, une politique de confidentialité et un formulaire de signalement de problèmes. L'identité visuelle repose sur des nuances de bleu et le logo fourni.

## Lancement local avec VS Code

1. **Ouvrez le dossier** dans Visual Studio Code.
2. Installez l'extension **Live Server** recommandée dans `.vscode/extensions.json`.
3. Lancez Live Server sur `index.html` pour visualiser le site avec rechargement automatique.

## Structure du projet

- `index.html` : page d'accueil avec hero, valeurs et CTA.
- `etudiants.html`, `entreprises.html`, `particuliers.html` : pages spécifiques avec sections connectées/non connectées.
- `offres.html` : liste de quelques offres avec description.
- `proposer.html` : formulaire pour publier une nouvelle offre.
- `contact.html` : formulaire de contact.
- `confidentialite.html` : texte de politique de confidentialité.
- `bug.html` : formulaire de signalement d'un problème.
- `assets/css/styles.css` : styles globaux.
- `assets/js/main.js` : scripts pour le modal de connexion/inscription et la simulation d'authentification (stockée dans `localStorage`).
- `assets/img/logo-nextquest.png` : logo fourni.
- `.vscode/extensions.json` : extensions recommandées pour VS Code.
- `Dockerfile` & `nginx.conf` : configuration pour servir le site via un container Docker.

## Fonctionnalités

- Header collant avec navigation et icône de compte (ouverture d'un modal pour se connecter/s'inscrire).
- Plusieurs menus : Accueil, Étudiants, Entreprises, Particuliers, Offres.
- Pages pour chaque type d'utilisateur avec deux états : non connecté et connecté (simplifiés pour la démonstration).
- Mise en page responsive et design moderne respectant la palette de couleurs bleu.
- Pied de page avec liens vers la politique de confidentialité, le formulaire de contact et la page pour signaler un problème.
- Formulaires de contact, d'inscription et de signalement.

Pour une intégration complète avec une base de données ou un backend, ajoutez la logique côté serveur et des API pour enregistrer les données.
