# 05 — UI Design Spec: SignLingo AI

> **Trạng thái:** v0.3 · **Ngày:** 2026-11-22 · **v0.2:** bỏ đăng nhập; tiến độ lưu trên máy · **v0.3 (đồng bộ với code):** giao diện tông **hồng**, chỉ chế độ sáng; thêm trang giới thiệu, `/login`, `/about`, `/alphabet`, `/leaderboard`, menu tài khoản; bỏ Xuất JSON và banner nhắc sao lưu. Nguồn sự thật cho giá trị màu là `frontend/src/styles/tokens.css`.
> Phong cách: *học tập gamification kiểu Duolingo* (cảm hứng về cơ chế & cảm giác vui, **không sao chép thương hiệu, linh vật, minh họa hay màu xanh lá đặc trưng của Duolingo**). Màu chủ đạo: **Hồng** (đổi từ xanh Cobalt ở bản thiết kế lại giao diện, 2026-11-22).

---

## 1. Nguyên tắc thiết kế

| # | Nguyên tắc | Áp dụng |
|---|---|---|
| D1 | **Camera là trung tâm** | Màn học: khung webcam chiếm ≥ 50% chiều rộng desktop, luôn thấy skeleton tay |
| D2 | **Phản hồi tức thì, đa kênh** | Màu + biểu tượng + chữ + âm thanh (không chỉ dựa vào màu — cho người mù màu) |
| D3 | **Không phụ thuộc âm thanh** | Người khiếm thính là người dùng chính: mọi âm báo có tín hiệu hình tương đương (rung UI, toast, icon) |
| D4 | **Vui nhưng gọn** | Nút "3D" dày, bo tròn lớn, hiệu ứng nảy ngắn (≤ 300 ms); tôn trọng `prefers-reduced-motion` |
| D5 | **Minh bạch AI** | Luôn có chỗ xem confidence, "AI đang thấy chữ gì", và liên kết tới AI Lab |

## 2. Design Tokens

Định nghĩa dưới dạng CSS variables trong `frontend/src/styles/tokens.css`, ánh xạ vào Tailwind 4 qua `@theme` (`--color-brand-500: var(--brand-500)`…). Component **không** viết mã hex rời (lint rule C5). Bảng dưới chép từ `tokens.css` tại 2026-11-22; khi lệch, `tokens.css` đúng.

### 2.1 Bảng màu thương hiệu (Brand – Hồng)

| Token | Hex | Dùng cho |
|---|---|---|
| `brand-50` | `#FFF4F8` | Nền nhấn nhẹ, hover hàng |
| `brand-100` | `#FFE3ED` | Nền icon, node đã hoàn thành |
| `brand-200` | `#FFC7DB` | Viền phụ |
| `brand-300` | `#FF97B5` | Viền nhấn, đầu gradient nút hồng |
| `brand-400` | `#FF80A7` | Vòng tròn chữ cái avatar, gradient |
| `brand-500` | `#F96D9A` | Accent, progress fill, skeleton tay |
| `brand-600` | `#D42D6C` | Focus ring |
| `brand-700` | `#B01C54` | Hover đậm |
| `brand-fg` | `#B01C54` | Chữ/liên kết hồng trên nền sáng (≥ 5,5:1 AA) |
| `ink-on-pink` | `#2B0A18` | Chữ trên nút/viên hồng sáng (≥ 6,6:1) |
| `btn-pink-bg` | gradient `#FF97B5 → #FF80A7 → #F96D9A` | Nút chính (`.btn-pink`), viền đáy `#D44C7C` |
| `unit-banner-bg` | gradient `#FF93B3 → #F96394` | Banner mỗi Unit |

### 2.2 Màu ngữ nghĩa

| Token | Giá trị | Ghi chú |
|---|---|---|
| `success-fg` / `success-bg` | `#15803D` / `#DCFCE7` | "Chính xác!" |
| `danger-fg` / `danger-bg` | `#DC2626` / `#FEE2E2` | Sai, mất tim, ngón lệch |
| `danger-on-bg` | `#B91C1C` | Chữ trên `danger-bg` |
| `warning-fg` / `warning-bg` | `#B45309` / `#FEF3C7` | Độ tin cậy thấp, banner storage bị chặn |
| `streak` · `xp` · `heart` | `#F59E0B` · `#EAB308` · `#F43F5E` | Chỉ icon, không làm nền chữ |

### 2.3 Màu bề mặt & chữ (chỉ chế độ sáng)

| Token | Giá trị |
|---|---|
| `bg` | `#FFFBFD` |
| `surface` / `surface-2` | `#FFFFFF` / `#FFF0F5` |
| `border` / `border-strong` | `#F2DCE5` / `#E8BFD0` |
| `text` / `text-muted` | `#1E141D` / `#614E5C` |
| `focus-ring` | `#D42D6C` |
| `overlay-skeleton` · `overlay-joint-ok` · `overlay-joint-bad` | `#F96D9A` · `#22C55E` · `#EF4444` |

**Theme:** app **chỉ chạy chế độ sáng** (`styles/theme.ts` luôn đặt `data-theme="light"`). Trường `settings.theme` vẫn được lưu để tương thích dữ liệu cũ nhưng không còn nút chọn. Nền trang có lớp trang trí `AmbientBackdrop` (chấm, quầng hồng, bàn tay mờ).

### 2.4 Typography

| Token | Giá trị |
|---|---|
| Font | **Nunito Variable** tự host qua `@fontsource-variable/nunito` (hỗ trợ tiếng Việt, không gọi Google Fonts lúc chạy); fallback `system-ui` |
| Số liệu | `font-variant-numeric: tabular-nums` cho XP, FPS, metrics |
| Scale | `display 40/48 800` · `h1 32/40 800` · `h2 24/32 800` · `h3 20/28 700` · `body 16/24 600` · `small 14/20 600` · `caption 12/16 700 uppercase tracking .04em` |
| Chữ cái mục tiêu (màn học) | 96–128 px, 800 |

### 2.5 Spacing, Radius, Shadow, Motion

| Nhóm | Token |
|---|---|
| Spacing (4px grid) | `1=4 · 2=8 · 3=12 · 4=16 · 5=20 · 6=24 · 8=32 · 10=40 · 12=48 · 16=64` |
| Radius | `sm 10` · `md 14` · `lg 18` · `xl 22` (thẻ) · `2xl 28` (khung camera) · `full` (node, chip, nút) |
| Nút 3D | `--btn-pink-shadow: 0 4px 0 #D44C7C, …`; active: `translateY(4px)` + bỏ shadow |
| Shadow thẻ | `--card-shadow: 0 3px 0 var(--border), …` (phẳng, kiểu game) |
| Motion | `fast 140ms` · `base 220ms` · `bounce 320ms cubic-bezier(.34,1.56,.64,1)`; tất cả về 0 khi `prefers-reduced-motion` |
| Breakpoints | `sm 640` · `md 768` · `lg 1024` · `xl 1280` |
| Touch target | ≥ 44×44 px |

## 3. Thư viện Component

| Component | Biến thể / trạng thái | Ghi chú |
|---|---|---|
| `Button` | primary (brand) · secondary (viền) · success · danger · ghost; size sm/md/lg; loading; disabled | Nút 3D; chữ HOA, 700 |
| `IconButton` | — | aria-label bắt buộc |
| `Card` | default · interactive · selected | |
| `ProgressBar` | lesson (dày 16px, bo full, có highlight sáng phía trên) · hold (vòng tròn) | `role="progressbar"` + `aria-valuenow` |
| `HoldRing` | 0–100%, đổi màu brand → success khi đạt | Bao quanh chữ mục tiêu / góc khung camera |
| `StatChip` | streak 🔥 · XP ⚡ · hearts ❤ | Trên TopBar; tooltip giải thích |
| `SkillNode` | locked · available · in_progress (vòng tiến độ) · completed (ngôi sao/vương miện) · current (nảy nhẹ) | Tròn 72px, nút 3D |
| `CameraFrame` | loading · no-permission · no-hand · tracking · verified · error | Gồm `<video>` + `<canvas>` overlay, gương ngang để người dùng thấy như soi gương |
| `PredictionBars` | top-3 (học) · top-24 (AI Lab) | Thanh ngang, label + % |
| `FingerHint` | danh sách ngón lệch + icon bàn tay SVG tô ngón | |
| `FeedbackBanner` | correct · incorrect · near (confused_with) | Trượt từ đáy, có nút TIẾP TỤC |
| `AccountCard` | disabled (ẩn) · loading · signed_out (form email/mật khẩu, nút mắt hiện/ẩn mật khẩu) · signed_in (đồng bộ, đăng xuất, xóa tài khoản) | `features/account` |
| `AccountMenu` | signed_out (link Đăng nhập) · signed_in (chữ cái đầu + tên, menu: email, Hồ sơ, Đăng xuất; Esc/bấm ngoài để đóng) | Thanh trên app và đầu trang giới thiệu |
| `JoinCard` | chưa tham gia (ô tên hiển thị) · đã tham gia (rời bảng) · lỗi (lý do gốc) | Trên trang Hồ sơ |
| `StatChip`, `AmbientBackdrop`, `BrandMark` | | `components/ui` |
| `ConfusionMatrix` | heatmap 24×24, hover hiện `true→pred %`, click ô mở gallery | Màu tuần tự brand-50 → brand-900 |
| `MetricTable` | sort theo cột, đánh dấu mô hình tốt nhất | |
| `FpsMeter` | số + sparkline 60 s, ngưỡng 30 vạch đứt | |

Không dùng Radix ngoài `@radix-ui/react-slot` (cho `Button asChild`); hộp thoại xác nhận là `role="alertdialog"` tự viết, câu hỏi thường gặp dùng `<details>`.

## 4. Kiến trúc thông tin & Điều hướng

```
/                 → Lần đầu: Trang chủ giới thiệu · lần sau chuyển thẳng /learn
/welcome          → Trang chủ (giới thiệu, xem thử thao tác chữ)        [menu giới thiệu]
/features         → Tính năng                                          [menu giới thiệu]
/how-it-works     → Cách hoạt động & quyền riêng tư, câu hỏi thường gặp [menu giới thiệu]
/about            → Giới thiệu & Liên hệ (nhóm, MSSV, phụ trách, email trưởng nhóm, GitHub) [menu giới thiệu]
/login            → Đăng nhập (đăng nhập xong chuyển /learn; báo tắt khi chưa cấu hình Supabase)
/register         → Đăng ký tài khoản (email, mật khẩu, nhập lại mật khẩu; xong chuyển /learn)
/learn            → Dashboard lộ trình (Skill Tree)            [Tab: Học]
/lesson/:code     → Lesson Player (toàn màn, không nav; màn kết quả nằm trong cùng route)
/practice         → Luyện tự do                                [Tab: Luyện]
/alphabet[/:letter] → Bảng chữ cái, hình mẫu từng chữ          [Tab: Bảng chữ cái]  (/dictionary chuyển về đây)
/leaderboard      → Bảng xếp hạng (cần đăng nhập)              [Tab: Hạng]
/lab              → AI Lab (Benchmark · Phân tích lỗi · Live Monitor · Data Leakage)   [Tab: AI Lab]
/profile          → Hồ sơ, thống kê, thẻ Tài khoản, thẻ Tham gia bảng xếp hạng   [Tab: Hồ sơ]
/settings         → Cài đặt (link Giới thiệu & Liên hệ ở cuối)
/collect          → Thu mẫu dữ liệu (contributor)
```

Trang giới thiệu dùng chung `MarketingLayout`: thanh trên có menu 4 trang, nút Đăng nhập/menu tài khoản và nút **Vào học**; trên điện thoại menu thành hàng viên thuốc dưới thanh trên. Trong app: desktop có sidebar trái (logo, 6 tab) + thanh trên dính (menu tài khoản, chuỗi ngày, XP, tim); mobile có thanh trên + dock viên thuốc nổi 6 tab ở đáy. Khi có menu tài khoản, chữ "SignLingo" cạnh logo ẩn dưới 640 px để thanh trên không tràn.

## 5. Màn hình chính

### 5.1 Dashboard lộ trình (`/learn`) — FT-LRN-01, FT-GAM-*

```
┌──────────┬──────────────────────────────────────────┬───────────────────┐
│ ◆ Sign-  │  ┌────────────────────────────────────┐  │ 🔥 4   ⚡ 340  ❤ 5 │
│   Lingo  │  │ CẤP 1 · UNIT 1  Bảng chữ cái A–E    │  │───────────────────│
│          │  │ [📖 HƯỚNG DẪN]                      │  │ Mục tiêu hôm nay   │
│ ● Học    │  └────────────────────────────────────┘  │ ▓▓▓▓▓░░░ 15/20 XP  │
│ ○ Luyện  │              (★)  A                       │───────────────────│
│ ○ Chữ cái│           (★)     B                       │ Chữ cần ôn         │
│ ○ AI Lab │              (◐)  C  ← "BẮT ĐẦU" tooltip  │ N · S · R          │
│ ○ Hồ sơ  │           (🔒)    D                       │ [ÔN NGAY]          │
│          │              (🔒) 🏆 Checkpoint           │───────────────────│
│ ⚙ Cài đặt│  ┌────────────────────────────────────┐  │ Đồng bộ tiến độ    │
│          │  │ CẤP 1 · UNIT 2  F–K  (khóa)         │  │ [Đăng nhập]        │
└──────────┴──┴────────────────────────────────────┴──┴───────────────────┘
```
- Node xếp **zig-zag** theo trục dọc; banner mỗi Unit dùng gradient `unit-banner-bg` chữ `ink-on-pink`. Lộ trình hiện có 3 unit: Bảng chữ cái ASL (7 bài), Chữ cái động J & Z (1 bài), Chữ số 0–10 (2 bài).
- Click node available → popover: tên bài, số bài tập, XP, nút **BẮT ĐẦU**.
- Thẻ "Đồng bộ tiến độ" ở cột phải mời đăng nhập (link tới Hồ sơ & Tài khoản). Banner nhắc sao lưu đã bỏ (2026-11-22).
- Khi `localStorage` bị chặn: banner `warning` "Tiến độ sẽ không được lưu" (AC-ACC-02).

### 5.2 Lesson Player – Màn học Webcam (`/lesson/:id`) — FT-LRN-02..05

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ✕   ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░  4/10                         ❤ 5     │
├───────────────────────────────┬─────────────────────────────────────────┤
│   Hãy ra dấu chữ               │  ┌───────────────────────────────────┐ │
│        ╭──────╮                │  │                                   │ │
│        │  C   │ ← HoldRing     │  │      [ webcam (mirror) ]          │ │
│        ╰──────╯   72%          │  │      skeleton sky-500             │ │
│   [ảnh/GIF mẫu cách ra dấu]    │  │      ngón lệch: đỏ                │ │
│                                │  │                         ● AI: C 84%│ │
│   💡 Gợi ý                      │  └───────────────────────────────────┘ │
│   • Cong tất cả ngón như chữ C │   Top-3:  C ███████ 84%                 │
│   ⚠ Ngón cái: mở rộng hơn 20°  │           O ██ 9%    E █ 3%             │
│                                │   [ĐỔI TAY]  [ẨN KHUNG XƯƠNG]  ⏱ 0:12   │
├───────────────────────────────┴─────────────────────────────────────────┤
│  [BỎ QUA]                                                  [KIỂM TRA]*  │
└─────────────────────────────────────────────────────────────────────────┘
 * Với perform_sign: không cần bấm — tự verify khi HoldRing đầy; nút chỉ hiện khi tắt auto.
```
- **Trạng thái CameraFrame:** loading (skeleton shimmer + "Đang tải AI…" kèm %), no-permission (minh họa + nút "Cấp quyền camera" + hướng dẫn theo trình duyệt), no-hand > 2 s (khung nhấp nháy viền `warning`, chữ "Đưa tay vào khung"), tracking, verified (viền `success`, nảy, âm "ding").
- **FeedbackBanner** trượt lên khi verified: nền `success-bg`, "Tuyệt vời! ⚡ +1", nút TIẾP TỤC (Enter). Khi timed_out: nền `danger-bg`, "Chưa đúng — đây là cách làm chữ C", hiện lại media, mất 1 tim (animation tim vỡ).
- **Near-miss:** nếu top-1 là chữ dễ nhầm → chip `warning`: "Đang giống **O** — mở rộng khoảng cách ngón cái".
- **Fingerspelling (`spell_word`):** hàng ô chữ `[H][E][L][L][O]` phía trên; ô hiện tại viền brand, ô đã verify nền success; HoldRing áp cho chữ hiện tại; chữ trùng liên tiếp (LL) yêu cầu hạ tay/nhả (no-hand hoặc đổi nhãn) giữa hai lần.
- **choose_sign:** hiện ảnh tay, chọn 1 trong 4 chữ (không cần camera) — giảm mệt. *(Chưa có trong curriculum hiện tại.)*
- **perform_dynamic (J, Z, số 10):** kiểm dáng tay khởi đầu, rồi vẽ vệt sáng hồng theo quỹ đạo đầu ngón trên khung camera; đủ quỹ đạo thì verified.
- Phím tắt: `Enter` tiếp tục, `S` bỏ qua, `H` ẩn skeleton, `Esc` thoát (xác nhận).
- Mobile: camera trên, chữ mục tiêu + HoldRing chồng góc trên trái camera, gợi ý dạng bottom sheet.

### 5.3 Màn kết quả (`/lesson/:id/done`) — FT-GAM-04

- Tiêu đề "Hoàn thành bài học!" + confetti; 3 thẻ số: **⚡ XP** (đếm tăng dần), **🎯 Chính xác %**, **⏱ Thời gian**.
- Streak: ngọn lửa + "4 → 5 ngày" khi vừa đạt mục tiêu.
- Danh sách chữ sai nhiều nhất → nút "Ôn lại".
- Nút **TIẾP TỤC** (về /learn, node kế tiếp nảy).

### 5.4 Luyện tự do (`/practice`) — FT-LRN-07

Camera lớn + chữ dự đoán khổng lồ + Top-3 + lịch sử chữ đã nhận (chuỗi ký tự tích lũy, nút xóa/space) → tạo cảm giác "gõ bằng tay". Không trừ tim.

### 5.5 AI Lab (`/lab`) — FT-LAB-01..04 (dành cho người chấm, P3)

Tabs: **Benchmark · Phân tích lỗi · Live Monitor · Data Leakage · Về dữ liệu**

```
┌ Benchmark ─────────────────────────────────────────────────────────────┐
│ Dataset: [Sign Language MNIST ▾]  Split: group_ward70   Seed 42  commit│
│ ┌──────────────┬────────┬────────┬────────┬────────┬───────┬────────┐  │
│ │ Model        │Features│Val F1  │Test Acc│Test F1 │Err %  │ms/img  │  │
│ │ Majority     │ –      │ …      │ …      │ …      │ …     │ …      │  │
│ │ …            │        │        │        │        │       │        │  │
│ │ ★ CNN+aug    │ 28×28  │ …      │ …      │ …      │ …     │ …      │  │
│ └──────────────┴────────┴────────┴────────┴────────┴───────┴────────┘  │
│ [Bar chart Test Macro-F1, vạch đứt = mốc baseline tốt nhất]            │
└────────────────────────────────────────────────────────────────────────┘
```
(Mọi số lấy từ file tĩnh `/data/experiments/index.json` do `ml/` sinh — không hardcode.)
- **Phân tích lỗi:** chọn mô hình → `ConfusionMatrix` 24×24 (chuẩn hóa hàng) + bảng Top cặp nhầm + bar per-class F1 + gallery ảnh sai (nếu có) + khung trả lời **RQ2**.
- **Live Monitor:** camera + `PredictionBars` 24 lớp + `FpsMeter` (thời gian xử lý khung p50/p95 với vạch 33 ms, MediaPipe ms, classifier ms, FPS xử lý, ORT backend WebGPU/WASM, delegate GPU/CPU) + nút "Ghi 60 s benchmark" lưu vào lịch sử và **tải file JSON** → bằng chứng **RQ3**.
- **Data Leakage:** biểu đồ cột đôi Val vs Test cho random vs group split, sơ đồ giải thích vì sao các bản augment của cùng một ảnh gây rò rỉ khi chia ngẫu nhiên (số liệu lấy từ thí nghiệm `leakage_study`).
- **Về dữ liệu:** phân bố lớp, ảnh mẫu mỗi chữ, giấy phép dataset.

### 5.6 Hồ sơ (`/profile`)
Avatar chữ cái đầu (từ tên hiển thị tùy chọn), tổng XP, streak dài nhất, heatmap hoạt động 12 tuần (màu brand), bảng "độ thành thạo" từng chữ (vòng % đúng). Bên dưới: thẻ **Tài khoản** (`AccountCard`) và thẻ **Tham gia bảng xếp hạng** (`JoinCard`, ô tên hiển thị 2–24 ký tự, đồng bộ trước khi bật).

### 5.6b Đăng nhập (`/login`) và Bảng xếp hạng (`/leaderboard`)
- `/login`: trang riêng, logo + "Đăng nhập" + `AccountCard` (chỉ nút Đăng nhập, dòng "Chưa có tài khoản? Tạo tài khoản" dẫn `/register`) + link "Học tiếp không cần đăng nhập". Sai email/mật khẩu hoặc chưa có tài khoản: báo "Sai email hoặc mật khẩu. Chưa có tài khoản thì hãy đăng ký trước."
- `/register`: cùng bố cục, `AccountCard mode="register"`: email, mật khẩu, nhập lại mật khẩu (phải khớp), nút "Tạo tài khoản", dòng "Đã có tài khoản? Đăng nhập". Email đã có tài khoản: báo hãy đăng nhập. Xong chuyển `/learn`.
- `/leaderboard`: tab **Tuần này · Tổng XP · Chuỗi ngày · Độ chính xác** (chọn "Tất cả" hoặc một chữ). Hàng của mình gắn nhãn "Bạn". Chưa đăng nhập → mời đăng nhập; chưa ai đủ điều kiện → trạng thái trống.

### 5.7 Cài đặt (`/settings`)
Âm thanh (on/off), Mục tiêu ngày (10/20/30/50), Tên hiển thị (tùy chọn, lưu khi rời ô), Camera (chọn thiết bị), Dữ liệu (nút **Nhập tiến độ** (hỏi xác nhận ghi đè), **Xóa toàn bộ dữ liệu** (xác nhận 2 bước)); link **Giới thiệu & Liên hệ** ở cuối. Đã bỏ: chọn giao diện sáng/tối, tay thuận, nút **Xuất tiến độ** (2026-11-22).

### 5.8 Thu mẫu (`/collect`) — FT-SYS-02
Nhập mã người ra dấu ẩn danh (S01…) → chọn chữ → đếm ngược 3-2-1 → ghi N khung landmark → xem lại skeleton → Giữ / Bỏ. Thanh tiến độ "30/50 mẫu chữ R". Nút **TẢI FILE** (`landmarks_<chữ>_<mã>_<thời gian>.json`). Ghi rõ: "Chỉ lưu tọa độ khớp tay, không lưu hình ảnh". Mẫu chưa tải giữ tạm trong bộ nhớ trang; rời trang sẽ hỏi xác nhận.

## 6. Âm thanh & Hiệu ứng (FT-GAM-05)

| Sự kiện | Âm | Hình tương đương (bắt buộc) |
|---|---|---|
| Hold đạt 100% | "ding" ngắn | HoldRing chuyển success + nảy |
| Sai/timeout | "bonk" trầm | Banner đỏ + rung ngang 200 ms |
| Hoàn thành bài | fanfare 1 s | Confetti + đếm XP |
| Streak tăng | "whoosh" | Ngọn lửa phóng to |
| Mất tim | "pop" | Tim vỡ |

Âm thanh **tự tạo** bằng Web Audio (`src/lib/sound.ts`, `uiSound.ts`), không dùng file có giấy phép; tắt ở Cài đặt.

## 7. Accessibility (AC-UI-02)

- Tương phản ≥ 4,5:1 cho văn bản thường, ≥ 3:1 cho icon/viền trạng thái (chỉ chế độ sáng) (đã chọn token theo tiêu chí này; kiểm lại bằng axe trong E2E).
- Focus ring 3px `focus-ring`, không bỏ outline.
- Trạng thái nhận diện được thông báo qua `aria-live="polite"` ("Đã nhận chữ C, độ tin cậy 84%"), throttle 1 lần/giây.
- Không truyền đạt thông tin chỉ bằng màu: ngón lệch có icon ⚠ + chữ.
- Hỗ trợ người thuận tay trái (mirror) và người dùng một tay.

## 8. Prompt mẫu cho V0 / Claude Design (lịch sử, bản xanh Cobalt ban đầu; giao diện hiện tại là tông hồng §2)

```
Build a responsive web app UI called "SignLingo AI" — a gamified American Sign Language
learning app (inspired by the mechanics of language-learning games, but with an original
look; no green; no owl or any existing mascot).
Brand: cobalt blue primary #1D6FE8 (3D buttons with 4px bottom shadow #1557C0), sky accent
#38BDF8, light bg #F5F9FF / dark bg #0B1220, cards #FFFFFF / #111A2E, font Nunito 600–800,
large rounded corners (20–28px). Support light/dark toggle via data-theme on <html>.
Screens:
1) /learn dashboard: left sidebar nav (Learn, Practice, Dictionary, AI Lab, Profile),
   center zig-zag skill path of round 72px nodes (locked/available/in-progress/completed)
   grouped under unit banners, right column with streak/XP/hearts chips and daily goal bar.
2) /lesson/:id: full-screen lesson player; top progress bar + hearts; left: big target letter
   inside a circular hold-progress ring, reference image, hint list; right: mirrored webcam
   frame with hand skeleton overlay, top-3 prediction bars; bottom bar with SKIP and a slide-up
   feedback banner (success green / error red). Include states: loading AI, camera permission
   denied, no hand detected, verified.
3) /lab: tabs Benchmark (sortable metrics table + bar chart), Error Analysis (24×24 confusion
   matrix heatmap in blue scale + per-class F1 bars), Live Monitor (webcam, 24 probability bars,
   FPS meter with 30 FPS dashed threshold), Data Leakage (grouped bar chart random vs group split).
Use placeholder numbers clearly marked "—"; do not invent metrics.
```

## 9. Cần người dùng cung cấp / quyết định

1. ~~Logo & tên~~ **Theo code:** tên **SignLingo**, logo bàn tay (`BrandMark`); chưa có linh vật.
2. ~~Nguồn ảnh~~ **Theo code:** hình chữ cái public domain (wpclipart.com qua Wikimedia Commons), hình số trong `public/media/numbers/`.
3. ~~Nguồn âm thanh~~ **Theo code:** tự tổng hợp bằng Web Audio.
4. ~~Ngôn ngữ UI~~ **Theo code:** tiếng Việt (`src/i18n/vi.ts`; riêng nội dung các trang giới thiệu viết thẳng trong component).
