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

const loti = (name: string) => `/loti/${name}.svg`;
const MotionContext = createContext(true);
function LotiImage({ src, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const motion = useContext(MotionContext);
  return (
    <img {...props} src={motion ? src : src?.replace(".svg", "-still.svg")} />
  );
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
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [audioStatus, setAudioStatus] = useState("");
  const nextButton = useRef<HTMLButtonElement>(null);
  const questionTitle = useRef<HTMLHeadingElement>(null);
  const lesson = lessons[step];
  const correct = selected === lesson.answer;
  useEffect(
    () => () => {
      window.speechSynthesis?.cancel();
    },
    [],
  );
  function speak() {
    if (!("speechSynthesis" in window)) {
      setAudioStatus(
        "Este navegador no ofrece lectura de voz. Puedes leer la frase.",
      );
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lesson.sentence);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.onerror = () =>
      setAudioStatus(
        "No se pudo reproducir. La frase sigue disponible para leer.",
      );
    setAudioStatus("");
    window.speechSynthesis.speak(utterance);
  }
  function next() {
    window.speechSynthesis?.cancel();
    if (step === lessons.length - 1) setDone(true);
    else setStep(step + 1);
    setSelected(null);
    setAudioStatus("");
    requestAnimationFrame(() => questionTitle.current?.focus());
  }
  return (
    <div className="demo-card">
      <div className="demo-top">
        <span>
          <Sprout size={18} /> TU PRIMER BROTE
        </span>
        <span>{done ? 3 : step + 1} / 3</span>
      </div>
      <div className="progress-track">
        <i style={{ width: `${done ? 100 : (step / 3) * 100}%` }} />
      </div>
      {done ? (
        <div className="demo-complete">
          <LotiImage
            src={loti("expression-excited")}
            alt="Loti celebra contigo"
            width="160"
            height="160"
            loading="lazy"
          />
          <h3 ref={questionTitle} tabIndex={-1}>
            Ya empezó a crecer.
          </h3>
          <p>
            Tres palabras, un pequeño comienzo.
            <br />
            Imagina todo lo que viene después.
          </p>
          <button
            className="button primary"
            onClick={() => {
              setDone(false);
              setStep(0);
              requestAnimationFrame(() => questionTitle.current?.focus());
            }}
          >
            <RotateCcw size={18} /> Volver a practicar
          </button>
        </div>
      ) : (
        <>
          <div className="word-question">
            <span>¿QUÉ SIGNIFICA…?</span>
            <h3 ref={questionTitle} tabIndex={-1}>
              {lesson.word}
              <button
                className="sound-button"
                aria-label={`Escuchar ${lesson.sentence}`}
                onClick={speak}
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
                aria-label={`${String.fromCharCode(65 + i)} ${choice}`}
                disabled={correct}
                className={`answer ${selected === i ? (correct ? "correct" : "incorrect") : ""}`}
                onClick={() => {
                  setSelected(i);
                  if (i === lesson.answer)
                    requestAnimationFrame(() => nextButton.current?.focus());
                }}
              >
                <span>{String.fromCharCode(65 + i)}</span>
                {choice}
                {selected === i &&
                  (correct ? <Check size={20} /> : <RotateCcw size={18} />)}
              </button>
            ))}
          </div>
          <div className="answer-feedback" role="status">
            {selected === null
              ? "Sin reloj. Sin presión. Dale una oportunidad."
              : correct
                ? `¡Eso es! ${lesson.translation}`
                : "Casi. Prueba otra opción; aquí equivocarse también cuenta."}
            {audioStatus && <small>{audioStatus}</small>}
          </div>
          {correct && (
            <button
              ref={nextButton}
              className="button primary next-button"
              onClick={next}
            >
              {step === 2 ? "Ver mi pequeño logro" : "Siguiente palabra"}
              <ArrowRight size={18} />
            </button>
          )}
        </>
      )}
      <div className="demo-caption">
        Una muestra de práctica · No guarda progreso en la app
      </div>
    </div>
  );
}

export default function App() {
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
        Saltar al contenido
      </a>
      <header className="site-header">
        <a className="brand" href="#" aria-label="Lextli, inicio">
          <img src="/brand/wordmark.svg" alt="lextli" width="118" height="44" />
        </a>
        <nav
          className={menuOpen ? "main-nav open" : "main-nav"}
          id="navigation"
          aria-label="Navegación principal"
        >
          <a href="#como-funciona" onClick={() => setMenuOpen(false)}>
            Así se aprende
          </a>
          <a href="#loti" onClick={() => setMenuOpen(false)}>
            Conoce a Loti
          </a>
          <a href="#preguntas" onClick={() => setMenuOpen(false)}>
            Tus preguntas
          </a>
        </nav>
        <div className="header-actions">
          <button className="button small primary" onClick={openBeta}>
            Conoce la beta <ArrowUpRight size={16} />
          </button>
          <button
            className="menu-toggle"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
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
              <span className="tiny-flower">✳</span> INGLÉS A TU RITMO, DE
              VERDAD
            </div>
            <h1>
              Un poquito
              <br />
              de inglés.
              <br />
              <em>Un mundo</em>
              <br />
              <em>más tuyo.</em>
            </h1>
            <p>
              Para esa canción, ese viaje, esa conversación.
              <br className="desktop-break" /> Cultiva tu inglés con Loti. Sin
              prisa, sin presión
              <br className="desktop-break" /> y también sin conexión.
            </p>
            <div className="hero-buttons">
              <a href="#prueba" className="button primary">
                Prueba tu primera palabra <ArrowRight size={19} />
              </a>
              <button className="text-button" onClick={openBeta}>
                <Smartphone size={18} /> Para Android
              </button>
            </div>
            <div className="hero-footnote">
              <span className="status-dot" /> Aprender es gratis. Crecer es a tu
              ritmo.
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
                <span>UN PEQUEÑO COMIENZO</span>
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
                    ¡Hola, soy Loti!
                  </text>
                  <path d="M121 36 C93 33 91 52 115 60 M107 53 L115 60 L105 62" />
                </svg>
                <LotiImage
                  className="hero-loti"
                  src={loti("accessory-book")}
                  alt="Loti, el ajolote rosa de Lextli, lee su pequeño libro"
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
                <span>EL COMIENZO</span>
                <p>Lo pequeño también crece.</p>
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
                  <span>crecer · como tú</span>
                </div>
                <span className="word-check">
                  <Check size={15} />
                </span>
              </div>
              <div className="round-stamp">
                HECHO CON
                <br />
                <Heart size={20} />
                <br />
                EN MÉXICO
              </div>
            </div>
          </div>
          <a className="scroll-cue" href="#como-funciona">
            <ArrowDown size={16} /> Aquí empieza algo bonito
          </a>
        </section>
        <div className="promise-strip">
          <span>
            <WifiOff /> Tu inglés va contigo
          </span>
          <i>✳</i>
          <span>
            <Heart /> Equivocarse también es aprender
          </span>
          <i>✳</i>
          <span>
            <Sprout /> Un poquito, todos los días
          </span>
        </div>
        <section
          id="como-funciona"
          className="method-section wrap section-space"
        >
          <div className="section-heading reveal">
            <div>
              <span className="eyebrow">
                01 / PEQUEÑOS PASOS, NUEVOS MUNDOS
              </span>
              <h2>
                No necesitas más ganas.
                <br />
                Necesitas <em>otra forma.</em>
              </h2>
            </div>
            <p>
              Menos «algún día voy a aprender».
              <br />
              Más palabras que empiezan a ser tuyas.
            </p>
          </div>
          <div className="method-grid">
            <article className="method-item reveal">
              <div className="method-illustration word-illustration">
                <div className="mini-word">
                  <span>una palabra, mil posibilidades</span>
                  <strong>
                    hello<span>!</span>
                  </strong>
                  <small>hola · tu primer puente</small>
                </div>
                <span className="little-flower">✳</span>
              </div>
              <span className="step-label">01 · DESCUBRE</span>
              <h3>Palabras con vida.</h3>
              <p>
                Inglés para entender lo que te rodea. Con ejemplos que le dan
                sentido a cada palabra.
              </p>
            </article>
            <article className="method-item reveal">
              <div className="method-illustration memory-illustration">
                <div className="memory-orbit" />
                <span className="memory-point point-one">Hoy</span>
                <span className="memory-point point-two">Después</span>
                <div className="memory-center">
                  <Sprout size={43} />
                </div>
                <span className="memory-check">
                  <Check size={22} />
                </span>
                <span className="memory-label">Volver también es avanzar.</span>
              </div>
              <span className="step-label">02 · RECUERDA</span>
              <h3>Que se quede contigo.</h3>
              <p>
                Repasa en el momento adecuado. La repetición espaciada se adapta
                a lo que vas recordando.
              </p>
            </article>
            <article className="method-item reveal">
              <div className="method-illustration pause-illustration">
                <div className="resume-card">
                  <span>
                    <BookOpen size={20} /> Tu momento de inglés
                  </span>
                  <strong>
                    ¿Seguimos donde
                    <br />
                    lo dejamos?
                  </strong>
                  <span className="resume-pill">
                    Continuar <ArrowRight size={15} />
                  </span>
                </div>
                <span className="pause-moon">
                  <Moon size={25} />
                </span>
              </div>
              <span className="step-label">03 · HAZLO TUYO</span>
              <h3>Tu vida no se pausa.</h3>
              <p>
                Deja una actividad a medias y vuelve después. Loti te guarda el
                lugar, no te pide explicaciones.
              </p>
            </article>
          </div>
        </section>
        <section id="prueba" className="demo-section">
          <div className="wrap demo-layout">
            <div className="demo-copy reveal">
              <span className="eyebrow">
                02 / MENOS CONTARTE. MÁS PROBARLO.
              </span>
              <h2>
                Tu primera palabra
                <br />
                está a <em>un clic.</em>
              </h2>
              <p>
                No necesitas una cuenta ni un gran propósito de año nuevo. Solo
                un poquito de curiosidad.
              </p>
              <div className="demo-note">
                <LotiImage
                  src={loti("expression-wink")}
                  alt=""
                  width="96"
                  height="96"
                  loading="lazy"
                />
                <span>
                  «Si te equivocas,
                  <br />
                  lo intentamos otra vez.»<small>— Loti, tu compañero</small>
                </span>
              </div>
              <span className="demo-detail">
                <WifiOff size={17} /> Esta práctica funciona sin enviar tus
                respuestas.
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
            <div className="phone">
              <div className="phone-camera" />
              <img
                key={activeScreen.file}
                src={`/app/${activeScreen.file}.png`}
                alt={`Captura real de Lextli: ${activeScreen.name}`}
                width="412"
                height="892"
                loading="lazy"
              />
            </div>
            <span className="app-caption">
              Así se ve Lextli · Capturas de la beta
            </span>
            <span className="offline-note">
              <WifiOff size={22} />
              <strong>
                Modo avión.
                <br />
                Mundo abierto.
              </strong>
            </span>
          </div>
          <div className="app-copy reveal">
            <span className="eyebrow">03 / CABE EN TU DÍA</span>
            <h2>
              Un pequeño hábito.
              <br />
              <em>Muy a tu manera.</em>
            </h2>
            <div
              className="screen-tabs"
              role="tablist"
              aria-label="Explora la app"
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
                  {item.name}
                </button>
              ))}
            </div>
            <div
              id="screen-panel"
              role="tabpanel"
              aria-labelledby={`tab-${screen}`}
            >
              <h3>{activeScreen.title}</h3>
              <p>{activeScreen.description}</p>
            </div>
            <ul className="feature-list">
              <li>
                <Check /> Más de 3,000 entradas de vocabulario
              </li>
              <li>
                <Check /> Siete formas de practicar
              </li>
              <li>
                <Check /> Modo claro y oscuro
              </li>
              <li>
                <Check /> Tu práctica descargada, también sin red
              </li>
            </ul>
            <a href="#preguntas" className="inline-link">
              Lo que necesitas saber <ArrowRight size={18} />
            </a>
          </div>
        </section>
        <section id="loti" className="loti-section">
          <div className="wrap loti-layout">
            <div className="loti-copy reveal">
              <span className="eyebrow">
                UN AJOLOTE. MUCHAS GANAS DE ACOMPAÑARTE.
              </span>
              <h2>
                Mucho gusto.
                <br />
                <em>Poquita prisa.</em>
              </h2>
              <p>
                Soy Loti. Vengo de un mundo de chinampas, libros y pequeñas
                historias. Y creo que aprender algo nuevo se disfruta más en
                buena compañía.
              </p>
              <p className="loti-signature">¿Qué hacemos hoy?</p>
              <div
                className="accessory-picker"
                aria-label="Elige el accesorio de Loti"
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
                    {item.name}
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
                src={loti(accessory)}
                alt={`Loti: ${accessory === "accessory-book" ? "con su libro" : accessory === "accessory-headphones" ? "escuchando con audífonos" : "con flores de cempasúchil"}`}
                width="420"
                height="420"
                loading="lazy"
              />
              <span className="loti-stage-note">
                Mexicano de origen.
                <br />
                Curioso por naturaleza.
              </span>
            </div>
          </div>
        </section>
        <section className="manifesto wrap section-space reveal">
          <span className="eyebrow">NUESTRA PROMESA</span>
          <h2>
            Tu aprendizaje no tiene
            <br />
            <em>por qué pasar por caja.</em>
          </h2>
          <p>
            Practicar, equivocarte, volver, avanzar.
            <br />
            Eso es tuyo. Y queremos que siga siendo así.
          </p>
          <div className="manifesto-values">
            <span>
              <Heart /> Sin pagar para avanzar
            </span>
            <span>
              <WifiOff /> Sin cobrarte por aprender offline
            </span>
            <span>
              <Sprout /> Sin presión por ser perfecto
            </span>
          </div>
        </section>
        <section id="preguntas" className="faq-section wrap section-space">
          <div className="faq-heading reveal">
            <span className="eyebrow">ANTES DE EMPEZAR</span>
            <h2>
              La curiosidad
              <br />
              <em>es bienvenida.</em>
            </h2>
            <LotiImage
              src={loti("expression-thinking")}
              alt="Loti pensando"
              width="150"
              height="150"
              loading="lazy"
            />
          </div>
          <div className="faq-list reveal">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <ChevronDown size={21} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="closing-section">
          <div className="wrap closing-inner reveal">
            <span className="closing-flower">✳</span>
            <span className="eyebrow">LO PEQUEÑO TAMBIÉN CRECE.</span>
            <h2>
              Tu próximo «hello»
              <br />
              puede abrir <em>mucho.</em>
            </h2>
            <p>Empieza por una palabra. Lo demás, paso a paso.</p>
            <a href="#prueba" className="button cream">
              Vamos a empezar <ArrowRight size={20} />
            </a>
            <span className="closing-small">
              Con cariño, desde México. Con Loti, a donde quieras.
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
              alt="Lextli, volver al inicio"
            />
          </a>
          <p>Tu inglés. Tu ritmo. Tu mundo.</p>
        </div>
        <div className="footer-links">
          <a href="#como-funciona">Así se aprende</a>
          <a href="#preguntas">Preguntas frecuentes</a>
          <button onClick={openBeta}>
            Estado de la beta <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Lextli · Hecho para seguir creciendo.
          </span>
          <button aria-pressed={!motion} onClick={() => setMotion(!motion)}>
            {motion ? <Pause size={14} /> : <Play size={14} />}{" "}
            {motion ? "Pausar animaciones" : "Activar animaciones"}
          </button>
          <span>
            Hecho en México <Heart size={13} />
          </span>
        </div>
      </footer>
      <dialog
        ref={modal}
        className="beta-dialog"
        aria-label="Estado de la beta de Lextli"
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
            aria-label="Cerrar"
          >
            <X />
          </button>
          <LotiImage
            src={loti("expression-happy")}
            alt="Loti te da la bienvenida"
            width="135"
            height="135"
          />
          <span className="eyebrow">ESTAMOS CULTIVANDO ALGO BONITO</span>
          <h2>
            Nos vemos
            <br />
            <em>muy pronto.</em>
          </h2>
          <p>
            Lextli está en beta para Android. La descarga pública todavía no
            está disponible aquí.
          </p>
          <p>
            Puedes conocer la experiencia con tres palabras, sin registrarte.
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
            Probar la práctica <ArrowRight size={18} />
          </button>
          <small>Sin lista de espera ni datos personales.</small>
        </div>
      </dialog>
    </MotionContext.Provider>
  );
}
