import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import roseSvg from "./assets/rose.svg";
import { startTracking } from "./tracking";

/* ════════════════════════════════════════════════════════════════════════════
   CONTENT  –  every visible string lives here
   ════════════════════════════════════════════════════════════════════════════ */
const CONTENT = {
  hero: {
    title: "For Liv, Happy Birthday",
    subtitle:
      "Roses, words, and a gentle heart's confession — sent your way on the eve of something special.",
    ctaLabel: "Open the Postcard",
    openedLabel: "A Little Something",
  },
  card: {
    toLabel: "To",
    toName: "Olivia Fritz",
    fromLabel: "From",
    fromName: "The one who finally got your attention",
    date: "January 31st, 2026",
    body: "Twenty suits you, Olivia. The world has been a little brighter since the day you arrived in it — and every year since has only made that clearer. Here's to you, and to this new chapter. Happy Birthday.",
  },
  intro: {
    title: "Why You're Always on My Mind",
    body: [
      "You carry people in your heart like it costs you nothing. The way you think of others, the way you check in, the way you care without ever being asked — it is the most natural thing about you.",
      "There was a time when all that kindness never reached me. You gave it so freely to everyone around you, and I stood on the outside, wondering what it would take for you to look my way.",
      "Turns out all it took was being myself and not giving up. And somehow, against all reason, you stayed.",
      "I do not take that lightly. The girl who cares for everyone finally let someone care for her — and I intend to make every moment worth it.",
      "The day I first saw you in that white dress, I'm convinced the universe paused just to admire you. You didn't just walk in — you claimed the room, like a Greek goddess who knew exactly what kind of trouble she was about to cause. I was lost before I ever said hello.",
      "I still think about that night you drifted off in my arms, a little tipsy, completely unguarded, trusting me with that soft, quiet version of you. I stayed wide awake, watching the world slow down, wondering how someone could look so peaceful and still be so dangerous to my heart.",
      "I remember the cold night when my headlights spilled across you, and somehow your radiance made the chill feel like nothing at all. Even the dark seemed to lean in just to admire you for a second longer.",
      "I'll never forget the black ice moment — me playing the calm hero, steering through chaos, and you squeezing my hand over the bridges because you were scared. Funny how something so small can feel like a promise, even when it isn't one.",
      "And yes, I still laugh about you mixing up our drinks and not even noticing — stealing my Diet Coke like it was the most natural thing in the world. I forgave you… mostly. The root beer was a charming apology, I'll give you that.",
    ],
  },
  notes: {
    title: "Things I Notice About You",
    items: [
      "The way your whole face lights up when you talk about the things you love — it is the most genuine joy I have ever seen, and it never gets old.",
      "That shy smile you try to hide when I get too close. You have no idea what it does to me every single time.",
      "How you hold space for people — you listen like it truly matters, because to you it always does.",
      "The one good thing about seeing you walk away — seeing the way that amazing booty jiggles. I had to be honest.",
      "Those green eyes of yours — the kind that don't just look at someone, but smile at them. They have this way of pulling me in, like they're sharing a secret I'm not quite brave enough to solve.",
      "You have this shy smile that pretends it doesn't know its own power. The way you move, the way your presence lingers, the way you make moments stretch just a little longer than they should — it's like poetry that knows how to tease.",
    ],
  },
  quote: {
    title: "Today's Words for You",
    subtitle: "A new thought, once per day, kept safe right here.",
  },
  quotes: [
    "You give your warmth to everyone you meet, and yet somehow being chosen by you still feels like the rarest thing in the world.",
    "There is something about the way your eyes light up that reminds me the world still has magic in it. Your gentle spirit is proof of that.",
    "If kindness had a face, it would look exactly like yours — soft, steady, and impossibly lovely.",
    "You make people feel safe just by being near them. That is not something you learn. That is just who you are.",
    "Some people carry beauty in how they look. You carry it in how you make others feel — and that is only the beginning.",
    "Every flower you have ever admired should be jealous, because nothing blooms quite like you do when you smile.",
    "Your kindness is not loud, but it reaches everyone. You are the most unforgettable person in any room, and you do not even know it.",
    "Sometimes I wish I could steal another quiet moment — just a soft forehead kiss, a warm cuddle, and letting the world fade into a gentle blur where it's only you and me, and the space between us that always feels charged with possibility.",
  ],
  countdown: {
    title: "Until Valentine's Day",
    subtitle: "Another reason to celebrate someone as special as you.",
    noteTitle: "A Little Promise",
    noteBody:
      "When Valentine's Day arrives, I want it to be full of red roses and every reminder that you are cherished. You deserve to be surrounded by all the beauty you so freely give to others.",
    toggleOpen: "Read the promise",
    toggleClose: "Close",
  },
  signoff: {
    title: "Before I Go",
    body: "You care for everyone around you — quietly, gently, without ever expecting anything back. I watched that for a long time before you ever noticed me. Now that I am here, I want you to know: you deserve every bit of the love you pour into this world. I am not going anywhere. Not now. Not while there is still breath in me. You've told me I mean a lot to you. I'll keep that like a secret tucked in my pocket — something I don't show off, but always carry with me.",
    closing: "With all the care in my heart,",
    name: "Yours, always",
  },
  toggle: {
    pause: "Pause",
    play: "Play",
  },
};

/* ════════════════════════════════════════════════════════════════════════════
   CONFIGURATION
   ════════════════════════════════════════════════════════════════════════════ */
const ROSE_DRIFT = [
  { top: "6%", left: "5%", size: 100, delay: 0.2 },
  { top: "14%", right: "8%", size: 130, delay: 0.6 },
  { bottom: "10%", left: "10%", size: 120, delay: 0.4 },
  { bottom: "5%", right: "14%", size: 90, delay: 0.1 },
];

const SHAPES = [
  { type: "sphere", position: [-3, 0.5, -2], color: "#b31b2c", scale: 1.2 },
  { type: "torus", position: [2.8, -1.2, -1], color: "#f0c56a", scale: 1 },
  {
    type: "icosahedron",
    position: [0.5, 2.2, -1.5],
    color: "#f4b2bf",
    scale: 1.1,
  },
  { type: "sphere", position: [3.5, 1.8, -3], color: "#7c0f1c", scale: 0.8 },
  {
    type: "torus",
    position: [-2.6, -2, -2.5],
    color: "#f8d7dc",
    scale: 0.9,
  },
];

const DAILY_QUOTE_KEY = "daily-quote-v1";
const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getNextValentine = (now) => {
  const year = now.getFullYear();
  const candidate = new Date(year, 1, 14, 0, 0, 0);
  return now > candidate ? new Date(year + 1, 1, 14, 0, 0, 0) : candidate;
};

const formatCountdown = (diffMs) => {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
};

/* ════════════════════════════════════════════════════════════════════════════
   3-D FLOATING SHAPES
   ════════════════════════════════════════════════════════════════════════════ */
function FloatingShape({ type, position, color, scale, paused }) {
  const meshRef = useRef(null);

  useFrame((_state, delta) => {
    if (!meshRef.current || paused) return;
    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <Float
      speed={paused ? 0 : 1.5}
      rotationIntensity={paused ? 0 : 1}
      floatIntensity={paused ? 0 : 2}
    >
      <mesh ref={meshRef} position={position} scale={scale}>
        {type === "sphere" && <sphereGeometry args={[1, 48, 48]} />}
        {type === "torus" && <torusGeometry args={[1, 0.35, 40, 64]} />}
        {type === "icosahedron" && <icosahedronGeometry args={[1, 0]} />}
        <meshStandardMaterial
          color={color}
          metalness={0.35}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.25}
          transparent
          opacity={0.55}
        />
      </mesh>
    </Float>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   ROSE  BLOOM  (reusable animated rose)
   ════════════════════════════════════════════════════════════════════════════ */
function RoseBloom({ paused, size = 220, className = "" }) {
  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={
        paused
          ? { scale: 1, rotate: 0 }
          : { scale: [0.96, 1.02, 0.98], rotate: [-1, 1.5, -1] }
      }
      transition={{ duration: 6, repeat: paused ? 0 : Infinity }}
    >
      <div
        className="absolute inset-0 rounded-full bg-ember/30 blur-2xl"
        aria-hidden="true"
      />
      <motion.img
        src={roseSvg}
        alt=""
        className="rose-image"
        style={{ width: "100%", height: "100%" }}
        animate={paused ? { opacity: 1 } : { opacity: [0.9, 1, 0.95] }}
        transition={{ duration: 4, repeat: paused ? 0 : Infinity }}
      />
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   ROSE  DRIFT  (ambient floating roses behind content)
   ════════════════════════════════════════════════════════════════════════════ */
function RoseDrift({ paused }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-[1]">
      {ROSE_DRIFT.map((rose, index) => (
        <motion.div
          key={`${rose.left || rose.right}-${index}`}
          className="absolute opacity-50"
          style={rose}
          animate={
            paused
              ? { y: 0, rotate: 0 }
              : { y: [0, -20, 0], rotate: [-2, 3, -2] }
          }
          transition={{
            duration: 6,
            repeat: paused ? 0 : Infinity,
            repeatType: "mirror",
            delay: rose.delay,
          }}
        >
          <RoseBloom paused={paused} size={rose.size} />
        </motion.div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   POSTCARD  STAMP
   ════════════════════════════════════════════════════════════════════════════ */
function Stamp({ paused }) {
  return (
    <div className="postcard-stamp relative rounded-sm overflow-hidden flex-shrink-0">
      <RoseBloom paused={paused} size={52} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   POSTCARD  POSTMARK
   ════════════════════════════════════════════════════════════════════════════ */
function Postmark() {
  return (
    <div className="postmark flex items-center gap-2">
      <div className="postmark-circle flex items-center justify-center">
        <span className="text-[9px] font-semibold tracking-[0.2em]">
          WITH CARE
        </span>
      </div>
      <div className="flex flex-col gap-[2px]">
        <div className="h-[1.5px] w-12 bg-inkRose/15 rounded" />
        <div className="h-[1.5px] w-10 bg-inkRose/15 rounded" />
        <div className="h-[1.5px] w-14 bg-inkRose/15 rounded" />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SECTION  DIVIDER  (decorative separator between postcard sections)
   ════════════════════════════════════════════════════════════════════════════ */
function Divider() {
  return (
    <div className="flex items-center gap-4 my-8">
      <div className="postcard-divider flex-1" />
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        className="text-ember/30 flex-shrink-0"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="currentColor"
        />
      </svg>
      <div className="postcard-divider flex-1" />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN  APP
   ════════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [opened, setOpened] = useState(false);
  const [paused, setPaused] = useState(false);
  const [quote, setQuote] = useState(CONTENT.quotes[0]);
  const [noteOpen, setNoteOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  /* ── tracking ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    const cleanup = startTracking();
    return cleanup;
  }, []);

  /* ── daily quote (localStorage) ────────────────────────────────────────── */
  useEffect(() => {
    const todayKey = getTodayKey();
    const stored = localStorage.getItem(DAILY_QUOTE_KEY);
    let storedData = null;
    if (stored) {
      try {
        storedData = JSON.parse(stored);
      } catch (e) {
        /* ignore corrupt data */
      }
    }

    if (
      storedData?.date === todayKey &&
      Number.isInteger(storedData?.quoteIndex) &&
      CONTENT.quotes[storedData.quoteIndex]
    ) {
      setQuote(CONTENT.quotes[storedData.quoteIndex]);
      return;
    }

    let nextIndex = Math.floor(Math.random() * CONTENT.quotes.length);
    if (
      Number.isInteger(storedData?.quoteIndex) &&
      CONTENT.quotes.length > 1 &&
      nextIndex === storedData.quoteIndex
    ) {
      nextIndex = (nextIndex + 1) % CONTENT.quotes.length;
    }

    setQuote(CONTENT.quotes[nextIndex]);
    localStorage.setItem(
      DAILY_QUOTE_KEY,
      JSON.stringify({ date: todayKey, quoteIndex: nextIndex })
    );
  }, []);

  /* ── countdown timer ───────────────────────────────────────────────────── */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const valentineDate = useMemo(() => getNextValentine(now), [now]);
  const countdown = formatCountdown(valentineDate - now);

  /* ══════════════════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="relative min-h-screen overflow-hidden bg-rosewood text-white">
      {/* ambient glow */}
      <div className="rose-glow" aria-hidden="true" />

      {/* floating roses */}
      <RoseDrift paused={paused} />

      {/* 3-D background */}
      <Canvas
        className="!fixed inset-0 pointer-events-none z-0"
        camera={{ position: [0, 0, 8], fov: 55 }}
        frameloop={paused ? "never" : "always"}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[6, 6, 6]} intensity={1.4} color="#f4b2bf" />
        <pointLight position={[-6, -4, 2]} intensity={1} color="#f0c56a" />
        <pointLight position={[0, 5, -4]} intensity={0.6} color="#ffffff" />
        {SHAPES.map((shape) => (
          <FloatingShape
            key={shape.position.join("-")}
            {...shape}
            paused={paused}
          />
        ))}
      </Canvas>

      {/* ── MAIN POSTCARD CONTENT ── */}
      <main className="relative z-10 flex min-h-screen flex-col items-center px-3 py-8 sm:px-6 sm:py-12">
        {/* pause toggle (top-right) */}
        <button
          type="button"
          className={`fixed top-4 right-4 z-30 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] transition backdrop-blur-sm ${
            paused
              ? "border-gold bg-gold/90 text-rosewood"
              : "border-white/30 bg-white/10 text-white/80 hover:bg-white/20"
          }`}
          aria-pressed={paused}
          onClick={() => setPaused((prev) => !prev)}
        >
          {paused ? CONTENT.toggle.play : CONTENT.toggle.pause}
        </button>

        {/* ── THE POSTCARD ── */}
        <motion.div
          className="postcard postcard-inner-border relative w-full max-w-2xl rounded-2xl sm:rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* ── postcard header: To / From / Stamp ── */}
          <div className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-10 sm:pt-8">
            {/* address block */}
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-inkRose/50 font-semibold">
                  {CONTENT.card.toLabel}
                </p>
                <p className="font-display text-base sm:text-lg text-inkRose/90 address-line">
                  {CONTENT.card.toName}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-inkRose/50 font-semibold">
                  {CONTENT.card.fromLabel}
                </p>
                <p className="font-display text-base sm:text-lg text-inkRose/90 address-line">
                  {CONTENT.card.fromName}
                </p>
              </div>
              <p className="text-[11px] text-inkRose/40 tracking-wide">
                {CONTENT.card.date}
              </p>
            </div>

            {/* stamp + postmark */}
            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              <Stamp paused={paused} />
              <Postmark />
            </div>
          </div>

          {/* decorative divider */}
          <div className="px-6 sm:px-10">
            <Divider />
          </div>

          {/* ── Birthday greeting ── */}
          <section className="px-6 sm:px-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex-1 space-y-3">
                <h1 className="font-display text-3xl sm:text-4xl text-inkRose italic">
                  Happy Birthday
                </h1>
                <p className="font-body text-base sm:text-lg text-inkRose/80 leading-relaxed">
                  {CONTENT.card.body}
                </p>
              </div>
              <div className="flex items-center justify-center sm:justify-end flex-shrink-0">
                <RoseBloom paused={paused} size={140} />
              </div>
            </div>
          </section>

          <div className="px-6 sm:px-10">
            <Divider />
          </div>

          {/* ── INTRO ── */}
          <section className="px-6 sm:px-10">
            <h2 className="font-display text-2xl sm:text-3xl text-inkRose">
              {CONTENT.intro.title}
            </h2>
            <div className="mt-4 space-y-3">
              {CONTENT.intro.body.map((line, i) => (
                <p
                  key={i}
                  className="font-body text-base sm:text-lg text-inkRose/75 leading-relaxed"
                >
                  {line}
                </p>
              ))}
            </div>
          </section>

          <div className="px-6 sm:px-10">
            <Divider />
          </div>

          {/* ── NOTES ── */}
          <section className="px-6 sm:px-10">
            <h2 className="font-display text-2xl sm:text-3xl text-inkRose">
              {CONTENT.notes.title}
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {CONTENT.notes.items.map((item, i) => (
                <div
                  key={i}
                  className="note-card rounded-xl p-4 sm:p-5 text-base text-inkRose/75 leading-relaxed"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <div className="px-6 sm:px-10">
            <Divider />
          </div>

          {/* ── DAILY QUOTE ── */}
          <section className="px-6 sm:px-10">
            <h2 className="font-display text-2xl sm:text-3xl text-inkRose">
              {CONTENT.quote.title}
            </h2>
            <p className="mt-1 text-sm text-inkRose/50">
              {CONTENT.quote.subtitle}
            </p>
            <motion.div
              className="mt-5 rounded-xl border border-ember/20 bg-ember/5 p-5 sm:p-6"
              animate={paused ? { opacity: 1 } : { opacity: [0.92, 1, 0.95] }}
              transition={{ duration: 5, repeat: paused ? 0 : Infinity }}
            >
              <p className="font-body text-lg sm:text-xl text-inkRose/85 italic leading-relaxed">
                &ldquo;{quote}&rdquo;
              </p>
            </motion.div>
          </section>

          <div className="px-6 sm:px-10">
            <Divider />
          </div>

          {/* ── COUNTDOWN TO VALENTINE'S ── */}
          <section className="px-6 sm:px-10">
            <h2 className="font-display text-2xl sm:text-3xl text-inkRose">
              {CONTENT.countdown.title}
            </h2>
            <p className="mt-1 text-sm text-inkRose/50">
              {CONTENT.countdown.subtitle}
            </p>

            <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: "Days", value: countdown.days },
                { label: "Hours", value: countdown.hours },
                { label: "Min", value: countdown.minutes },
                { label: "Sec", value: countdown.seconds },
              ].map((item) => (
                <div
                  key={item.label}
                  className="note-card rounded-xl px-2 py-4 text-center sm:px-4 sm:py-5"
                >
                  <div className="font-display text-2xl sm:text-3xl text-ember">
                    {item.value.toString().padStart(2, "0")}
                  </div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-inkRose/50 mt-1">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setNoteOpen((prev) => !prev)}
                className="rounded-full border border-ember/30 px-4 py-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-ember transition hover:bg-ember/10"
              >
                {noteOpen
                  ? CONTENT.countdown.toggleClose
                  : CONTENT.countdown.toggleOpen}
              </button>
              <AnimatePresence>
                {noteOpen && (
                  <motion.div
                    className="mt-4 note-card rounded-xl p-5"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                  >
                    <h3 className="font-display text-xl text-inkRose">
                      {CONTENT.countdown.noteTitle}
                    </h3>
                    <p className="mt-2 text-base sm:text-lg text-inkRose/75 leading-relaxed">
                      {CONTENT.countdown.noteBody}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          <div className="px-6 sm:px-10">
            <Divider />
          </div>

          {/* ── SIGN-OFF ── */}
          <section className="px-6 pb-8 sm:px-10 sm:pb-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="flex-1 space-y-3">
                <h2 className="font-display text-2xl sm:text-3xl text-inkRose">
                  {CONTENT.signoff.title}
                </h2>
                <p className="font-body text-base sm:text-lg text-inkRose/75 leading-relaxed">
                  {CONTENT.signoff.body}
                </p>
                <div className="pt-2">
                  <p className="font-body italic text-inkRose/60 text-base">
                    {CONTENT.signoff.closing}
                  </p>
                  <p className="font-display text-xl text-inkRose/80 mt-1">
                    {CONTENT.signoff.name}
                  </p>
                </div>
              </div>
              <div className="flex items-end justify-center sm:justify-end flex-shrink-0">
                <RoseBloom paused={paused} size={110} />
              </div>
            </div>
          </section>

          {/* rose watermark */}
          <img
            src={roseSvg}
            alt=""
            className="rose-watermark absolute bottom-4 right-4 w-32 h-32 sm:w-44 sm:h-44"
          />
        </motion.div>
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
         REVEAL OVERLAY  –  "front" of the postcard
         ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {!opened && (
          <motion.div
            className="fixed inset-0 z-20 flex items-center justify-center bg-rosewood/95 px-4 sm:px-6"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
          >
            <motion.div
              className="postcard postcard-inner-border relative flex w-full max-w-lg flex-col items-center gap-6 rounded-2xl sm:rounded-3xl p-6 text-center sm:p-10 overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, rotateY: -8 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.95, opacity: 0, rotateY: 12 }}
              transition={{ duration: 0.8 }}
            >
              {/* stamp corner */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <Stamp paused={paused} />
              </div>

              <RoseBloom paused={paused} size={200} />

              <div>
                <h2 className="font-display text-2xl sm:text-3xl text-inkRose">
                  {CONTENT.hero.title}
                </h2>
                <p className="mt-3 font-body text-base text-inkRose/70 sm:text-lg max-w-sm mx-auto leading-relaxed">
                  {CONTENT.hero.subtitle}
                </p>
              </div>

              <motion.button
                type="button"
                onClick={() => setOpened(true)}
                className="rounded-full bg-ember px-6 py-3 text-[11px] sm:text-xs uppercase tracking-[0.3em] text-white shadow-glow"
                animate={
                  paused
                    ? { scale: 1 }
                    : {
                        scale: [1, 1.06, 1],
                        boxShadow: [
                          "0 0 0 rgba(0,0,0,0)",
                          "0 0 30px rgba(179,27,44,0.6)",
                          "0 0 0 rgba(0,0,0,0)",
                        ],
                      }
                }
                transition={{
                  duration: 2.4,
                  repeat: paused ? 0 : Infinity,
                }}
              >
                {CONTENT.hero.ctaLabel}
              </motion.button>

              {/* watermark */}
              <img
                src={roseSvg}
                alt=""
                className="rose-watermark absolute -bottom-6 -left-6 w-36 h-36"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
