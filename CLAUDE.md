# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tổng quan

"Bộ Não Thứ 2" là kho công cụ web hỗ trợ giảng dạy Toán, tư duy song song (Edward de Bono) và phát triển não bộ. Toàn bộ nội dung giao diện và tài liệu viết bằng **tiếng Việt**.

## Chạy và kiểm thử

Không có bước build, không có package manager, không có dependency, không có test runner. Các công cụ là HTML/CSS/JS thuần chạy thẳng trên trình duyệt.

- **Cách chính** — mở trực tiếp: nhấp đúp `dong-ho-sau-mu-tu-duy/index.html`. Không cần cài đặt gì.
- Chạy qua server tĩnh (cần khi thử localStorage/`file://` gây lỗi):

```bash
python -m http.server 8000
```

Sau đó vào `http://localhost:8000/dong-ho-sau-mu-tu-duy/`.

### ⚠️ Ràng buộc môi trường

**Máy của người dùng chưa cài Python lẫn Node.js.** Kiểm tra ngày 21-08-2026: cả `python --version` lẫn `node --version` đều báo không tìm thấy lệnh. Nghĩa là lệnh `python -m http.server` ở trên **hiện chạy không được**, và mọi công cụ trong repo bắt buộc phải chạy trọn vẹn bằng `file://`.

Hệ quả — tránh các kỹ thuật đòi hỏi giao thức HTTP, vì chúng hỏng lặng lẽ trên `file://`:

- `<script type="module">` cùng `import`/`export` — bị chặn bởi CORS, kết quả là **trang trắng không kèm thông báo lỗi rõ ràng**.
- `fetch()` hay `XMLHttpRequest` đọc file cùng thư mục (JSON, SVG, dữ liệu ngoài) — cùng lý do.
- Service worker và Web Worker nạp từ file rời.

Nếu một công cụ mới thật sự cần những thứ trên, phải cài Python hoặc Node trước, và ghi rõ yêu cầu đó vào README của công cụ.

### Kiểm thử

Kiểm thử là thủ công: bấm qua từng mũ, chạy hẹn giờ tới 0 (nghe chuông), tải lại trang để xác nhận ghi chú còn trong localStorage, bấm "Xuất tóm tắt" và "Xóa toàn bộ phiên".

Khi cần chạy tự động mà không có server: dựng một file HTML tạm nội tuyến hoá `style.css` và `app.js` vào thẳng `index.html`, mở bằng `file://` rồi gọi trực tiếp các hàm trong trang. Xóa file tạm sau khi xong. Lưu ý localStorage có thể bị chặn tuỳ ngữ cảnh tải trang, nên bộ kiểm thử cần một lớp giả lập localStorage dự phòng.

## Kiến trúc

Mỗi công cụ là **một thư mục độc lập ở gốc repo**, tự chứa đủ 3 file `index.html` + `style.css` + `app.js`, không chia sẻ code với nhau, không framework, không bundler, không CDN ngoài. README.md ở gốc là mục lục — mục "Công cụ" liệt kê link tới từng `index.html`.

Khi thêm công cụ mới: tạo thư mục mới theo cùng bộ 3 file và **thêm một dòng vào mục "Công cụ" trong README.md**.

### Khuôn mẫu code trong `app.js`

Công cụ hiện có (`dong-ho-sau-mu-tu-duy/app.js`) đặt ra khuôn mẫu nên theo cho các công cụ sau:

- **Dữ liệu cấu hình đứng đầu file**: hằng `HATS` (mảng object `{id, name, emoji, cls, prompt}`) là nguồn duy nhất sinh ra cả UI lẫn nội dung xuất file. Muốn đổi tên mũ, câu gợi ý hay màu — sửa mảng này, không sửa DOM.
- **Lưu trạng thái**: một khoá localStorage duy nhất (`STORAGE_KEY = "sau-mu-tu-duy-session"`), ghi bằng `saveState()` sau mỗi thay đổi. Chỉ `notes`, `minutes`, `secondsSpent` được lưu — trạng thái đồng hồ đang chạy thì không, tải lại trang là đồng hồ về mốc ban đầu.
- **DOM trực tiếp**: `document.getElementById(...)` + `addEventListener` gắn một lần ở cuối file; `renderHats()` vẽ lại toàn bộ lưới thẻ mũ. Không có virtual DOM, không có template engine.
- **Không phụ thuộc ngoài**: chuông báo hết giờ dựng bằng Web Audio API (`playChime()`), xuất file bằng `Blob` + thẻ `<a download>` tạo tạm. Giữ nguyên hướng này thay vì kéo thư viện về.

### CSS

Bảng màu khai báo bằng CSS custom properties trong `:root` (`--bg`, `--accent`, cùng một biến cho mỗi màu mũ). Dùng biến thay vì hardcode mã màu. Layout dựa trên grid `auto-fit`, đã responsive sẵn.

## Quy ước

- Tên thư mục: kebab-case, tiếng Việt **không dấu** (`dong-ho-sau-mu-tu-duy`).
- Chuỗi hiển thị cho người dùng: tiếng Việt có dấu, thường kèm emoji ở đầu nhãn.
- Commit message: viết bằng tiếng Việt, thể khẳng định (ví dụ: `Thêm app Đồng Hồ Sáu Mũ Tư Duy`).
- Nhánh làm việc tách khỏi `main`, merge qua pull request.

## Lưu ý

Thư mục cha của repo (`NTV Brain 2/CLAUDE.md`) chứa hồ sơ cá nhân và yêu cầu về cách trả lời của người dùng; file đó nằm ngoài repo nhưng vẫn được nạp vào ngữ cảnh — không sao chép nội dung đó vào đây.
