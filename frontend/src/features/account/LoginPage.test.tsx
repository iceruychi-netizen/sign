import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { createAccountStore } from '@/sync/account';
import type { AccountUser, AuthApi } from '@/sync/supabase';
import { LoginPage } from './LoginPage';

const api = (user: AccountUser | null) => ({
  getUser: vi.fn(async () => user),
  onChange: vi.fn(() => () => {}),
  signInWithGoogle: vi.fn(async () => {}),
  signInWithPassword: vi.fn(async () => {}),
  signUp: vi.fn(async () => ({ needsConfirmation: false })),
  signOut: vi.fn(async () => {}),
  deleteAccount: vi.fn(async () => {}),
  progressFor: vi.fn(() => ({ load: vi.fn(async () => null), save: vi.fn(async () => {}) })),
  leaderboardFor: vi.fn(),
}) satisfies AuthApi;

const show = (store: ReturnType<typeof createAccountStore>, path = '/login') => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/login" element={<LoginPage store={store} />} />
      <Route path="/register" element={<LoginPage store={store} mode="register" />} />
      <Route path="/learn" element={<h1>Lộ trình</h1>} />
    </Routes>
  </MemoryRouter>,
);

const local = { readData: () => ({}), applyData: vi.fn() };

describe('LoginPage', () => {
  it('shows the sign-in form on its own page, with a way to keep learning without an account', async () => {
    const store = createAccountStore({ api: api(null), local });
    void store.getState().start();
    show(store);
    expect(screen.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeInTheDocument();
    expect(await screen.findByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Học tiếp không cần đăng nhập' })).toHaveAttribute('href', '/learn');
  });

  it('has a separate sign-up page that creates the account', async () => {
    const store = createAccountStore({ api: api(null), local });
    void store.getState().start();
    show(store, '/register');
    expect(screen.getByRole('heading', { level: 1, name: 'Đăng ký' })).toBeInTheDocument();
    expect(await screen.findByLabelText('Nhập lại mật khẩu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tạo tài khoản' })).toBeInTheDocument();
  });

  it('goes to the learning path once signed in', async () => {
    const store = createAccountStore({ api: api({ id: 'u1', email: 'an@example.com' }), local });
    void store.getState().start();
    show(store);
    expect(await screen.findByRole('heading', { name: 'Lộ trình' })).toBeInTheDocument();
  });

  it('says accounts are off when sync is not configured', () => {
    show(createAccountStore({ api: null, local }));
    expect(screen.getByText(/chưa được bật/)).toBeInTheDocument();
  });
});
