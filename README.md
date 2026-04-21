# 💸 Mes Dettes — PWA

Suivi de dettes personnel. React + TypeScript + Supabase + Vite PWA.

---

## 🚀 Installation en 5 étapes

### 1. Supabase — créer le projet

1. Va sur [supabase.com](https://supabase.com) → **New project**
2. Donne un nom, choisis une région proche (Europe West)
3. Une fois créé : **SQL Editor** → **New Query**
4. Colle le contenu de `supabase/schema.sql` et clique **Run**
   - Ça crée les tables + insère tes données historiques ✓

### 2. Récupérer les clés Supabase

**Project Settings → API** :
- `Project URL` → copie
- `anon public` key → copie

### 3. Configurer l'environnement

```bash
cp .env.example .env.local
```

Édite `.env.local` :
```
VITE_SUPABASE_URL=https://XXXXXXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 4. Lancer en local

```bash
npm install
npm run dev
```

→ Ouvre http://localhost:5173

### 5. Déployer sur Vercel (accès tel + PC)

```bash
npm install -g vercel
vercel
```

Ou via l'interface :
1. Push le projet sur GitHub
2. [vercel.com](https://vercel.com) → **Import Project**
3. Ajoute les variables d'environnement (`VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`)
4. **Deploy** → t'as une URL accessible partout 🎉

---

## 📱 Installer comme app (PWA)

**Sur Android (Chrome)** : menu ⋮ → "Ajouter à l'écran d'accueil"

**Sur iOS (Safari)** : bouton partage → "Sur l'écran d'accueil"

**Sur PC (Chrome/Edge)** : icône d'installation dans la barre d'adresse

---

## 🗂️ Structure

```
src/
├── App.tsx              # Root, state, navigation
├── types.ts             # TypeScript interfaces
├── index.css            # Styles globaux
├── lib/
│   └── supabase.ts      # Client Supabase
└── components/
    ├── Dashboard.tsx    # Vue d'ensemble
    ├── PersonDetail.tsx # Transactions par personne
    └── AddForm.tsx      # Formulaire d'ajout
supabase/
└── schema.sql           # Schéma DB + données initiales
```

## ✨ Features

- 📊 Dashboard avec total + barre de progression
- 👤 Détail par personne (emprunts, remboursements, solde cumulé)
- ➕ Ajout de transactions (emprunt / remboursement)
- 👥 Ajout de nouvelles personnes
- 🗑️ Suppression de transactions
- ⚡ Mise à jour temps réel (Supabase Realtime)
- 📱 PWA installable sur téléphone et PC
- 💾 Données persistées en base PostgreSQL
