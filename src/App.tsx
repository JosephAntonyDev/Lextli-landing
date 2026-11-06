import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ImgHTMLAttributes } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Flower2,
  Heart,
  Menu,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Smartphone,
  Sprout,
  Volume2,
  WifiOff,
  X,
} from "lucide-react";

import { LocaleProvider, LanguagePicker, useTranslation } from "./i18n";
import { useSpeech } from "./useSpeech";
import { PixelPreview } from "./PixelPreview";

import thinkingSvg from "./assets/loti/expression-thinking.svg?raw";
import thinkingStillSvg from "./assets/loti/expression-thinking-still.svg?raw";
const thinkingImages = {
  animated: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(thinkingSvg)}`,
  still: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(thinkingStillSvg)}`,
};
const MotionContext = createContext(true);
function LotiImage({
  name,
  ...props
}: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { name: string }) {
  const motion = useContext(MotionContext);
  // Bundle the FAQ illustration so a late scroll needs no new image request.
  const src =
    name === "expression-thinking"
      ? thinkingImages[motion ? "animated" : "still"]
      : `/loti/${name}${motion ? "" : "-still"}.svg`;
  return <img {...props} src={src} />;
}
const lessons = [
  {
    word: "grow",
    meaning: "crecer",
    sentence: "Little by little, we grow.",
    translation: "Poco a poco, crecemos.",
    choices: ["crecer", "olvidar", "correr"],
    answer: 0,
  },
  {
    word: "remember",
    meaning: "recordar",
    sentence: "I remember this word.",
    translation: "Recuerdo esta palabra.",
    choices: ["descansar", "recordar", "escribir"],
    answer: 1,
  },
  {
    word: "together",
    meaning: "juntos",
    sentence: "We learn together.",
    translation: "Aprendemos juntos.",
    choices: ["mañana", "siempre", "juntos"],
    answer: 2,
  },
];
const screens = [
  {
    name: "Tu camino",
    file: "home-light",
    title: "Cada palabra abre un camino.",
    description:
      "Un recorrido por pequeñas unidades. Entra, practica un poco y vuelve cuando puedas.",
  },
  {
    name: "Tu práctica",
    file: "session-light",
    title: "Apréndela. Recuérdala. Úsala.",
    description:
      "Escucha, escribe y conecta palabras con su significado. El repaso se adapta a lo que recuerdas.",
  },
  {
    name: "Tu colección",
    file: "album-light",
    title: "Hay mucho por descubrir.",
    description:
      "Reúne estampas, dale tu estilo a Loti y comparte el juego. Aprender también puede sorprenderte.",
  },
];
const faqs = [
  [
    "¿Tengo que pagar para seguir aprendiendo?",
    "No. Aprender, repasar y avanzar en tu recorrido no depende de pagar. Tampoco necesitas ver un anuncio para continuar. Queremos que lo opcional sea la personalización, nunca tu aprendizaje.",
  ],
  [
    "¿De verdad funciona sin internet?",
    "Puedes estudiar el contenido instalado, repasar, retomar una sesión y escuchar las voces que ya descargaste. Para iniciar sesión, sincronizar, descargar voces nuevas o jugar en vivo sí necesitas conexión.",
  ],
  [
    "¿Puedo empezar desde cero?",
    "Sí. El recorrido comienza con vocabulario general y ejemplos en contexto. Tú eliges tu ritmo. También hay paquetes de viajes y software para explorar inglés relacionado con tus intereses.",
  ],
  [
    "¿Qué pasa si dejo una lección a medias?",
    "Puedes volver a la actividad donde la dejaste o empezar de nuevo. Una llamada, el transporte o un día ocupado no tienen por qué borrar lo que ya hiciste.",
  ],
  [
    "¿Ya puedo descargar Lextli?",
    "Lextli está en beta para Android. Aún no anunciamos aquí una descarga pública. Mientras preparamos ese paso, puedes probar la práctica interactiva de esta página sin crear una cuenta.",
  ],
  [
    "¿Loti es una inteligencia artificial?",
    "Loti es nuestro ajolote y compañero de aprendizaje. La conversación con inteligencia artificial es una posibilidad futura; no es una función disponible de esta beta.",
  ],
];

function Demo() {
  const { t } = useTranslation();
  const audio = useSpeech();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const nextButton = useRef<HTMLButtonElement>(null);
  const questionTitle = useRef<HTMLHeadingElement>(null);
  const lesson = lessons[step];
  const correct = selected === lesson.answer;
  const audioStatus =
    audio.status === "loading"
      ? t("Preparando la voz…")
      : audio.status === "playing"
        ? t("Reproduciendo…")
        : audio.status === "unavailable"
          ? t("Este navegador no ofrece lectura de voz. Puedes leer la frase.")
          : audio.status === "error"
            ? t(
                "La voz no respondió. Puedes volver a intentarlo o leer la frase.",
              )
            : "";
  function next() {
    audio.reset();
    if (step === lessons.length - 1) setDone(true);
    else setStep(step + 1);
    setSelected(null);

    requestAnimationFrame(() => questionTitle.current?.focus());
  }
  return (
    <div className="demo-card">
      <div className="demo-top">
        <span>
          <Sprout size={18} /> {t("TU PRIMER BROTE")}{" "}
        </span>
        <span>{done ? 3 : step + 1} / 3</span>
      </div>
      <div className="progress-track">
        <i style={{ width: `${done ? 100 : (step / 3) * 100}%` }} />
      </div>
      {done ? (
        <div className="demo-complete">
          <LotiImage
            name="expression-excited"
            alt={t("Loti celebra contigo")}
            width="160"
            height="160"
            loading="lazy"
          />
          <h3 ref={questionTitle} tabIndex={-1}>
            {" "}
            {t("Ya empezó a crecer.")}{" "}
          </h3>
          <p>
            {" "}
            {t("Tres palabras, un pequeño comienzo.")} <br />{" "}
            {t("Imagina todo lo que viene después.")}{" "}
          </p>
          <button
            className="button primary"
            onClick={() => {
              setDone(false);
              setStep(0);
              requestAnimationFrame(() => questionTitle.current?.focus());
            }}
          >
            <RotateCcw size={18} /> {t("Volver a practicar")}{" "}
          </button>
        </div>
      ) : (
        <>
          <div className="word-question">
            <span>{t("¿QUÉ SIGNIFICA…?")}</span>
            <h3 ref={questionTitle} tabIndex={-1}>
              {lesson.word}
              <button
                className="sound-button"
                aria-label={`${t("Escuchar")} ${lesson.sentence}`}
                onClick={() => audio.speak(lesson.sentence)}
                aria-busy={audio.status === "loading"}
                disabled={
                  audio.status === "loading" || audio.status === "playing"
                }
              >
                <Volume2 size={22} />
              </button>
            </h3>
            <p>{lesson.sentence}</p>
          </div>
          <div className="answer-options">
            {lesson.choices.map((choice, i) => (
              <button
                key={`${step}-${i}`}
                aria-label={`${String.fromCharCode(65 + i)} ${t(choice)}`}
                disabled={correct}
                className={`answer ${selected === i ? (correct ? "correct" : "incorrect") : ""}`}
                onClick={() => {
                  setSelected(i);
                  if (i === lesson.answer)
                    requestAnimationFrame(() => nextButton.current?.focus());
                }}
              >
                <span>{String.fromCharCode(65 + i)}</span>
                {t(choice)}
                {selected === i &&
                  (correct ? <Check size={20} /> : <RotateCcw size={18} />)}
              </button>
            ))}
          </div>
          <div className="answer-feedback" role="status">
            {selected === null
              ? t("Sin reloj. Sin presión. Dale una oportunidad.")
              : correct
                ? `${t("¡Eso es!")} ${t(lesson.translation)}`
                : t(
                    "Casi. Prueba otra opción; aquí equivocarse también cuenta.",
                  )}
            {audioStatus && (
              <small className="audio-status">{audioStatus}</small>
            )}
          </div>
          {correct && (
            <button
              ref={nextButton}
              className="button primary next-button"
              onClick={next}
            >
              {step === 2 ? t("Ver mi pequeño logro") : t("Siguiente palabra")}
              <ArrowRight size={18} />
            </button>
          )}
        </>
      )}
      <div className="demo-caption">
        {" "}
        {t("Una muestra de práctica · No guarda progreso en la app")}{" "}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <Landing />
    </LocaleProvider>
  );
}

function Landing() {
  const { t, locale } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [motion, setMotion] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [screen, setScreen] = useState(0);
  const [accessory, setAccessory] = useState("accessory-book");
  const modal = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const heroArt = useRef<HTMLDivElement>(null);
  const pointerFrame = useRef<number | null>(null);
  const pointerTilt = useRef(0);
  useEffect(
    () => () => {
      if (pointerFrame.current !== null)
        cancelAnimationFrame(pointerFrame.current);
    },
    [],
  );
  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "on" : "off";
  }, [motion]);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotion(!query.matches);
    query.addEventListener("change", update);
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08, rootMargin: "0px 0px 60px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      query.removeEventListener("change", update);
    };
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);
  function openBeta() {
    opener.current = document.activeElement as HTMLElement;
    modal.current?.showModal();
    document.body.style.overflow = "hidden";
    setMenuOpen(false);
  }
  function closeBeta() {
    modal.current?.close();
    document.body.style.overflow = "";
    opener.current?.focus();
  }
  const activeScreen = screens[screen];
  return (
    <MotionContext.Provider value={motion}>
      <a href="#contenido" className="skip-link">
        {" "}
        {t("Saltar al contenido")}{" "}
      </a>
      <header className="site-header">
        <a className="brand" href="#" aria-label={t("Lextli, inicio")}>
          <img src="/brand/wordmark.svg" alt="lextli" width="118" height="44" />
        </a>
        <nav
          className={menuOpen ? "main-nav open" : "main-nav"}
          id="navigation"
          aria-label={t("Navegación principal")}
        >
          <a href="#como-funciona" onClick={() => setMenuOpen(false)}>
            {" "}
            {t("Así se aprende")}{" "}
          </a>
          <a href="#loti" onClick={() => setMenuOpen(false)}>
            {" "}
            {t("Conoce a Loti")}{" "}
          </a>
          <a href="#preguntas" onClick={() => setMenuOpen(false)}>
            {" "}
            {t("Tus preguntas")}{" "}
          </a>
        </nav>
        <div className="header-actions">
          <LanguagePicker />
          <button className="button small primary" onClick={openBeta}>
            {" "}
            {t("Conoce la beta")} <ArrowUpRight size={16} />
          </button>
          <button
            className="menu-toggle"
            aria-label={menuOpen ? t("Cerrar menú") : t("Abrir menú")}
            aria-expanded={menuOpen}
            aria-controls="navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="contenido">
        <section className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="tiny-flower">✳</span>{" "}
              {t("INGLÉS A TU RITMO, DE VERDAD")}{" "}
            </div>
            <h1>
              {" "}
              {t("Un poquito")} <br /> {t("de inglés.")} <br />
              <em>{t("Un mundo")}</em>
              <br />
              <em>{t("más tuyo.")}</em>
            </h1>
            <p>
              {" "}
              {t("Para esa canción, ese viaje, esa conversación.")}{" "}
              <br className="desktop-break" />{" "}
              {t("Cultiva tu inglés con Loti. Sin prisa, sin presión")}{" "}
              <br className="desktop-break" />{" "}
              {t("y también sin conexión.")}{" "}
            </p>
            <div className="hero-buttons">
              <a href="#prueba" className="button primary">
                {" "}
                {t("Prueba tu primera palabra")} <ArrowRight size={19} />
              </a>
              <button className="text-button" onClick={openBeta}>
                <Smartphone size={18} /> {t("Para Android")}{" "}
              </button>
            </div>
            <div className="hero-footnote">
              <span className="status-dot" />{" "}
              {t("Aprender es gratis. Crecer es a tu ritmo.")}{" "}
            </div>
          </div>
          <div
            className="hero-art"
            ref={heroArt}
            onPointerMove={(e) => {
              if (!motion || e.pointerType !== "mouse") return;
              const b = e.currentTarget.getBoundingClientRect();
              pointerTilt.current = ((e.clientX - b.left) / b.width - 0.5) * 3;
              if (pointerFrame.current !== null) return;
              pointerFrame.current = requestAnimationFrame(() => {
                heroArt.current?.style.setProperty(
                  "--tilt",
                  `${pointerTilt.current}deg`,
                );
                pointerFrame.current = null;
              });
            }}
            onPointerLeave={() => {
              if (pointerFrame.current !== null)
                cancelAnimationFrame(pointerFrame.current);
              pointerFrame.current = null;
              heroArt.current?.style.setProperty("--tilt", "0deg");
            }}
          >
            <div className="art-orbits" aria-hidden="true">
              <span className="art-orbit orbit-one" />
              <span className="art-orbit orbit-two" />
            </div>
            <div className="loteria-card">
              <div className="card-heading">
                <span>01</span>
                <span>{t("UN PEQUEÑO COMIENZO")}</span>
                <Flower2 size={20} />
              </div>
              <div className="card-scene">
                <div className="sun-disc" />
                <div className="scene-lines" />
                <svg
                  className="hello-note"
                  viewBox="0 0 320 320"
                  aria-hidden="true"
                >
                  <text x="160" y="28" textAnchor="middle">
                    {" "}
                    {t("¡Hola, soy Loti!")}{" "}
                  </text>
                  <path d="M121 36 C93 33 91 52 115 60 M107 53 L115 60 L105 62" />
                </svg>
                <LotiImage
                  className="hero-loti"
                  name="accessory-book"
                  alt={t(
                    "Loti, el ajolote rosa de Lextli, lee su pequeño libro",
                  )}
                  width="380"
                  height="380"
                  fetchPriority="high"
                />
                <span className="scene-spark spark-one">✧</span>
                <span className="scene-spark spark-two">✧</span>
                <svg
                  className="scene-plants"
                  viewBox="0 0 400 160"
                  aria-hidden="true"
                >
                  <g fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M40 150Q60 80 27 22M43 119Q10 110 9 80Q43 84 43 119M46 82Q73 57 73 36Q42 48 46 82M359 150Q340 85 370 35M352 113Q384 97 390 74Q355 81 352 113M351 86Q324 72 326 48Q348 50 351 86" />
                  </g>
                </svg>
              </div>
              <div className="card-title">
                <span>{t("EL COMIENZO")}</span>
                <p>{t("Lo pequeño también crece.")}</p>
              </div>
            </div>
            <div className="hero-details">
              <div className="floating-word">
                <span className="word-icon">
                  <Sprout size={24} />
                </span>
                <div>
                  <strong>
                    grow <span>/ɡroʊ/</span>
                  </strong>
                  <span>{t("crecer · como tú")}</span>
                </div>
                <span className="word-check">
                  <Check size={15} />
                </span>
              </div>
              <div className="round-stamp">
                <span>{t("HECHO CON")}</span>
                <Heart size={16} aria-hidden="true" />
                <span>{t("EN MÉXICO")}</span>
              </div>
            </div>
          </div>
          <a className="scroll-cue" href="#como-funciona">
            <ArrowDown size={16} /> {t("Aquí empieza algo bonito")}{" "}
          </a>
        </section>
        <div className="promise-strip">
          <span>
            <WifiOff /> {t("Tu inglés va contigo")}{" "}
          </span>
          <i>✳</i>
          <span>
            <Heart /> {t("Equivocarse también es aprender")}{" "}
          </span>
          <i>✳</i>
          <span>
            <Sprout /> {t("Un poquito, todos los días")}{" "}
          </span>
        </div>
        <section
          id="como-funciona"
          className="method-section wrap section-space"
        >
          <div className="section-heading reveal">
            <div>
              <span className="eyebrow">
                {" "}
                {t("01 / PEQUEÑOS PASOS, NUEVOS MUNDOS")}{" "}
              </span>
              <h2>
                {" "}
                {t("No necesitas más ganas.")} <br /> {t("Necesitas")}{" "}
                <em>{t("otra forma.")}</em>
              </h2>
            </div>
            <p>
              {" "}
              {t("Menos «algún día voy a aprender».")} <br />{" "}
              {t("Más palabras que empiezan a ser tuyas.")}{" "}
            </p>
          </div>
          <div className="method-grid">
            <article className="method-item reveal">
              <div className="method-illustration word-illustration">
                <div className="mini-word">
                  <span>{t("una palabra, mil posibilidades")}</span>
                  <strong>
                    hello<span>!</span>
                  </strong>
                  <small>{t("hola · tu primer puente")}</small>
                </div>
                <span className="little-flower">✳</span>
              </div>
              <span className="step-label">{t("01 · DESCUBRE")}</span>
              <h3>{t("Palabras con vida.")}</h3>
              <p>
                {" "}
                {t(
                  "Inglés para entender lo que te rodea. Con ejemplos que le dan sentido a cada palabra.",
                )}{" "}
              </p>
            </article>
            <article className="method-item reveal">
              <div className="method-illustration memory-illustration">
                <div className="memory-orbit" />
                <span className="memory-point point-one">{t("Hoy")}</span>
                <span className="memory-point point-two">{t("Después")}</span>
                <div className="memory-center">
                  <Sprout size={43} />
                </div>
                <span className="memory-check">
                  <Check size={22} />
                </span>
                <span className="memory-label">
                  {t("Volver también es avanzar.")}
                </span>
              </div>
              <span className="step-label">{t("02 · RECUERDA")}</span>
              <h3>{t("Que se quede contigo.")}</h3>
              <p>
                {" "}
                {t(
                  "Repasa en el momento adecuado. La repetición espaciada se adapta a lo que vas recordando.",
                )}{" "}
              </p>
            </article>
            <article className="method-item reveal">
              <div className="method-illustration pause-illustration">
                <div className="resume-card">
                  <span>
                    <BookOpen size={20} /> {t("Tu momento de inglés")}{" "}
                  </span>
                  <strong>
                    {" "}
                    {t("¿Seguimos donde")} <br /> {t("lo dejamos?")}{" "}
                  </strong>
                  <span className="resume-pill">
                    {" "}
                    {t("Continuar")} <ArrowRight size={15} />
                  </span>
                </div>
                <span className="pause-moon">
                  <Moon size={25} />
                </span>
              </div>
              <span className="step-label">{t("03 · HAZLO TUYO")}</span>
              <h3>{t("Tu vida no se pausa.")}</h3>
              <p>
                {" "}
                {t(
                  "Deja una actividad a medias y vuelve después. Loti te guarda el lugar, no te pide explicaciones.",
                )}{" "}
              </p>
            </article>
          </div>
        </section>
        <section id="prueba" className="demo-section">
          <div className="wrap demo-layout">
            <div className="demo-copy reveal">
              <span className="eyebrow">
                {" "}
                {t("02 / MENOS CONTARTE. MÁS PROBARLO.")}{" "}
              </span>
              <h2>
                {" "}
                {t("Tu primera palabra")} <br /> {t("está a")}{" "}
                <em>{t("un clic.")}</em>
              </h2>
              <p>
                {" "}
                {t(
                  "No necesitas una cuenta ni un gran propósito de año nuevo. Solo un poquito de curiosidad.",
                )}{" "}
              </p>
              <div className="demo-note">
                <LotiImage
                  name="expression-wink"
                  alt=""
                  width="96"
                  height="96"
                  loading="lazy"
                />
                <span>
                  {" "}
                  {t("«Si te equivocas,")} <br />{" "}
                  {t("lo intentamos otra vez.»")}
                  <small>{t("— Loti, tu compañero")}</small>
                </span>
              </div>
              <span className="demo-detail">
                <WifiOff size={17} />{" "}
                {t("Esta práctica funciona sin enviar tus respuestas.")}{" "}
              </span>
            </div>
            <div className="reveal">
              <Demo />
            </div>
          </div>
        </section>
        <section className="app-section wrap section-space">
          <div className="app-preview reveal">
            <div className="app-halo" />
            <PixelPreview
              src={`/app/${activeScreen.file}.png`}
              alt={`${t("Captura real de Lextli:")} ${t(activeScreen.name)}`}
            />
            <span className="app-caption">
              {" "}
              {locale === "es"
                ? t("Así se ve Lextli · Capturas de la beta")
                : t("Capturas de la beta en español")}{" "}
            </span>
            <span className="offline-note">
              <WifiOff size={22} />
              <strong>
                {" "}
                {t("Modo avión.")} <br /> {t("Mundo abierto.")}{" "}
              </strong>
            </span>
          </div>
          <div className="app-copy reveal">
            <span className="eyebrow">{t("03 / CABE EN TU DÍA")}</span>
            <h2>
              {" "}
              {t("Un pequeño hábito.")} <br />
              <em>{t("Muy a tu manera.")}</em>
            </h2>
            <div
              className="screen-tabs"
              role="tablist"
              aria-label={t("Explora la app")}
            >
              {screens.map((item, i) => (
                <button
                  key={item.file}
                  role="tab"
                  id={`tab-${i}`}
                  aria-controls="screen-panel"
                  aria-selected={screen === i}
                  tabIndex={screen === i ? 0 : -1}
                  onKeyDown={(e) => {
                    if (
                      ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                    ) {
                      e.preventDefault();
                      const target =
                        e.key === "Home"
                          ? 0
                          : e.key === "End"
                            ? 2
                            : (i + (e.key === "ArrowRight" ? 1 : 2)) % 3;
                      setScreen(target);
                      document.getElementById(`tab-${target}`)?.focus();
                    }
                  }}
                  onClick={() => setScreen(i)}
                >
                  {t(item.name)}
                </button>
              ))}
            </div>
            <div
              id="screen-panel"
              role="tabpanel"
              aria-labelledby={`tab-${screen}`}
            >
              <h3>{t(activeScreen.title)}</h3>
              <p>{t(activeScreen.description)}</p>
            </div>
            <ul className="feature-list">
              <li>
                <Check /> {t("Más de 3,000 entradas de vocabulario")}{" "}
              </li>
              <li>
                <Check /> {t("Siete formas de practicar")}{" "}
              </li>
              <li>
                <Check /> {t("Modo claro y oscuro")}{" "}
              </li>
              <li>
                <Check /> {t("Tu práctica descargada, también sin red")}{" "}
              </li>
            </ul>
            <a href="#preguntas" className="inline-link">
              {" "}
              {t("Lo que necesitas saber")} <ArrowRight size={18} />
            </a>
          </div>
        </section>
        <section id="loti" className="loti-section">
          <div className="wrap loti-layout">
            <div className="loti-copy reveal">
              <span className="eyebrow">
                {" "}
                {t("UN AJOLOTE. MUCHAS GANAS DE ACOMPAÑARTE.")}{" "}
              </span>
              <h2>
                {" "}
                {t("Mucho gusto.")} <br />
                <em>{t("Poquita prisa.")}</em>
              </h2>
              <p>
                {" "}
                {t(
                  "Soy Loti. Vengo de un mundo de chinampas, libros y pequeñas historias. Y creo que aprender algo nuevo se disfruta más en buena compañía.",
                )}{" "}
              </p>
              <p className="loti-signature">{t("¿Qué hacemos hoy?")}</p>
              <div
                className="accessory-picker"
                aria-label={t("Elige el accesorio de Loti")}
              >
                {[
                  { id: "accessory-book", name: "Leemos" },
                  { id: "accessory-headphones", name: "Escuchamos" },
                  { id: "accessory-marigolds", name: "Florecemos" },
                ].map((item) => (
                  <button
                    key={item.id}
                    aria-pressed={accessory === item.id}
                    onClick={() => setAccessory(item.id)}
                  >
                    {t(item.name)}
                    {accessory === item.id && <Check size={15} />}
                  </button>
                ))}
              </div>
            </div>
            <div className="loti-stage reveal">
              <span className="loti-circle" />
              <span className="loti-spark">✳</span>
              <LotiImage
                key={accessory}
                name={accessory}
                alt={`Loti: ${accessory === "accessory-book" ? t("con su libro") : accessory === "accessory-headphones" ? t("escuchando con audífonos") : t("con flores de cempasúchil")}`}
                width="420"
                height="420"
                loading="lazy"
              />
              <span className="loti-stage-note">
                {" "}
                {t("Mexicano de origen.")} <br />{" "}
                {t("Curioso por naturaleza.")}{" "}
              </span>
            </div>
          </div>
        </section>
        <section className="manifesto wrap section-space reveal">
          <span className="eyebrow">{t("NUESTRA PROMESA")}</span>
          <h2>
            {" "}
            {t("Tu aprendizaje no tiene")} <br />
            <em>{t("por qué pasar por caja.")}</em>
          </h2>
          <p>
            {" "}
            {t("Practicar, equivocarte, volver, avanzar.")} <br />{" "}
            {t("Eso es tuyo. Y queremos que siga siendo así.")}{" "}
          </p>
          <div className="manifesto-values">
            <span>
              <Heart /> {t("Sin pagar para avanzar")}{" "}
            </span>
            <span>
              <WifiOff /> {t("Sin cobrarte por aprender offline")}{" "}
            </span>
            <span>
              <Sprout /> {t("Sin presión por ser perfecto")}{" "}
            </span>
          </div>
        </section>
        <section id="preguntas" className="faq-section wrap section-space">
          <div className="faq-heading reveal">
            <span className="eyebrow">{t("ANTES DE EMPEZAR")}</span>
            <h2>
              {" "}
              {t("La curiosidad")} <br />
              <em>{t("es bienvenida.")}</em>
            </h2>
            <LotiImage
              name="expression-thinking"
              alt={t("Loti pensando")}
              width="150"
              height="150"
              loading="lazy"
            />
          </div>
          <div className="faq-list reveal">
            {faqs.map(([q, a]) => (
              <details key={t(q)}>
                <summary>
                  {t(q)}
                  <ChevronDown size={21} />
                </summary>
                <p>{t(a)}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="closing-section">
          <div className="wrap closing-inner reveal">
            <span className="closing-flower">✳</span>
            <span className="eyebrow">{t("LO PEQUEÑO TAMBIÉN CRECE.")}</span>
            <h2>
              {" "}
              {t("Tu próximo «hello»")} <br /> {t("puede abrir")}{" "}
              <em>{t("mucho.")}</em>
            </h2>
            <p>{t("Empieza por una palabra. Lo demás, paso a paso.")}</p>
            <a href="#prueba" className="button cream">
              {" "}
              {t("Vamos a empezar")} <ArrowRight size={20} />
            </a>
            <span className="closing-small">
              {" "}
              {t("Con cariño, desde México. Con Loti, a donde quieras.")}{" "}
            </span>
          </div>
        </section>
      </main>
      <footer className="wrap footer">
        <div>
          <a href="#" className="brand">
            <img
              src="/brand/wordmark.svg"
              width="118"
              height="44"
              alt={t("Lextli, volver al inicio")}
            />
          </a>
          <p>{t("Tu inglés. Tu ritmo. Tu mundo.")}</p>
        </div>
        <div className="footer-links">
          <a href="#como-funciona">{t("Así se aprende")}</a>
          <a href="#preguntas">{t("Preguntas frecuentes")}</a>
          <button onClick={openBeta}>
            {" "}
            {t("Estado de la beta")} <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()}{" "}
            {t("Lextli · Hecho para seguir creciendo.")}{" "}
          </span>
          <button aria-pressed={!motion} onClick={() => setMotion(!motion)}>
            {motion ? <Pause size={14} /> : <Play size={14} />}{" "}
            {motion ? t("Pausar animaciones") : t("Activar animaciones")}
          </button>
          <span>
            {" "}
            {t("Hecho en México")} <Heart size={13} />
          </span>
        </div>
      </footer>
      <dialog
        ref={modal}
        className="beta-dialog"
        aria-label={t("Estado de la beta de Lextli")}
        onCancel={(e) => {
          e.preventDefault();
          closeBeta();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeBeta();
        }}
      >
        <div className="beta-content">
          <button
            className="dialog-close"
            onClick={closeBeta}
            aria-label={t("Cerrar")}
          >
            <X />
          </button>
          <LotiImage
            name="expression-happy"
            alt={t("Loti te da la bienvenida")}
            width="135"
            height="135"
          />
          <span className="eyebrow">{t("ESTAMOS CULTIVANDO ALGO BONITO")}</span>
          <h2>
            {" "}
            {t("Nos vemos")} <br />
            <em>{t("muy pronto.")}</em>
          </h2>
          <p>
            {" "}
            {t(
              "Lextli está en beta para Android. La descarga pública todavía no está disponible aquí.",
            )}{" "}
          </p>
          <p>
            {" "}
            {t(
              "Puedes conocer la experiencia con tres palabras, sin registrarte.",
            )}{" "}
          </p>
          <button
            className="button primary"
            onClick={() => {
              closeBeta();
              document
                .getElementById("prueba")
                ?.scrollIntoView({ behavior: motion ? "smooth" : "instant" });
            }}
          >
            {" "}
            {t("Probar la práctica")} <ArrowRight size={18} />
          </button>
          <small>{t("Sin lista de espera ni datos personales.")}</small>
        </div>
      </dialog>
    </MotionContext.Provider>
  );
}
