// Technical figures only, from my own run notes and the provider's billing view (read 2026-10-13).
export interface Gpu { id: string; label: string; cloud: 'Community' | 'Secure'; rateMin: number; rateMax: number; note: { en: string; es: string } }

export const GPUS: Gpu[] = [
  { id: '3090', label: 'RTX 3090', cloud: 'Community', rateMin: 0.19, rateMax: 0.22, note: { en: 'About 70 times faster than generating on the laptop.', es: 'Unas 70 veces más rápida que generar en la laptop.' } },
  { id: '4090', label: 'RTX 4090', cloud: 'Secure', rateMin: 0.89, rateMax: 0.89, note: { en: 'For short batches (about 0.34 h), where the rate matters little.', es: 'Para tandas cortas (unas 0.34 h), donde la tarifa pesa poco.' } },
];

/** Image-to-video (Wan 2.2) on an L40S: 20 steps at about 70 s per step. The rate is not in my notes: you enter it. */
export const VIDEO = { gpu: 'L40S', model: 'Wan 2.2', minutesPerClip: 24, steps: 20, secondsPerStep: 70 };

/** LoRA training with kohya sd-scripts v0.9.1 on a rented GPU. */
export const LORA = { steps: 1880, minutes: 41 };

/** October 2026 billing view. */
export const BILLING = { total: 8.11, gpu: 7.83, disk: 0.28, activePods: 0 };

export const DEFAULT_CAP_USD = 5;

export interface WorkflowNode { id: string; name: string; role: { en: string; es: string } }
// Generic workflow: no model names, only the kind of node.
export const NODES: WorkflowNode[] = [
  { id: 'ckpt', name: 'Checkpoint (SDXL)', role: { en: 'Loads the base model that every later node builds on.', es: 'Carga el modelo base sobre el que se apoyan los nodos siguientes.' } },
  { id: 'ipa', name: 'IP-Adapter', role: { en: 'Conditions the generation on a reference image.', es: 'Condiciona la generación con una imagen de referencia.' } },
  { id: 'cn', name: 'ControlNet', role: { en: 'Constrains composition or pose from a guide image.', es: 'Restringe la composición o la pose con una imagen guía.' } },
  { id: 'ks', name: 'KSampler', role: { en: 'Runs the denoising steps (seed, steps, cfg, sampler).', es: 'Ejecuta los pasos de eliminación de ruido (semilla, pasos, cfg, sampler).' } },
  { id: 'det', name: 'Detailer', role: { en: 'Re-draws small regions at higher detail.', es: 'Vuelve a dibujar regiones pequeñas con más detalle.' } },
  { id: 'up', name: 'Upscale', role: { en: 'Enlarges the final image.', es: 'Amplía la imagen final.' } },
];

export const LIFECYCLE = {
  en: ['Script creates the pod for the batch', 'Models download in parallel', 'ComfyUI starts', 'The batch runs under the spending cap', 'Script deletes the pod'],
  es: ['El script crea el pod de la tanda', 'Los modelos se bajan en paralelo', 'Arranca ComfyUI', 'La tanda corre bajo el tope de gasto', 'El script borra el pod'],
};
