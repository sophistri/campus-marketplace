const runtimeApiUrl = window.__APP_CONFIG__?.API_URL;
const buildTimeApiUrl = import.meta.env.VITE_API_URL;

export const API_URL = (
  runtimeApiUrl || buildTimeApiUrl
)?.replace(/\/+$/, "");

if (!API_URL) {
  throw new Error(
    "API URL is missing. Set API_URL at runtime or VITE_API_URL for development."
  );
}

// http://localhost:5173/api -> http://localhost:5173
export const API_ORIGIN = API_URL.replace(/\/api$/, "");    