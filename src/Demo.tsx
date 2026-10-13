import { useState } from 'react';
import type { Lang } from './i18n';
import { Shell } from './ui/Shell';
import { Frame } from './ui/Frame';
import { BILLING, DEFAULT_CAP_USD, GPUS, LIFECYCLE, LORA, NODES, VIDEO } from './data/gpu';
import { formatHours, imageCost, imageHours, loraCost, totalRange, usd, videoCost, videoMinutes, withinCap } from './lib/cost';

const T = {
  en: {
    eyebrow: 'Case study / GPU pipeline', title: 'GPU image pipeline: ComfyUI on Runpod',
    lead: 'A cost and time calculator for rented GPUs, a generic workflow viewer and the lifecycle of a pod that is created, used and deleted in one run.',
    calc: 'Cost and time calculator', gpu: 'GPU', images: 'Images', sec: 'Seconds per image (your own value)', lora: 'Include a LoRA training run', clips: 'Video clips', rate: 'L40S rate (US$/h, from your console)', cap: 'Spending cap (US$)',
    time: 'Generation time', cost: 'Cost', loraRow: 'LoRA training', videoRow: 'Video', total: 'Total', cap_ok: 'Within the cap', cap_over: 'Over the cap', noRate: 'Enter a rate to see the video cost',
    notes: 'Rates are the ones I paid on the provider. The seconds-per-image field is an input, not a measurement. The LoRA run (1,880 steps, about 41 min, kohya sd-scripts v0.9.1) is priced at the selected GPU rate; my notes do not say which GPU trained it.',
    wf: 'Workflow viewer (generic)', wfHint: 'Select a node', life: 'Pod lifecycle', bill: 'October 2026 billing', pods: 'Active pods', spend: 'Total spend', diskL: 'Disk', gpuL: 'GPU time',
  },
  es: {
    eyebrow: 'Caso de estudio / pipeline de GPU', title: 'Pipeline de imágenes en GPU: ComfyUI en Runpod',
    lead: 'Una calculadora de costo y tiempo para GPU rentadas, un visor de workflow genérico y el ciclo de vida de un pod que se crea, se usa y se borra en una corrida.',
    calc: 'Calculadora de costo y tiempo', gpu: 'GPU', images: 'Imágenes', sec: 'Segundos por imagen (tu propio valor)', lora: 'Incluir un entrenamiento de LoRA', clips: 'Clips de video', rate: 'Tarifa de la L40S (US$/h, de tu consola)', cap: 'Tope de gasto (US$)',
    time: 'Tiempo de generación', cost: 'Costo', loraRow: 'Entrenamiento de LoRA', videoRow: 'Video', total: 'Total', cap_ok: 'Dentro del tope', cap_over: 'Pasa del tope', noRate: 'Escribe una tarifa para ver el costo del video',
    notes: 'Las tarifas son las que pagué al proveedor. El campo de segundos por imagen es un dato de entrada, no una medición. El entrenamiento de LoRA (1,880 pasos, unos 41 min, kohya sd-scripts v0.9.1) se cobra a la tarifa de la GPU elegida; mis notas no dicen en cuál GPU se entrenó.',
    wf: 'Visor de workflow (genérico)', wfHint: 'Elige un nodo', life: 'Ciclo de vida del pod', bill: 'Facturación de octubre de 2026', pods: 'Pods activos', spend: 'Gasto total', diskL: 'Disco', gpuL: 'Tiempo de GPU',
  },
};

export function Demo({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [gpuId, setGpuId] = useState(GPUS[0].id);
  const [images, setImages] = useState(500);
  const [sec, setSec] = useState(10);
  const [withLora, setWithLora] = useState(false);
  const [clips, setClips] = useState(0);
  const [videoRate, setVideoRate] = useState('');
  const [cap, setCap] = useState(DEFAULT_CAP_USD);
  const [node, setNode] = useState<string>('');
  const gpu = GPUS.find((g) => g.id === gpuId)!;

  const hours = imageHours(images, sec);
  const img = { min: imageCost(images, sec, gpu.rateMin), max: imageCost(images, sec, gpu.rateMax) };
  const lora = withLora ? { min: loraCost(LORA.minutes, gpu.rateMin), max: loraCost(LORA.minutes, gpu.rateMax) } : { min: 0, max: 0 };
  const vr = Number(videoRate);
  const vid = clips > 0 && vr > 0 ? { min: videoCost(clips, VIDEO.minutesPerClip, vr), max: videoCost(clips, VIDEO.minutesPerClip, vr) } : { min: 0, max: 0 };
  const total = totalRange([img, lora, vid]);
  const fmt = (r: { min: number; max: number }) => (r.min === r.max ? usd(r.min) : `${usd(r.min)} - ${usd(r.max)}`);
  const sel = NODES.find((n) => n.id === node);
  const num = (v: string) => Math.max(0, Number(v) || 0);

  return (
    <Shell lang={lang} eyebrow={t.eyebrow} title={t.title} lead={t.lead}>
      <Frame tl="CALC" tr={`${gpu.cloud} ${gpu.label}`}>
        <h2>{t.calc}</h2>
        <div className="row">
          <label>{t.gpu}
            <select value={gpuId} onChange={(e) => setGpuId(e.target.value)}>{GPUS.map((g) => <option key={g.id} value={g.id}>{g.cloud} {g.label} ({g.rateMin === g.rateMax ? `$${g.rateMin}` : `$${g.rateMin}-${g.rateMax}`}/h)</option>)}</select>
          </label>
          <label>{t.images}<input type="number" min={0} value={images} onChange={(e) => setImages(num(e.target.value))} style={{ width: '7rem' }} /></label>
          <label>{t.sec}<input type="number" min={0} value={sec} onChange={(e) => setSec(num(e.target.value))} style={{ width: '7rem' }} /></label>
          <label>{t.clips}<input type="number" min={0} value={clips} onChange={(e) => setClips(num(e.target.value))} style={{ width: '6rem' }} /></label>
          <label>{t.rate}<input type="number" min={0} step={0.01} value={videoRate} onChange={(e) => setVideoRate(e.target.value)} style={{ width: '7rem' }} /></label>
          <label>{t.cap}<input type="number" min={0} value={cap} onChange={(e) => setCap(num(e.target.value))} style={{ width: '6rem' }} /></label>
        </div>
        <button className="toggle" style={{ marginTop: 'var(--s-3)' }} aria-pressed={withLora} onClick={() => setWithLora(!withLora)}>{t.lora}</button>
        <p className="note" style={{ marginTop: 'var(--s-3)' }}>{gpu.note[lang]}</p>

        <div className="grid" style={{ marginTop: 'var(--s-3)' }}>
          <div className="card"><div className="num" data-testid="time">{formatHours(hours)}</div><div className="label">{t.time}</div></div>
          <div className="card"><div className="num" data-testid="img-cost" style={{ fontSize: '1.6rem' }}>{fmt(img)}</div><div className="label">{t.cost}</div></div>
          {withLora && <div className="card"><div className="num" style={{ fontSize: '1.6rem' }}>{fmt(lora)}</div><div className="label">{t.loraRow} / {LORA.minutes} min</div></div>}
          {clips > 0 && <div className="card"><div className="num" style={{ fontSize: '1.6rem' }}>{vr > 0 ? fmt(vid) : '-'}</div><div className="label">{t.videoRow} / {formatHours(videoMinutes(clips, VIDEO.minutesPerClip) / 60)}</div></div>}
          <div className="card verdict"><div className="num" data-testid="total" style={{ fontSize: '1.6rem' }}>{fmt(total)}</div><div className="label">{t.total} / {withinCap(total, cap) ? t.cap_ok : t.cap_over}</div></div>
        </div>
        {clips > 0 && !(vr > 0) && <p className="note">{t.noRate}</p>}
        <p className="note" style={{ marginTop: 'var(--s-3)' }}>{t.notes}</p>
      </Frame>

      <Frame tl="NODES">
        <h2>{t.wf}</h2>
        <div className="row" role="group" aria-label={t.wf} style={{ alignItems: 'stretch' }}>
          {NODES.map((n, i) => (
            <span key={n.id} className="row" style={{ gap: 'var(--s-2)' }}>
              <button className="toggle" aria-pressed={node === n.id} onClick={() => setNode(n.id)}>{n.name}</button>
              {i < NODES.length - 1 && <span aria-hidden="true" className="acc">&rarr;</span>}
            </span>
          ))}
        </div>
        <p style={{ marginTop: 'var(--s-3)' }} data-testid="node-role">{sel ? `${sel.name}: ${sel.role[lang]}` : t.wfHint}</p>
      </Frame>

      <Frame tl="POD">
        <h2>{t.life}</h2>
        <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>{LIFECYCLE[lang].map((s) => <li key={s}>{s}</li>)}</ol>
      </Frame>

      <Frame tl="BILL">
        <h2>{t.bill}</h2>
        <div className="grid">
          <div className="card"><div className="num">{usd(BILLING.total)}</div><div className="label">{t.spend}</div></div>
          <div className="card"><div className="num">{usd(BILLING.gpu)}</div><div className="label">{t.gpuL}</div></div>
          <div className="card"><div className="num">{usd(BILLING.disk)}</div><div className="label">{t.diskL}</div></div>
          <div className="card"><div className="num">{BILLING.activePods}</div><div className="label">{t.pods}</div></div>
        </div>
      </Frame>
    </Shell>
  );
}
