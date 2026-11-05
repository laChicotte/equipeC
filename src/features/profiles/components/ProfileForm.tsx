"use client";

import { useActionState, useState, type ComponentProps, type ReactNode } from "react";
import { saveProfile, type ProfileFormState } from "../actions";
import { DOMAIN_SHORT_LABELS, MENTEE_STATUS_LABELS } from "../labels";
import { MAX_MENTOR_DOMAINS, MIN_MENTOR_YEARS, PROFILE_FORM_ID } from "../constants";
import type { Domain, MenteeStatus, Profile } from "@/types/database";

const initialState: ProfileFormState = {};

const MAX_SKILLS = 10;

/** Icônes des 6 publics du cahier des charges (§2.3). */
const STATUS_ICONS: Record<MenteeStatus, string> = {
  etudiant: "🎓",
  jeune_diplome: "📄",
  entrepreneur: "🚀",
  porteur_projet: "💡",
  reconversion: "🔄",
  autre: "🌱",
};

/** Suggestions rapides (un clic pour ajouter). */
const SKILL_SUGGESTIONS = {
  mentor: [
    "Business plan",
    "Recherche de financement",
    "Lettre de motivation",
    "Préparation d'entretien",
    "Prise de parole",
    "Développement web",
  ],
  mentee: [
    "Lettre de motivation",
    "CV",
    "Business plan",
    "Trouver un financement",
    "Confiance en soi",
    "Choisir une formation",
  ],
};

// --- Petites icônes (traits fins, comme la maquette) --------------------------
function Icon({ children, className = "size-4" }: { children: ReactNode; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
const PinIcon = () => (
  <Icon>
    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
);
const MailIcon = () => (
  <Icon>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Icon>
);
const CalendarIcon = () => (
  <Icon>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Icon>
);
const BriefcaseIcon = () => (
  <Icon>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </Icon>
);
const BulbIcon = () => (
  <Icon>
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />
  </Icon>
);
const CloudIcon = () => (
  <Icon className="size-5">
    <path d="M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 9.5a4 4 0 0 1-.5 8.5H7Z" />
    <path d="m9.5 13 2.5-2.5 2.5 2.5M12 10.5V16" />
  </Icon>
);

// --- Mise en page ------------------------------------------------------------
/** Section numérotée : pastille 01/02…, titre et explication à gauche, champs à droite. */
function Section({
  id,
  number,
  title,
  description,
  children,
}: {
  id: string;
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="grid scroll-mt-24 gap-6 rounded-3xl border border-zinc-100 bg-white p-6 shadow-[0_1px_3px_rgba(23,43,69,0.04)] sm:p-8 lg:grid-cols-[16rem_1fr] lg:gap-12"
    >
      <div>
        <span className="inline-flex size-9 items-center justify-center rounded-lg border border-zinc-200 text-xs font-semibold text-ink-500">
          {number}
        </span>
        <h2 className="mt-4 text-xl font-bold">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">{description}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-5">{children}</div>
    </section>
  );
}

const inputClasses = (hasError: boolean, withIcon: boolean) =>
  `w-full rounded-xl border bg-background py-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-500/60 focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-100 read-only:cursor-default read-only:text-ink-500 read-only:focus:border-transparent read-only:focus:bg-background read-only:focus:ring-0 ${
    withIcon ? "pr-3.5 pl-10" : "px-3.5"
  } ${hasError ? "border-red-500" : "border-transparent"}`;

/** Libellé de champ, avec astérisque si obligatoire. */
function Label({ htmlFor, children, required }: { htmlFor: string; children: ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-900">
      {children}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
}

/** Champ texte « rempli » (fond gris clair), avec icône et aide facultatives. */
function TextInput({
  label,
  name,
  errors,
  hint,
  icon,
  required,
  ...props
}: Omit<ComponentProps<"input">, "name"> & {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
  icon?: ReactNode;
}) {
  const hasError = Boolean(errors?.length);
  const id = props.id ?? name;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-500">{icon}</span>}
        <input
          id={id}
          name={name}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={inputClasses(hasError, Boolean(icon))}
          {...props}
        />
      </div>
      {hasError ? (
        <p id={`${id}-error`} className="text-sm text-red-600">
          {errors!.join(" ")}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-ink-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Zone de texte avec compteur de caractères et conseil. */
function CountedTextArea({
  label,
  name,
  max,
  defaultValue,
  placeholder,
  errors,
  required,
  tip,
  rows = 6,
}: {
  label: string;
  name: string;
  max: number;
  defaultValue: string;
  placeholder?: string;
  errors?: string[];
  required?: boolean;
  tip?: string;
  rows?: number;
}) {
  const [length, setLength] = useState(defaultValue.length);
  const hasError = Boolean(errors?.length);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={name} required={required}>
          {label}
        </Label>
        <span className={`text-xs tabular-nums ${length > max ? "font-semibold text-red-600" : "text-ink-500"}`}>
          {length} / {max}
        </span>
      </div>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={(e) => setLength(e.target.value.length)}
        aria-invalid={hasError}
        className={`${inputClasses(hasError, false)} leading-relaxed`}
      />
      {hasError && <p className="text-sm text-red-600">{errors!.join(" ")}</p>}
      {tip && !hasError && (
        <p className="flex items-center gap-2 text-xs text-brand-700">
          <BulbIcon /> {tip}
        </p>
      )}
    </div>
  );
}

/**
 * Compétences (mentor) ou besoins précis (mentoré) : étiquettes libres.
 * Chaque étiquette est envoyée au serveur dans un champ caché `skills`.
 */
function SkillsInput({
  initial,
  isMentor,
  errors,
  onChange,
}: {
  initial: string[];
  isMentor: boolean;
  errors?: string[];
  onChange: () => void;
}) {
  const [skills, setSkills] = useState(initial);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function add(value: string) {
    const skill = value.trim().replace(/\s+/g, " ");
    if (skill.length < 2) return setMessage("2 caractères minimum.");
    if (skill.length > 40) return setMessage("40 caractères maximum.");
    if (skills.some((s) => s.toLowerCase() === skill.toLowerCase())) return setMessage("Déjà dans la liste.");
    if (skills.length >= MAX_SKILLS) return setMessage(`${MAX_SKILLS} éléments maximum.`);
    setSkills([...skills, skill]);
    setDraft("");
    setMessage(null);
    onChange();
  }

  function remove(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
    onChange();
  }

  const suggestions = SKILL_SUGGESTIONS[isMentor ? "mentor" : "mentee"].filter(
    (s) => !skills.some((k) => k.toLowerCase() === s.toLowerCase()),
  );
  const label = isMentor ? "Compétences précises" : "Besoins précis";

  return (
    <div className="flex flex-col gap-3 border-t border-zinc-100 pt-5">
      <div>
        <p className="text-sm font-semibold text-ink-900">{label}</p>
        <p className="text-xs text-ink-500">
          {isMentor
            ? "Ce que vous savez transmettre : elles sont rapprochées des besoins des mentorés."
            : "Ce sur quoi vous voulez être aidé(e) : nous les rapprochons des compétences des mentors."}
        </p>
      </div>

      {skills.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={label}>
          {skills.map((skill) => (
            <li key={skill} className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1.5 pr-1.5 pl-3.5 text-sm font-medium text-brand-800 ring-1 ring-brand-100 ring-inset">
              {skill}
              <input type="hidden" name="skills" value={skill} />
              <button
                type="button"
                onClick={() => remove(skill)}
                aria-label={`Retirer « ${skill} »`}
                className="inline-flex size-6 items-center justify-center rounded-full text-brand-700 hover:bg-brand-100"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-background p-1.5 pl-3.5 focus-within:ring-2 focus-within:ring-brand-100">
          <label htmlFor="skill-draft" className="sr-only">
            Ajouter {isMentor ? "une compétence" : "un besoin"}
          </label>
          <input
            id="skill-draft"
            value={draft}
            maxLength={40}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Entrée ajoute l'étiquette au lieu d'envoyer le formulaire
              if (e.key === "Enter") {
                e.preventDefault();
                add(draft);
              }
            }}
            placeholder={isMentor ? "Ajouter une compétence (ex. Business plan)…" : "Ajouter un besoin (ex. Lettre de motivation)…"}
            className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-ink-500/60"
          />
          <button
            type="button"
            onClick={() => add(draft)}
            disabled={!draft.trim()}
            className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            Ajouter
          </button>
        </div>
        <span className="text-xs text-ink-500">
          {skills.length}/{MAX_SKILLS} · 3 conseillés
        </span>
      </div>
      {message && (
        <p role="status" className="text-xs text-red-600">
          {message}
        </p>
      )}
      {errors && <p className="text-sm text-red-600">{errors.join(" ")}</p>}

      {suggestions.length > 0 && skills.length < MAX_SKILLS && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-500">Suggestions :</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-full border border-dashed border-zinc-300 px-3 py-1 text-xs text-ink-700 transition-colors hover:border-brand-600 hover:text-brand-700"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Formulaire ----------------------------------------------------------------
type Props = {
  profile: Profile;
  domains: Domain[];
  selectedDomainIds: number[];
  mode: "onboarding" | "edit";
  /** Adresse du compte (lecture seule, jamais affichée aux autres membres) */
  email?: string | null;
  /** Sections en lecture seule ajoutées avant la barre d'enregistrement (ex. avis) */
  extra?: ReactNode;
};

export function ProfileForm({ profile, domains, selectedDomainIds, mode, email, extra }: Props) {
  const [state, formAction, pending] = useActionState(saveProfile, initialState);
  const [dirty, setDirty] = useState(false);
  // Changer la clé recrée les champs avec leurs valeurs enregistrées (« Annuler »)
  const [version, setVersion] = useState(0);
  const errors = state.fieldErrors ?? {};
  const isMentor = profile.role === "mentor";
  const markDirty = () => setDirty(true);

  function cancel() {
    setVersion((v) => v + 1);
    setDirty(false);
  }

  return (
    <form
      id={PROFILE_FORM_ID}
      action={(formData) => {
        setDirty(false);
        formAction(formData);
      }}
      onChange={markDirty}
      className="flex flex-col gap-6"
      noValidate
    >
      <input type="hidden" name="mode" value={mode} />

      <div key={version} className="flex flex-col gap-6">
        <Section
          id="section-identite"
          number="01"
          title={isMentor ? "Identité & statut" : "Identité"}
          description={
            isMentor
              ? "Les informations visibles par les mentorés dans le catalogue des mentors."
              : "Visible uniquement par vous et par vos mentors."
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput label="Nom complet" name="full_name" defaultValue={profile.full_name} errors={errors.full_name} required />
            <TextInput
              label="Ville"
              name="city"
              icon={<PinIcon />}
              placeholder="ex. Conakry"
              defaultValue={profile.city ?? ""}
              errors={errors.city}
            />
          </div>
          <TextInput
            label="Titre court"
            name="headline"
            placeholder={isMentor ? "ex. Experte en marketing digital" : "ex. Étudiante en informatique"}
            defaultValue={profile.headline ?? ""}
            errors={errors.headline}
            hint={
              isMentor
                ? "Ce titre apparaît sur votre fiche et dans les résultats de recherche."
                : "Une phrase qui vous résume, lue par votre futur mentor."
            }
          />
          {isMentor && (
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput label="Poste actuel" name="job_title" defaultValue={profile.job_title ?? ""} errors={errors.job_title} required />
              <TextInput label="Organisation" name="organization" defaultValue={profile.organization ?? ""} errors={errors.organization} />
            </div>
          )}
          {email && (
            <TextInput
              label="Courriel du compte"
              name="account_email"
              id="account_email"
              icon={<MailIcon />}
              value={email}
              readOnly
              hint="Visible uniquement par vous : les échanges passent par la messagerie de la plateforme."
            />
          )}
        </Section>

        {isMentor ? (
          <Section
            id="section-cadre"
            number="02"
            title="Disponibilités & cadre"
            description="Précisez votre expérience et vos créneaux, et indiquez si vous acceptez de nouveaux mentorés."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput
                label="Années d'expérience"
                name="years_experience"
                type="number"
                min={MIN_MENTOR_YEARS}
                max={60}
                inputMode="numeric"
                icon={<BriefcaseIcon />}
                defaultValue={profile.years_experience ?? ""}
                errors={errors.years_experience}
                hint={`${MIN_MENTOR_YEARS} ans minimum : le programme mobilise des professionnels expérimentés.`}
                required
              />
              <TextInput
                label="Créneaux préférentiels"
                name="availability"
                icon={<CalendarIcon />}
                placeholder="ex. Mardi et jeudi soir (18h–20h)"
                defaultValue={profile.availability ?? ""}
                errors={errors.availability}
              />
            </div>

            {/* Interrupteur de disponibilité (case à cocher stylée) */}
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-zinc-100 bg-background p-5">
              <span>
                <span className="flex flex-wrap items-center gap-2 font-semibold">
                  Accepter de nouvelles demandes de mentorat
                  <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-800">Recommandé</span>
                </span>
                <span className="mt-1 block text-sm text-ink-500">
                  Activé, votre profil apparaît dans le catalogue et dans les recommandations des mentorés.
                </span>
              </span>
              <input type="checkbox" name="is_available" defaultChecked={profile.is_available} className="peer sr-only" />
              <span
                aria-hidden
                className="relative h-7 w-12 shrink-0 rounded-full bg-zinc-300 transition-colors peer-checked:bg-brand-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600 after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
              />
            </label>
          </Section>
        ) : (
          <Section
            id="section-cadre"
            number="02"
            title="Votre situation"
            description="Elle nous aide à vous recommander les mentors les plus adaptés."
          >
            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-ink-900">
                Vous êtes… <span className="text-red-500">*</span>
              </legend>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {(Object.keys(MENTEE_STATUS_LABELS) as MenteeStatus[]).map((status) => (
                  <label key={status} className="cursor-pointer">
                    <input
                      type="radio"
                      name="mentee_status"
                      value={status}
                      defaultChecked={profile.mentee_status === status}
                      className="peer sr-only"
                    />
                    <span className="flex h-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm transition-colors peer-checked:border-ink-900 peer-checked:bg-ink-900 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-brand-600">
                      <span aria-hidden className="text-xl">{STATUS_ICONS[status]}</span>
                      <span className="font-medium">{MENTEE_STATUS_LABELS[status]}</span>
                    </span>
                  </label>
                ))}
              </div>
              {errors.mentee_status && <p className="mt-2 text-sm text-red-600">{errors.mentee_status.join(" ")}</p>}
            </fieldset>
            <CountedTextArea
              label="Vos objectifs"
              name="goals_summary"
              max={1000}
              rows={4}
              required
              placeholder="ex. Préparer mon dossier Campus France et trouver une formation en data."
              defaultValue={profile.goals_summary ?? ""}
              errors={errors.goals_summary}
              tip="Des objectifs précis donnent de meilleures recommandations."
            />
          </Section>
        )}

        <Section
          id="section-expertises"
          number="03"
          title={isMentor ? "Champs d'expertise" : "Centres d'intérêt & besoins"}
          description={
            isMentor
              ? `Les domaines que vous maîtrisez vraiment (1 à ${MAX_MENTOR_DOMAINS}) et les compétences que vous pouvez transmettre.`
              : "Les domaines et besoins précis sur lesquels vous cherchez un accompagnement. Au moins un domaine."
          }
        >
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-ink-900">
              Domaines <span className="text-red-500">*</span>
            </legend>
            <div className="flex flex-wrap gap-2.5">
              {domains.map((domain) => (
                <label key={domain.id} className="group cursor-pointer" title={domain.description ?? domain.name}>
                  <input
                    type="checkbox"
                    name="domain_ids"
                    value={domain.id}
                    defaultChecked={selectedDomainIds.includes(domain.id)}
                    className="peer sr-only"
                  />
                  <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-ink-700 transition-colors peer-checked:border-ink-900 peer-checked:bg-ink-900 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-brand-600">
                    {DOMAIN_SHORT_LABELS[domain.slug] ?? domain.name}
                    <span aria-hidden className="text-ink-500 group-has-checked:hidden">+</span>
                    <span aria-hidden className="hidden group-has-checked:inline">✓</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.domain_ids && <p className="mt-3 text-sm text-red-600">{errors.domain_ids.join(" ")}</p>}
          </fieldset>

          <SkillsInput initial={profile.skills} isMentor={isMentor} errors={errors.skills} onChange={markDirty} />
        </Section>

        <Section
          id="section-parcours"
          number="04"
          title={isMentor ? "Votre parcours" : "Présentez-vous"}
          description={
            isMentor
              ? "Racontez votre expérience, vos réalisations et votre méthode pour faire grandir vos mentorés."
              : "Quelques lignes pour que votre futur mentor vous connaisse."
          }
        >
          <CountedTextArea
            label={isMentor ? "Présentation & biographie professionnelle" : "Présentation"}
            name="bio"
            max={2000}
            placeholder={
              isMentor
                ? "ex. Après 10 ans dans la finance, j'accompagne les jeunes entrepreneurs à structurer leur projet…"
                : "ex. Passionnée de données, je termine ma licence et je veux poursuivre en master…"
            }
            defaultValue={profile.bio ?? ""}
            errors={errors.bio}
            tip={
              isMentor
                ? "Conseil : détaillez au moins un cas concret de réussite ou un défi surmonté."
                : "Conseil : parlez de votre parcours et de ce qui vous motive."
            }
          />
        </Section>
      </div>

      {extra}

      {/* Barre d'enregistrement, toujours visible en bas de l'écran */}
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-zinc-100 bg-white/95 p-3 pl-5 shadow-[0_10px_40px_-10px_rgba(23,43,69,0.3)] backdrop-blur">
        <p role={state.error ? "alert" : "status"} className="flex min-w-0 flex-1 items-center gap-2.5 text-sm font-medium">
          {state.error && !dirty ? (
            <>
              <span aria-hidden className="size-2 shrink-0 rounded-full bg-red-500" />
              <span className="text-red-600">{state.error}</span>
            </>
          ) : dirty ? (
            <>
              <span aria-hidden className="size-2 shrink-0 rounded-full bg-accent-500" />
              Modifications en attente d&apos;enregistrement
            </>
          ) : state.success ? (
            <>
              <span aria-hidden className="size-2 shrink-0 rounded-full bg-brand-600" />
              <span className="text-brand-700">✓ {state.success}</span>
            </>
          ) : (
            <>
              <span aria-hidden className="size-2 shrink-0 rounded-full bg-brand-600" />
              Profil à jour
            </>
          )}
        </p>
        <p className="hidden text-xs text-ink-500 md:block">Les champs marqués d&apos;un astérisque (*) sont requis.</p>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={cancel}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-ink-500 transition-colors hover:bg-zinc-100 hover:text-ink-900"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-800 disabled:opacity-60"
          >
            <CloudIcon />
            {pending ? "Enregistrement…" : mode === "onboarding" ? "Terminer mon profil →" : "Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </form>
  );
}
