# Chat Challenge — Sếp giao việc khó

Website trò chơi chat mô phỏng giao diện nhắn tin, dùng HTML/CSS/JavaScript thuần, chạy trực tiếp trong VS Code.

## Chạy trên máy
1. Giải nén thư mục.
2. Mở thư mục trong VS Code.
3. Mở `index.html` bằng Live Server (nếu đã cài extension) hoặc mở file trực tiếp trên trình duyệt.
4. Chọn 1 trong 3 tình huống và nhập câu trả lời ở khung chat.

## Các file
- `index.html`: cấu trúc giao diện.
- `style.css`: giao diện responsive kiểu Messenger.
- `script.js`: 3 tình huống, mỗi tình huống 8 lượt đối thoại, chấm điểm và tính tổng.
- `fallback.js` (MỚI): lưới câu hỏi dự phòng khi người chơi trả lời ngoài luồng + nối mạch câu sếp + hook AI.
- `server.js` (MỚI, tuỳ chọn): proxy Node gọi AI, giữ API key ở phía server.

## Cách tính điểm
- +10: phản hồi có dấu hiệu lịch sự, làm rõ yêu cầu và đưa ra phương án/kế hoạch.
- +5: phản hồi tương đối hợp tác nhưng thiếu một số chi tiết.
- -5: câu trả lời có dấu hiệu công kích/từ chối cụt lủn hoặc quá ngắn.

Bản mẫu chấm điểm bằng các quy tắc và mẫu câu chạy trong trình duyệt, không dùng AI và không gửi câu trả lời ra ngoài. Hệ thống cố gắng phân biệt lời phủ định mang tính xây dựng (ví dụ: không kịp nhưng đề xuất phương án) với từ chối cụt lủn hoặc công kích. Dù vậy, đây vẫn là heuristic, có thể hiểu sai câu mỉa mai, câu phức tạp hoặc ngữ cảnh. Có thể chỉnh `scoreReply()` trong `script.js` để thay đổi tiêu chí.

## Tùy chỉnh
- Đổi nội dung tình huống: chỉnh mảng `scenarios` trong `script.js`.
- Đổi màu/giao diện: chỉnh biến CSS trong `style.css`.
- Thêm màn: thêm object vào `turns` của tình huống và cập nhật số lượt ở các dòng hiển thị `/ 8` nếu cần.

## Lưới dự phòng khi người chơi trả lời ngoài luồng (`fallback.js`)
Chạy offline, không cần cài gì thêm. Với mỗi câu trả lời, game phân loại rồi xử lý:

| Loại | Ví dụ | Sếp phản ứng | Điểm |
|---|---|---|---|
| Vô nghĩa / quá ngắn | `asdfgh`, `Dạ` | Nhờ viết rõ hơn + nhắc lại câu hỏi | Chưa tính |
| Lạc đề | "tối nay ăn gì nhỉ" | Kéo về việc đang bàn | Chưa tính |
| Lệch ý | Được hỏi "bỏ phần nào" nhưng trả lời "em làm tất cả" | Nhắc lại đúng câu hỏi | Chưa tính |
| Hỏi ngược sếp | "Anh ưu tiên phần nào ạ?" | Trả lời từ `FAQ`, rồi hỏi lại | +5 lần đầu |
| Công kích | "kệ tao đi" | Nhắc bình tĩnh, đi tiếp | -5 |
| Hợp lệ | | Chấm bằng `scoreReply()`, câu sếp tiếp theo được **nối mạch** | +10/+5/-5 |

- Sau `maxClarify` (mặc định 2) lần vẫn lạc đề → bị -5 và sếp chuyển sang việc tiếp theo, nên không bị kẹt vĩnh viễn.
- **Nối mạch**: câu sếp tiếp theo tự đổi theo điều người chơi vừa nói. Ví dụ người chơi không từ chối thì sếp không còn nói "Anh không muốn nghe lý do"; đã nhắc tới "nhờ hỗ trợ" rồi thì sếp hỏi sâu hơn thay vì hỏi lại từ đầu.
- Hiểu cả câu gõ không dấu ("em lam xong truoc 16h").
- Chỉnh nội dung: `POOL` (câu hỏi lại chung), `FAQ` (sếp trả lời khi bị hỏi), `FLOW` (từng lượt: `redirect`, `alt`, `covered`, `expects`). Thêm tình huống mới thì thêm một phần tử tương ứng vào `FAQ`, `FLOW`, `DOMAIN`.

## Kết nối AI (tuỳ chọn)
1. Cần Node 18+. Chạy: `ANTHROPIC_API_KEY=sk-ant-... node server.js`
2. Mở `http://localhost:3000/?ai=1`.
3. AI đánh giá độ liên quan, chấm điểm, viết nhận xét và câu sếp phản ứng tự nhiên. Nếu AI lỗi hoặc quá 12 giây, game tự dùng bộ luật offline.
4. Không bao giờ đặt API key trong `script.js`/`fallback.js`. Dùng AI khác thì sửa hàm `callModel()` trong `server.js`. Khi đưa lên mạng thật, nên đặt giới hạn chi phí cho key.

## Sửa lỗi trong `script.js`
Các regex dùng `\b` không nhận chữ tiếng Việt có dấu ở đầu/cuối từ, nên "dạ", "đề xuất", "hỗ trợ", "ưu tiên" không bao giờ khớp và câu trả lời tốt dễ bị chấm thấp. Đã thay bằng ranh giới từ hiểu tiếng Việt.
