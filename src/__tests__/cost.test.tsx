import { render, screen, fireEvent } from '@testing-library/react';
import { BILLING, GPUS, NODES } from '../data/gpu';
import { formatHours, imageCost, imageHours, loraCost, totalRange, videoCost, withinCap } from '../lib/cost';
import { Demo } from '../Demo';

test('costo: imagenes x s/img / 3600 x $/h', () => {
  expect(imageCost(600, 6, 0.2)).toBeCloseTo(0.2, 10); // 1 h a 0.20
  expect(imageCost(1800, 10, 0.89)).toBeCloseTo(4.45, 10); // 5 h a 0.89
  expect(imageCost(0, 10, 0.2)).toBe(0);
});

test('tiempo en horas y formato', () => {
  expect(imageHours(360, 10)).toBe(1);
  expect(formatHours(imageHours(390, 10))).toBe('1 h 05 min');
  expect(formatHours(0.5)).toBe('30 min');
});

test('LoRA y video', () => {
  expect(loraCost(41, 0.2)).toBeCloseTo(0.1367, 4);
  expect(videoCost(2, 24, 1)).toBeCloseTo(0.8, 10); // 48 min a 1 US$/h
});

test('tope de gasto', () => {
  const r = totalRange([{ min: 1, max: 2 }, { min: 0.5, max: 0.5 }]);
  expect(r).toEqual({ min: 1.5, max: 2.5 });
  expect(withinCap(r, 5)).toBe(true);
  expect(withinCap(r, 2)).toBe(false);
});

test('las cifras de D9 y la facturacion coinciden', () => {
  expect(GPUS.map((g) => [g.id, g.rateMin, g.rateMax])).toEqual([['3090', 0.19, 0.22], ['4090', 0.89, 0.89]]);
  expect(BILLING.gpu + BILLING.disk).toBeCloseTo(BILLING.total, 10);
  expect(BILLING.activePods).toBe(0);
  expect(NODES.map((n) => n.id)).toEqual(['ckpt', 'ipa', 'cn', 'ks', 'det', 'up']);
});

test('la interfaz calcula, muestra el rol del nodo y no tiene galeria', () => {
  render(<Demo lang="en" />);
  expect(screen.getByTestId('time')).toHaveTextContent('1 h 23 min'); // 500 x 10 s
  expect(screen.getByTestId('total')).toHaveTextContent('US$0.26 - US$0.31');
  fireEvent.click(screen.getByRole('button', { name: 'ControlNet' }));
  expect(screen.getByTestId('node-role')).toHaveTextContent('Constrains composition');
  expect(document.querySelectorAll('img')).toHaveLength(0);
});
