import Config from "../types/config";
import titleIndications from "../utils/title-indications";
import reply from "./reply";

const pressedKeys: string[] = [];
const listeners: {
  element: HTMLElement;
  fn: (this: HTMLElement, ev: MouseEvent) => any;
}[] = [];

/**
 * Create a listener on the keyboard to inject the code
 * @param config
 */
function codeListener(config: Config) {
  document.body.addEventListener("keydown", function (event) {
    pressedKeys.push(event.key);
    if (pressedKeys.length > config.code.length) pressedKeys.shift();
    if (pressedKeys.join("") === config.code) {
      pressedKeys.length = 0;
      setUpMoodleGpt(config);
    }
  });
}

/**
 * Setup moodleGPT into the page (remove/injection)
 * @param config
 * @returns
 */
function setUpMoodleGpt(config: Config) {
  /* Removing events */
  if (listeners.length > 0) {
    for (const listener of listeners) {
      if (config.cursor) listener.element.style.cursor = "initial";
      listener.element.removeEventListener("click", listener.fn);
    }
    if (config.title) titleIndications("Removed");
    listeners.length = 0;
    return;
  }

  /* Code injection */
  const inputQuery = ["checkbox", "radio", "text", "number"]
    .map((e) => `input[type="${e}"]`)
    .join(",");
  const query = inputQuery + ", textarea, select, [contenteditable]";
  const forms = document.querySelectorAll(".formulation");

  for (const form of forms) {
    const hiddenButton: HTMLElement = form.querySelector(".qtext");

    if (!hiddenButton) continue;

    if (config.cursor) hiddenButton.style.cursor = "pointer";

    const injectionFunction = reply.bind(
      null,
      config,
      hiddenButton,
      form,
      query
    );
    listeners.push({ element: hiddenButton, fn: injectionFunction });
    hiddenButton.addEventListener("click", injectionFunction);
  }

  if (config.title) titleIndications("Injected");
}

/**
 * Remove the event listener on a specific question
 * @param element
 */
function removeListener(element: HTMLElement) {
  const index = listeners.findIndex((listener) => listener.element === element);
  if (index !== -1) {
    const listener = listeners.splice(index, 1)[0];
    listener.element.removeEventListener("click", listener.fn);
  }
}

export { codeListener, removeListener };
