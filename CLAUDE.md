# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tổng quan

"Bộ Não Thứ 2" là kho công cụ web hỗ trợ giảng dạy Toán, tư duy song song (Edward de Bono) và phát triển não bộ. Toàn bộ nội dung giao diện và tài liệu viết bằng **tiếng Việt**.

## Chạy và kiểm thử

Không có bước build, không có package manager, không có dependency, không có test runner. Các công cụ là HTML/CSS/JS thuần chạy thẳng trên trình duyệt.

- **Cách chính** — mở trực tiếp: nhấp đúp `dong-ho-sau-mu-tu-duy/index.html`. Không cần cài đặt gì.
- Chạy qua server tĩnh (cần khi thử localStorage/`file://` gây lỗi, hoặc khi công cụ dùng `import`/`fetch()`):

```bash
npx --yes http-server -p 8000 -c-1
```

Sau đó vào `http://localhost:8000/dong-ho-sau-mu-tu-duy/`.

### Môi trường chạy

**Node.js đã được cài — Python thì chưa.** Kiểm tra ngày 21-08-2026: `node --version` cho v24.19.0, `npm --version` cho 11.17.0, `npx` có sẵn; còn `python --version` vẫn báo không tìm thấy lệnh. Lệnh `npx --yes http-server` ở trên đã được chạy thử thật và phục vụ được `dong-ho-sau-mu-tu-duy/` (HTTP 200), không phải chép từ tài liệu.

Nghĩa là repo **không còn bị trói vào `file://`**. Các kỹ thuật đòi hỏi giao thức HTTP giờ đã dùng được, với điều kiện chạy qua server tĩnh:

- `<script type="module">` cùng `import`/`export`
- `fetch()` hay `XMLHttpRequest` đọc file cùng thư mục (JSON, SVG, dữ liệu ngoài)
- Service worker và Web Worker nạp từ file rời

⚠️ Nhưng **mở trực tiếp bằng `file://` vẫn là cách dùng chính** của các công cụ, và trên `file://` những kỹ thuật trên hỏng *lặng lẽ* — `import` bị CORS chặn sẽ cho ra **trang trắng không kèm thông báo lỗi rõ ràng**. Vậy nên:

- Công cụ nào chỉ dùng HTML/CSS/JS thuần thì giữ nguyên, để mở bằng `file://` là chạy.
- Công cụ nào thật sự cần HTTP thì phải ghi rõ trong README của nó rằng **bắt buộc chạy qua server**, kèm lệnh chạy ở trên.

Lệnh `python -m http.server` từng ghi trong tài liệu cũ hiện vẫn chạy không được, vì máy chưa cài Python.

### Kiểm thử

Kiểm thử là thủ công: bấm qua từng mũ, chạy hẹn giờ tới 0 (nghe chuông), tải lại trang để xác nhận ghi chú còn trong localStorage, bấm "Xuất tóm tắt" và "Xóa toàn bộ phiên".

Khi cần chạy tự động: cách gọn nhất bây giờ là bật server tĩnh (`npx --yes http-server -p 8000 -c-1`) rồi kiểm thử qua `http://localhost:8000/` — ở ngữ cảnh HTTP thì localStorage hoạt động bình thường, không cần mẹo mực gì.

Cách cũ vẫn giữ lại làm phương án dự phòng khi không tiện bật server: dựng một file HTML tạm nội tuyến hoá `style.css` và `app.js` vào thẳng `index.html`, mở bằng `file://` rồi gọi trực tiếp các hàm trong trang. Xóa file tạm sau khi xong. Lưu ý localStorage có thể bị chặn tuỳ ngữ cảnh tải trang, nên bộ kiểm thử theo cách này cần một lớp giả lập localStorage dự phòng.

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
