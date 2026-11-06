"use client";

/**
 * Salle de visio intégrée (appel à deux, mentor ↔ mentoré) en WebRTC.
 *
 * - Le son et l'image passent directement d'un navigateur à l'autre.
 * - La mise en relation des deux navigateurs (« signalisation ») passe par un
 *   canal temps réel Supabase propre à la séance : présence pour savoir qui est
 *   là, messages pour échanger les offres et les chemins réseau.
 * - Négociation « parfaite » (recommandation W3C) : peu importe qui arrive en
 *   premier ou si les deux démarrent en même temps.
 * - Sans caméra ni micro (refusés ou absents), on rejoint quand même la salle
 *   et l'on voit et entend l'autre participant.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";

type Status = "media" | "waiting" | "connecting" | "connected" | "reconnecting" | "failed";

type Signal =
  | { kind: "description"; description: RTCSessionDescriptionInit; from: string }
  | { kind: "candidate"; candidate: RTCIceCandidateInit | null; from: string };

/** Serveurs STUN publics (découverte de l'adresse réseau) + TURN facultatif (réseaux d'entreprise, 4G). */
function iceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }];
  const turn = process.env.NEXT_PUBLIC_TURN_URL;
  if (turn) {
    servers.push({
      urls: turn.split(","),
      username: process.env.NEXT_PUBLIC_TURN_USERNAME,
      credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL,
    });
  }
  return servers;
}

const STATUS_TEXT: Record<Status, string> = {
  media: "Préparation de votre caméra et de votre micro…",
  waiting: "En attente de votre interlocuteur…",
  connecting: "Connexion en cours…",
  connected: "Connecté",
  reconnecting: "Connexion instable, reconnexion…",
  failed: "La connexion directe n'a pas abouti.",
};

function ControlButton({
  on,
  onClick,
  label,
  children,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!on}
      aria-label={label}
      title={label}
      className={`inline-flex size-12 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
        on ? "bg-white/15 text-white hover:bg-white/25" : "bg-white text-ink-900 hover:bg-white/90"
      }`}
    >
      <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-5">
        {children}
      </svg>
    </button>
  );
}

export function VideoCall({
  sessionId,
  currentUserId,
  partner,
  backHref,
  fallbackUrl,
}: {
  sessionId: string;
  currentUserId: string;
  partner: { name: string; avatarUrl: string | null };
  backHref: string;
  /** Salle Jitsi de la séance, proposée en secours */
  fallbackUrl: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<Status>("media");
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [hasCamera, setHasCamera] = useState(false);
  const [remoteVideoOn, setRemoteVideoOn] = useState(false);
  const [needsPlay, setNeedsPlay] = useState(false);

  useEffect(() => {
    let disposed = false;
    let pc: RTCPeerConnection | null = null;
    let makingOffer = false;
    let ignoreOffer = false;
    let polite = false;
    // Chemins réseau reçus avant l'offre de l'autre navigateur : appliqués dès qu'elle arrive
    let pendingCandidates: RTCIceCandidateInit[] = [];

    const channel = supabase.channel(`visio:${sessionId}`, {
      config: { broadcast: { self: false }, presence: { key: currentUserId } },
    });
    const send = (signal: Omit<Signal, "from"> & Record<string, unknown>) =>
      void channel.send({ type: "broadcast", event: "signal", payload: { ...signal, from: currentUserId } });

    const playRemote = () => {
      const video = remoteVideo.current;
      if (!video) return;
      video.play().then(
        () => setNeedsPlay(false),
        () => setNeedsPlay(true), // Lecture automatique bloquée : bouton « Lancer la vidéo »
      );
    };

    function closePeer() {
      pc?.close();
      pc = null;
      if (remoteVideo.current) remoteVideo.current.srcObject = null;
      setRemoteVideoOn(false);
    }

    function startPeer(otherId: string) {
      closePeer();
      const peer = new RTCPeerConnection({ iceServers: iceServers() });
      pc = peer;
      makingOffer = false;
      ignoreOffer = false;
      pendingCandidates = [];
      // Rôles fixes et identiques des deux côtés : le « poli » cède en cas d'offres croisées
      polite = currentUserId < otherId;
      setStatus("connecting");

      const stream = streamRef.current;
      if (stream && stream.getTracks().length > 0) {
        for (const track of stream.getTracks()) peer.addTrack(track, stream);
        if (stream.getAudioTracks().length === 0) peer.addTransceiver("audio", { direction: "recvonly" });
        if (stream.getVideoTracks().length === 0) peer.addTransceiver("video", { direction: "recvonly" });
      } else {
        peer.addTransceiver("audio", { direction: "recvonly" });
        peer.addTransceiver("video", { direction: "recvonly" });
      }

      peer.ontrack = ({ track, streams }) => {
        const video = remoteVideo.current;
        if (!video) return;
        const remote = streams[0] ?? (video.srcObject as MediaStream | null) ?? new MediaStream();
        if (!streams[0] && !remote.getTracks().includes(track)) remote.addTrack(track);
        video.srcObject = remote;
        if (track.kind === "video") {
          setRemoteVideoOn(!track.muted);
          track.onunmute = () => setRemoteVideoOn(true);
          track.onmute = () => setRemoteVideoOn(false);
        }
        playRemote();
      };
      peer.onicecandidate = ({ candidate }) => send({ kind: "candidate", candidate: candidate ? candidate.toJSON() : null });
      peer.onnegotiationneeded = async () => {
        try {
          makingOffer = true;
          await peer.setLocalDescription();
          if (peer.localDescription) send({ kind: "description", description: peer.localDescription.toJSON() });
        } catch (error) {
          console.error("[visio] négociation", error);
        } finally {
          makingOffer = false;
        }
      };
      peer.onconnectionstatechange = () => {
        if (pc !== peer) return;
        switch (peer.connectionState) {
          case "connected":
            setStatus("connected");
            break;
          case "disconnected":
            setStatus("reconnecting");
            break;
          case "failed":
            setStatus("failed");
            peer.restartIce();
            break;
        }
      };
    }

    async function onSignal(signal: Signal) {
      if (signal.from === currentUserId) return;
      if (!pc) startPeer(signal.from);
      const peer = pc!;
      try {
        if (signal.kind === "description") {
          const offerCollision =
            signal.description.type === "offer" && (makingOffer || peer.signalingState !== "stable");
          ignoreOffer = !polite && offerCollision;
          if (ignoreOffer) return;
          await peer.setRemoteDescription(signal.description);
          // Chemins réseau arrivés trop tôt : on les applique maintenant
          const early = pendingCandidates;
          pendingCandidates = [];
          for (const candidate of early) await peer.addIceCandidate(candidate).catch(() => {});
          if (signal.description.type === "offer") {
            await peer.setLocalDescription();
            if (peer.localDescription) send({ kind: "description", description: peer.localDescription.toJSON() });
          }
        } else if (signal.candidate) {
          if (!peer.remoteDescription) {
            pendingCandidates.push(signal.candidate);
            return;
          }
          try {
            await peer.addIceCandidate(signal.candidate);
          } catch (error) {
            if (!ignoreOffer) throw error;
          }
        }
      } catch (error) {
        console.error("[visio] signalisation", error);
      }
    }

    channel
      .on("broadcast", { event: "signal" }, ({ payload }) => void onSignal(payload as Signal))
      .on("presence", { event: "sync" }, () => {
        const others = Object.keys(channel.presenceState()).filter((key) => key !== currentUserId);
        if (others.length === 0) {
          closePeer();
          setStatus("waiting");
        } else if (!pc) {
          startPeer(others[0]);
        }
      });

    // 1. Caméra et micro (en cas de refus : micro seul, puis aucun média)
    (async () => {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMediaError("Caméra indisponible : vous participez avec le micro seulement.");
        } catch {
          setMediaError(
            "Caméra et micro indisponibles (autorisation refusée ou appareil absent). Vous voyez et entendez quand même votre interlocuteur.",
          );
        }
      }
      if (disposed) {
        stream?.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      setHasCamera(Boolean(stream?.getVideoTracks().length));
      if (stream && localVideo.current) localVideo.current.srcObject = stream;
      setStatus("waiting");

      // 2. Entrée dans la salle : on signale sa présence
      channel.subscribe((state) => {
        if (state === "SUBSCRIBED") void channel.track({ joinedAt: new Date().toISOString() });
      });
    })();

    return () => {
      disposed = true;
      closePeer();
      // Quitter le canal suffit à signaler son départ aux autres participants
      void supabase.removeChannel(channel);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [supabase, sessionId, currentUserId]);

  const toggle = (kind: "audio" | "video") => {
    const tracks = kind === "audio" ? streamRef.current?.getAudioTracks() : streamRef.current?.getVideoTracks();
    if (!tracks?.length) return;
    const next = !tracks[0].enabled;
    for (const t of tracks) t.enabled = next;
    if (kind === "audio") setMicOn(next);
    else setCamOn(next);
  };

  const connected = status === "connected";

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-[56dvh] w-full overflow-hidden rounded-3xl bg-ink-950 sm:h-[min(58dvh,600px)]">
        {/* Interlocuteur */}
        <video
          ref={remoteVideo}
          autoPlay
          playsInline
          className={`absolute inset-0 size-full object-cover transition-opacity ${remoteVideoOn ? "opacity-100" : "opacity-0"}`}
        />
        {!remoteVideoOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-white">
            <Avatar name={partner.name} src={partner.avatarUrl} size="xl" className="ring-4 ring-white/10" />
            <p className="text-lg font-semibold">{partner.name}</p>
            <p role="status" className="inline-flex items-center gap-2 text-sm text-white/70">
              {!connected && status !== "failed" && (
                <span aria-hidden className="size-2 animate-pulse rounded-full bg-accent-400" />
              )}
              {connected ? "Caméra coupée" : STATUS_TEXT[status]}
            </p>
          </div>
        )}

        {/* Bandeau d'état */}
        <p className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-ink-950/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          <span aria-hidden className={`size-2 rounded-full ${connected ? "bg-accent-400" : "bg-amber-400"}`} />
          {STATUS_TEXT[status]}
        </p>

        {needsPlay && (
          <button
            type="button"
            onClick={() => remoteVideo.current?.play().then(() => setNeedsPlay(false))}
            className="absolute inset-x-0 bottom-24 mx-auto w-fit rounded-xl bg-accent-400 px-5 py-3 font-semibold text-ink-950"
          >
            Lancer la vidéo et le son
          </button>
        )}

        {/* Moi (aperçu) */}
        <div className="absolute right-4 bottom-4 aspect-[3/4] w-24 overflow-hidden rounded-2xl bg-ink-900 ring-2 ring-white/20 sm:aspect-video sm:w-48">
          <video ref={localVideo} autoPlay playsInline muted className={`size-full -scale-x-100 object-cover ${hasCamera && camOn ? "" : "hidden"}`} />
          {!(hasCamera && camOn) && (
            <p className="flex size-full items-center justify-center p-2 text-center text-xs text-white/70">Vous</p>
          )}
        </div>
      </div>

      {/* Commandes */}
      <div className="flex items-center justify-center gap-3 rounded-2xl bg-ink-950 p-3">
        <ControlButton on={micOn} onClick={() => toggle("audio")} label={micOn ? "Couper le micro" : "Activer le micro"}>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          {!micOn && <path d="M4 4l16 16" />}
        </ControlButton>
        <ControlButton on={camOn} onClick={() => toggle("video")} label={camOn ? "Couper la caméra" : "Activer la caméra"}>
          <rect x="3" y="6" width="13" height="12" rx="2" />
          <path d="m16 10 5-3v10l-5-3" />
          {!camOn && <path d="M3 3l18 18" />}
        </ControlButton>
        <Link
          href={backHref}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-red-600 px-5 font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="size-5">
            <path d="M3 15c5-5 13-5 18 0l-2.5 2.5-3-1.5v-2.5a10 10 0 0 0-5 0V16l-3 1.5z" />
          </svg>
          Quitter
        </Link>
      </div>

      {mediaError && <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">{mediaError}</p>}

      <p className="text-center text-sm text-ink-500">
        {status === "failed" ? "Le réseau bloque peut-être l'appel direct. " : "Un souci de connexion ? "}
        <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">
          Ouvrir la salle de secours (Jitsi)
        </a>
      </p>
    </div>
  );
}
