import type { ComponentType } from "react";
import {
  BriefcaseIcon,
  ChartIcon,
  CompassIcon,
  FeatherIcon,
  LaptopIcon,
  PlaneIcon,
  RocketIcon,
  SparkleIcon,
  SproutIcon,
} from "@/components/ui/icons";

/** Pictogrammes des domaines (icônes au trait, à la place des emojis). */
const DOMAIN_ICON_COMPONENTS: Record<string, ComponentType<{ className?: string }>> = {
  entrepreneuriat: RocketIcon,
  numerique: LaptopIcon,
  "orientation-insertion": CompassIcon,
  "culture-creation": FeatherIcon,
  "gestion-finance": ChartIcon,
  "developpement-personnel": SproutIcon,
  "campus-france": PlaneIcon,
  emploi: BriefcaseIcon,
};

export function DomainIcon({ slug, className = "size-5" }: { slug: string; className?: string }) {
  const Icon = DOMAIN_ICON_COMPONENTS[slug] ?? SparkleIcon;
  return <Icon className={className} />;
}
