# Note de pérennisation — MentorConnect

Livrable n° 4 : pistes de développement, besoins d'accompagnement et conditions
de déploiement.
Hackathon « Le mentorat à l'ère du numérique » (programme « Talents connect »),
Salon international du livre de jeunesse de Conakry, Mois du Numérique, novembre 2026.

> Les éléments entre crochets `[…]` sont à compléter (montants, partenaires,
> dates). Aucun chiffre n'a été inventé dans ce document.

---

## 1. En résumé

MentorConnect met en relation des jeunes (étudiants, jeunes diplômés,
entrepreneurs, porteurs de projet, personnes en reconversion) avec des
professionnels expérimentés. La plateforme accompagne toute la relation : de
l'orientation au bilan final.

L'objectif après le Salon : **passer d'un prototype démontrable à un service
utilisé par une première promotion réelle**, puis l'étendre progressivement.

## 2. Où en est le prototype

**Ce qui fonctionne aujourd'hui :**
- **Profils et mise en relation** : profils mentors et mentorés, catalogue des
  7 domaines, recherche, orientation et recherche par IA (Claude, d'Anthropic,
  avec repli automatique sur un score explicable), recommandations expliquées,
  demande puis acceptation par le mentor.
- **Accompagnement** : chat en temps réel, visio intégrée à l'application pour
  les séances (appel direct entre les deux participants), ateliers collectifs en visio (Jitsi),
  objectifs et progression, ressources, opportunités.
- **Suivi et restitution** : évaluation des séances, bilans de fin de mentorat,
  page d'impact avec les chiffres réels de la plateforme.

**Côté technique :**
- Next.js 16 et Supabase (PostgreSQL, authentification, temps réel).
- Les règles d'accès sont appliquées dans la base de données et vérifiées par
  **65 tests de sécurité automatisés**, plus 19 tests du moteur de recommandation.

**Ce qui manque pour un usage réel :**
- notifications (e-mail, SMS) ;
- modération et signalement ;
- espace d'administration pour les organisateurs ;
- application mobile ;
- un mode adapté aux connexions faibles.

## 3. Pistes de développement

| Horizon | Priorités |
|---|---|
| **0 à 3 mois — pilote** | Déploiement en ligne · notifications par e-mail · signalement d'un comportement · espace administrateur (validation des mentors, suivi des mentorats) · pilote avec **[nombre]** mentors et **[nombre]** jeunes |
| **3 à 12 mois — consolidation** | Application mobile (ou version installable) · rappels par SMS · mode connexion faible · certificats de participation · statistiques pour les partenaires · extension à d'autres villes **[à préciser]** |
| **Au-delà** | Assistant d'orientation conversationnel (l'analyse par IA existe déjà), avec consentement explicite · serveur relais pour la visio sur les réseaux mobiles restrictifs · intégration aux dispositifs d'orientation et d'insertion existants · ouverture à la diaspora (mentors guinéens à l'étranger) |

## 4. Besoins d'accompagnement

| Besoin | Détail | Qui pourrait y répondre |
|---|---|---|
| **Perfectionnement de l'application** | Revue technique, sécurité, passage à l'échelle, accompagnement de l'équipe | **Efficience Globale**, partenaire prévu par les termes de référence (§8) pour l'équipe lauréate |
| **Mobilisation des mentors** | Recruter et fidéliser des professionnels des 7 domaines | IFG, CCFG, entreprises, ordres professionnels, associations d'anciens étudiants |
| **Animation de la communauté** | Un référent pour accueillir, relancer, organiser les ateliers | **[structure porteuse]** |
| **Hébergement et exploitation** | Hébergement, nom de domaine, sauvegardes, maintenance | Pilote : Vercel et Supabase (offres gratuites, déjà en service) ; ensuite **[partenaire technique]** |
| **Accompagnement juridique** | Protection des données personnelles, conditions d'utilisation, cadre pour les mineurs | **[conseil juridique]** |
| **Financement** | Budget de fonctionnement annuel : **[montant]** | Partenaires institutionnels, mécénat d'entreprises, subventions **[à préciser]** |

## 5. Conditions de déploiement

1. **Une structure porteuse identifiée.** Elle porte le service, la charte et la
   relation avec les mentors. Proposition : **l'IFG**, structure organisatrice du
   programme, **[à confirmer]**.
2. **Des mentors vérifiés.** Les critères (3 ans d'expérience minimum, charte)
   sont déjà appliqués par la plateforme. Une validation humaine des profils mentors est à ajouter.
3. **La protection des jeunes et de leurs données.**
   - Déjà en place : profils des mentorés invisibles hors de leurs relations,
     échanges et visio dans l'application (l'appel vidéo ne transite pas par nos serveurs).
   - Reste à définir avant l'ouverture au public :
     - l'âge minimum ou l'accord parental ;
     - les conditions d'utilisation ;
     - la conformité à la réglementation guinéenne sur les données personnelles.
4. **L'accessibilité.** Usage sur téléphone et connexions limitées : l'interface
   est déjà adaptée au mobile, et un mode allégé est prévu.
5. **Les coûts d'hébergement.** Les outils utilisés proposent des offres
   gratuites suffisantes pour un pilote. Des offres payantes seront nécessaires
   avec la croissance : **[estimation à établir selon le nombre d'utilisateurs]**.
6. **La gratuité pour les jeunes.** Le service reste gratuit pour les
   bénéficiaires. Le financement repose sur les partenaires.

## 6. Mesurer l'impact

La page « Impact » de la plateforme suit déjà, à partir de données réelles :
- **les participants** : nombre de mentors engagés et de jeunes accompagnés ;
- **l'activité** : mentorats démarrés, séances réalisées et ateliers animés ;
- **les résultats** : objectifs atteints et satisfaction moyenne des séances
  (note sur 5) ;
- **la restitution** : témoignages partagés en fin de mentorat.

Indicateurs à ajouter pour le pilote :
- le délai entre une demande et la première séance ;
- le taux de mentorats menés à leur terme ;
- l'insertion à 6 mois (emploi, formation, projet lancé), mesurée par enquête.

## 7. Risques et réponses

| Risque | Réponse |
|---|---|
| Pas assez de mentors disponibles | Partenariats de recrutement, ateliers collectifs (un mentor pour plusieurs jeunes), reconnaissance des mentors |
| Relations qui s'essoufflent | Objectifs suivis, rappels, bilans de fin de mentorat |
| Comportement inapproprié | Charte, échanges dans l'application, signalement et modération (à développer) |
| Connexion Internet limitée | Version mobile légère, rappels par SMS |
| Dépendance à un seul porteur | Code documenté, déploiement reproductible, gouvernance partagée **[à définir]** |
