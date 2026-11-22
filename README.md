# SignLingo AI

Real-time ASL learning web app (Duolingo-style) + final project for *Introduction to AI*.
Ứng dụng web học ngôn ngữ ký hiệu ASL bằng camera: 24 chữ cái tĩnh (mô hình học máy), 2 chữ động J, Z và số 0–10 (luật hình học). Nhận dạng chạy hoàn toàn trong trình duyệt.

- Bản chạy: https://signlingo-vn.vercel.app

- Tài liệu thiết kế: [`docs/`](docs/) · Kế hoạch và trạng thái task: [`docs/07_MASTER_PLAN.md`](docs/07_MASTER_PLAN.md)
- Kết quả thí nghiệm ML: [`ml/reports/RESULTS.md`](ml/reports/RESULTS.md)
- Làm việc nhóm: [`CONTRIBUTING.md`](CONTRIBUTING.md)

> Đang phát triển. Phần Kết quả và Giới hạn sẽ được hoàn thiện ở task P4-10.

## Kiến trúc

Không tự viết backend. Frontend là trang tĩnh (Vite + React + TypeScript) chạy MediaPipe và ONNX Runtime trong trình duyệt; tiến độ học lưu ở `localStorage`. Phần huấn luyện mô hình là pipeline Python chạy offline trong `ml/`, xuất mô hình ONNX và số liệu thí nghiệm vào `frontend/public/`. Không có ảnh, video hay dữ liệu bàn tay nào rời khỏi máy người dùng.

**Tùy chọn:** đăng nhập (email + mật khẩu) để đồng bộ tiến độ giữa các máy và tham gia bảng xếp hạng, qua dịch vụ có sẵn Supabase (Auth + Postgres với Row Level Security). Chỉ tiến độ học được lưu. Không cấu hình Supabase thì app vẫn chạy đầy đủ. Thiết lập: [`supabase/README.md`](supabase/README.md); thiết kế: [`docs/drafts/ADR_backend_sync_DRAFT.md`](docs/drafts/ADR_backend_sync_DRAFT.md).

## Chạy thử nhanh (frontend)

Cần Node.js 22 (xem `.nvmrc`) và pnpm 12 (phiên bản dự án dùng được ghi ở trường `packageManager` trong `frontend/package.json`; cài bằng `npm install -g pnpm@12` nếu chưa có).

```powershell
cd frontend
pnpm install
pnpm dev
```

Mở địa chỉ `Local:` mà terminal in ra (thường là `http://localhost:5173`), dùng Chrome. Lần đầu chạy, `pnpm dev` tự chép các file MediaPipe và ONNX Runtime vào `public/` và có thể tải mô hình bàn tay (khoảng 8 MB) từ Google; những file này không được commit.

| Địa chỉ | Việc |
|---|---|
| `/welcome`, `/features`, `/how-it-works`, `/about` | Trang giới thiệu, tính năng, cách hoạt động, nhóm & liên hệ |
| `/learn` | Lộ trình học: bảng chữ cái, J & Z, số 0–10 |
| `/practice` | Luyện tự do: ra dấu trước camera, giữ 1 giây để gõ chữ |
| `/alphabet` | Bảng chữ cái: hình mẫu từng chữ |
| `/leaderboard` | Bảng xếp hạng (cần đăng nhập) |
| `/lab` | AI Lab: so sánh mô hình, ma trận nhầm, rò rỉ dữ liệu, đo FPS |
| `/login`, `/register`, `/profile`, `/settings` | Đăng nhập, đăng ký, hồ sơ và tài khoản, cài đặt |
| `/collect` | Thu mẫu landmark cho nhóm (xem `CONTRIBUTING.md`) |

Muốn thử đăng nhập khi chạy cục bộ: chép `frontend/.env.example` thành `frontend/.env.local` và điền `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (khóa công khai; không bao giờ dùng khóa `service_role`).

Camera chỉ hoạt động trên `localhost` hoặc HTTPS.

Kiểm tra mã: `pnpm lint`, `pnpm typecheck`, `pnpm test --run`.

## Chạy lại phần ML

Cần Python 3.11 và bộ dữ liệu đặt đúng chỗ (dữ liệu không được commit). Hướng dẫn cài đặt, nguồn dữ liệu và các bước pipeline nằm trong [`ml/README.md`](ml/README.md).

## Cấu trúc

```text
docs/       thiết kế và kế hoạch
frontend/   ứng dụng web
ml/         pipeline học máy (Python)
shared/     hợp đồng dữ liệu giữa ml/ và frontend/
supabase/   SQL cho tài khoản và bảng xếp hạng (tùy chọn)
e2e/        kiểm thử đầu cuối (Playwright)
```

## Giấy phép

[MIT](LICENSE). Các bộ dữ liệu (Sign Language MNIST, `keypoint.csv`) và thư viện bên thứ ba giữ giấy phép riêng của tác giả gốc.
