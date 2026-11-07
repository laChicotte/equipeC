import type { ReactNode } from "react";
import type { OpportunityView } from "../queries";
import { deleteOpportunity } from "../actions";
import { ApplicationForm } from "./ApplicationForm";
import { OPPORTUNITY_KIND_LABELS } from "@/features/profiles/labels";
import type { OpportunityKind } from "@/types/database";
import {
  ActionRow,
  FormSwap,
  OpenFormButton,
} from "@/components/ui/DialogForm";
import { BriefcaseIllustration } from "@/components/ui/illustrations";
import { buttonClasses } from "@/components/ui/Button";
import {
  CountPill,
  DetailCallout,
  DetailFact,
  DetailFacts,
  DetailFooter,
  DetailPill,
  FormRecap,
} from "@/components/ui/DetailParts";
import {
  BookOpenIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  ChartIcon,
  ExternalLinkIcon,
  GraduationIcon,
  LaptopIcon,
  MapPinIcon,
  PresentationIcon,
  SendIcon,
  StarIcon,
  TargetIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { formatDueDate, formatShortDate } from "@/lib/datetime";

export const KIND_ICONS: Record<
  OpportunityKind,
  (p: { className?: string }) => ReactNode
> = {
  stage: LaptopIcon,
  emploi: BriefcaseIcon,
  bourse: GraduationIcon,
  financement: ChartIcon,
  concours: StarIcon,
  formation: BookOpenIcon,
  evenement: CalendarIcon,
  atelier: PresentationIcon,
};

/**
 * Détail d'une opportunité (dans une <Modal headless size="xl">). Pour
 * postuler, le membre remplit d'abord un court formulaire (motivation +
 * contact) transmis à l'auteur de l'annonce.
 */
export function OpportunityDetail({
  o,
  userId,
}: {
  o: OpportunityView;
  userId: string | null;
}) {
  const kindUi = OPPORTUNITY_KIND_LABELS[o.kind];
  const KindIcon = KIND_ICONS[o.kind] ?? BriefcaseIcon;
  const isAuthor = o.author_id === userId;

  const externalLink = o.url && (
    <a
      href={o.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={buttonClasses("secondary", "py-3.5")}
    >
      <ExternalLinkIcon className="size-5" /> Voir l&apos;offre complète
    </a>
  );

  const deleteButton = (
    <form action={deleteOpportunity}>
      <input type="hidden" name="opportunity_id" value={o.id} />
      <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-red-600 transition-colors hover:border-red-200 hover:bg-red-50">
        <TrashIcon className="size-5" /> Supprimer
      </button>
    </form>
  );

  let action: ReactNode;
  let canApply = false;
  if (isAuthor) {
    action = (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {deleteButton}
        <CountPill icon={<UsersIcon />}>
          <strong className="text-ink-900">{o.applications.length}</strong>{" "}
          candidature{o.applications.length > 1 ? "s" : ""} reçue
          {o.applications.length > 1 ? "s" : ""}
        </CountPill>
      </div>
    );
  } else if (o.hasApplied) {
    action = (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DetailPill tone="brand">
          ✓ Candidature envoyée à{" "}
          {o.author?.full_name ?? "l'auteur de l'annonce"}
        </DetailPill>
        {externalLink}
      </div>
    );
  } else {
    canApply = true;
    action = (
      <ActionRow summary={externalLink || undefined}>
        <OpenFormButton
          label="Postuler"
          icon={<SendIcon className="size-5" />}
        />
      </ActionRow>
    );
  }

  const detail = (
    <div className="p-6 sm:p-8">
      <div className="flex gap-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3 pr-14 md:pr-0">
            <DetailPill icon={<KindIcon className="size-5" />}>
              {kindUi.label}
            </DetailPill>
            <DetailPill
              tone={o.closingSoon ? "red" : "slate"}
              icon={<CalendarIcon className="size-5" />}
            >
              {o.deadline
                ? `Jusqu'au ${formatDueDate(o.deadline)}`
                : "Sans date limite"}
            </DetailPill>
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight break-words text-ink-900 sm:text-3xl">
            {o.title}
          </h2>

          {(o.location || o.organization) && (
            <div className="mt-6">
              <DetailFacts>
                {o.location && (
                  <DetailFact
                    icon={<MapPinIcon />}
                    label="Lieu"
                    value={o.location}
                  />
                )}
                {o.organization && (
                  <DetailFact
                    icon={<BuildingIcon />}
                    label="Organisation"
                    value={o.organization}
                  />
                )}
              </DetailFacts>
            </div>
          )}
        </div>

        <div
          aria-hidden
          className="relative hidden w-64 shrink-0 items-center justify-center md:flex"
        >
          <svg viewBox="0 0 200 160" className="absolute inset-0 size-full">
            <path
              d="M40 30c35-30 100-25 135 5s30 85-5 110-110 20-140-10S5 60 40 30Z"
              className="fill-brand-50"
            />
          </svg>
          <BriefcaseIllustration className="relative h-36 w-40" />
        </div>
      </div>

      <div className="mt-6">
        <DetailCallout icon={<TargetIcon />} title="À propos de l'offre">
          {o.description}
        </DetailCallout>
      </div>

      <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-ink-700">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <UserIcon className="size-5" />
        </span>
        <span>
          Partagé par{" "}
          <strong className="text-ink-900">
            {o.author?.full_name ?? "un membre"}
          </strong>
        </span>
        <span aria-hidden className="text-ink-500">
          •
        </span>
        <span className="inline-flex items-center gap-2">
          <CalendarIcon className="size-5 text-brand-700" />{" "}
          {formatShortDate(o.created_at)}
        </span>
      </p>

      {isAuthor && o.applications.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-lg font-bold text-ink-900">
            Candidatures reçues
          </p>
          <ul className="flex flex-col gap-2">
            {o.applications.map((a) => (
              <li
                key={`${a.full_name}-${a.created_at}`}
                className="rounded-xl border border-slate-100 px-4 py-3 text-sm"
              >
                <p className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold text-ink-900">
                    {a.full_name}
                  </span>
                  <span className="text-xs text-ink-500">
                    {formatShortDate(a.created_at)}
                  </span>
                </p>
                <p className="mt-1 break-words whitespace-pre-line text-ink-700">
                  {a.motivation}
                </p>
                <p className="mt-2 font-medium break-all text-brand-800">
                  Contact : {a.contact}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <DetailFooter>{action}</DetailFooter>
    </div>
  );

  if (!canApply) return detail;
  return (
    <FormSwap
      eyebrow="Candidature"
      title="Votre candidature"
      intro={`Votre message et votre contact sont transmis à ${o.author?.full_name ?? "l'auteur de l'annonce"}, qui vous recontactera.`}
      recap={
        <FormRecap
          illustration={<BriefcaseIllustration className="h-24 w-28" />}
          pill={
            <DetailPill icon={<KindIcon className="size-5" />}>
              {kindUi.label}
            </DetailPill>
          }
          title={o.title}
          facts={[
            ...(o.organization
              ? [{ icon: <BuildingIcon />, text: o.organization }]
              : []),
            ...(o.location ? [{ icon: <MapPinIcon />, text: o.location }] : []),
            {
              icon: <CalendarIcon />,
              text: o.deadline
                ? `Jusqu'au ${formatDueDate(o.deadline)}`
                : "Sans date limite",
            },
          ]}
        />
      }
      form={<ApplicationForm opportunityId={o.id} />}
    >
      {detail}
    </FormSwap>
  );
}
