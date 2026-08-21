# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tổng quan

"Bộ Não Thứ 2" là kho công cụ web hỗ trợ giảng dạy Toán, tư duy song song (Edward de Bono) và phát triển não bộ. Toàn bộ nội dung giao diện và tài liệu viết bằng **tiếng Việt**.

## Chạy và kiểm thử

Không có bước build, không có package manager, không có dependency, không có test runner. Các công cụ là HTML/CSS/JS thuần chạy thẳng trên trình duyệt.

- Mở trực tiếp: mở `dong-ho-sau-mu-tu-duy/index.html` bằng trình duyệt.
- Chạy qua server tĩnh (cần khi thử localStorage/`file://` gây lỗi):

```bash
python -m http.server 8000
```

Sau đó vào `http://localhost:8000/dong-ho-sau-mu-tu-duy/`.

Kiểm thử là thủ công: bấm qua từng mũ, chạy hẹn giờ tới 0 (nghe chuông), tải lại trang để xác nhận ghi chú còn trong localStorage, bấm "Xuất tóm tắt" và "Xóa toàn bộ phiên".

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
