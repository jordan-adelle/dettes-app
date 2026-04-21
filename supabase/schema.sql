-- ============================================================
--  SCHÉMA — Mes Dettes
--  À coller dans : Supabase > SQL Editor > New Query
-- ============================================================

-- 1. Personnes
CREATE TABLE IF NOT EXISTS persons (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  color_bg   TEXT NOT NULL DEFAULT '#1c1c30',
  color_text TEXT NOT NULL DEFAULT '#a09bff',
  initials   TEXT NOT NULL DEFAULT '?',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id  UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('emprunt', 'remboursement')),
  amount     NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  motif      TEXT NOT NULL,
  date       DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_transactions_person ON transactions(person_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

-- ============================================================
--  RLS — désactivé (app mono-utilisateur, clé anon privée)
--  Si tu veux sécuriser quand même, active RLS et ajoute
--  une policy "allow all for anon"
-- ============================================================
ALTER TABLE persons      DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- ============================================================
--  DONNÉES INITIALES — Personnes
-- ============================================================
INSERT INTO persons (name, color_bg, color_text, initials) VALUES
  ('Mel',      '#2a1f6b', '#a09bff', 'ME'),
  ('Mémère',   '#1f3a2a', '#00e5a0', 'MM'),
  ('Jayson',   '#3a1f2a', '#ff6b9d', 'JA'),
  ('Kim',      '#3a2a1f', '#ffaa5c', 'KI'),
  ('Wilfried', '#1f2a3a', '#5cb8ff', 'WI')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
--  DONNÉES INITIALES — Transactions historiques
--  (remplace les UUIDs par ceux générés dans persons)
-- ============================================================
DO $$
DECLARE
  mel_id      UUID;
  memere_id   UUID;
  jayson_id   UUID;
  kim_id      UUID;
  wilfried_id UUID;
BEGIN
  SELECT id INTO mel_id      FROM persons WHERE name = 'Mel';
  SELECT id INTO memere_id   FROM persons WHERE name = 'Mémère';
  SELECT id INTO jayson_id   FROM persons WHERE name = 'Jayson';
  SELECT id INTO kim_id      FROM persons WHERE name = 'Kim';
  SELECT id INTO wilfried_id FROM persons WHERE name = 'Wilfried';

  -- Mel
  INSERT INTO transactions (person_id, type, amount, motif) VALUES
    (mel_id, 'emprunt', 20.00, 'Dépannage fourrière');

  -- Mémère
  INSERT INTO transactions (person_id, type, amount, motif) VALUES
    (memere_id, 'emprunt',       40.00,  'Autre'),
    (memere_id, 'emprunt',       38.00,  'Bolt'),
    (memere_id, 'emprunt',       50.00,  'Essence'),
    (memere_id, 'emprunt',       75.00,  'Bouffe etc'),
    (memere_id, 'emprunt',       30.00,  'Pour Augmentcode + forfait'),
    (memere_id, 'emprunt',       14.49,  'Forfait'),
    (memere_id, 'remboursement', 20.00,  'Espèce'),
    (memere_id, 'emprunt',       80.00,  'Dépanneuse'),
    (memere_id, 'emprunt',       86.99,  'Forfait'),
    (memere_id, 'emprunt',        8.50,  'Viande hachée'),
    (memere_id, 'remboursement', 100.00, 'Remboursement'),
    (memere_id, 'remboursement',  75.49, 'Remboursement'),
    (memere_id, 'emprunt',        8.50,  'Essai gratuit'),
    (memere_id, 'emprunt',       60.99,  'Contrôle technique'),
    (memere_id, 'emprunt',      103.63,  'Forfait Orange'),
    (memere_id, 'remboursement', 164.62, 'Remboursement');

  -- Jayson
  INSERT INTO transactions (person_id, type, amount, motif) VALUES
    (jayson_id, 'emprunt', 480.00, 'Autre'),
    (jayson_id, 'emprunt',  23.00, 'Le pingouin');

  -- Kim
  INSERT INTO transactions (person_id, type, amount, motif) VALUES
    (kim_id, 'emprunt', 3000.00, 'Prêt pour voiture'),
    (kim_id, 'emprunt',  157.50, 'Prêt pour jsp'),
    (kim_id, 'emprunt', 1000.00, 'Intérêts');

  -- Wilfried
  INSERT INTO transactions (person_id, type, amount, motif) VALUES
    (wilfried_id, 'emprunt', 1599.00, 'Prêt pour voiture');
END $$;
