# Solution pour pousser sur GitHub

## Le problème
Votre token semble ne pas avoir les permissions nécessaires pour pousser vers le repository.

## Solutions

### Solution 1 : Créer un nouveau token avec les bonnes permissions

1. Allez sur : https://github.com/settings/tokens/new
2. Donnez un nom au token (ex: "al-hidaya-push")
3. **IMPORTANT** : Cochez ces permissions :
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
4. Cliquez sur "Generate token"
5. Copiez le nouveau token

### Solution 2 : Utiliser GitHub Desktop (Plus simple)

1. Téléchargez GitHub Desktop : https://desktop.github.com/
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur "Add" > "Add Existing Repository"
4. Sélectionnez : `C:\Users\elhil\al-hidaya-platform`
5. Cliquez sur "Publish repository"

### Solution 3 : Via l'interface web GitHub

1. Allez sur : https://github.com/Anass7575/islamicsite
2. Cliquez sur "uploading an existing file"
3. Glissez-déposez tous les fichiers du projet

### Solution 4 : Commandes avec le nouveau token

Une fois que vous avez un nouveau token avec les bonnes permissions :

```bash
cd /mnt/c/Users/elhil/al-hidaya-platform

# Configurer le remote avec le nouveau token
git remote set-url origin https://Anass7575:VOTRE_NOUVEAU_TOKEN@github.com/Anass7575/islamicsite.git

# Pousser
git push -u origin main
```

## Vérification des permissions du token

Pour vérifier les permissions de votre token actuel :
https://github.com/settings/tokens

Assurez-vous qu'il a au minimum la permission `repo`.

## Alternative : Archive prête à uploader

J'ai créé une archive à : `C:\Users\elhil\al-hidaya-platform.tar.gz`

Vous pouvez l'extraire et l'uploader manuellement sur GitHub.