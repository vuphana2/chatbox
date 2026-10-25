const scenarios = [
  {
    title: "Deadline bất khả thi",
    desc: "Sếp yêu cầu hoàn thành báo cáo trong thời gian quá ngắn.",
    intro: "Minh ơi, anh cần em hoàn thành báo cáo phân tích doanh số của quý trong hôm nay, trước 16:00. Anh biết bình thường mất hai ngày, nhưng lần này ban giám đốc đang đợi.",
    turns: [
      {boss:"Anh cần báo cáo phân tích doanh số quý trước 16:00 hôm nay. Bình thường mất hai ngày, nhưng ban giám đốc đang đợi.", context:"Hãy phản hồi trước yêu cầu gấp.", hint:"Thể hiện tinh thần hợp tác, đồng thời làm rõ phạm vi và thời gian."},
      {boss:"Anh cần đủ số liệu theo khu vực, biểu đồ xu hướng và phần nhận định nguyên nhân. Em làm được chứ?", hint:"Xác nhận những phần có thể làm và hỏi rõ phần ưu tiên."},
      {boss:"Anh không muốn nghe lý do. Việc này quan trọng, em cố gắng xử lý đi.", hint:"Giữ bình tĩnh, tránh tranh cãi; đưa dữ kiện về thời gian và đề xuất."},
      {boss:"Nếu không đủ thời gian thì em định bỏ phần nào?", hint:"Đưa ra lựa chọn cụ thể và nói rõ ảnh hưởng của từng lựa chọn."},
      {boss:"Anh có thể nhờ một người hỗ trợ, nhưng em phải nói rõ cần hỗ trợ gì.", hint:"Yêu cầu hỗ trợ cụ thể, có thể chia việc theo đầu mục."},
      {boss:"Được. Nhưng anh cần bản xem trước lúc 15:00 để kiểm tra.", hint:"Nhắc lại mốc thời gian và phạm vi bàn giao."},
      {boss:"Nếu đến 15:00 vẫn thiếu vài số liệu từ phòng kinh doanh thì sao?", hint:"Báo sớm rủi ro, nêu phương án dự phòng và cách ghi chú dữ liệu thiếu."},
      {boss:"Tốt. Em nhắn lại kế hoạch cuối cùng để anh xác nhận nhé.", hint:"Tóm tắt nhiệm vụ, ưu tiên, người hỗ trợ và các mốc thời gian."}
    ]
  },
  {
    title: "Việc ngoài chuyên môn",
    desc: "Sếp giao thêm việc sự kiện khi bạn đang quá tải và chưa có kinh nghiệm.",
    intro: "Anh muốn em phụ trách luôn buổi hội thảo khách hàng tuần sau: liên hệ nhà cung cấp, chốt địa điểm, làm nội dung và điều phối hôm diễn ra. Em nhận nhé?",
    turns: [
      {boss:"Anh muốn em phụ trách hội thảo khách hàng tuần sau: nhà cung cấp, địa điểm, nội dung và điều phối. Em nhận nhé?", hint:"Đừng từ chối ngay; làm rõ kỳ vọng, năng lực và phạm vi."},
      {boss:"Anh chọn em vì em cẩn thận. Nhưng anh vẫn cần em hoàn thành báo cáo thường kỳ.", hint:"Nêu khối lượng công việc hiện tại bằng dữ kiện và hỏi về ưu tiên."},
      {boss:"Vậy em đang nói là không làm được à?", hint:"Khẳng định tinh thần hợp tác, nhưng tránh nhận lời vô điều kiện."},
      {boss:"Nếu giao em việc này thì báo cáo thường kỳ có thể lùi một ngày. Em thấy sao?", hint:"Xác nhận quyết định ưu tiên và tác động cần được thống nhất."},
      {boss:"Em chưa từng tổ chức sự kiện. Em sẽ bắt đầu từ đâu?", hint:"Đề xuất kế hoạch bước đầu và xin tài liệu hoặc người hướng dẫn."},
      {boss:"Ngân sách chưa chốt, mà nhà cung cấp cần câu trả lời ngày mai.", hint:"Làm rõ quyền quyết định ngân sách và xin mốc/phương án phê duyệt."},
      {boss:"Anh muốn em tự chủ, đừng việc gì cũng chờ anh.", hint:"Thể hiện chủ động nhưng thống nhất các điểm cần xin duyệt."},
      {boss:"Được, gửi anh kế hoạch phân chia việc và các mốc cần quyết định.", hint:"Tóm tắt kế hoạch, trách nhiệm, nguồn lực và điểm cần sếp phê duyệt."}
    ]
  },
  {
    title: "Bị quy trách nhiệm",
    desc: "Một lỗi trong dự án bị đổ dồn cho bạn dù nguyên nhân chưa rõ.",
    intro: "Khách hàng vừa phản ánh bản demo có số liệu sai. Anh nghe nói em là người cập nhật dữ liệu cuối cùng. Em giải thích chuyện này thế nào?",
    turns: [
      {boss:"Khách hàng phản ánh bản demo có số liệu sai. Anh nghe nói em cập nhật dữ liệu cuối cùng. Em giải thích thế nào?", hint:"Không phản ứng phòng thủ; mô tả sự việc bằng dữ kiện và đề nghị kiểm tra."},
      {boss:"Anh không cần đổ lỗi cho ai, anh cần biết tại sao việc này xảy ra.", hint:"Tập trung vào quy trình, thời điểm, nguồn dữ liệu và bước kiểm tra."},
      {boss:"Nhưng file của em là file được đưa lên bản demo.", hint:"Thừa nhận phần trách nhiệm thuộc phạm vi mình, không nhận lỗi chưa được xác minh."},
      {boss:"Em có thể sửa ngay trong 30 phút không?", hint:"Đánh giá tính khả thi, xác nhận mức độ ưu tiên và cách thông báo."},
      {boss:"Khách hàng đang chờ. Có cần nói với họ là đội mình mắc lỗi không?", hint:"Trung thực, không suy đoán nguyên nhân; thống nhất thông điệp và thời điểm cập nhật."},
      {boss:"Một đồng nghiệp nói em đã nhận được file dữ liệu mới từ hôm qua.", hint:"Xác minh bằng lịch sử file/tin nhắn, tránh công kích đồng nghiệp."},
      {boss:"Anh muốn sau vụ này không lặp lại nữa. Em đề xuất gì?", hint:"Đưa giải pháp phòng ngừa như checklist, người duyệt và quản lý phiên bản."},
      {boss:"Tốt. Em gửi anh bản tóm tắt nguyên nhân, cách khắc phục và phòng ngừa nhé.", hint:"Tóm tắt theo cấu trúc: sự việc, dữ kiện, hành động, phòng ngừa, thời hạn."}
    ]
  }
];

const state = {scenario:0, round:0, total:0, scenarioScores:[0,0,0], finished:[false,false,false], busy:false};
const $ = id => document.getElementById(id);
const messages = $("messages"), input = $("replyInput"), form = $("replyForm");
const scorePanel = $("liveScore");
let typingTimer;

function safeText(text){return String(text).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function current(){return scenarios[state.scenario];}
function addMessage(text, who, score=null){
  const row=document.createElement("div");
  row.className=`message-row ${who}`;
  const avatar=who==="boss"?'<div class="mini-avatar">S</div>':'';
  let chip='';
  if(score!==null){
    const cls=score>0?(score===10?'pos':'mid'):'neg';
    chip=`<div class="score-chip ${cls}">${score>0?'+':''}${score} điểm</div>`;
  }
  row.innerHTML=`${avatar}<div class="bubble-wrap">${who==="boss"?'<div class="sender-name">Trưởng phòng Minh</div>':''}<div class="bubble ${who==="boss"?'boss-bubble':'user-bubble'}">${safeText(text)}</div>${chip}<div class="message-time">${new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</div></div>`;
  messages.appendChild(row); scrollBottom();
}
function scrollBottom(){const sc=$("chatScroll");sc.scrollTop=sc.scrollHeight;}
function setScenarioButtons(){document.querySelectorAll(".scenario").forEach((b,i)=>{b.classList.toggle("active",i===state.scenario);b.querySelector(".status-dot").style.background=state.finished[i]?"#20b77a":(i===state.scenario?"var(--blue)":"#d6dce5");});}
function renderScenario(){
  const s=current();state.round=0;state.busy=false;
  $("scenarioEyebrow").textContent=`TÌNH HUỐNG ${state.scenario+1} / ${scenarios.length}`;
  $("scenarioTitle").textContent=s.title;$("scenarioDesc").textContent=s.desc;
  messages.innerHTML="";addMessage(s.intro,"boss");
  $("roundNum").textContent="1";$("progressText").textContent="0/8";$("progressBar").style.width="0%";
  input.disabled=false;input.value="";input.placeholder="Nhập câu trả lời của bạn...";form.querySelector(".send-btn").disabled=false;
  $("feedbackText").textContent="Hãy trả lời theo cách bạn sẽ giao tiếp với sếp trong thực tế.";
  $("liveScoreValue").textContent="—";$("liveScoreLabel").textContent="Chờ câu trả lời của bạn";scorePanel.className="live-score";
  updateTotal();setScenarioButtons();scrollBottom();input.focus();
}
function updateTotal(){
  $("totalScore").textContent=state.total>0?`+${state.total}`:state.total;
  const max=scenarios[state.scenario].turns.length;
  $("progressBar").style.width=`${state.round/max*100}%`;
  $("progressText").textContent=`${state.round}/${max}`;
  $("roundNum").textContent=Math.min(state.round+1,max);
}
// Chấm theo cấu trúc và ngữ cảnh câu trả lời, không phạt từ phủ định một cách máy móc.
// Đây vẫn là bộ luật heuristic; muốn hiểu ngữ nghĩa linh hoạt cần dùng AI qua backend an toàn.
const hostilePatterns = [
  /(?:^|[^A-Za-zÃ-á»¹])(kệ|mặc kệ|im đi|ngu|đồ ngu|vô dụng)(?![A-Za-zÃ-á»¹])/i,
  /(?:^|[^A-Za-zÃ-á»¹])(sếp|anh|chị)\s+(tự làm|tự xử lý|tự lo)(?![A-Za-zÃ-á»¹])/i,
  /(?:^|[^A-Za-zÃ-á»¹])(em|tôi)\s+(chả|đéo)\s+(quan tâm|làm|giúp)(?![A-Za-zÃ-á»¹])/i,
  /(?:^|[^A-Za-zÃ-á»¹])(lỗi hoàn toàn là của|tại sếp|tại anh|tại chị)(?![A-Za-zÃ-á»¹])/i
];
const constructiveNegation = [
  /(?:^|[^A-Za-zÃ-á»¹])(không|chưa|khó)\s+(thể|kịp|đủ|hoàn thành|đảm bảo|cam kết)(?![A-Za-zÃ-á»¹])/i,
  /(?:^|[^A-Za-zÃ-á»¹])(em|tôi)\s+(không|chưa)\s+(thể|kịp|đủ)(?![A-Za-zÃ-á»¹])/i,
  /(?:^|[^A-Za-zÃ-á»¹])(tuy nhiên|nhưng|thay vào đó|đổi lại|vì vậy|do đó)(?![A-Za-zÃ-á»¹])/i,
  /(?:^|[^A-Za-zÃ-á»¹])(nếu ưu tiên|nếu cần|để kịp|em có thể|tôi có thể)(?![A-Za-zÃ-á»¹])/i
];
const politenessPatterns = [
  /(?:^|[^A-Za-zÃ-á»¹])(dạ|vâng|cảm ơn|xin phép|mong anh|mong chị|em hiểu|em ghi nhận|anh ơi|chị ơi)(?![A-Za-zÃ-á»¹])/i
];
const actionPatterns = [
  /(?:^|[^A-Za-zÃ-á»¹])(đề xuất|phương án|kế hoạch|ưu tiên|chia nhỏ|hỗ trợ|phối hợp|kiểm tra|xác minh|cập nhật|báo lại|tóm tắt|bàn giao|thống nhất|phòng ngừa|khắc phục|đối chiếu|phân công|dự kiến)(?![A-Za-zÃ-á»¹])/i
];
const clarityPatterns = [
  /(?:^|[^A-Za-zÃ-á»¹])(làm rõ|xác nhận|cụ thể|phạm vi|mốc thời gian|thời hạn|trước \d|lúc \d|ngân sách|nguồn lực|dữ liệu|nguyên nhân|đầu mục|ưu tiên)(?![A-Za-zÃ-á»¹])/i
];
const ownershipPatterns = [
  /(?:^|[^A-Za-zÃ-á»¹])(em sẽ|tôi sẽ|em có thể|tôi có thể|em phụ trách|tôi phụ trách|em chịu trách nhiệm|tôi chịu trách nhiệm|em kiểm tra|tôi kiểm tra)(?![A-Za-zÃ-á»¹])/i
];
const vagueOrFlatPatterns = [
  /^(không|không được|không làm|không biết|tùy|được|ok|ừ|biết rồi|không nhé)[.! ]*$/i,
  /(?:^|[^A-Za-zÃ-á»¹])(không phải việc của em|không liên quan đến em|em không quan tâm|tự xử lý đi)(?![A-Za-zÃ-á»¹])/i
];

function scoreReply(raw){
  const t = raw.toLowerCase().normalize("NFC").replace(/\s+/g," ").trim();
  const words = t.split(/\s+/).filter(Boolean).length;

  // Lời lẽ công kích rõ ràng là dấu hiệu tiêu cực mạnh.
  if (hostilePatterns.some(p => p.test(t))) {
    return {
      score: -5,
      feedback: "Câu trả lời có dấu hiệu công kích hoặc đẩy trách nhiệm. Hãy mô tả vấn đề bằng dữ kiện, nói rõ phần mình có thể xử lý và đề xuất bước tiếp theo."
    };
  }

  // Câu quá ngắn hoặc từ chối cụt lủn không có phương án thay thế.
  if (words < 4 || vagueOrFlatPatterns.some(p => p.test(t))) {
    return {
      score: -5,
      feedback: "Phản hồi còn quá ngắn hoặc từ chối cụt lủn. Hãy giải thích ngắn gọn lý do, giữ thái độ tôn trọng và đưa ra một lựa chọn khả thi."
    };
  }

  const polite = politenessPatterns.some(p => p.test(t));
  const action = actionPatterns.some(p => p.test(t));
  const clear = clarityPatterns.some(p => p.test(t));
  const ownership = ownershipPatterns.some(p => p.test(t));
  const hasConstructiveNegation = constructiveNegation.some(p => p.test(t));
  const hasAlternative = /(?:^|[^A-Za-zÃ-á»¹])(nhưng|tuy nhiên|thay vào đó|em có thể|tôi có thể|đề xuất|phương án|nếu.*thì|đổi lại)(?![A-Za-zÃ-á»¹])/i.test(t);
  const hasReason = /(?:^|[^A-Za-zÃ-á»¹])(vì|do|bởi vì|hiện tại|đang|mất khoảng|cần thêm|thiếu|chưa có|để đảm bảo)(?![A-Za-zÃ-á»¹])/i.test(t);
  const hasSpecificity = /(?:^|[^A-Za-zÃ-á»¹])(\d+\s*(phút|tiếng|giờ|ngày|buổi)|trước \d{1,2}(:\d{2})?|lúc \d{1,2}(:\d{2})?|sáng mai|chiều nay|ngày mai|đầu tiên|phần còn lại|bản nháp|bản xem trước)(?![A-Za-zÃ-á»¹])/i.test(t);
  const negatedAgreement = /(?:^|[^A-Za-zÃ-á»¹])(đồng ý|được|nhận)(?![A-Za-zÃ-á»¹]).{0,35}(?:^|[^A-Za-zÃ-á»¹])(nhưng|mà)(?![A-Za-zÃ-á»¹]).{0,25}(?:^|[^A-Za-zÃ-á»¹])(không làm|không thực hiện|mặc kệ|không quan tâm)(?![A-Za-zÃ-á»¹])/i.test(t);

  if (negatedAgreement) {
    return {
      score: -5,
      feedback: "Câu trả lời nói đồng ý nhưng phần sau lại phủ nhận trách nhiệm, khiến thông điệp mâu thuẫn. Hãy nói rõ bạn nhận phần nào, không thể làm phần nào và đề xuất phương án thay thế."
    };
  }

  // Phủ định có phương án thay thế là thương lượng có trách nhiệm, không phải tiêu cực.
  if (hasConstructiveNegation && hasAlternative && (action || clear || hasSpecificity) && (polite || ownership || hasReason)) {
    return {
      score: 10,
      feedback: "Bạn đã nêu giới hạn nhưng vẫn thể hiện tinh thần hợp tác bằng phương án thay thế. Đây là cách từ chối mang tính xây dựng; hãy đảm bảo thời hạn và trách nhiệm được thống nhất rõ."
    };
  }

  // Điểm cao khi kết hợp hành động cụ thể, làm rõ yêu cầu và nhận trách nhiệm.
  const strongSignals = [polite, action, clear, ownership, hasReason, hasSpecificity].filter(Boolean).length;
  if (strongSignals >= 4 && words >= 10) {
    return {
      score: 10,
      feedback: "Phản hồi tốt: có thái độ chuyên nghiệp và cách xử lý cụ thể. Bạn kết hợp được dữ kiện, trách nhiệm và phương án thay vì chỉ đồng ý hoặc từ chối."
    };
  }

  if ((polite && (action || clear || ownership || hasAlternative)) || (action && clear && words >= 8) || (hasReason && hasAlternative && words >= 10)) {
    return {
      score: 5,
      feedback: "Bạn có tinh thần hợp tác và hướng xử lý tương đối rõ. Để đạt hiệu quả hơn, hãy thêm một mốc thời gian, dữ kiện cụ thể hoặc câu xác nhận ưu tiên với sếp."
    };
  }

  if (hasConstructiveNegation || hasReason || ownership || action || clear || polite || words >= 12) {
    return {
      score: 5,
      feedback: "Câu trả lời có một số yếu tố phù hợp nhưng chưa đủ rõ về kế hoạch hoặc kết quả cần bàn giao. Hãy bổ sung phương án cụ thể và thống nhất kỳ vọng."
    };
  }

  return {
    score: -5,
    feedback: "Câu trả lời chưa cho thấy rõ sự hợp tác hoặc hướng giải quyết. Hãy phản hồi bình tĩnh, nêu dữ kiện và đưa ra bước tiếp theo có thể thực hiện."
  };
}
function showScore(score,feedback){
  $("liveScoreValue").textContent=score>0?`+${score}`:`${score}`;
  $("liveScoreLabel").textContent=score===10?"Phản hồi hiệu quả!":score===5?"Có tinh thần hợp tác":"Cần điều chỉnh cách phản hồi";
  scorePanel.className=`live-score ${score>0?(score===10?'positive':'neutral'):'negative'} show`;
  $("feedbackText").textContent=feedback;
  setTimeout(()=>scorePanel.classList.remove("show"),3000);
}
function sendReply(text){
  if(state.busy||!text.trim())return;
  const s=current(), turn=s.turns[state.round];state.busy=true;input.disabled=true;form.querySelector(".send-btn").disabled=true;
  addMessage(text.trim(),"user");
  const result=scoreReply(text);
  state.total+=result.score;state.scenarioScores[state.scenario]+=result.score;
  $("typing").hidden=false;scrollBottom();
  typingTimer=setTimeout(()=>{
    $("typing").hidden=true;showScore(result.score,result.feedback);
    const userRow=messages.querySelectorAll(".message-row.user");const lastUser=userRow[userRow.length-1];
    const chip=document.createElement("div");chip.className=`score-chip ${result.score>0?(result.score===10?'pos':'mid'):'neg'}`;chip.textContent=`${result.score>0?'+':''}${result.score} điểm`;lastUser.querySelector(".bubble-wrap").appendChild(chip);
    state.round++;updateTotal();state.busy=false;input.disabled=false;form.querySelector(".send-btn").disabled=false;
    if(state.round>=s.turns.length){finishScenario();return;}
    addMessage(s.turns[state.round].boss,"boss");
    $("roundNum").textContent=state.round+1;
    input.value="";input.placeholder="Màn "+(state.round+1)+": trả lời sếp...";
    scrollBottom();input.focus();
  },650);
}
function finishScenario(){
  state.finished[state.scenario]=true;setScenarioButtons();
  input.disabled=true;form.querySelector(".send-btn").disabled=true;
  const score=state.scenarioScores[state.scenario];
  $("resultTitle").textContent=score>=50?"Giao tiếp rất tốt!":score>=20?"Bạn đã xử lý khá ổn!":"Bạn đã hoàn thành tình huống!";
  $("resultSummary").textContent=`Bạn đã hoàn thành 8 lượt đối thoại trong tình huống “${current().title}”. Hãy đọc nhận xét sau mỗi câu để cải thiện cách giao tiếp.`;
  $("resultScore").textContent=score>0?`+${score}`:score;
  $("nextScenarioBtn").textContent=state.scenario<scenarios.length-1?"Tình huống tiếp theo →":"Xem lại tình huống đầu ↻";
  $("resultDialog").showModal();
}
form.addEventListener("submit",e=>{e.preventDefault();sendReply(input.value);});
input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit();}});
document.querySelectorAll(".scenario").forEach((b,i)=>b.addEventListener("click",()=>{
  if(i===state.scenario)return;
  if(state.round>0&&state.round<8&&!state.finished[state.scenario]){
    if(!confirm("Chuyển tình huống sẽ bỏ dở màn hiện tại. Bạn muốn tiếp tục?"))return;
  }
  state.scenario=i;renderScenario();
}));
$("rulesBtn").addEventListener("click",()=>$("rulesDialog").showModal());
$("closeRules").addEventListener("click",()=>$("rulesDialog").close());
$("restartBtn").addEventListener("click",()=>{
  if(confirm("Chơi lại tình huống này? Điểm của tình huống hiện tại sẽ được tính lại.")){
    state.total-=state.scenarioScores[state.scenario];state.scenarioScores[state.scenario]=0;state.finished[state.scenario]=false;renderScenario();
  }
});
$("hintBtn").addEventListener("click",()=>{
  const turn=current().turns[Math.min(state.round,current().turns.length-1)];
  $("feedbackText").textContent="Gợi ý: "+turn.hint;
  $("liveScoreValue").textContent="💡";$("liveScoreLabel").textContent="Gợi ý giao tiếp";scorePanel.className="live-score neutral show";
  input.focus();
});
$("replayBtn").addEventListener("click",()=>{
  $("resultDialog").close();state.total-=state.scenarioScores[state.scenario];state.scenarioScores[state.scenario]=0;state.finished[state.scenario]=false;renderScenario();
});
$("nextScenarioBtn").addEventListener("click",()=>{
  $("resultDialog").close();state.scenario=(state.scenario+1)%scenarios.length;
  if(state.finished[state.scenario]){state.total-=state.scenarioScores[state.scenario];state.scenarioScores[state.scenario]=0;state.finished[state.scenario]=false;}
  renderScenario();
});
renderScenario();
