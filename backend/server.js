require('dotenv').config();
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ✅ JSON 파일 불러오기
const timetable = JSON.parse(fs.readFileSync('./data/timetable.json', 'utf-8'));
const schedule = JSON.parse(fs.readFileSync('./data/schedule.json', 'utf-8'));
const meals = JSON.parse(fs.readFileSync('./data/meals.json', 'utf-8'));

// ✅ 한국 시간 기준 날짜 및 요일 구하기
function getKoreanDate(offset = 0) {
  const now = new Date();
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000 + offset * 24 * 60 * 60 * 1000);
  return koreaTime.toISOString().split('T')[0];
}

function getKoreanDay(offset = 0) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const now = new Date();
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000 + offset * 24 * 60 * 60 * 1000);
  return days[koreaTime.getUTCDay()];
}

// ✅ 오늘/내일/어제 → 날짜로 변환
function replaceDateKeywords(message) {
  return message
    .replace(/오늘/g, getKoreanDate(0))
    .replace(/내일/g, getKoreanDate(1))
    .replace(/어제/g, getKoreanDate(-1));
}

// ✅ 급식 정보 JSON에서 불러오기
function fetchMeal(date) {
  if (meals[date]) {
    return meals[date]
      .replace(/<br\/?>/g, '\n')         // <br/> 제거
      .replace(/\([^)]+\)/g, '')         // (1.2.3) 제거
      .replace(/\s*,\s*/g, '\n')         // 쉼표 → 줄바꿈
      .trim();
  } else {
    return "해당 날짜의 급식 정보가 없습니다.";
  }
}

// ✅ 시스템 프롬프트 생성
function buildSystemPrompt() {
  const todayDate = getKoreanDate(0);
  const todayDay = getKoreanDay(0);
  const todayMeal = fetchMeal(todayDate);

  return `
너는 '대원고등학교'의 정보를 알려주는 AI야.
시간표는 항상 1교시, 2교시, 3교시, 4교시, 5교시, 6교시, 7교시의 형식으로 말해.
'오늘', '내일', '어제'는 날짜와 요일로 자동 변환해.

오늘은 ${todayDate} (${todayDay}요일)야.

반드시 요청된 날짜에 해당되는 답만 해.

[오늘의 급식]
${todayMeal}

[시간표]
${JSON.stringify(timetable, null, 2)}

[학사일정]
${JSON.stringify(schedule, null, 2)}
`.trim();
}

// ✅ API 요청 처리
app.post('/api/ask', async (req, res) => {
  const userInput = req.body.message;
  if (!userInput) {
    return res.status(400).json({ error: '질문 내용이 없습니다.' });
  }

  const replacedMessage = replaceDateKeywords(userInput);

  try {
    const systemPrompt = buildSystemPrompt();

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: replacedMessage }
      ]
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const answer = response.data.choices[0].message.content;
    res.json({ answer });

  } catch (err) {
    console.error("AI 응답 오류:", err.response?.data || err.message);
    res.status(500).json({ error: "AI 응답 생성 중 오류가 발생했습니다." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
