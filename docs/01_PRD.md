# 01 — PRD: SignLingo AI

> **Trạng thái:** v0.3 · **Ngày:** 2026-11-22 · **v0.2:** bỏ backend; app là SPA tĩnh trên Vercel, dữ liệu người học lưu trong trình duyệt. · **v0.3 (đồng bộ với code):** thêm tài khoản tùy chọn (Supabase) để đồng bộ tiến độ, bảng xếp hạng tự nguyện, số 0–10 và chữ động J, Z (luật hình học), trang đăng nhập và trang Giới thiệu & Liên hệ; bỏ Xuất JSON và chế độ tối.
> **Tài liệu liên quan:** [02_SOLUTION_ARCHITECTURE](02_SOLUTION_ARCHITECTURE.md) · [03_DATA_STORAGE](03_DATA_STORAGE.md) · [04_CONTRACTS](04_CONTRACTS.md) · [05_UI_DESIGN_SPEC](05_UI_DESIGN_SPEC.md) · [07_MASTER_PLAN](07_MASTER_PLAN.md)
> **Nguồn đầu vào:** `docs/course/topic.docx`, `week1–5.docx` (yêu cầu môn). Các báo cáo tuần 3–4 cũ **không được dùng** (xem §2).

---

## 1. Problem (Vấn đề)

1. **Người tự học ngôn ngữ ký hiệu không biết mình làm đúng hay sai.** Sách, video chỉ cho xem mẫu một chiều; không có ai sửa vị trí ngón tay, nên lỗi sai lặp lại thành thói quen.
2. **Thiếu động lực duy trì.** Học ký hiệu cần luyện đều mỗi ngày; tài liệu tĩnh không có cơ chế giữ chân (mục tiêu ngày, chuỗi ngày, phần thưởng).
3. **Rào cản kỹ thuật của các giải pháp AI hiện có:** cần cài app, cần GPU/server, độ trễ cao, hoặc chỉ là demo nhận diện mà không có lộ trình học.

**Câu phát biểu bài toán (Problem Statement – dùng cho báo cáo môn):**
> Xây dựng hệ thống nhận diện bảng chữ cái ASL tĩnh (24 lớp A–Y, trừ J, Z) theo thời gian thực từ webcam, chạy hoàn toàn trên trình duyệt (> 30 FPS), đạt Macro-F1 cao trên dữ liệu chưa thấy, và đóng gói thành một gia sư AI có phản hồi tức thì theo phong cách gamification.

## 2. Context (Bối cảnh)

| Mục | Nội dung |
|---|---|
| Mục tiêu kép | (a) Sản phẩm EdTech thực tế; (b) Đồ án cuối kỳ môn *Introduction to Artificial Intelligence* — **40% điểm môn** |
| Rubric môn (10 điểm) | AI Problem Definition (2) · Problem Statement & 3 Research Questions (2) · Solution Development & Analysis (5) · GitHub Repository + README (1) |
| Tiến độ môn | Lịch môn học theo `docs/course/week1–5.docx`. Tiến độ **thực** của nhóm chỉ được tính bằng kết quả chạy trong repo này (xem `docs/07_MASTER_PLAN.md`) |
| Kết quả đã có | **Chưa có kết quả nào được kiểm chứng.** Số liệu trong các báo cáo tuần 3–4 cũ không do mã trong repo này sinh ra nên **không dùng** làm bằng chứng, ngưỡng hay mục tiêu (quyết định 2026-11-18). Mọi số liệu về sau đến từ `ml/reports/experiments/*.json` (có seed và git commit) |
| Dữ liệu | Kaggle Sign Language MNIST (27.455 train / 7.172 test, 28×28 xám, 24 lớp; số đếm đã kiểm trực tiếp trên file) · `keypoint.csv` (36.402 dòng, 33.536 mẫu sau khi bỏ J, Z, 24 chữ; giấy phép MIT, từ dự án American-Sign-Language-Detection; **không có cột người ra dấu hay phiên thu**) · Dữ liệu webcam tự thu của nhóm (kế hoạch: ≥ 3 người × 30–50 mẫu/chữ). Cách Kaggle tạo tập train (số ảnh gốc, số bản augment) **chưa được kiểm chứng**; ta chỉ dựa vào bằng chứng đo được (chia ngẫu nhiên gây rò rỉ) |
| Quyết định hạ tầng (2026-11-18, sửa 2026-11-22) | Dự án học tập phi thương mại → **SPA tĩnh deploy Vercel (gói Hobby)**, không tự viết server. Tiến độ lưu `localStorage` (local-first). **Từ 2026-11-22:** tài khoản tùy chọn qua Supabase (Auth + Postgres) để đồng bộ tiến độ và tham gia bảng xếp hạng; xem [ADR_backend_sync](drafts/ADR_backend_sync_DRAFT.md). Mẫu landmark thu thêm vẫn tải về dạng file |
| Ràng buộc kỹ thuật | Inference trên trình duyệt (privacy: hình camera và landmark không rời máy; chỉ tiến độ học được đồng bộ khi người học tự đăng nhập) · random_seed = 42 · Không chia validation ngẫu nhiên trên MNIST · Chuẩn hóa chỉ fit trên Train · Không lật ngang ảnh MNIST |

### 2.1 Research Questions (dùng cho rubric "3 Research Questions")

| RQ | Câu hỏi | Bằng chứng / Feature đáp ứng |
|---|---|---|
| **RQ1** *(cần nhóm xác nhận lại đúng wording đã nộp tuần 2)* | Mô hình Deep Learning (CNN có augmentation) cải thiện bao nhiêu so với các baseline ML cổ điển, và đặc trưng (pixel vs HOG vs landmark) ảnh hưởng thế nào? | FT-ML-03, FT-ML-04, AI Lab bảng benchmark |
| **RQ2** | Những chữ cái nào bị nhầm lẫn nhiều nhất và vì sao (giả thuyết ban đầu: các chữ nắm tay và các chữ 2–3 ngón dễ nhầm với nhau; **cần kiểm chứng** bằng Confusion Matrix thật)? | FT-ML-05 Confusion Matrix, per-class F1, gallery lỗi |
| **RQ3** | Có thể đạt suy luận thời gian thực > 30 FPS trên trình duyệt với độ chính xác chấp nhận được không? | FT-ML-06 ONNX, FT-PERF-01 FPS monitor, Phase 4 |

## 3. User Personas

| Persona | Mô tả | Nhu cầu chính | Thành công khi |
|---|---|---|---|
| **P1 – Lan, người mới học (18–30)** | Muốn giao tiếp với bạn/người thân khiếm thính; học 10–15 phút/ngày trên laptop | Lộ trình rõ, được sửa lỗi ngón tay, động lực mỗi ngày | Ký đúng 24 chữ cái và đánh vần tên mình sau 2 tuần |
| **P2 – Minh, người khiếm thính/người dùng ASL** | Đã biết ký hiệu, muốn ôn luyện, hoặc dạy người thân | Nhận diện nhanh, ít sai, chế độ luyện tự do | Hệ thống nhận đúng ký hiệu của mình ổn định (≥ 85%) |
| **P3 – Giảng viên / người chấm đồ án** | Đánh giá chất lượng khoa học của pipeline AI | Thấy rõ dữ liệu → mô hình → kết quả, tái lập được, so sánh baseline | Chạy lại được bằng README, đọc được Confusion Matrix/Macro-F1 trong AI Lab |
| **P4 – Thành viên nhóm (developer)** | Phát triển và thu thêm dữ liệu | Công cụ thu mẫu landmark, xem log thí nghiệm | Thu và gán nhãn mẫu mới trong < 5 phút/chữ |

## 4. Phạm vi (Scope)

| Mức ưu tiên | Bao gồm |
|---|---|
| **MUST (bắt buộc cho Tuần 5 / chấm điểm)** | Pipeline ML tái lập được · Baseline vs CNN vs Landmark-MLP · Group split chống leakage · Xuất ONNX · Web nhận diện real-time > 30 FPS · Cấp độ 1 (bảng chữ cái) với Hold-to-Verify · Free Practice · AI Lab hiển thị kết quả từ JSON · Deploy Vercel · README |
| **SHOULD (MVP)** | Skill Tree · XP, Streak, Hearts · Âm thanh · Phản hồi sửa lỗi ngón tay · Cấp độ 2 Fingerspelling · Nhập/Xóa tiến độ · Trang thu mẫu landmark · Bảng chữ cái tra cứu · **(đã làm, 2026-11-22)** J, Z động và số 0–10 bằng luật hình học · tài khoản tùy chọn + đồng bộ tiến độ · bảng xếp hạng tự nguyện · trang giới thiệu (Trang chủ, Tính năng, Cách hoạt động, Giới thiệu & Liên hệ) |
| **COULD (mở rộng)** | Cấp độ 3 từ vựng động (chuỗi landmark) · mô hình học máy cho J, Z, số (thay luật) · đăng nhập Google · PWA offline |
| **WON'T (lần này)** | Tự viết backend/server · telemetry, analytics · chế độ tối (đã bỏ 2026-11-22, giao diện chỉ sáng) · App mobile native · Nhận diện câu ASL liên tục · VSL · Biểu cảm khuôn mặt |

## 5. Danh sách tính năng (Features – Ft)

Mã tính năng được dùng xuyên suốt ARCH / DATA / CONTRACTS / PLAN. Cột **Dữ liệu / Hợp đồng** đảm bảo truy vết.

### 5.1 Nhóm ML (Python pipeline) — phục vụ rubric "Solution Development & Analysis"

| ID | Tính năng | Mô tả | Ưu tiên |
|---|---|---|---|
| FT-ML-01 | Pipeline dữ liệu tái lập | Load → Quality check → Clean → Transform → Group Split → Features; seed 42; chạy bằng 1 lệnh | MUST |
| FT-ML-02 | Group Split chống leakage | Gom mỗi lớp thành 70 cụm (thumbnail 10×10, Ward linkage), giữ 15% số cụm làm validation; báo cáo gap random-vs-group | MUST |
| FT-ML-03 | Baseline | Majority, Logistic Regression, Random Forest, Linear SVM, MLP trên Pixel/HOG | MUST |
| FT-ML-04 | Mô hình chính | (a) CNN + augmentation trên ảnh 28×28; (b) MLP trên 21 landmark chuẩn hóa theo gốc cổ tay | MUST |
| FT-ML-05 | Đánh giá & phân tích lỗi | Accuracy, Macro-F1, per-class F1, Confusion Matrix chuẩn hóa hàng, top cặp nhầm, gallery lỗi, latency | MUST |
| FT-ML-06 | Xuất mô hình web | ONNX (+ kiểm tra parity với PyTorch), manifest (labels, preprocess version, sha256, class templates) | MUST |
| FT-ML-07 | Đánh giá trên người mới | Holdout theo người ra dấu (signer-holdout) trên dữ liệu webcam tự thu (file từ trang `/collect`) | MUST |
| FT-ML-08 | Mô hình chuỗi (từ vựng động) | GRU/1D-CNN trên chuỗi landmark cho từ vựng + J/Z | COULD |

### 5.2 Nhóm Học tập (Learning)

| ID | Tính năng | Mô tả | Ưu tiên | Dữ liệu / Hợp đồng |
|---|---|---|---|---|
| FT-LRN-01 | Skill Tree | Lộ trình Unit → Lesson dạng đường đi; khóa/mở theo tiến độ | SHOULD | `curriculum.json` + `progress` (03 §2–3) |
| FT-LRN-02 | Lesson Player – Cấp 1 Chữ cái | Chuỗi bài tập: Xem mẫu → Làm theo trước webcam → Hold-to-Verify | MUST | K3 engine + K4 `startSession/recordAttempt/completeSession` |
| FT-LRN-03 | Hold-to-Verify | Giữ đúng ký hiệu liên tục ≥ `hold_ms` (mặc định 1.000 ms) với confidence ≥ `threshold` (mặc định 0,60) | MUST | `HoldVerifier`; tham số `item.config` / `manifest.recommended` |
| FT-LRN-04 | Phản hồi sửa lỗi ngón tay | Tô màu ngón lệch so với mẫu chuẩn (template) + gợi ý bằng chữ + "Đang giống chữ…" | SHOULD | `manifest.class_templates`, `confusable` |
| FT-LRN-05 | Cấp 2 Fingerspelling | Đánh vần một từ: chuỗi chữ cái tĩnh lần lượt, mỗi chữ Hold-to-Verify | SHOULD | `item.type = spell_word` |
| FT-LRN-06 | Cấp 3 Từ vựng động | Nhận diện từ vựng qua chuỗi landmark | COULD | `sign.kind = dynamic`, task `dynamic_words` |
| FT-LRN-07 | Luyện tự do (Free Practice) | Bật webcam, hiển thị chữ dự đoán + top-3 xác suất, không tính tim | MUST | K3; session `mode = free_practice` |
| FT-LRN-08 | Chữ động J, Z | Kiểm dáng tay khởi đầu rồi theo dõi quỹ đạo đầu ngón, vẽ vệt sáng trên màn hình (luật hình học, không học máy) | SHOULD (đã làm) | `vision/dynamicGesture.ts`, `item.type = perform_dynamic`, Unit 2 |
| FT-LRN-09 | Chữ số 0–10 | 0–9 theo tổ hợp ngón; 10 là ngón cái giơ lên kèm lắc cổ tay (luật hình học) | SHOULD (đã làm) | `vision/numberGesture.ts`, Unit 3 |
| FT-LRN-10 | Bảng chữ cái | Trang `/alphabet` tra cứu hình mẫu từng chữ (thay tab Từ điển) | SHOULD (đã làm) | `curriculum.json` `signs.media` |

### 5.3 Nhóm Gamification (tính hoàn toàn ở client)

| ID | Tính năng | Mô tả | Ưu tiên | Dữ liệu |
|---|---|---|---|---|
| FT-GAM-01 | XP | Điểm thưởng theo bài: hoàn thành + độ chính xác + bonus không mất tim | SHOULD | `src/game/computeXp`, `stats`, `sessions` |
| FT-GAM-02 | Streak | Chuỗi ngày đạt mục tiêu XP/ngày theo múi giờ máy | SHOULD | `daily`, `stats` |
| FT-GAM-03 | Hearts (Tim/mạng) | Tối đa 5; mất 1 khi trượt bài tập mà mô hình đủ tự tin (không phạt khi mô hình phân vân); hồi 1 tim/30 phút | SHOULD | `stats.hearts`, `hearts_updated_at` |
| FT-GAM-04 | Thanh tiến độ & màn kết quả | Tiến độ trong bài, màn tổng kết XP/độ chính xác/thời gian | SHOULD | `CompleteResult` |
| FT-GAM-05 | Âm thanh & hiệu ứng | Âm đúng/sai/hoàn thành (tổng hợp bằng Web Audio), confetti CSS; luôn có tín hiệu hình tương đương; tôn trọng `prefers-reduced-motion` | SHOULD | `settings` |
| FT-GAM-06 | Bảng xếp hạng | Bốn bảng: Tuần này, Tổng XP, Chuỗi ngày, Độ chính xác (chung hoặc từng chữ); chỉ người đã đăng nhập xem; chỉ hiện người tự bật tham gia | SHOULD (đã làm) | Supabase `public_profiles`, `get_leaderboard` (03 §6.3) |

### 5.4 Nhóm Hồ sơ, Tài khoản & Hệ thống

| ID | Tính năng | Mô tả | Ưu tiên | Dữ liệu / Hợp đồng |
|---|---|---|---|---|
| FT-ACC-01 | Tài khoản tùy chọn & đồng bộ | Đăng ký (trang `/register`) rồi đăng nhập (trang `/login`) bằng email + mật khẩu (cùng thẻ Tài khoản ở Hồ sơ, menu tài khoản ở thanh trên); đồng bộ tiến độ giữa các máy theo quy tắc "không mất tiến độ"; đăng xuất; xóa tài khoản. Không đăng nhập vẫn dùng đủ | SHOULD (đã làm) | Supabase `user_backups` (03 §6) · K6 |
| FT-ACC-02 | Hồ sơ | Tên hiển thị tùy chọn; XP, chuỗi ngày, lịch hoạt động 12 tuần, độ thành thạo từng chữ | SHOULD | `profile` |
| FT-ACC-03 | Cài đặt | Âm thanh, mục tiêu XP/ngày, tên hiển thị, camera (giao diện chỉ chế độ sáng) | SHOULD | `settings` |
| FT-ACC-04 | Nhập / Xóa tiến độ | Nhập file sao lưu từ bản cũ; xóa toàn bộ dữ liệu trên máy. Nút Xuất JSON đã bỏ (2026-11-22) vì tài khoản thay thế việc chuyển máy | SHOULD | 03 §3.6 · K5 |
| FT-SYS-01 | Quản lý phiên bản mô hình | Client đọc `models/index.json`, tải manifest + ONNX, kiểm sha256, cache theo version | MUST | K2 |
| FT-SYS-02 | Thu thập mẫu landmark | Ghi landmark (không ghi video) có nhãn, **tải về dạng file JSON**; nhóm gom vào `ml/data/raw/webcam/` | MUST cho nhóm dev | 03 §4 · K5 |

> FT-ACC-01 bị bỏ ở v0.2 và **làm lại ở dạng tùy chọn** ở v0.3 (2026-11-22).

### 5.5 Nhóm AI Lab (Phòng thí nghiệm — cho người chấm)

| ID | Tính năng | Mô tả | Ưu tiên | Dữ liệu |
|---|---|---|---|---|
| FT-LAB-01 | Bảng Benchmark | So sánh tất cả mô hình: Val/Test Acc, Macro-F1, tỉ lệ sai, latency, số tham số | MUST | K1 `data/experiments/index.json` |
| FT-LAB-02 | Confusion Matrix & per-class F1 | Heatmap tương tác, chọn mô hình; top cặp nhầm | MUST | K1 `<run_id>.json` |
| FT-LAB-03 | Live Inference Monitor | Webcam + skeleton + thanh xác suất 24 lớp + thời gian xử lý (MediaPipe/classifier, p50/p95) + ghi benchmark 60 s và tải JSON | MUST | K3 `getPerf`, `recordBenchmark` |
| FT-LAB-04 | Leakage Demo | Biểu đồ khoảng lệch Val–Test của cùng một mô hình khi chia ngẫu nhiên và khi chia theo nhóm (số đo từ thí nghiệm `leakage_study`) | SHOULD | K1 `leakage_study` |

## 6. Acceptance Criteria (AC)

Mỗi AC đo được và gắn với rubric (R1 = Problem Definition, R2 = Problem Statement & RQ, R3 = Solution Development & Analysis, R4 = GitHub).

### 6.1 AC học thuật (ML) — **gating cho Tuần 5**

| AC | Điều kiện nghiệm thu | Rubric | Kiểm bằng |
|---|---|---|---|
| AC-ML-01 | `python -m signlingo_ml.pipeline all` chạy từ repo sạch (có CSV trong `data/raw/`) và tạo lại toàn bộ metrics; chạy 2 lần cho kết quả giống nhau (sai khác Macro-F1 ≤ 0,005 với CPU deterministic) | R3, R4 | E2E ML |
| AC-ML-02 | Không có `group_id` nào xuất hiện ở cả train và validation; tập test chính thức không dùng cho bất kỳ lựa chọn mô hình nào (log chứng minh) | R3 | Unit + Integration |
| AC-ML-03 | Bộ chuẩn hóa (scaler, mean/std) chỉ fit trên train; có test kiểm tra | R3 | Unit |
| AC-ML-04 | Báo cáo đủ ≥ 5 baseline + ≥ 2 mô hình chính với Val/Test Accuracy, Macro-F1, latency | R3 | Integration |
| AC-ML-05 | CNN chính có **Test Macro-F1 cao hơn baseline tốt nhất** (cùng split, cùng cách đánh giá), với chênh lệch lớn hơn độ dao động giữa các seed (≥ 3 seed, báo cáo trung bình ± độ lệch chuẩn). **Không đặt trước ngưỡng tuyệt đối**; nhóm chốt ngưỡng sau khi có kết quả baseline đầu tiên | R3 | E2E ML |
| AC-ML-06 | Landmark-MLP: báo cáo Macro-F1 trên (a) holdout theo thứ tự thu và (b) **signer-holdout** (người chưa có trong train, từ dữ liệu webcam nhóm thu). Không đặt ngưỡng cứng trước; số (b) là phép đo chính về khả năng dùng thật và phải được báo cáo trung thực dù thấp | R3 | E2E ML |
| AC-ML-07 | Có Confusion Matrix chuẩn hóa hàng + top-5 cặp nhầm cho mô hình chính; trả lời RQ2 bằng văn bản | R2, R3 | Artifact check |
| AC-ML-08 | ONNX xuất ra cho kết quả lệch PyTorch ≤ 1e-4 (max abs diff logits) trên 256 mẫu | R3 | Integration |
| AC-ML-09 | Kết quả landmark-normalize của Python và TypeScript trùng nhau ≤ 1e-6 trên bộ fixture chung | R3 | Integration (cross-language) |

### 6.2 AC hiệu năng (RQ3)

| AC | Điều kiện nghiệm thu | Kiểm bằng |
|---|---|---|
| AC-PERF-01 | Trên laptop tham chiếu của nhóm (*cần điền cấu hình: CPU/GPU/RAM*), Chrome stable, bản deploy Vercel: **thời gian xử lý mỗi khung (MediaPipe + classifier + hậu xử lý) p50 ≤ 33 ms, p95 ≤ 40 ms**, tức xử lý kịp ≥ 30 khung/giây, đo trong 60 giây. Webcam thường giới hạn 30 khung/giây nên đo thời gian xử lý chứ không đo FPS hiển thị | E2E perf (Playwright + fake camera) + đo tay |
| AC-PERF-02 | Classifier landmark < 2 ms/khung; CNN < 5 ms/khung trên trình duyệt | Unit benchmark |
| AC-PERF-03 | Lần tải đầu trên Vercel: mô hình + wasm sẵn sàng < 5 s trên mạng 20 Mbps; lần sau dùng cache trình duyệt | E2E |

### 6.3 AC sản phẩm

| AC | Điều kiện nghiệm thu | Ft |
|---|---|---|
| AC-LRN-01 | Khi người dùng giữ đúng ký hiệu mục tiêu ≥ 1.000 ms với confidence ≥ 0,60, bài tập chuyển trạng thái *Đúng* trong ≤ 200 ms sau mốc giữ; nếu nhả tay/sai, thanh giữ reset | FT-LRN-03 |
| AC-LRN-02 | Không phát hiện bàn tay > 2 s → hiển thị hướng dẫn "Đưa tay vào khung" | FT-LRN-02 |
| AC-LRN-03 | Từ chối quyền camera → màn hướng dẫn cấp quyền, không crash; vẫn xem được thẻ học | FT-LRN-02 |
| AC-LRN-04 | Phản hồi ngón tay đánh dấu đúng ngón lệch trong ≥ 80% trường hợp trên bộ test thủ công 24 chữ × 3 lỗi phổ biến | FT-LRN-04 |
| AC-LRN-05 | Fingerspelling: hoàn thành từ khi tất cả chữ được verify theo đúng thứ tự | FT-LRN-05 |
| AC-GAM-01 | XP, streak, hearts chỉ thay đổi qua module `src/game/` + `LearnerStore`; gọi `completeSession` 2 lần cho cùng session không cộng XP 2 lần (idempotent); reload trang vẫn giữ tiến độ | FT-GAM-01..03 |
| AC-GAM-02 | Streak tăng đúng 1 khi người dùng đạt mục tiêu ngày lần đầu trong ngày theo múi giờ của họ; bỏ 1 ngày → reset về 0 (khi chưa có streak freeze) | FT-GAM-02 |
| AC-GAM-03 | Hết tim → không bắt đầu được bài học mới (Free Practice vẫn được) và hiển thị thời gian hồi | FT-GAM-03 |
| AC-ACC-01 | Nhập file sao lưu hợp lệ cho ra cùng XP, streak, tiến độ bài; file sai schema bị từ chối, không ghi đè | FT-ACC-04 |
| AC-ACC-03 | Đăng nhập cùng tài khoản trên trình duyệt khác thì tiến độ xuất hiện; hai máy có tiến độ khác nhau gộp lại không mất bài hoàn thành, XP hay ngày học nào; tài khoản này không đọc được dữ liệu tài khoản khác (RLS) | FT-ACC-01 |
| AC-ACC-04 | Người chưa bật tham gia không xuất hiện trên bảng xếp hạng; khách chưa đăng nhập không đọc được bảng; email không lộ | FT-GAM-06 |
| AC-ACC-02 | localStorage bị chặn → app vẫn chạy, hiện banner "Tiến độ sẽ không được lưu" | FT-ACC-02 |
| ~~AC-UI-01~~ | **Bỏ (2026-11-22):** giao diện chỉ còn chế độ sáng | — |
| AC-UI-02 | Tương phản văn bản đạt WCAG 2.1 AA; toàn bộ luồng học điều khiển được bằng bàn phím | Toàn bộ UI |
| AC-PRIV-01 | Khi chưa đăng nhập, app không gửi request nào ra ngoài origin của chính nó (kiểm network log trong E2E); khi đã đăng nhập, chỉ thêm request tới Supabase mang tiến độ học. Không request nào mang ảnh/video/landmark; mẫu landmark chỉ rời trình duyệt khi người dùng bấm tải file | FT-SYS-02, FT-ACC-01 |

### 6.4 AC kho mã (R4)

| AC | Điều kiện |
|---|---|
| AC-REPO-01 | README có: mô tả, kiến trúc, link bản deploy Vercel, cách cài, lệnh tái lập ML, cách chạy web, bảng kết quả, giới hạn |
| AC-REPO-02 | CI xanh: lint + unit + integration cho `ml/` và `frontend/`; mỗi PR có Vercel Preview |
| AC-REPO-03 | Không commit dữ liệu thô Kaggle hay file > 50 MB; có hướng dẫn tải dữ liệu |

## 7. Chỉ số thành công

Không có telemetry, nên đo bằng **buổi thử nghiệm có hướng dẫn** với ≥ 5 người ngoài nhóm:

| Chỉ số | Mục tiêu MVP | Cách đo |
|---|---|---|
| Hoàn thành bài đầu tiên không cần trợ giúp | ≥ 4/5 người | Quan sát |
| Tỉ lệ nhận diện đúng do người thử xác nhận | ≥ 85% | Phiếu ghi |
| Thời gian xử lý khung p95 trên máy người thử | ≤ 40 ms | File benchmark JSON tải từ AI Lab (Live Monitor) |

## 8. Rủi ro & Giới hạn

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| Domain gap Kaggle → webcam thật | Điểm trên tập test Kaggle (cùng nguồn với train) có thể cao hơn nhiều so với webcam thật | Dùng landmark-MLP cho web; signer-holdout; thu dữ liệu webcam nhóm; báo cáo cả hai phép đo |
| Tốc độ xử lý trên trình duyệt chưa có đủ phép đo | Có thể không đạt RQ3 | Ghi benchmark 60 s bằng Live Monitor trên nhiều máy; MediaPipe Tasks Vision (CPU mặc định, GPU tùy chọn), VIDEO mode, giảm độ phân giải input, worker (Phase 4) |
| Các cặp chữ dễ nhầm trên tọa độ 2D (chưa kiểm chứng) | Người học bị chấm sai | Phân tích Confusion Matrix thật; dùng thêm z, góc ngón; ngưỡng 0,60; feedback "có thể nhầm với…" |
| Ít người ra dấu trong dữ liệu | Không tổng quát | Signer-holdout, thu thêm dữ liệu có consent |
| Dữ liệu từ vựng động (Cấp 3) chưa chốt nguồn/giấy phép | Trễ Cấp 3 | Để COULD; cần quyết định nguồn trước Phase 1B |
| Ảnh/video mẫu ký hiệu cho thẻ học chưa có nguồn hợp lệ | Thiếu nội dung học | **Cần người dùng cung cấp hoặc chọn nguồn có giấy phép** |
| Mất tiến độ khi xóa dữ liệu trình duyệt | Người học chưa đăng nhập mất XP/streak | Đăng nhập để đồng bộ (FT-ACC-01) |
| XP/streak sửa được bằng DevTools, kể cả điểm trên bảng xếp hạng | Gamification không đáng tin tuyệt đối | Chấp nhận (dự án học tập); DB chỉ kiểm đúng ≤ thử; ghi trong Giới hạn |
| Phụ thuộc Supabase gói Free (dự án tạm dừng khi lâu không dùng) | Không đăng nhập/đồng bộ được | App vẫn chạy local; mở lại dự án Supabase trước buổi demo |
| Luật nhận diện số và J, Z chưa được đo độ chính xác | Không trích được số liệu | Ghi rõ trong Giới hạn; COULD: thay bằng mô hình học máy có thí nghiệm |
| Giới hạn gói Vercel Hobby (băng thông, thành viên nhóm) | Deploy bị chặn | File tĩnh nhỏ; repo public hoặc chủ project merge; kiểm điều khoản khi tạo project |

## 9. Câu hỏi mở (cần người dùng trả lời)

1. Wording chính thức của RQ1–RQ3 đã nộp tuần 2?
2. Ngày trình bày cuối kỳ (Tuần 5) và hạn nộp GitHub/báo cáo?
3. ~~Mã nguồn tuần 3–4~~ **Đã chốt (2026-11-18):** không dùng; viết lại toàn bộ trong repo này, mọi số liệu tự đo.
4. ~~Ngôn ngữ giao diện?~~ **Theo code (2026-11-22):** tiếng Việt (`src/i18n/vi.ts`).
5. ~~Nguồn hình minh họa?~~ **Theo code (2026-11-22):** 26 hình chữ cái public domain từ wpclipart.com qua Wikimedia Commons (`frontend/public/media/letters/ATTRIBUTION.md`); hình số nằm ở `public/media/numbers/`.
6. Danh sách từ cho Cấp 2 (Fingerspelling) và từ vựng Cấp 3 — **vẫn chờ người dùng cung cấp**.
7. ~~Deploy?~~ **Đã chốt:** Vercel Hobby (project `sign-lingo`, `https://signlingo-vn.vercel.app`); repo `github.com/Nyanta-dotcom/SignLingo`; tài khoản tùy chọn qua Supabase (2026-11-22).
