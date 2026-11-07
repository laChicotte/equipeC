# MentorConnect

Plateforme de mentorat qui met en relation des jeunes (étudiants, jeunes diplômés,
entrepreneurs, porteurs de projet, personnes en reconversion) avec des professionnels
expérimentés, pour un accompagnement **par chat et en visio**.

Projet réalisé pour le hackathon d'innovation numérique « Talents connect » du Salon
international du livre de jeunesse de Conakry (Mois du Numérique, 4-7 novembre 2026).

## Fonctionnalités

| | |
|---|---|
| 👤 Profils mentors et mentorés | Domaines, expérience, situation, objectifs |
| 🔎 Catalogue | Filtre par domaine (dont Campus France), recherche sans accents |
| ✨ Recommandations | Recherche et orientation par **IA** (Claude, d'Anthropic) qui explique chaque choix ; repli automatique sur un score de compatibilité explicable (domaines, objectifs, situation, note) |
| 🤝 Mise en relation | Demande motivée, acceptation ou refus par le mentor |
| 💬 Chat temps réel | Supabase Realtime, rattrapage des messages après une coupure |
| 🎥 Séances en visio | Planification, visio intégrée à l'application (WebRTC, appel direct entre mentor et mentoré), salle Jitsi en secours |
| ⭐ Évaluations | Notes des séances, moyenne publique des mentors |
| 🎯 Objectifs | Suivi À faire / En cours / Fait, barre de progression |

## Stack technique

- **Next.js 16** (App Router, Server Components, Server Actions, `proxy.ts`), **TypeScript**, **Tailwind CSS 4**
- **Supabase** : authentification, PostgreSQL avec **Row Level Security** sur toutes les tables, Realtime
- **zod** pour la validation côté serveur

La sécurité repose sur trois niveaux : le proxy (redirections), une vérification dans chaque
Server Action, et surtout les **règles RLS de PostgreSQL**, testées automatiquement
(`npm run test:rls`).

## Démarrage

Prérequis : Node.js 20 ou plus, un projet Supabase (plan gratuit).

```bash
npm install
cp .env.example .env.local   # puis renseigner les valeurs (voir les commentaires)
npm run check:supabase       # vérifie la configuration, sans afficher les clés
```

Base de données : exécuter **une fois, dans l'ordre**, les fichiers de
`supabase/migrations/` dans Supabase (*SQL Editor → New query → Run*) :

1. `0001_init.sql` : tables, sécurité RLS, trigger, domaines
2. `0002_resources_opportunities.sql` : ressources et opportunités
3. `0003_cancel_and_public_reviews.sql` : annulation d'une demande, avis publics, ateliers
4. `0004_profile_skills.sql` : compétences (mentor) et besoins précis (mentoré) pour la mise en relation
5. `0005_workshops_and_impact.sql` : ateliers thématiques (inscriptions, visio) et restitution (bilans, impact)
6. `0006_avatars.sql` : photos de profil (stockage Supabase, 2 Mo maximum, chacun dans son dossier)
7. `0007_dual_roles.sql` : double rôle (une même personne peut être mentor ET mentorée, avec le même e-mail)

Puis désactiver *Confirm email* (*Authentication → Sign In / Providers → Email*).

```bash
npm run dev    # http://localhost:3000
```

## Données de démonstration

```bash
npm run seed
```

Crée 10 mentors et 3 mentorés **fictifs**, avec messages, séances, évaluations et objectifs.
Nécessite `SUPABASE_SECRET_KEY` et `DEMO_PASSWORD` dans `.env.local` (jamais dans Git).
⚠️ Supprime d'abord tous les comptes en `@example.com`.

| Compte | Rôle | Pour montrer |
|---|---|---|
| `aissatou.demo@example.com` | Mentorée | Mentorat actif : chat, séances, objectifs, avis |
| `fatoumata.demo@example.com` | Mentore | Une demande à accepter en direct |
| `ibrahima.demo@example.com` | Mentoré | Porteur de projet, demande en attente |
| `nene.demo@example.com` | Mentorée | Historique d'un mentorat terminé |

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm run start` | Version de production |
| `npm run lint` / `npm run typecheck` | Qualité du code |
| `npm test` | Tests unitaires (score de recommandation) |
| `npm run test:rls` | Tests de sécurité de la base (crée des comptes `@example.com`) |
| `npm run check:supabase` | Vérifie `.env.local` et la connexion |
| `npm run seed` | Recrée les données de démonstration |

## Organisation du code

```
src/
├── app/            Pages (App Router) : (auth) connexion, (app) zone connectée
├── components/     Interface réutilisable (ui/, layout/, shared/)
├── features/       Code métier par fonctionnalité : queries.ts (lecture),
│                   actions.ts (écriture, Server Actions), components/
├── lib/            Clients Supabase, dates (fuseau Africa/Conakry)
├── types/          Types du schéma de base de données
└── proxy.ts        Session et protection des pages
supabase/migrations Schéma SQL, règles RLS, triggers
scripts/            Vérification, tests de sécurité, données de démo
tests/              Tests unitaires
```

## Livrables du hackathon

- [Cahier des charges (TDR)](docs/CAHIER-DES-CHARGES.md) : termes de référence du programme « Talents connect » (domaines §5, fonctionnalités §7.2, livrables §11)
- [Démonstration du parcours utilisateur](docs/DEMO.md) : déroulé minuté et comptes de démonstration
- [Note de pérennisation](docs/PERENNISATION.md) : pistes de développement, besoins d'accompagnement, conditions de déploiement
