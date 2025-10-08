import type { SocialProvider } from "../_types/types";

export const socialProviders: SocialProvider[] = [
  {
    name: "Quantum ID",
    icon: (
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M12 2.75c-5.1 0-9.25 4.15-9.25 9.25s4.15 9.25 9.25 9.25 9.25-4.15 9.25-9.25S17.1 2.75 12 2.75Zm0 1.5c4.27 0 7.75 3.48 7.75 7.75s-3.48 7.75-7.75 7.75-7.75-3.48-7.75-7.75S7.73 4.25 12 4.25Z"
          fill="currentColor"
          opacity="0.6"
        />
        <path
          d="M12 7.25a4.75 4.75 0 1 0 4.75 4.75A4.76 4.76 0 0 0 12 7.25Zm0 1.5a3.25 3.25 0 1 1-3.25 3.25A3.25 3.25 0 0 1 12 8.75Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "Nebula",
    icon: (
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M4.5 12A7.5 7.5 0 0 1 18 7.54a.75.75 0 1 0 1.05-1.07A9 9 0 1 0 21 12a1.5 1.5 0 0 1-1.5 1.5H16.5a.75.75 0 0 0 0 1.5H19.5A3 3 0 0 0 22.5 12a10.5 10.5 0 1 0-4.55 8.62.75.75 0 0 0-.84-1.25A9 9 0 0 1 4.5 12Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "SynthWave",
    icon: (
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M3.75 4.5h16.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75V5.25a.75.75 0 0 1 .75-.75Zm.75 1.5v3.05l5.15 2.98a2.25 2.25 0 0 0 2.2 0l5.15-2.98V6H4.5Zm14.25 11.5v-6l-4.38 2.53a3.75 3.75 0 0 1-3.74 0L6.25 12v5.5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];
