# Instructions pour pousser sur GitHub

## Option 1 : Avec un Token (Recommandé)

1. Créez un token sur : https://github.com/settings/tokens
2. Exécutez ces commandes en remplaçant YOUR_USERNAME et YOUR_TOKEN :

```bash
cd /mnt/c/Users/elhil/al-hidaya-platform

# Configurer le remote avec vos identifiants
git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/Anass7575/islamicsite.git

# Pousser le code
git push -u origin main
```

## Option 2 : Avec l'invite de commande Windows

1. Ouvrez PowerShell ou CMD en tant qu'administrateur
2. Naviguez vers le dossier :
   ```
   cd C:\Users\elhil\al-hidaya-platform
   ```

3. Exécutez :
   ```
   git push -u origin main
   ```

4. Une fenêtre s'ouvrira pour vos identifiants GitHub

## Option 3 : Avec GitHub Desktop

1. Téléchargez GitHub Desktop : https://desktop.github.com/
2. Ajoutez le repository existant : C:\Users\elhil\al-hidaya-platform
3. Connectez-vous avec votre compte GitHub
4. Publiez le repository

## Vérification

Une fois poussé, vérifiez sur : https://github.com/Anass7575/islamicsite

## Problèmes courants

- **Erreur d'authentification** : Vérifiez que votre token a les permissions `repo`
- **Repository n'existe pas** : Créez d'abord le repository sur GitHub
- **Permissions refusées** : Vérifiez que vous êtes bien le propriétaire du repository Anass7575/islamicsite