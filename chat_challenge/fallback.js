/* =====================================================================
   fallback.js — Lưới câu hỏi dự phòng + (tuỳ chọn) kết nối AI
   ---------------------------------------------------------------------
   Nạp SAU script.js. File này không sửa kịch bản trong script.js; nó
   "bọc" lại sendReply() và renderScenario() để:

   1. Phát hiện câu trả lời lạc đề / vô nghĩa / quá ngắn → sếp HỎI LẠI
      (không tính điểm, không sang lượt mới) thay vì cứ đọc tiếp kịch bản.
   2. Phát hiện câu trả lời đi lệch câu hỏi (mismatch) → sếp kéo về đúng ý.
   3. Người chơi HỎI NGƯỢC sếp → sếp trả lời từ ngân hàng FAQ rồi hỏi lại.
   4. NỐI MẠCH: câu hỏi tiếp theo được chỉnh theo những gì người chơi vừa
      nói (đã nhắc tới rồi thì hỏi sâu hơn, chưa nói gì thì đổi câu cho hợp).
   5. (Tuỳ chọn) gọi AI qua server.js để hiểu ngữ nghĩa linh hoạt hơn.
      Nếu AI lỗi/chậm → tự rơi về bộ luật offline ở trên.

   Muốn sửa nội dung: xem các khối POOL, FAQ, FLOW bên dưới.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------------------------- CẤU HÌNH ---------------------------- */
  const USER_CFG = window.SMART_CHAT_CONFIG || {};
  const CONFIG = {
    maxClarify: 2,   // số lần sếp hỏi lại khi lạc đề/vô nghĩa trước khi bỏ qua lượt (bị -5)
    maxMismatch: 1,  // số lần sếp kéo lại khi trả lời lệch ý
    maxQuestions: 2, // số lần người chơi được hỏi ngược sếp trong 1 lượt
    ...USER_CFG,
    ai: {
      enabled: new URLSearchParams(location.search).get("ai") === "1", // hoặc đặt true ở đây
      endpoint: "/api/boss",  // server.js (không để API key trong trình duyệt)
      timeoutMs: 12000,
      ...(USER_CFG.ai || {})
    }
  };

  /* --------------------- TIỆN ÍCH XỬ LÝ TIẾNG VIỆT --------------------- */
  // Bỏ dấu để người chơi gõ "em lam xong truoc 16h" vẫn được hiểu.
  const fold = s => String(s).toLowerCase().replace(/đ/g, "d").normalize("NFD")
    .replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s?:%]/g, " ").replace(/\s+/g, " ").trim();

  /* ------------------------------ NHÃN Ý ------------------------------ */
  // s = dấu hiệu mạnh, w = dấu hiệu yếu (từ quá phổ biến, chỉ tính khi đi cùng nhau).
  const TAGS = {
    agree:   { s: /\b(em (se |co the |xin |dam )?(nhan|lam|xu ly|phu trach|dam nhan|lo)|dong y|nhan viec|ok|oke|chac chan|san sang|em hieu)\b/, w: /\b(duoc|vang|da)\b/ },
    decline: { s: /\b(khong (the|kip|du|dam|nhan|dong y|chac|lam duoc|xong)|chua (the|kip|du|co kinh nghiem|tung)|kho (ma )?(kip|lam|xong)|qua (tai|gap|nhieu|ngan)|tu choi|vuot kha nang|het kha nang)\b/ },
    reason:  { s: /\b(boi vi|ly do|vi thoi gian|thieu (thoi gian|nguoi|du lieu|so lieu)|mat khoang|dang (lam|ban|qua tai)|khoi luong)\b/ },
    plan:    { s: /\b(de xuat|phuong an|ke hoach|uu tien|chia (nho|viec|thanh)|buoc (dau|tiep|1|mot)|truoc tien|sau do|lo trinh|phan (viec|cong)|se (gui|cap nhat|bao|lam xong|hoan thanh|tong hop)|bao lai|ban nhap|ban xem truoc|giai phap|cach (lam|xu ly))\b/ },
    time:    { s: /\b(\d{1,2}\s*(h|gio|phut|tieng|ngay|tuan|buoi)|\d{1,2}h\d{2}|\d{1,2}:\d{2}|truoc \d|luc \d|deadline|han chot|moc (thoi gian|\d)|cuoi ngay|dau gio|trong (hom nay|ngay mai|tuan))\b/,
               w: /\b(hom nay|ngay mai|chieu nay|sang mai|sang nay|tuan sau|thoi gian|thoi han)\b/ },
    help:    { s: /\b(ho tro|giup (em|do)|phoi hop|dong nghiep|them (mot |1 )?(nguoi|nhan su|ban)|nguoi (ho tro|giup|lam)|nho (them )?(ban|chi|anh|nguoi|dong nghiep|phong)|cung lam|chia se)\b/, w: /\b(nhan su|nho)\b/ },
    cut:     { s: /\b(bo|cat|giam|rut gon|don gian hoa|luoc bot|de sau|lui|hoan|tam bo|bo qua|ban rut gon|ban tom tat)\b/ },
    risk:    { s: /\b(du phong|ghi chu|bao som|uoc tinh|tam thoi|danh dau|phuong an b|rui ro|bo sung sau|cap nhat sau|neu (thieu|chua)|so lieu tam)\b/ },
    preview: { s: /\b(ban xem truoc|ban nhap|draft|xem truoc|ban dau|ban so bo|15:00|15h|3 gio chieu)\b/ },
    start:   { s: /\b(bat dau|tim hieu|tai lieu|huong dan|mentor|nguoi co kinh nghiem|hoc hoi|mau|template|checklist|kich ban|lap (danh sach|lich)|danh sach viec|tuan nay)\b/ },
    budget:  { s: /\b(ngan sach|chi phi|phe duyet|duyet|quyen (quyet dinh|chi)|bao gia|han muc|kinh phi|xin y kien|xin phep)\b/ },
    cause:   { s: /\b(nguyen nhan|quy trinh|kiem tra|doi chieu|lich su|phien ban|nguon du lieu|thoi diem|xac minh|buoc kiem tra|log)\b/ },
    fix:     { s: /\b(sua|fix|chinh lai|cap nhat lai|thay (file|so lieu)|kip|30 phut|ngay bay gio|ngay lap tuc)\b/ },
    message: { s: /\b(thong bao|nhan cho khach|email|thong diep|minh bach|trung thuc|cap nhat cho khach|noi (voi|cho) khach|goi cho khach)\b/ },
    prevent: { s: /\b(phong ngua|checklist|nguoi duyet|quan ly phien ban|review|kiem duyet|tranh lap lai|rut kinh nghiem|quy trinh (moi|kiem tra)|kiem soat)\b/ },
    own:     { s: /\b(xin loi|em chiu trach nhiem|em phu trach|em kiem tra|em xu ly|em ghi nhan|phan cua em)\b/ },
    blame:   { s: /\b(loi (cua|tai) (ho|ben|dong nghiep|anh|sep|chi)|khong phai (loi|viec) (cua )?em|tai (anh|sep|ho|dong nghiep|chi)|do (anh|sep|dong nghiep|ben)|em khong (lam|sai|co loi))\b/ }
  };

  // Từ khoá "đúng chủ đề" theo từng tình huống (chỉ để biết câu trả lời có liên quan hay không).
  const DOMAIN = [
    /\b(bao cao|so lieu|bieu do|doanh so|khu vuc|nhan dinh|ban giam doc|phong kinh doanh|16h|16:00|excel|crm)\b/,
    /\b(hoi thao|su kien|nha cung cap|dia diem|noi dung|dieu phoi|khach hang|ngan sach|bao cao|kinh nghiem|marketing)\b/,
    /\b(demo|khach hang|file|phien ban|du lieu|so lieu|sai|loi|dong nghiep|cap nhat|bao cao)\b/
  ];

  /* ---------------------- LƯỚI CÂU HỎI DỰ PHÒNG ---------------------- */
  // Câu sếp dùng khi người chơi đi lệch. Mỗi nhóm xoay vòng, không lặp liên tiếp.
  const POOL = {
    unclear:  ["Anh chưa hiểu ý em. Em viết lại rõ hơn giúp anh nhé.",
               "Tin nhắn của em hơi khó hiểu, em nói đầy đủ hơn được không?",
               "Anh chưa đọc ra ý của em. Em trả lời lại ngắn gọn nhưng rõ ràng nhé."],
    thin:     ["Em trả lời hơi ngắn quá. Em nói rõ hơn một chút giúp anh nhé.",
               "Một chữ thì anh chưa nắm được ý. Em giải thích thêm được không?"],
    offtopic: ["Anh đang hỏi về công việc đang bàn mà. Em quay lại câu anh vừa hỏi giúp anh nhé.",
               "Chuyện đó để sau nhé. Bây giờ anh cần em trả lời việc đang trao đổi.",
               "Anh chưa thấy câu trả lời liên quan đến việc này. Em tập trung vào câu hỏi của anh giúp anh."],
    mismatch: ["Anh hiểu ý em, nhưng câu anh hỏi hơi khác.",
               "Ý đó anh ghi nhận, nhưng anh đang cần em trả lời một việc cụ thể hơn.",
               "Em nói vậy cũng có lý, nhưng anh chưa nghe phần anh vừa hỏi."],
    noFaq:    ["Câu đó anh để em tự cân nhắc — anh cần nghe đề xuất của em.",
               "Anh không có thêm thông tin về chuyện đó. Em dựa vào những gì đã biết mà đề xuất nhé."],
    reask:    ["Vậy giờ em trả lời giúp anh câu lúc nãy nhé.",
               "Quay lại câu anh hỏi lúc nãy — em thấy sao?"],
    skip:     ["Anh thấy mình chưa trao đổi được ý chính. Thôi, anh chuyển sang việc tiếp theo."],
    hostile:  ["Anh nghĩ mình nên bình tĩnh lại một chút. Mình trao đổi lại cho đúng cách nhé."]
  };

  // Người chơi HỎI NGƯỢC sếp → sếp trả lời bằng thông tin này (sửa số liệu tuỳ ý).
  const FAQ = [
    [ // 0 — Deadline bất khả thi
      [/\b(uu tien|quan trong nhat|truoc phan nao|phan nao truoc)\b/, "Ưu tiên số liệu theo khu vực trước, rồi tới biểu đồ. Phần nhận định anh chấp nhận bản ngắn."],
      [/\b(tai sao|vi sao|ly do|sao gap|gap the)\b/, "Ban giám đốc họp lúc 16:30 và cần số liệu để quyết định ngân sách quý sau."],
      [/\b(ho tro|nguoi|dong nghiep|them nguoi|nhan su)\b/, "Anh có thể xin một bạn bên kinh doanh hỗ trợ, nhưng em phải nói rõ cần bạn ấy làm gì."],
      [/\b(lui|gia han|them thoi gian|muon hon|doi han|keo dai)\b/, "Không lùi được. Cứng 16:00, và anh cần xem bản xem trước lúc 15:00."],
      [/\b(dinh dang|mau|slide|excel|bang|file)\b/, "Excel kèm biểu đồ là được, không cần làm slide."],
      [/\b(so lieu|nguon|du lieu|lay o dau|crm)\b/, "Số liệu nằm trên hệ thống CRM; riêng khu vực miền Nam do phòng kinh doanh giữ."]
    ],
    [ // 1 — Việc ngoài chuyên môn
      [/\b(ngan sach|chi phi|kinh phi|bao nhieu tien)\b/, "Dự kiến khoảng 50 triệu nhưng anh chưa chốt, tuần này anh sẽ xin duyệt."],
      [/\b(bao nhieu (nguoi|khach)|quy mo|khach moi|so luong khach)\b/, "Khoảng 60 khách hàng, tổ chức nửa ngày."],
      [/\b(ho tro|ai giup|dong nghiep|mentor|nguoi (huong dan|co kinh nghiem)|huong dan)\b/, "Chị Lan bên marketing từng tổ chức sự kiện, em có thể nhờ chị ấy hướng dẫn."],
      [/\b(khi nao|bao gio|ngay nao|han|deadline|thoi gian)\b/, "Hội thảo diễn ra thứ Năm tuần sau; nhà cung cấp cần câu trả lời trước chiều mai."],
      [/\b(bao cao|lui|doi han)\b/, "Báo cáo thường kỳ có thể lùi một ngày, không hơn."],
      [/\b(quyen|duyet|quyet dinh|tu quyet)\b/, "Khoản chi dưới 5 triệu em tự quyết; trên mức đó em báo anh duyệt."]
    ],
    [ // 2 — Bị quy trách nhiệm
      [/\b(sai (o dau|cho nao|nhu the nao)|so lieu nao|khach (phan anh|chi ra)|chi tiet)\b/, "Khách chỉ ra bảng doanh thu khu vực miền Trung lệch khoảng 8% so với báo cáo gốc."],
      [/\b(khi nao|luc nao|gio nao|thoi diem|may gio)\b/, "Bản demo được đưa lên lúc 9:30 sáng nay, khách báo lỗi lúc 11:00."],
      [/\b(lich su|phien ban|log|ai (sua|cap nhat))\b/, "Hệ thống có lưu lịch sử phiên bản. Em kiểm tra rồi gửi anh nhé."],
      [/\b(ai|nguoi nao|dong nghiep)\b/, "Anh chưa biết ai khác đã chỉnh file. Anh cần em cung cấp lịch sử file để đối chiếu."],
      [/\b(khach|thong bao|noi voi khach|bao khach)\b/, "Anh sẽ trực tiếp gọi cho khách; em chuẩn bị giúp anh nội dung ngắn gọn và dữ kiện."],
      [/\b(sua|kip|bao lau|han)\b/, "Cần sửa xong trước 14:00 vì khách có buổi họp lúc 14:30."]
    ]
  ];

  /* ------------------ BẢN ĐỒ NỐI MẠCH TỪNG LƯỢT SẾP ------------------
     FLOW[tình huống][lượt] mô tả câu sếp thứ `lượt` (khớp với turns[] trong script.js):
       expects : nhãn ý mà câu TRẢ LỜI câu này nên có (null = chấp nhận mọi ý đúng chủ đề)
       redirect: câu sếp hỏi lại khi người chơi lạc đề / lệch ý lúc trả lời câu này
       onlyIf  : câu sếp này chỉ hợp lý nếu câu trả lời TRƯỚC có một trong các nhãn này;
                 nếu không thì dùng `alt`
       topic   : nhãn ý mà câu sếp này mở ra; nếu người chơi đã nói tới rồi thì dùng `covered`
  ------------------------------------------------------------------- */
  const CORE = ["agree", "decline", "plan", "time", "reason", "own", "cut", "help", "risk", "preview"];
  const FLOW = [
    [ // 0 — Deadline bất khả thi
      { expects: null, redirect: "Anh chưa nghe em trả lời. Anh cần báo cáo doanh số quý trước 16:00 hôm nay — em nhận việc này thế nào, và có gì cần làm rõ không?" },
      { expects: CORE, redirect: "Anh hỏi về phạm vi: số liệu theo khu vực, biểu đồ xu hướng và nhận định nguyên nhân. Em làm được những phần nào?" },
      { expects: CORE, onlyIf: ["decline", "reason"],
        alt: "Anh ghi nhận tinh thần của em. Trong ba phần đó (số liệu, biểu đồ, nhận định), phần nào em chắc chắn xong sớm nhất?",
        redirect: "Anh cần em xử lý cụ thể: em đề xuất cách làm nào để kịp trước 16:00?" },
      { expects: ["cut", "plan", "risk", "decline", "reason"], topic: ["cut"],
        covered: "Em đã nói tới việc rút gọn. Cụ thể em bỏ hoặc làm tóm tắt phần nào, và ảnh hưởng thế nào?",
        redirect: "Anh hỏi: nếu không đủ thời gian thì em bỏ phần nào? Em chọn cụ thể một phần và nói ảnh hưởng của nó." },
      { expects: ["help", "plan", "start", "time"], topic: ["help"],
        covered: "Em có nhắc tới việc cần hỗ trợ rồi. Cụ thể người đó làm đầu mục nào, và cần xong lúc mấy giờ?",
        redirect: "Anh cần biết em muốn nhờ hỗ trợ việc gì cụ thể — ví dụ lấy số liệu, dựng biểu đồ hay soát lại." },
      { expects: ["preview", "time", "agree", "plan", "own", "risk"], topic: ["preview"],
        covered: "Em đã đề xuất bản xem trước rồi, tốt. Anh chốt luôn 15:00 nhé. Bản đó em sẽ gồm những phần nào?",
        redirect: "Anh cần bản xem trước lúc 15:00. Em xác nhận mốc này và nói rõ bản đó gồm những gì." },
      { expects: ["risk", "plan", "help", "cut", "own", "time"], topic: ["risk"],
        covered: "Em đã nói tới phương án dự phòng. Nếu đến 15:00 phòng kinh doanh vẫn chưa gửi số liệu thì em ghi chú và báo anh thế nào?",
        redirect: "Câu anh hỏi là: nếu 15:00 vẫn thiếu số liệu từ phòng kinh doanh thì em xử lý ra sao?" },
      { expects: ["plan", "time", "help", "own", "preview", "risk", "cut"],
        redirect: "Anh cần bản tóm tắt kế hoạch cuối cùng: việc em làm, người hỗ trợ và các mốc 15:00 / 16:00." }
    ],
    [ // 1 — Việc ngoài chuyên môn
      { expects: null, redirect: "Anh hỏi em có nhận phụ trách hội thảo tuần sau không. Em trả lời thẳng, kèm điều em cần làm rõ." },
      { expects: ["decline", "reason", "plan", "budget", "time", "own", "cut", "help", "start", "agree"],
        redirect: "Anh vẫn cần báo cáo thường kỳ. Em nói giúp anh khối lượng hiện tại và em muốn xếp ưu tiên thế nào?" },
      { expects: ["agree", "plan", "own", "cut", "budget", "time", "help", "decline", "reason"], onlyIf: ["decline", "reason"],
        alt: "Anh vui vì em sẵn sàng. Nhưng em làm cả hai việc cùng lúc được không? Em xếp báo cáo thường kỳ vào đâu?",
        redirect: "Anh cần em nói rõ: em nhận được, nhận có điều kiện hay chưa nhận được? Điều kiện là gì?" },
      { expects: ["agree", "budget", "time", "plan", "own", "cut"], topic: ["cut"],
        covered: "Em đã nhắc tới việc lùi báo cáo. Anh đồng ý lùi một ngày — em xác nhận mốc nộp mới là khi nào?",
        redirect: "Báo cáo thường kỳ có thể lùi một ngày. Em có đồng ý và cần anh xác nhận thêm điều gì?" },
      { expects: ["start", "plan", "help", "time", "own"], topic: ["start"],
        covered: "Em đã có hướng bắt đầu rồi. Cụ thể tuần này em làm gì trước, và cần anh cấp tài liệu hay người hướng dẫn nào?",
        redirect: "Anh hỏi em bắt đầu từ đâu. Em nêu 2-3 bước đầu tiên và điều em cần anh hỗ trợ." },
      { expects: ["budget", "plan", "time", "risk", "own"], topic: ["budget"],
        covered: "Em đã hỏi về ngân sách rồi. Anh chưa chốt, mà nhà cung cấp cần câu trả lời ngày mai. Em đề xuất phương án nào để không bị trễ?",
        redirect: "Ngân sách chưa chốt mà nhà cung cấp cần trả lời ngày mai. Em xử lý thế nào, và cần anh duyệt gì?" },
      { expects: ["own", "plan", "budget", "agree", "start", "time", "help"], onlyIf: ["budget", "help"],
        alt: "Anh thích sự chủ động của em. Vậy việc nào em tự quyết, việc nào cần anh duyệt?",
        redirect: "Anh muốn em chủ động. Em nói rõ việc nào em tự quyết và việc nào cần anh duyệt." },
      { expects: ["plan", "time", "own", "budget", "help", "start"],
        redirect: "Anh cần bản kế hoạch: phân chia việc, các mốc và điểm cần anh quyết định." }
    ],
    [ // 2 — Bị quy trách nhiệm
      { expects: null, redirect: "Anh hỏi em về bản demo có số liệu sai. Em trình bày sự việc từ phía em, bằng dữ kiện nhé." },
      { expects: ["cause", "plan", "own", "time", "reason"], onlyIf: ["blame", "decline", "reason"], topic: ["cause"],
        alt: "Anh ghi nhận cách em trình bày. Anh cần biết vì sao việc này xảy ra: từ lúc em nhận dữ liệu đến lúc file lên demo, có những bước kiểm tra nào?",
        covered: "Em đã mô tả quy trình rồi. Anh cần thêm mốc thời gian: em nhận file lúc nào, cập nhật lúc nào, có ai duyệt không?",
        redirect: "Anh cần hiểu quy trình: em nhận dữ liệu, cập nhật và kiểm tra vào lúc nào?" },
      { expects: ["own", "cause", "fix", "plan", "reason", "time"], onlyIf: ["blame", "decline"],
        alt: "Đúng là file của em được đưa lên bản demo. Em thấy phần trách nhiệm nào thuộc về em, phần nào cần xác minh thêm?",
        redirect: "File của em là file được đưa lên demo. Em nhận phần nào thuộc về mình và phần nào cần xác minh thêm?" },
      { expects: ["fix", "time", "plan", "decline", "message", "own", "cause", "risk"], topic: ["fix"],
        covered: "Em đã nói về việc sửa rồi. Vậy cụ thể mất bao lâu, và khi nào em xác nhận lại với anh?",
        redirect: "Anh hỏi em có sửa được trong 30 phút không. Em đánh giá khả thi và nói em sẽ báo anh lúc nào." },
      { expects: ["message", "plan", "time", "own", "risk", "cause"], topic: ["message"],
        covered: "Em đã nhắc tới việc báo cho khách. Nội dung em đề xuất nói gì, và gửi khi nào?",
        redirect: "Khách đang chờ. Em đề xuất có nên báo cho khách không, nói những gì và vào lúc nào?" },
      { expects: ["cause", "own", "plan", "time", "message"],
        redirect: "Một đồng nghiệp nói em đã nhận file mới từ hôm qua. Em kiểm tra thế nào để xác minh, và em phản hồi ra sao?" },
      { expects: ["prevent", "plan", "own", "cause", "start"], topic: ["prevent"],
        covered: "Em đã nhắc tới cách phòng ngừa. Em chọn ra hai biện pháp quan trọng nhất và người chịu trách nhiệm cho từng cái nhé?",
        redirect: "Anh hỏi em đề xuất gì để không lặp lại, ví dụ checklist, người duyệt hay quản lý phiên bản." },
      { expects: ["cause", "fix", "prevent", "plan", "time", "own", "message"],
        redirect: "Anh cần bản tóm tắt: sự việc, dữ kiện, cách khắc phục, phòng ngừa và thời hạn." }
    ]
  ];

  /* ------------------------- PHÂN TÍCH CÂU TRẢ LỜI ------------------------- */
  function detect(raw) {
    const f = fold(raw), strong = new Set(), weak = new Set();
    for (const [k, t] of Object.entries(TAGS)) {
      if (t.s.test(f)) strong.add(k); else if (t.w && t.w.test(f)) weak.add(k);
    }
    return { f, strong, weak };
  }

  function looksGibberish(f) {
    if (!/[a-z]/.test(f)) return true;                        // chỉ số/ký hiệu
    if (/(.)\1{3,}/.test(f)) return true;                     // aaaa, hhhhh
    const words = f.replace(/[?:%]/g, " ").split(" ").filter(Boolean);
    if (!words.length) return true;
    if (words.every(w => w.length <= 1)) return true;
    return words.some(w => /[^aeiouy0-9]{5,}/.test(w));       // bàn phím gõ bừa: "asdfgh"
  }

  function faqFor(si, f) {
    const hit = FAQ[si].find(([re]) => re.test(f));
    return hit ? hit[1] : null;
  }

  /** Trả về { kind, strong, weak, tags, words, faq, isQ } */
  function analyze(raw, si, ti) {
    const d = detect(raw), words = d.f.replace(/\?/g, " ").split(" ").filter(Boolean).length;
    const entry = (FLOW[si] && FLOW[si][ti]) || {};
    const out = { ...d, words, tags: new Set([...d.strong, ...d.weak]) };
    out.isQ = /\?/.test(raw) || /\b(cho em hoi|em xin hoi|em muon hoi|em hoi)\b/.test(d.f);
    out.faq = out.isQ ? faqFor(si, d.f) : null;

    const lower = raw.toLowerCase().normalize("NFC");
    if (typeof hostilePatterns !== "undefined" && hostilePatterns.some(p => p.test(lower))) return { ...out, kind: "hostile" };
    if (looksGibberish(d.f)) return { ...out, kind: "unclear" };

    const domain = DOMAIN[si].test(d.f);
    const weakAgree = d.weak.has("agree") || d.weak.has("decline");
    const onTopic = d.strong.size > 0 || domain || d.weak.size >= 2 || (weakAgree && words <= 4);
    const answerTags = ["agree", "decline", "plan", "own", "reason", "cut", "risk"];
    const questionOnly = out.isQ && !answerTags.some(t => d.strong.has(t)) && words <= 20;

    if (questionOnly && (out.faq || onTopic)) return { ...out, kind: "question" };
    if (!onTopic) return { ...out, kind: "offtopic" };
    if (words < 4) return { ...out, kind: "thin" };

    const intents = [...d.strong];
    if (entry.expects && intents.length && !intents.some(t => entry.expects.includes(t))) return { ...out, kind: "mismatch" };
    return { ...out, kind: "ok" };
  }

  /* --------------------------- TRẠNG THÁI PHỤ --------------------------- */
  let mem, runId = 0;
  function resetMem(scenarioIdx) {
    mem = { clarify: 0, mismatch: 0, asked: 0, pick: 0, lastScore: 0, question: scenarios[scenarioIdx].intro };
    runId++;
  }
  const pick = arr => arr[(mem.pick++) % arr.length];

  function buildNext(si, idx, tags, score) {
    const base = scenarios[si].turns[idx].boss, e = (FLOW[si] && FLOW[si][idx]) || {};
    let text = base, tailored = false;
    if (tags) {
      if (e.onlyIf && e.alt && !e.onlyIf.some(t => tags.has(t))) { text = e.alt; tailored = true; }
      else if (e.topic && e.covered && e.topic.some(t => tags.has(t))) { text = e.covered; tailored = true; }
    }
    if (!tailored && score < 0) text = stripPraise(text); // đừng khen "Tốt." ngay sau câu trả lời tệ
    return { text, tailored };
  }
  function stripPraise(t) {
    const m = t.replace(/^(Tốt|Được)[.,]\s*(Nhưng\s+)?/, "");
    return m === t ? t : m.charAt(0).toUpperCase() + m.slice(1);
  }
  function ackFor(score, tags) {
    if (tags && tags.has("decline")) return "Anh hiểu là em đang gặp khó khăn.";
    if (score < 0) return "Anh chưa thấy rõ hướng xử lý của em lắm.";
    if (score === 10 && state.round % 2 === 0) return "Cách xử lý này của em anh thấy hợp lý.";
    return null;
  }

  /* ----------------------------- RA QUYẾT ĐỊNH ----------------------------- */
  function advance(score, feedback, tags, o = {}) {
    const si = state.scenario, ni = state.round + 1, last = ni >= scenarios[si].turns.length;
    const lines = [];
    if (!last) {
      const next = buildNext(si, ni, o.noTailor ? null : tags, score);
      if (o.faq) lines.push(o.faq);
      if (o.ack) lines.push(o.ack);
      if (o.hostile) lines.push(pick(POOL.hostile));
      if (o.skip) lines.push(pick(POOL.skip));
      if (!o.faq && !o.ack && !o.hostile && !o.skip && !next.tailored) { const a = ackFor(score, tags); if (a) lines.push(a); }
      lines.push(next.text);
      mem.question = next.text;
    }
    mem.lastScore = score;
    return { kind: "advance", score, feedback, lines };
  }

  function clarify(lines, feedback, label, score = null) {
    return { kind: "clarify", lines, feedback, label, score };
  }

  function skipTurn(why) {
    return advance(-5, why, null, { skip: true, noTailor: true });
  }

  function decideLocal(raw) {
    const si = state.scenario, ti = state.round, a = analyze(raw, si, ti);
    const e = (FLOW[si] && FLOW[si][ti]) || {}, hint = scenarios[si].turns[ti].hint;

    if (a.kind === "hostile") {
      const r = scoreReply(raw);
      return advance(r.score, r.feedback, null, { hostile: true, noTailor: true });
    }

    if (a.kind === "question") {
      if (mem.asked < CONFIG.maxQuestions) {
        mem.asked++;
        const first = mem.asked === 1;
        if (a.faq) return clarify([a.faq, pick(POOL.reask)],
          "Câu hỏi làm rõ rất tốt — hỏi lại sếp để nắm thông tin là kỹ năng quan trọng." + (first ? "" : " Nhưng đừng hỏi mãi, hãy đề xuất."),
          "Hỏi làm rõ", first ? 5 : 0);
        return clarify([pick(POOL.noFaq), pick(POOL.reask)],
          "Sếp không có thêm thông tin về câu này. Hãy dựa vào dữ kiện đã có để đề xuất.", "Chưa tính điểm", 0);
      }
      // đã hỏi quá nhiều → coi như câu trả lời thường
    }

    if (["unclear", "offtopic", "thin"].includes(a.kind) || (a.kind === "question" && !a.faq)) {
      if (mem.clarify < CONFIG.maxClarify) {
        mem.clarify++;
        const kind = a.kind === "question" ? "offtopic" : a.kind;
        const lines = mem.clarify === 1 ? [pick(POOL[kind]), e.redirect] : ["Anh nhắc lại lần nữa nhé: " + e.redirect.charAt(0).toLowerCase() + e.redirect.slice(1)];
        const left = CONFIG.maxClarify - mem.clarify;
        return clarify(lines,
          (kind === "thin" ? "Câu trả lời quá ngắn nên chưa được tính điểm." : "Câu trả lời chưa liên quan đến câu hỏi của sếp nên chưa được tính điểm.") +
          (left > 0 ? ` Bạn còn ${left} lần trả lời lại. ` : " Đây là cơ hội cuối. ") + "Gợi ý: " + hint,
          "Chưa tính điểm");
      }
      return skipTurn("Sau " + CONFIG.maxClarify + " lần sếp nhắc, câu trả lời vẫn chưa đi vào vấn đề nên bị trừ điểm. Hãy đọc kỹ câu hỏi và trả lời đúng trọng tâm.");
    }

    if (a.kind === "mismatch" && mem.mismatch < CONFIG.maxMismatch) {
      mem.mismatch++;
      return clarify([pick(POOL.mismatch), e.redirect],
        "Câu trả lời có ý hay nhưng chưa đúng câu sếp đang hỏi nên chưa được tính điểm. Gợi ý: " + hint, "Chưa tính điểm");
    }

    // Trả lời hợp lệ → chấm bằng scoreReply() gốc, nối mạch câu sếp tiếp theo.
    const r = scoreReply(raw);
    return advance(r.score, r.feedback, a.tags, { faq: a.isQ ? a.faq : null });
  }

  /* ------------------------------- AI (tuỳ chọn) ------------------------------- */
  function recentHistory() {
    return [...messages.querySelectorAll(".message-row")].slice(-8).map(r => ({
      role: r.classList.contains("user") ? "player" : "boss",
      text: (r.querySelector(".bubble") || {}).textContent || ""
    }));
  }

  async function askAI(raw) {
    const s = current(), turn = s.turns[state.round];
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), CONFIG.ai.timeoutMs);
    try {
      const res = await fetch(CONFIG.ai.endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: ctl.signal,
        body: JSON.stringify({
          scenario: s.title, round: state.round + 1, bossQuestion: mem.question,
          goal: turn.hint, reply: raw, history: recentHistory()
        })
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } finally { clearTimeout(timer); }
  }

  // ai = { relevance: ok|question|mismatch|offtopic|unclear, score, feedback, ack, redirect, answer }
  function decideAI(raw, ai) {
    const si = state.scenario, ti = state.round, e = (FLOW[si] && FLOW[si][ti]) || {}, hint = scenarios[si].turns[ti].hint;
    const local = analyze(raw, si, ti);
    const rel = String(ai.relevance || "ok");
    if (local.kind === "hostile") return decideLocal(raw);
    const text = v => (typeof v === "string" && v.trim() ? v.trim().slice(0, 300) : "");

    if (rel === "question" && text(ai.answer) && mem.asked < CONFIG.maxQuestions) {
      mem.asked++;
      return clarify([text(ai.answer), pick(POOL.reask)], text(ai.feedback) || "Câu hỏi làm rõ tốt.", "Hỏi làm rõ", mem.asked === 1 ? 5 : 0);
    }
    if (["offtopic", "unclear"].includes(rel)) {
      if (mem.clarify < CONFIG.maxClarify) {
        mem.clarify++;
        return clarify([text(ai.redirect) || e.redirect], (text(ai.feedback) || "Câu trả lời chưa liên quan nên chưa được tính điểm.") + " Gợi ý: " + hint, "Chưa tính điểm");
      }
      return skipTurn("Sau " + CONFIG.maxClarify + " lần sếp nhắc, câu trả lời vẫn chưa đi vào vấn đề nên bị trừ điểm.");
    }
    if (rel === "mismatch" && mem.mismatch < CONFIG.maxMismatch) {
      mem.mismatch++;
      return clarify([text(ai.redirect) || e.redirect], (text(ai.feedback) || "Câu trả lời chưa đúng câu sếp hỏi nên chưa được tính điểm.") + " Gợi ý: " + hint, "Chưa tính điểm");
    }
    const score = [10, 5, -5].includes(Number(ai.score)) ? Number(ai.score) : scoreReply(raw).score;
    return advance(score, text(ai.feedback) || scoreReply(raw).feedback, local.tags, { ack: text(ai.ack) || null });
  }

  async function decide(raw) {
    if (CONFIG.ai.enabled) {
      try { return decideAI(raw, await askAI(raw)); }
      catch (err) {
        console.warn("[fallback] AI không phản hồi, dùng bộ luật offline:", err);
        const d = decideLocal(raw);
        d.feedback = (d.feedback || "") + " (AI không phản hồi — đang dùng bộ chấm offline.)";
        return d;
      }
    }
    return decideLocal(raw);
  }

  /* ----------------------------- HIỂN THỊ ----------------------------- */
  function lockUI(on) {
    state.busy = on; input.disabled = on; form.querySelector(".send-btn").disabled = on;
  }
  function addChip(score, label) {
    const rows = messages.querySelectorAll(".message-row.user"), last = rows[rows.length - 1];
    if (!last) return;
    const chip = document.createElement("div");
    chip.className = "score-chip " + (score == null || score === 0 ? "mid" : score > 0 ? (score === 10 ? "pos" : "mid") : "neg");
    chip.textContent = label || ((score > 0 ? "+" : "") + score + " điểm");
    last.querySelector(".bubble-wrap").appendChild(chip);
  }
  function showNeutral(label, feedback) {
    $("liveScoreValue").textContent = "…";
    $("liveScoreLabel").textContent = label;
    scorePanel.className = "live-score neutral show";
    $("feedbackText").textContent = feedback;
    setTimeout(() => scorePanel.classList.remove("show"), 3000);
  }
  function sayLines(lines, token, done) {
    let i = 0;
    (function step() {
      if (token !== runId) return;
      if (i >= lines.length) { done && done(); return; }
      const txt = lines[i++];
      $("typing").hidden = false; scrollBottom();
      setTimeout(() => {
        if (token !== runId) return;
        $("typing").hidden = true; addMessage(txt, "boss"); step();
      }, i === 1 ? 300 : 450 + Math.min(txt.length * 8, 700));
    })();
  }

  function apply(d, token) {
    if (token !== runId) return;
    const s = current();
    if (d.kind === "clarify") {
      if (d.score != null) { state.total += d.score; state.scenarioScores[state.scenario] += d.score; updateTotal(); }
      if (d.score) { addChip(d.score, d.label === "Hỏi làm rõ" ? "+5 điểm · hỏi làm rõ" : null); showScore(d.score, d.feedback); }
      else { addChip(null, "Chưa tính điểm"); showNeutral(d.label || "Chưa tính điểm", d.feedback); }
      sayLines(d.lines, token, () => {
        lockUI(false); input.placeholder = "Trả lời lại sếp..."; input.focus();
      });
      return;
    }
    // advance
    state.total += d.score; state.scenarioScores[state.scenario] += d.score;
    addChip(d.score); showScore(d.score, d.feedback);
    state.round++; updateTotal();
    if (state.round >= s.turns.length) { lockUI(false); finishScenario(); return; }
    resetTurnCounters();
    sayLines(d.lines, token, () => {
      lockUI(false); $("roundNum").textContent = state.round + 1;
      input.value = ""; input.placeholder = "Màn " + (state.round + 1) + ": trả lời sếp..."; input.focus();
    });
  }
  function resetTurnCounters() { mem.clarify = 0; mem.mismatch = 0; mem.asked = 0; }

  /* --------------------- GHI ĐÈ HÀM TRONG script.js --------------------- */
  const originalRender = window.renderScenario;
  window.renderScenario = function () {
    resetMem(state.scenario);
    originalRender();
  };

  window.sendReply = function (text) {
    text = (text || "").trim();
    if (state.busy || !text) return;
    const token = runId;
    lockUI(true);
    addMessage(text, "user");
    input.value = "";
    $("typing").hidden = false; scrollBottom();
    const started = Date.now();
    decide(text).then(d => {
      const wait = Math.max(0, 650 - (Date.now() - started));
      setTimeout(() => apply(d, token), wait);
    });
  };

  resetMem(state.scenario);
  window.SmartChat = { CONFIG, FLOW, FAQ, POOL, analyze, fold }; // tiện kiểm thử trong console
})();
