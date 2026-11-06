// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { browserLocale, catalogs } from "./i18n";
import { messages } from "./messages";

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(navigator, "languages", "get").mockReturnValue(["es-MX"]);
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.style.overflow = "";
});

describe("Landing de Lextli", () => {
  it("detecta variantes regionales y usa español si ningún idioma está disponible", () => {
    expect(browserLocale(["nl-NL", "fr-CA", "en-US"])).toBe("fr");
    expect(browserLocale(["pt-BR", "es-MX"])).toBe("pt");
    expect(browserLocale(["pt-PT"])).toBe("pt");
    expect(browserLocale(["it-IT"])).toBe("it");
    expect(browserLocale(["de-AT"])).toBe("de");
    expect(browserLocale(["ru-RU"])).toBe("ru");
    expect(browserLocale(["es-MX"])).toBe("es");
    expect(browserLocale(["ja-JP"])).toBe("ja");
    expect(browserLocale(["ko-KR"])).toBe("ko");
    expect(browserLocale(["zh-Hans-CN"])).toBe("zh");
    expect(browserLocale(["id-ID"])).toBe("id");
    expect(browserLocale(["in-ID"])).toBe("id");
    expect(browserLocale(["km-KH"])).toBe("km");
    expect(browserLocale(["nl-NL"])).toBe("es");
  });

  it("mantiene todos los catálogos completos y sin traducciones vacías", () => {
    for (const catalog of Object.values(catalogs)) {
      expect(Object.keys(catalog).sort()).toEqual(Object.keys(messages).sort());
      expect(
        Object.values(catalog).every((value) => value.trim().length > 0),
      ).toBe(true);
    }
  });

  it.each([
    ["Português", "pt", "A crescer", "Próxima palavra"],
    ["Italiano", "it", "A crescere", "Prossima parola"],
    ["Deutsch", "de", "A wachsen", "Nächstes Wort"],
    ["日本語", "ja", "A 育つ", "次の単語"],
    ["한국어", "ko", "A 자라다", "다음 단어"],
    ["中文", "zh", "A 成长", "下一个单词"],
    ["Bahasa Indonesia", "id", "A tumbuh", "Kata berikutnya"],
    ["ខ្មែរ", "km", "A លូតលាស់", "ពាក្យបន្ទាប់"],
  ])("permite practicar en %s", async (name, locale, answer, next) => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Idioma de la página" }),
    );
    await user.click(screen.getByRole("option", { name: new RegExp(name) }));
    expect(document.documentElement.lang).toBe(locale);
    await user.click(screen.getByRole("button", { name: answer }));
    expect(screen.getByRole("button", { name: next })).toBeTruthy();
    expect(localStorage.getItem("lextli.locale")).toBe(locale);
  });

  it("incluye la imagen de preguntas en la página también al pausar animaciones", async () => {
    const user = userEvent.setup();
    render(<App />);
    const image = screen.getByAltText("Loti pensando");
    const animated = image.getAttribute("src")!;
    expect(animated).toMatch(/^data:image\/svg\+xml/);
    const svg = new DOMParser().parseFromString(
      decodeURIComponent(animated.split(",")[1]),
      "image/svg+xml",
    );
    expect(svg.querySelector("parsererror")).toBeNull();
    expect(svg.querySelectorAll("path").length).toBeGreaterThan(0);
    await user.click(
      screen.getByRole("button", { name: "Pausar animaciones" }),
    );
    const still = image.getAttribute("src")!;
    expect(still).not.toBe(animated);
    expect(decodeURIComponent(still)).not.toContain("<style>");
  });

  it("detecta el idioma del navegador y conserva la elección manual al recargar", async () => {
    vi.spyOn(navigator, "languages", "get").mockReturnValue(["fr-CA"]);
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    expect(document.documentElement.lang).toBe("fr");
    await user.click(screen.getByRole("button", { name: "Langue de la page" }));
    await user.click(screen.getByRole("option", { name: /Русский/ }));
    expect(document.documentElement.lang).toBe("ru");
    expect(localStorage.getItem("lextli.locale")).toBe("ru");
    expect(screen.getByRole("button", { name: "A расти" })).toBeTruthy();
    expect(screen.queryByRole("listbox")).toBeNull();
    unmount();
    render(<App />);
    expect(document.documentElement.lang).toBe("ru");
    expect(document.title).toContain("Английский");
    await user.click(screen.getByRole("button", { name: "Язык страницы" }));
    await user.click(screen.getByRole("option", { name: /Автоматически/ }));
    expect(document.documentElement.lang).toBe("fr");
    expect(localStorage.getItem("lextli.locale")).toBeNull();
  });

  it("mantiene el progreso al cambiar idioma y permite cerrar el selector con teclado", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "A crecer" }));
    const trigger = screen.getByRole("button", { name: "Idioma de la página" });
    trigger.focus();
    await user.keyboard("{ArrowDown}{End}{Escape}");
    expect(document.activeElement).toBe(trigger);
    expect(screen.queryByRole("listbox")).toBeNull();
    await user.click(trigger);
    await user.click(screen.getByRole("option", { name: /English/ }));
    expect(screen.getByRole("button", { name: "Next word" })).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "A to grow" })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(screen.getByText("Little by little, we grow.")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Page language" }));
    await user.click(screen.getByRole("button", { name: "Explore the beta" }));
    expect(screen.queryByRole("listbox")).toBeNull();
  });
  it("permite equivocarse, completar tres palabras y volver a practicar sin registrarse", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "B olvidar" }));
    expect(screen.getByRole("status").textContent).toContain(
      "Prueba otra opción",
    );
    expect(
      screen.queryByRole("button", { name: "Siguiente palabra" }),
    ).toBeNull();
    await user.click(screen.getByRole("button", { name: "A crecer" }));
    expect(screen.getByRole("status").textContent).toContain(
      "Poco a poco, crecemos",
    );
    expect(
      screen.getByRole("button", { name: "A crecer" }).hasAttribute("disabled"),
    ).toBe(true);
    await user.click(screen.getByRole("button", { name: "Siguiente palabra" }));
    await user.click(screen.getByRole("button", { name: "B recordar" }));
    await user.click(screen.getByRole("button", { name: "Siguiente palabra" }));
    await user.click(screen.getByRole("button", { name: "C juntos" }));
    await user.click(
      screen.getByRole("button", { name: "Ver mi pequeño logro" }),
    );
    expect(
      screen.getByRole("heading", { name: "Ya empezó a crecer." }),
    ).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: "Volver a practicar" }),
    );
    expect(
      screen.getByRole("button", { name: "A crecer" }).hasAttribute("disabled"),
    ).toBe(false);
  });

  it("conserva una alternativa legible si el navegador no ofrece voz", async () => {
    render(<App />);
    await userEvent.click(
      screen.getByRole("button", {
        name: "Escuchar Little by little, we grow.",
      }),
    );
    expect(screen.getByRole("status").textContent).toContain(
      "Puedes leer la frase",
    );
    expect(screen.getByText("Little by little, we grow.")).toBeTruthy();
  });

  it("abre la información real de la beta y restablece el scroll al cerrar", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Conoce la beta" }));
    expect(screen.getByRole("dialog").hasAttribute("open")).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent(
      screen.getByRole("dialog"),
      new Event("cancel", { cancelable: true }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Conoce la beta" }),
    );
  });

  it("cierra el menú con Escape y al navegar", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    expect(
      screen
        .getByRole("button", { name: "Cerrar menú" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
    await user.keyboard("{Escape}");
    expect(
      screen
        .getByRole("button", { name: "Abrir menú" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    await user.click(screen.getByRole("link", { name: "Conoce a Loti" }));
    expect(
      screen
        .getByRole("button", { name: "Abrir menú" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("permite navegar las capturas con teclado y cambiar a Loti", async () => {
    const user = userEvent.setup();
    render(<App />);
    screen.getByRole("tab", { name: "Tu camino" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(
      screen
        .getByRole("tab", { name: "Tu práctica" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(
      screen
        .getByAltText("Captura real de Lextli: Tu práctica")
        .getAttribute("src"),
    ).toContain("session-light");
    await user.keyboard("{End}");
    expect(
      screen
        .getByRole("tab", { name: "Tu colección" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    await user.click(screen.getByRole("button", { name: "Escuchamos" }));
    expect(
      screen.getByAltText("Loti: escuchando con audífonos").getAttribute("src"),
    ).toContain("headphones");
  });

  it("pausa también los SVG animados y respeta movimiento reducido", async () => {
    const { unmount } = render(<App />);
    await userEvent.click(
      screen.getByRole("button", { name: "Pausar animaciones" }),
    );
    expect(document.documentElement.dataset.motion).toBe("off");
    expect(
      screen
        .getByAltText("Loti, el ajolote rosa de Lextli, lee su pequeño libro")
        .getAttribute("src"),
    ).toContain("-still.svg");
    unmount();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    render(<App />);
    expect(
      screen.getByRole("button", { name: "Activar animaciones" }),
    ).toBeTruthy();
    expect(document.documentElement.dataset.motion).toBe("off");
  });
});
