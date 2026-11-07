import Link from "next/link";
import type { ReactNode } from "react";
import type { WorkshopView } from "../queries";
import { WORKSHOP_LEVEL_LABELS } from "../constants";
import { WorkshopButton } from "./WorkshopButton";
import { WorkshopRegistrationForm } from "./WorkshopRegistrationForm";
import {
  ActionRow,
  FormSwap,
  OpenFormButton,
} from "@/components/ui/DialogForm";
import { WorkshopTopicArt } from "@/components/illustrations/TopicArt";
import { buttonClasses } from "@/components/ui/Button";
import {
  CheckList,
  CountPill,
  DetailCallout,
  DetailFact,
  DetailFacts,
  DetailFooter,
  DetailPill,
  FormRecap,
  splitBullets,
} from "@/components/ui/DetailParts";
import {
  BriefcaseIcon,
  CalendarIcon,
  ChartIcon,
  TargetIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  VideoIcon,
} from "@/components/ui/icons";
import { formatDay, formatTimeRange } from "@/lib/datetime";

/** Visuel de gauche : illustration sur fond vert avec la pastille « Atelier ». */
function WorkshopVisual({
  w,
  domainLabel,
}: {
  w: WorkshopView;
  domainLabel: string;
}) {
  return (
    <div className="relative hidden min-h-80 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200 md:block">
      <span className="absolute top-6 left-6 inline-flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm">
        <CalendarIcon className="size-5" /> Atelier
      </span>
      <div className="absolute inset-0 flex items-center justify-center">
        <WorkshopTopicArt
          text={`${w.title} ${w.description}`}
          slug={w.domain?.slug ?? null}
          className="h-56 w-64"
        />
      </div>
      <p className="absolute right-6 bottom-6 left-6 z-10 text-center text-sm font-semibold text-white">
        {domainLabel}
      </p>
      <svg
        aria-hidden
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-24 w-full"
      >
        <path d="M0 40c90 50 200 60 400 10v70H0Z" className="fill-brand-600" />
        <path d="M0 75c120 35 260 30 400-5v50H0Z" className="fill-brand-700" />
      </svg>
    </div>
  );
}

/**
 * Détail d'un atelier (dans une <Modal headless size="xl">) : visuel, infos
 * clés, programme, puis inscription via un formulaire (niveau + attentes).
 */
export function WorkshopDetail({
  w,
  domainLabel,
}: {
  w: WorkshopView;
  domainLabel: string;
}) {
  const full = w.registered >= w.capacity;
  const left = w.capacity - w.registered;
  const status =
    w.phase === "cancelled" ? (
      <DetailPill tone="red">Annulé</DetailPill>
    ) : w.phase === "live" ? (
      <DetailPill tone="dark">En cours</DetailPill>
    ) : w.phase === "past" ? (
      <DetailPill tone="slate">Terminé</DetailPill>
    ) : full ? (
      <DetailPill tone="slate">Complet</DetailPill>
    ) : (
      <DetailPill>
        {left} place{left > 1 ? "s" : ""} restante{left > 1 ? "s" : ""}
      </DetailPill>
    );
  const { body, bullets } = splitBullets(w.description);
  const countPill = (
    <CountPill icon={<UsersIcon />}>
      <strong className="text-ink-900">{w.registered}</strong> / {w.capacity}{" "}
      inscrits
    </CountPill>
  );

  let action: ReactNode;
  let canRegister = false;
  if (w.phase === "cancelled") {
    action = (
      <p className="text-sm font-medium text-red-600">
        Cet atelier a été annulé par son animateur.
      </p>
    );
  } else if (w.phase === "past") {
    action = <p className="text-sm text-ink-500">Atelier terminé.</p>;
  } else {
    const visio =
      w.meetingUrl &&
      (w.phase === "live" ? (
        <a
          href={w.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("primary", "py-3.5 text-base")}
        >
          <VideoIcon className="size-5" /> Rejoindre la visio
        </a>
      ) : (
        <span className="text-xs text-ink-500">
          Lien de visio actif 15 min avant le début
        </span>
      ));
    if (w.isHost || w.isRegistered) {
      action = (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {countPill}
          <div className="flex flex-wrap items-center justify-end gap-3">
            {w.isRegistered && (
              <DetailPill tone="brand">✓ Vous êtes inscrit(e)</DetailPill>
            )}
            {visio}
            {w.isHost ? (
              <WorkshopButton workshopId={w.id} kind="cancel" />
            ) : (
              w.phase === "upcoming" && (
                <WorkshopButton workshopId={w.id} kind="unregister" />
              )
            )}
          </div>
        </div>
      );
    } else if (full || w.phase === "live") {
      action = (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {countPill}
          <DetailPill tone="slate">
            {full ? "Atelier complet" : "Inscriptions closes"}
          </DetailPill>
        </div>
      );
    } else {
      canRegister = true;
      action = (
        <ActionRow summary={countPill}>
          <OpenFormButton
            label="S'inscrire"
            icon={<UserPlusIcon className="size-5" />}
          />
        </ActionRow>
      );
    }
  }

  const detail = (
    <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[2fr_3fr]">
      <WorkshopVisual w={w} domainLabel={domainLabel} />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3 pr-14">
          {status}
          <DetailPill icon={<UsersIcon className="size-5" />}>
            {domainLabel}
          </DetailPill>
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight break-words text-ink-900 sm:text-3xl">
          {w.title}
        </h2>

        <div className="mt-6">
          <DetailFacts>
            <DetailFact
              icon={<CalendarIcon />}
              value={
                <span className="first-letter:uppercase">
                  {formatDay(w.scheduled_at)}
                </span>
              }
              sub={formatTimeRange(w.scheduled_at, w.duration_min)}
            />
            {w.host && (
              <DetailFact
                icon={<UserIcon />}
                label="Animé par"
                value={
                  <Link
                    href={`/mentors/${w.host.id}`}
                    className="hover:text-brand-700"
                  >
                    {w.host.full_name}
                  </Link>
                }
              />
            )}
            {w.host?.job_title && (
              <DetailFact icon={<BriefcaseIcon />} value={w.host.job_title} />
            )}
          </DetailFacts>
        </div>

        {body && (
          <div className="mt-6">
            <DetailCallout icon={<TargetIcon />} title="Programme de l'atelier">
              {body}
            </DetailCallout>
          </div>
        )}

        {bullets.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 flex items-center gap-2.5 text-lg font-bold text-ink-900">
              <ChartIcon className="size-6 text-brand-700" /> Ce que vous allez
              apprendre
            </p>
            <CheckList items={bullets} />
          </div>
        )}

        {w.isHost && w.participants.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 text-lg font-bold text-ink-900">Vos inscrits</p>
            <ul className="flex flex-col gap-2">
              {w.participants.map((p, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-slate-100 px-4 py-3 text-sm"
                >
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-ink-900">
                    {p.first_name}
                    {p.level && (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-800">
                        {WORKSHOP_LEVEL_LABELS[p.level] ?? p.level}
                      </span>
                    )}
                  </p>
                  {p.expectations && (
                    <p className="mt-1 whitespace-pre-line text-ink-500">
                      {p.expectations}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <DetailFooter>{action}</DetailFooter>
      </div>
    </div>
  );

  if (!canRegister) return detail;
  return (
    <FormSwap
      eyebrow="Inscription à l'atelier"
      title="Votre inscription"
      intro={`Ces informations sont transmises à ${w.host?.full_name ?? "l'animateur"} pour adapter l'atelier aux participants.`}
      recap={
        <FormRecap
          illustration={
            <WorkshopTopicArt
              text={`${w.title} ${w.description}`}
              slug={w.domain?.slug ?? null}
              className="h-28 w-36"
            />
          }
          pill={status}
          title={w.title}
          facts={[
            {
              icon: <CalendarIcon />,
              text: (
                <span className="first-letter:uppercase">
                  {formatDay(w.scheduled_at)} ·{" "}
                  {formatTimeRange(w.scheduled_at, w.duration_min)}
                </span>
              ),
            },
            ...(w.host
              ? [
                  {
                    icon: <UserIcon />,
                    text: <>Animé par {w.host.full_name}</>,
                  },
                ]
              : []),
            { icon: <UsersIcon />, text: domainLabel },
          ]}
        />
      }
      form={<WorkshopRegistrationForm workshopId={w.id} />}
    >
      {detail}
    </FormSwap>
  );
}
