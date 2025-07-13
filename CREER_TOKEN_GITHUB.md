# Guide : Créer un Token GitHub pour le projet Al-Hidaya

## 📋 Étapes détaillées

### 1. Ouvrir GitHub
- Connectez-vous à votre compte GitHub
- Allez sur : https://github.com/settings/tokens

### 2. Créer un nouveau token
- Cliquez sur **"Generate new token"**
- Choisissez **"Generate new token (classic)"**

### 3. Configuration du token

#### Nom du token
```
Note: al-hidaya-platform-push
```

#### Expiration
- Choisissez : **90 days** (ou "No expiration" si vous préférez)

#### Permissions à cocher ✅

**IMPORTANT : Cochez ces cases**

- ✅ **repo** (Full control of private repositories)
  - ✅ repo:status
  - ✅ repo_deployment
  - ✅ public_repo
  - ✅ repo:invite
  - ✅ security_events

- ✅ **workflow** (Update GitHub Action workflows)

- ✅ **write:packages** (Si vous voulez publier des packages)
  - ✅ read:packages

- ✅ **delete_repo** (Optionnel - si vous voulez pouvoir supprimer)

### 4. Générer le token
- Cliquez sur **"Generate token"** en bas
- **IMPORTANT** : Copiez immédiatement le token ! Vous ne le reverrez plus !

### 5. Utiliser le token

Une fois le token copié, revenez ici et exécutez :

```bash
cd /mnt/c/Users/elhil/al-hidaya-platform

# Remplacez VOTRE_TOKEN_ICI par le token que vous avez copié
git remote set-url origin https://Anass7575:VOTRE_TOKEN_ICI@github.com/Anass7575/islamicsite.git

# Pousser le code
git push -u origin main
```

## 🔒 Sécurité

- **Ne partagez jamais votre token**
- Stockez-le dans un gestionnaire de mots de passe
- Si compromis, révoquez-le immédiatement sur GitHub

## 🚨 Erreurs courantes

### "Permission denied"
→ Vérifiez que vous avez coché la permission **repo**

### "Repository not found"
→ Vérifiez que le repository existe : https://github.com/Anass7575/islamicsite

### "Invalid credentials"
→ Le token a peut-être expiré ou été mal copié

## 💡 Alternative : SSH

Si les tokens ne fonctionnent pas, configurez SSH :

1. Générez une clé SSH :
   ```bash
   ssh-keygen -t ed25519 -C "votre-email@example.com"
   ```

2. Ajoutez la clé publique sur GitHub :
   - https://github.com/settings/keys

3. Changez l'URL du remote :
   ```bash
   git remote set-url origin git@github.com:Anass7575/islamicsite.git
   ```

## 📱 Option facile : GitHub Desktop

1. Téléchargez : https://desktop.github.com/
2. Connectez-vous avec votre compte
3. Ajoutez le repository local
4. Cliquez sur "Publish"

---

**Besoin d'aide ?** Les tokens sont liés à votre compte, pas à un projet spécifique. Une fois créé avec les bonnes permissions, il fonctionnera pour tous vos repositories.