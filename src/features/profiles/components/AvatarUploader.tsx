"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { setAvatar } from "../actions";
import { Avatar } from "@/components/ui/Avatar";

const MAX_BYTES = 2 * 1024 * 1024; // 2 Mo : limite du stockage (migration 0006)
const SIDE = 512; // photo recadrée en carré de 512 px

/** Recadre l'image au centre en carré et la convertit en JPEG (fichier léger). */
async function toSquareJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = SIDE;
  canvas.height = SIDE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIDE, SIDE);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob"))), "image/jpeg", 0.86),
  );
}

/**
 * Photo de profil : choisir, recadrer, déposer dans avatars/<id>/, enregistrer.
 * Les règles du stockage empêchent d'écrire dans le dossier de quelqu'un d'autre.
 */
export function AvatarUploader({
  userId,
  name,
  avatarUrl,
}: {
  userId: string;
  name: string;
  avatarUrl: string | null;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ tone: "error" | "ok"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  async function upload(file: File) {
    setMessage(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return setMessage({ tone: "error", text: "Formats acceptés : JPEG, PNG ou WebP." });
    }
    if (file.size > 10 * MAX_BYTES) {
      return setMessage({ tone: "error", text: "Image trop lourde (20 Mo maximum avant recadrage)." });
    }
    setBusy(true);
    try {
      const blob = await toSquareJpeg(file);
      if (blob.size > MAX_BYTES) throw new Error("trop lourde");
      const path = `${userId}/${Date.now()}.jpg`;
      const supabase = createClient();
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const result = await setAvatar(data.publicUrl);
      if (result.error) throw new Error(result.error);
      setMessage({ tone: "ok", text: "Photo mise à jour." });
    } catch (e) {
      const text = e instanceof Error && e.message.length < 120 ? e.message : "Envoi impossible.";
      setMessage({ tone: "error", text: text.includes("Bucket") || text.includes("bucket") ? "Le stockage des photos n'est pas activé (migration 0006)." : text });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  function remove() {
    setMessage(null);
    startTransition(async () => {
      const result = await setAvatar(null);
      setMessage(result.error ? { tone: "error", text: result.error } : { tone: "ok", text: "Photo retirée." });
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        aria-label={avatarUrl ? "Changer la photo de profil" : "Ajouter une photo de profil"}
        className="group relative rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <Avatar name={name} src={avatarUrl} size="xl" rounded="3xl" className="bg-gradient-to-br from-brand-50 to-brand-100" />
        <span className="absolute inset-0 flex items-center justify-center rounded-3xl bg-ink-900/55 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {busy ? "Envoi…" : "📷 Changer"}
        </span>
        {busy && <span className="absolute inset-0 animate-pulse rounded-3xl bg-white/40" />}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />
      <div className="flex gap-3 text-xs font-semibold">
        <button type="button" onClick={() => input.current?.click()} disabled={busy} className="text-brand-700 hover:underline">
          {avatarUrl ? "Changer" : "Ajouter une photo"}
        </button>
        {avatarUrl && (
          <button type="button" onClick={remove} disabled={busy} className="text-ink-500 hover:text-red-600">
            Retirer
          </button>
        )}
      </div>
      {message && (
        <p role={message.tone === "error" ? "alert" : "status"} className={`max-w-40 text-xs ${message.tone === "error" ? "text-red-600" : "text-brand-700"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
