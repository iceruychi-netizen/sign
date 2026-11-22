import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { createAccountStore } from '@/sync/account';
import type { AccountUser, AuthApi } from '@/sync/supabase';
import { AccountCard } from './AccountCard';

const USER: AccountUser = { id: 'u1', email: 'an@example.com' };

const setup = (over: Partial<AuthApi> = {}, user: AccountUser | null = null, mode: 'login' | 'register' = 'login') => {
  const api = {
    getUser: vi.fn(async () => user),
    onChange: vi.fn(() => () => {}),
    signInWithGoogle: vi.fn(async () => {}),
    signInWithPassword: vi.fn(async () => {}),
    signUp: vi.fn(async () => ({ needsConfirmation: true })),
    signOut: vi.fn(async () => {}),
    deleteAccount: vi.fn(async () => {}),
    progressFor: vi.fn(() => ({ load: vi.fn(async () => null), save: vi.fn(async () => {}) })),
    leaderboardFor: vi.fn(),
    ...over,
  } satisfies AuthApi;
  const store = createAccountStore({ api, local: { readData: () => ({}), applyData: vi.fn() } });
  void store.getState().start();
  return { api, store, ...render(<MemoryRouter><AccountCard store={store} google mode={mode} /></MemoryRouter>) };
};

describe('AccountCard', () => {
  it('renders nothing when sync is not configured', () => {
    const { container } = render(<AccountCard store={createAccountStore({ api: null, local: { readData: () => ({}), applyData: vi.fn() } })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('signed out: offers Google and email sign-in and says what is stored', async () => {
    setup();
    expect(await screen.findByRole('button', { name: 'Tiếp tục với Google' })).toBeInTheDocument();
    expect(screen.getByText(/không bao giờ rời máy bạn/)).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('lets the learner show and hide the password they typed', async () => {
    setup();
    const field = await screen.findByLabelText(/Mật khẩu/);
    expect(field).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Hiện mật khẩu' }));
    expect(field).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: 'Ẩn mật khẩu' }));
    expect(field).toHaveAttribute('type', 'password');
  });

  it('hides the Google button until Google sign-in is switched on', async () => {
    const api = {
      getUser: vi.fn(async () => null), onChange: vi.fn(() => () => {}), signInWithGoogle: vi.fn(), signInWithPassword: vi.fn(),
      signUp: vi.fn(), signOut: vi.fn(), deleteAccount: vi.fn(), progressFor: vi.fn(),
    } as unknown as AuthApi;
    const store = createAccountStore({ api, local: { readData: () => ({}), applyData: vi.fn() } });
    void store.getState().start();
    render(<MemoryRouter><AccountCard store={store} google={false} /></MemoryRouter>);
    expect(await screen.findByLabelText('Email')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tiếp tục với Google' })).toBeNull();
  });

  it('signs in with email and password', async () => {
    const { api } = setup();
    await screen.findByRole('button', { name: 'Đăng nhập' });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'an@example.com' } });
    fireEvent.change(screen.getByLabelText(/Mật khẩu/), { target: { value: 'secret-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    await waitFor(() => expect(api.signInWithPassword).toHaveBeenCalledWith('an@example.com', 'secret-pass'));
  });

  it('shows the reason the service gave when sign-in fails', async () => {
    setup({ signInWithPassword: vi.fn(async () => { throw new Error('Invalid login credentials'); }) });
    await screen.findByRole('button', { name: 'Đăng nhập' });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'an@example.com' } });
    fireEvent.change(screen.getByLabelText(/Mật khẩu/), { target: { value: 'secret-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(await screen.findByText(/Lý do từ máy chủ: Invalid login credentials/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Chưa có tài khoản thì hãy đăng ký trước');
    expect(screen.getByRole('link', { name: 'Tạo tài khoản' })).toHaveAttribute('href', '/register');
  });

  it('the sign-in form only signs in; creating an account is a link to the sign-up page', async () => {
    setup();
    await screen.findByRole('button', { name: 'Đăng nhập' });
    expect(screen.queryByRole('button', { name: /Đăng ký|Tạo tài khoản/ })).toBeNull();
    expect(screen.getByRole('link', { name: 'Tạo tài khoản' })).toHaveAttribute('href', '/register');
  });

  const fillRegister = (password: string, again: string) => {
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'an@example.com' } });
    fireEvent.change(screen.getByLabelText(/Mật khẩu/), { target: { value: password } });
    fireEvent.change(screen.getByLabelText('Nhập lại mật khẩu'), { target: { value: again } });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }));
  };

  it('sign-up page: creates the account and links back to sign in', async () => {
    const { api } = setup({}, null, 'register');
    await screen.findByRole('button', { name: 'Tạo tài khoản' });
    expect(screen.queryByRole('button', { name: 'Đăng nhập' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute('href', '/login');
    fillRegister('secret-pass', 'secret-pass');
    await waitFor(() => expect(api.signUp).toHaveBeenCalledWith('an@example.com', 'secret-pass'));
    expect(await screen.findByText(/xác nhận tài khoản/)).toBeInTheDocument();
  });

  it('sign-up page: the two passwords must match', async () => {
    const { api } = setup({}, null, 'register');
    await screen.findByRole('button', { name: 'Tạo tài khoản' });
    fillRegister('secret-pass', 'secret-pazz');
    expect(screen.getByRole('alert')).toHaveTextContent('không khớp');
    expect(api.signUp).not.toHaveBeenCalled();
  });

  it('sign-up page: an email that already has an account is told to sign in', async () => {
    setup({ signUp: vi.fn(async () => { throw new Error('User already registered'); }) }, null, 'register');
    await screen.findByRole('button', { name: 'Tạo tài khoản' });
    fillRegister('secret-pass', 'secret-pass');
    expect(await screen.findByRole('status')).toHaveTextContent('đã có tài khoản');
  });

  it('signed in: shows the account, syncs and can sign out', async () => {
    const { api } = setup({}, USER);
    expect(await screen.findByText('Đã đăng nhập: an@example.com')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Đã đồng bộ lúc/)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Đăng xuất' }));
    await waitFor(() => expect(api.signOut).toHaveBeenCalled());
    expect(await screen.findByRole('button', { name: 'Tiếp tục với Google' })).toBeInTheDocument();
  });

  it('deleting the account needs a confirmation and says it cannot be undone', async () => {
    const { api } = setup({}, USER);
    fireEvent.click(await screen.findByRole('button', { name: 'Xóa tài khoản' }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Không thể hoàn tác');
    expect(api.deleteAccount).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Xóa vĩnh viễn' }));
    await waitFor(() => expect(api.deleteAccount).toHaveBeenCalled());
  });

  it('keeping the account closes the confirmation without deleting', async () => {
    const { api } = setup({}, USER);
    fireEvent.click(await screen.findByRole('button', { name: 'Xóa tài khoản' }));
    fireEvent.click(screen.getByRole('button', { name: 'Giữ lại' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(api.deleteAccount).not.toHaveBeenCalled();
  });
});
