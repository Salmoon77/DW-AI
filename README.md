
# 대원고등학교 정보 제공 AI 서버

이 프로젝트는 **대원고등학교의 급식, 시간표, 학사일정** 정보를 질문하면 응답하는 AI API 서버입니다.  
OpenRouter의 무료 LLM 모델을 사용하여 AI 응답을 생성하며, `meals.json`, `timetable.json`, `schedule.json` 등의 데이터를 기반으로 동작합니다.

---

## 📁 프로젝트 구조

```
project-root/
│
├── data/
│   ├── meals.json           # 날짜별 급식 정보
│   ├── timetable.json       # 요일별 시간표
│   └── schedule.json        # 학사일정 정보
│
├── .env                     # API 키 보관
├── server.js                 # Express 서버
└── README.md
```

---

## ⚙️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. `.env` 파일 생성

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

> 🔐 `OPENROUTER_API_KEY`는 [https://openrouter.ai/](https://openrouter.ai/)에서 발급받을 수 있습니다.

### 3. 서버 실행

```bash
node index.js
```

---

## 🧠 작동 방식

### 입력 예시 (`POST /api/ask`)

```json
{
  "message": "오늘 급식 뭐야?"
}
```

### 처리 흐름

1. 입력 메시지에서 `오늘`, `내일`, `어제`를 실제 날짜로 변환  
2. `meals.json`에서 해당 날짜의 급식 정보를 조회  
3. `timetable.json`과 `schedule.json`을 포함한 시스템 프롬프트 생성  
4. OpenRouter AI 모델에 사용자 메시지와 시스템 프롬프트를 전달  
5. 모델이 생성한 응답을 반환

---

## 📦 API 명세

### `POST /api/ask`

- **요청**
  ```json
  {
    "message": "오늘 시간표 알려줘"
  }
  ```

- **응답**
  ```json
  {
    "answer": "오늘은 2025-05-13 (화요일)입니다. 1교시, 2교시, 3교시, ..."
  }
  ```

---

## 📝 데이터 포맷

### `meals.json`

```json
{
  "2025-05-01": "흑미밥, 맘모스빵, 얼큰어묵국, 두부조림, 깻잎무쌈, 훈제돼지구이, 배추겉절이, 머스타드소스",
  "2025-05-02": "단호박카로틴밥, 마제비빔면, ..."
}
```

### `timetable.json`

```json
{
  "월": ["수학", "영어", "국어", "체육", "과학", "역사", "자율"],
  "화": ["국어", "수학", "영어", ...]
}
```

### `schedule.json`

```json
{
  "2025-05-05": "어린이날",
  "2025-05-15": "중간고사"
}
```

---

## 🧠 사용 모델

- **모델명**: `deepseek/deepseek-chat-v3-0324:free`
- **API**: [https://openrouter.ai/api/v1/chat/completions](https://openrouter.ai/api/v1/chat/completions)
- **요금**: 무료 사용 가능

---

## 🕒 시간 처리

- 시간 기준은 **한국 표준시 (KST)** 기준입니다.
- `"오늘"`, `"내일"`, `"어제"`는 자동으로 날짜 문자열(`YYYY-MM-DD`)로 변환됩니다.

---

## 📌 주의 사항

- 급식 정보는 외부 API 대신 `data/meals.json`에서 로드됩니다.
- 시간표 및 학사일정 정보도 로컬 JSON 파일에서 불러옵니다.
- 반드시 `.env` 파일에 OpenRouter API 키가 설정되어 있어야 합니다.

---

## 🛠 향후 개선 아이디어

- 프론트엔드 챗 UI와 연동
- NEIS Open API 자동 크롤링 및 `meals.json` 업데이트 기능 추가
- 여러 학교 지원을 위한 구조 일반화

---

## 👤 만든이

- 개발자: **[살문]**
- 목적: 대원고등학교용 AI 정보 챗봇 API 구축
