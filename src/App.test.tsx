// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => {
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
  document.body.style.overflow = "";
});

describe("Landing de Lextli", () => {
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
