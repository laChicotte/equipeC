# Démonstration du parcours utilisateur — MentorConnect

Livrable n° 3 : démonstration du parcours utilisateur, illustrant la manière dont
la solution répond au besoin identifié. **Durée visée : 6 minutes.**

Fil conducteur : **Aïssatou**, étudiante en L3 informatique, prépare son dossier
Campus France. Elle trouve une mentore, échange avec elle, progresse, puis
témoigne. Autour d'elle : Fatoumata (mentore), Néné (mentorat terminé).

---

## Avant la présentation (la veille et 30 min avant)

| ✓ | Action |
|---|---|
| ☐ | `npm run seed` : remet les données de démonstration à zéro (la demande de Néné redevient « en attente », les séances sont recalculées à partir de la date du jour). ⚠️ Supprime puis recrée tous les comptes `@example.com`. |
| ☐ | Application lancée (`npm run dev` ou version déployée) et page d'accueil ouverte une première fois (les pages se compilent au premier affichage). |
| ☐ | **Fenêtre 1** (normale) : connectée avec `aissatou.demo@example.com`. |
| ☐ | **Fenêtre 2** (navigation privée) : connectée avec `fatoumata.demo@example.com`. |
| ☐ | Mot de passe : la valeur `DEMO_PASSWORD` de `.env.local` (ne pas l'afficher à l'écran). |
| ☐ | Zoom du navigateur à 100 % ou 90 %, notifications du système coupées. |
| ☐ | **Plan B** : captures d'écran ou courte vidéo du parcours, au cas où le réseau tomberait. |

---

## Déroulé minuté

| Temps | Écran | Ce que je montre | Ce que je dis |
|---|---|---|---|
| 0:00 | Page d'accueil | Les 6 publics, les domaines, la charte | « MentorConnect s'adresse aux six publics du programme. » |
| 0:30 | **Aïssatou** · Tableau de bord | Prochaine séance, progression, mentors recommandés avec leur score | « Dès la connexion, Aïssatou voit où elle en est et qui peut l'aider. » |
| 1:00 | Domaines → Orientation intelligente | Taper : *« Je veux faire un master en data en France »* → **M'orienter** | « Elle décrit son besoin en une phrase : la plateforme l'oriente, et explique pourquoi. » |
| 1:40 | Découvrir → fiche de **Fatoumata** | Score de compatibilité, « Pourquoi ce mentor pour vous ? », compétences, engagements, avis | « Chaque recommandation est justifiée : pas de boîte noire. » |
| 2:20 | Mentorat → mentorat avec Fatoumata | Écrire un message dans la **fenêtre 1** : il apparaît **en direct** dans la **fenêtre 2** | « Les échanges restent dans l'application. » |
| 2:50 | Même écran (ou onglet « Rendez-vous ») | Séance « Simulation d'entretien Campus France » et son bouton de visio ; cocher un objectif | « Séances en visio en un clic, objectifs suivis avec la mentore. » |
| 3:30 | **Fatoumata** (fenêtre 2) · Tableau de bord | Demande de Néné → **Accepter** | « Côté mentor : on accepte une demande, et la relation démarre. » |
| 4:00 | Ateliers | Aïssatou inscrite ; Fatoumata « Vous animez », prénoms des inscrits | « Les ateliers thématiques collectifs, à places limitées. » |
| 4:30 | Bibliothèque / Opportunités | Filtrer « Campus France » ; une opportunité de stage | « Les conseils et opportunités partagés par la communauté. » |
| 5:00 | Impact | Chiffres de la plateforme, témoignages de Néné et Mariama, les 7 étapes | « Et la restitution : ce que le programme a produit, en chiffres et en témoignages. » |
| 5:40 | — | Retour à la présentation (diapositive de conclusion) | « Voilà le parcours complet, de la première demande au bilan. » |

---

## Si le jury demande…

- **« C'est de l'IA ? »** : oui, une intelligence *explicable* : un score de
  compatibilité fondé sur des critères lisibles (domaines, objectifs, besoins,
  situation, avis). Chaque point produit une raison affichée. Aucune donnée n'est
  envoyée à un service externe. Un modèle de langage pourrait compléter
  l'orientation plus tard.
- **« Comment protégez-vous les jeunes ? »** : un mentoré n'est visible que par
  ses mentors ; les règles d'accès sont dans la base de données et vérifiées par
  65 tests automatisés (`npm run test:rls`) ; chat et visio dans l'application ;
  charte acceptée à l'inscription.
- **« Comment sont choisis les mentors ? »** : 3 ans d'expérience minimum,
  3 domaines au maximum, engagements de la charte, et notes des mentorés après
  chaque séance.
- **« Et Campus France ? »** : un domaine dédié, avec la mention que
  l'accompagnement ne garantit ni l'admission ni l'obtention d'un visa.
- **« Et après le hackathon ? »** : voir [PERENNISATION.md](PERENNISATION.md).

## Comptes de démonstration

| Compte | Rôle | Situation |
|---|---|---|
| `aissatou.demo@example.com` | Mentorée | Mentorat actif avec Fatoumata (séances, objectifs, chat) |
| `fatoumata.demo@example.com` | Mentore | Demande de Néné à accepter en direct ; anime un atelier |
| `nene.demo@example.com` | Mentorée | Mentorat terminé avec Mariama, bilan rédigé |
| `ibrahima.demo@example.com` | Mentoré | Porteur de projet, mentorat actif avec Alpha |
| `<prénom>.demo@example.com` | Mentors | Mamadou, Alpha, Kadiatou, Aminata, Mariama, Oumar… |
