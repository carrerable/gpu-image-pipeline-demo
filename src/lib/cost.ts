/** Hours needed to generate `images` at `secPerImage` seconds each. */
export const imageHours = (images: number, secPerImage: number): number => (images * secPerImage) / 3600;

/** images x s/img / 3600 x $/h */
export const imageCost = (images: number, secPerImage: number, ratePerHour: number): number => imageHours(images, secPerImage) * ratePerHour;

/** Training cost for `minutes` on a GPU billed at `ratePerHour`. */
export const loraCost = (minutes: number, ratePerHour: number): number => (minutes / 60) * ratePerHour;

export const videoMinutes = (clips: number, minutesPerClip: number): number => clips * minutesPerClip;
export const videoCost = (clips: number, minutesPerClip: number, ratePerHour: number): number => (videoMinutes(clips, minutesPerClip) / 60) * ratePerHour;

export interface Range { min: number; max: number }

export function totalRange(parts: Range[]): Range {
  return parts.reduce((a, p) => ({ min: a.min + p.min, max: a.max + p.max }), { min: 0, max: 0 });
}

export const withinCap = (r: Range, cap: number): boolean => r.max <= cap;

/** "1 h 05 min" style duration. */
export function formatHours(h: number): string {
  const total = Math.round(h * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return hh > 0 ? `${hh} h ${String(mm).padStart(2, '0')} min` : `${mm} min`;
}

export const usd = (n: number): string => `US$${n.toFixed(2)}`;
