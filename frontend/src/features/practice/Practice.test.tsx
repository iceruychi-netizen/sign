import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { initLearner } from '@/storage/useLearner';
import type { RecognitionEvent } from '@/vision/engine';
import { Practice } from './Practice';
import type { EngineFactory } from './useRecognition';

beforeAll(() => {
  initLearner({ heartThreshold: 0.6, appVersion: 'test' });
});

const track = () => ({ stop: vi.fn() });

function fakeEngine() {
  let cb: ((e: RecognitionEvent) => void) | null = null;
  const engine = {
    start: vi.fn(async (video: HTMLVideoElement) => { void video; }),
    stop: vi.fn(),
    subscribe: vi.fn((fn: (e: RecognitionEvent) => void) => {
      cb = fn;
      return () => { cb = null; };
    }),
  };
  const factory: EngineFactory = async () => ({
    engine,
    recommended: { threshold: 0.6, hold_ms: 1000, smoothing_window: 5 },
    model: { model_id: 'landmark-mlp-ens5', version: '1.0.0' },
  });
  return { engine, factory, emit: (e: RecognitionEvent) => act(() => cb?.(e)) };
}

const prediction = (label: string, confidence = 0.9): RecognitionEvent => ({
  type: 'prediction', label, confidence,
  topK: [{ label, p: confidence }, { label: 'B', p: 0.06 }, { label: 'C', p: 0.04 }],
  hold: { state: 'idle', progress: 0 }, fingers: [], confusedWith: null,
});

let now = 0;
beforeEach(() => {
  now = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  vi.stubGlobal('isSecureContext', true);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const stubCamera = (gum: unknown) => vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: gum }, userAgent: 'test' });
const startCamera = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Bật camera' }));
  await screen.findByRole('button', { name: 'Tắt camera' });
};

describe('Practice (Free Practice)', () => {
  it('starts with an explanation and a start button, without touching the camera', () => {
    const gum = vi.fn();
    stubCamera(gum);
    render(<Practice factory={fakeEngine().factory} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Luyện tự do' })).toBeInTheDocument();
    expect(screen.getByText(/không tính tim/i)).toBeInTheDocument();
    expect(gum).not.toHaveBeenCalled();
  });

  it('starts the engine on the video once the camera is on, and stops everything on unmount', async () => {
    const t = track();
    stubCamera(vi.fn().mockResolvedValue({ getTracks: () => [t] }));
    const f = fakeEngine();
    const { unmount } = render(<Practice factory={f.factory} />);
    await startCamera();
    await waitFor(() => expect(f.engine.start).toHaveBeenCalledOnce());
    expect(f.engine.start.mock.calls[0][0]).toBeInstanceOf(HTMLVideoElement);
    unmount();
    expect(f.engine.stop).toHaveBeenCalled();
    expect(t.stop).toHaveBeenCalled();
  });

  it('shows the recognised letter, the top-3 bars and the model in use', async () => {
    stubCamera(vi.fn().mockResolvedValue({ getTracks: () => [track()] }));
    const f = fakeEngine();
    render(<Practice factory={f.factory} />);
    await startCamera();
    await waitFor(() => expect(f.engine.start).toHaveBeenCalled());
    await f.emit(prediction('C', 0.84));
    expect(screen.getByLabelText('Chữ đang nhận')).toHaveTextContent('C');
    expect(screen.getByRole('list', { name: 'Ba chữ khả dĩ nhất' })).toHaveTextContent('84%');
    expect(screen.getByText(/landmark-mlp-ens5 1\.0\.0/)).toBeInTheDocument();
  });

  it('types a letter held for a second, with progress on the ring, and no hearts are touched', async () => {
    stubCamera(vi.fn().mockResolvedValue({ getTracks: () => [track()] }));
    const f = fakeEngine();
    render(<Practice factory={f.factory} />);
    await startCamera();
    await waitFor(() => expect(f.engine.start).toHaveBeenCalled());
    now = 0;
    await f.emit(prediction('H'));
    now = 500;
    await f.emit(prediction('H'));
    expect(screen.getByRole('progressbar', { name: 'Tiến độ giữ chữ' })).toHaveAttribute('aria-valuenow', '50');
    now = 1000;
    await f.emit(prediction('H'));
    expect(screen.getByText('H', { selector: 'p' })).toBeInTheDocument();
  });

  it('space, backspace and clear edit the text', async () => {
    stubCamera(vi.fn().mockResolvedValue({ getTracks: () => [track()] }));
    const f = fakeEngine();
    render(<Practice factory={f.factory} />);
    await startCamera();
    await waitFor(() => expect(f.engine.start).toHaveBeenCalled());
    for (const t of [0, 1000]) { now = t; await f.emit(prediction('H')); }
    fireEvent.click(screen.getByRole('button', { name: 'Dấu cách' }));
    expect(document.querySelector('[aria-live="polite"].text-2xl')?.textContent).toBe('H ');
    fireEvent.click(screen.getByRole('button', { name: 'Xóa chữ cuối' }));
    fireEvent.click(screen.getByRole('button', { name: 'Xóa chữ cuối' }));
    expect(screen.getByText('Chưa có chữ nào')).toBeInTheDocument();
  });

  it('shows the "put your hand in the frame" cue only after 2 seconds without a hand', async () => {
    stubCamera(vi.fn().mockResolvedValue({ getTracks: () => [track()] }));
    const f = fakeEngine();
    render(<Practice factory={f.factory} />);
    await startCamera();
    await waitFor(() => expect(f.engine.start).toHaveBeenCalled());
    await f.emit({ type: 'ready', backend: 'wasm', delegate: 'CPU' });
    await f.emit({ type: 'no_hand', sinceMs: 500 });
    expect(screen.queryByText('Đưa tay vào khung')).toBeNull();
    await f.emit({ type: 'no_hand', sinceMs: 2500 });
    expect(screen.getByText('Đưa tay vào khung')).toBeInTheDocument();
  });

  it('explains a denied camera and lets the learner try again', async () => {
    stubCamera(vi.fn().mockRejectedValue(Object.assign(new Error('x'), { name: 'NotAllowedError' })));
    render(<Practice factory={fakeEngine().factory} />);
    fireEvent.click(screen.getByRole('button', { name: 'Bật camera' }));
    expect(await screen.findByText('Chưa có quyền dùng camera')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cấp quyền camera' })).toBeInTheDocument();
  });

  it('shows an engine error in an alert', async () => {
    stubCamera(vi.fn().mockResolvedValue({ getTracks: () => [track()] }));
    const f = fakeEngine();
    render(<Practice factory={f.factory} />);
    await startCamera();
    await waitFor(() => expect(f.engine.start).toHaveBeenCalled());
    await f.emit({ type: 'error', code: 'MODEL_LOAD_FAILED', message: 'Không tải được mô hình.' });
    expect(screen.getByRole('alert')).toHaveTextContent('Không tải được mô hình.');
  });

  it('toggles the skeleton button label', () => {
    stubCamera(vi.fn());
    render(<Practice factory={fakeEngine().factory} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ẩn khung xương' }));
    expect(screen.getByRole('button', { name: 'Hiện khung xương' })).toBeInTheDocument();
  });
});
