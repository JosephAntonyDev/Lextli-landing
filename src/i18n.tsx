import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useId,
} from "react";
import type { ReactNode } from "react";
import { Languages, ChevronDown, Check, Globe2, Sparkles } from "lucide-react";
import { messages } from "./messages";
import { extraMessages } from "./messages-extra";
import { asiaMessages } from "./messages-asia";

export const locales = [
  "es",
  "en",
  "fr",
  "ru",
  "pt",
  "it",
  "de",
  "ja",
  "ko",
  "zh",
  "id",
  "km",
] as const;
export type Locale = (typeof locales)[number];
type Preference = Locale | "auto";
const storageKey = "lextli.locale";
const names: Record<Locale, string> = {
  es: "Español",
  en: "English",
  fr: "Français",
  ru: "Русский",
  pt: "Português",
  it: "Italiano",
  de: "Deutsch",
  ja: "日本語",
  ko: "한국어",
  zh: "中文（简体）",
  id: "Bahasa Indonesia",
  km: "ខ្មែរ",
};
const glyphs: Record<Locale, string> = {
  es: "Ñ",
  en: "A",
  fr: "Ç",
  ru: "Я",
  pt: "Ã",
  it: "È",
  de: "Ä",
  ja: "あ",
  ko: "한",
  zh: "文",
  id: "I",
  km: "ក",
};
const column = (
  source: Record<string, readonly string[]>,
  index: number,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(source).map(([key, values]) => [key, values[index]]),
  );
export const catalogs: Record<Exclude<Locale, "es">, Record<string, string>> = {
  en: column(messages, 0),
  fr: column(messages, 1),
  ru: column(messages, 2),
  pt: column(extraMessages, 0),
  it: column(extraMessages, 1),
  de: column(extraMessages, 2),
  ja: column(asiaMessages, 0),
  ko: column(asiaMessages, 1),
  zh: column(asiaMessages, 2),
  id: column(asiaMessages, 3),
  km: column(asiaMessages, 4),
};
const supported = (value: string): value is Locale =>
  locales.includes(value as Locale);

export function browserLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const code = language.toLowerCase().split(/[-_]/)[0];
    const base = code === "in" ? "id" : code;
    if (supported(base)) return base;
  }
  return "es";
}
export function translate(locale: Locale, key: string): string {
  if (locale === "es") return key;
  return catalogs[locale][key] ?? key;
}
function storedPreference(): Preference {
  try {
    const value = localStorage.getItem(storageKey);
    return value && supported(value) ? value : "auto";
  } catch {
    return "auto";
  }
}
const Context = createContext({
  locale: "es" as Locale,
  preference: "auto" as Preference,
  setPreference: (_value: Preference) => {},
  t: (key: string) => key,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<Preference>(storedPreference);
  const [detected, setDetected] = useState(() =>
    browserLocale(navigator.languages ?? [navigator.language]),
  );
  const locale = preference === "auto" ? detected : preference;
  const t = (key: string) => translate(locale, key);
  useEffect(() => {
    const update = () =>
      setDetected(browserLocale(navigator.languages ?? [navigator.language]));
    window.addEventListener("languagechange", update);
    return () => window.removeEventListener("languagechange", update);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = translate(locale, "Lextli · Tu inglés, a tu ritmo");
    const description = translate(
      locale,
      "Aprende palabras en contexto, practica a tu ritmo y conoce a Loti. Inglés también sin conexión.",
    );
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", document.title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", description);
  }, [locale]);
  const change = (value: Preference) => {
    setPreference(value);
    try {
      if (value === "auto") localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, value);
    } catch {
      /* The selection still works when browser storage is blocked. */
    }
  };
  return (
    <Context.Provider value={{ locale, preference, setPreference: change, t }}>
      {children}
    </Context.Provider>
  );
}

export const useTranslation = () => useContext(Context);

export function LanguagePicker() {
  const { locale, preference, setPreference, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();
  const values: Preference[] = ["auto", ...locales];
  const [focused, setFocused] = useState(0);
  const show = () => {
    setFocused(Math.max(0, values.indexOf(preference)));
    setOpen(true);
  };
  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus();
  };
  useEffect(() => {
    if (open) options.current[focused]?.focus();
  }, [open, focused]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  return (
    <div
      className="language-picker"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        className="language-trigger"
        aria-label={t("Idioma de la página")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => (open ? close() : show())}
        onKeyDown={(event) => {
          if (["ArrowDown", "ArrowUp"].includes(event.key)) {
            event.preventDefault();
            show();
          }
          if (event.key === "Escape") close(true);
        }}
      >
        <Languages size={18} aria-hidden="true" />
        <span className="language-code" key={locale} aria-hidden="true">
          {locale.toUpperCase()}
        </span>
        <ChevronDown
          className="language-chevron"
          size={13}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="language-popover">
          <div className="language-popover__heading">
            <span className="language-popover__icon">
              <Languages size={20} />
            </span>
            <div>
              <strong>{t("Tu mundo, tus palabras.")}</strong>
              <span>{t("Elige cómo explorar Lextli")}</span>
            </div>
          </div>
          <div
            role="listbox"
            id={id}
            aria-label={t("Idioma de la página")}
            className="language-options"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                close(true);
                return;
              }
              const last = values.length - 1;
              const target =
                event.key === "ArrowDown"
                  ? (focused + 1) % values.length
                  : event.key === "ArrowUp"
                    ? (focused + last) % values.length
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? last
                        : -1;
              if (target >= 0) {
                event.preventDefault();
                setFocused(target);
              } else if (event.key.length === 1 && event.key !== " ") {
                const match = values.findIndex((value) =>
                  (value === "auto" ? t("Automático") : names[value])
                    .toLocaleLowerCase(locale)
                    .startsWith(event.key.toLocaleLowerCase(locale)),
                );
                if (match >= 0) {
                  event.preventDefault();
                  setFocused(match);
                }
              }
            }}
          >
            {values.map((value, index) => (
              <button
                key={value}
                type="button"
                role="option"
                lang={value === "auto" ? locale : value}
                ref={(element) => {
                  options.current[index] = element;
                }}
                tabIndex={focused === index ? 0 : -1}
                aria-selected={preference === value}
                onFocus={() => setFocused(index)}
                onClick={() => {
                  setPreference(value);
                  close(true);
                }}
                className={`language-option ${value === "auto" ? "language-option--auto" : ""}`}
              >
                <span className="language-option__symbol" aria-hidden="true">
                  {value === "auto" ? <Globe2 size={19} /> : glyphs[value]}
                </span>
                <span className="language-option__copy">
                  <strong lang={value === "auto" ? locale : value}>
                    {value === "auto" ? t("Automático") : names[value]}
                  </strong>
                  <small>
                    {value === "auto"
                      ? t("Según tu navegador")
                      : value.toUpperCase()}
                  </small>
                </span>
                <span className="language-option__check" aria-hidden="true">
                  {preference === value && <Check size={16} />}
                </span>
              </button>
            ))}
          </div>
          <div className="language-popover__footer">
            <Sparkles size={14} aria-hidden="true" />
            {t("Tu ritmo no cambia.")}
          </div>
        </div>
      )}
    </div>
  );
}
