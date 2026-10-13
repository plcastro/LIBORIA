const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!rawApiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is not defined. Set it in .env.");
}

const apiBaseUrl = rawApiBaseUrl.replace(/\/$/, "");

if (
  typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(apiBaseUrl)
) {
  throw new Error("VITE_API_BASE_URL cannot point to localhost in a deployed app.");
}

export const API_BASE_URL = apiBaseUrl;
