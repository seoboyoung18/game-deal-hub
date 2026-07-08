# 딜모아 (DealMoa)

> 게임 할인 통합 비교 서비스 — 여러 스토어(Steam, Epic, GOG 등)의 할인을 한 곳에서 모아 비교.
>
> _프로젝트명은 가제입니다. 확정 시 교체하세요._

## 소개

게임을 스토어마다 따로 뒤지지 않고, 할인 정보를 한 화면에서 비교합니다. 같은 게임이 어느 스토어에서 제일 싼지 바로 확인할 수 있습니다.

## 주요 기능

- 여러 스토어 할인 **통합 목록** (할인율 / 가격 정렬)
- 스토어 · 가격대 **필터**
- 게임 제목 **검색**
- 게임별 **스토어 가격 비교**
- 주기적 **자동 수집** (실시간 아님 — 하루 몇 회 갱신)

## 기술 스택

| 영역 | 기술 |
|------|------|
| Backend | Java, Spring Boot, MyBatis, PostgreSQL, Flyway |
| Frontend | React |
| Infra | Oracle Cloud Free Tier (백엔드 + DB), Vercel / Netlify (프론트) |
| Data | CheapShark API (+ 향후 Steam / Epic / GOG / itch.io) |

## 아키텍처

수집(쓰기)과 서빙(읽기)을 **DB로 분리**한 구조.

```
외부 소스 → [ @Scheduled 수집 → Normalizer ] → PostgreSQL(캐시) → REST API → Frontend
```

- 외부 API는 **수집 주기에만** 호출, 사용자 요청은 **DB에서만** 응답 (rate limit · 무료 티어 대응).
- 스토어별 **Fetcher 분리**로 장애 격리 — 하나 깨져도 나머지 무중단.
- 자세한 결정 배경: `docs/game-deal-project-overview.md`

## 프로젝트 구조

```
game-deal-hub/
├── backend/                      # Spring Boot
│   └── src/main/
│       ├── java/com/example/deal/
│       │   ├── fetcher/          # 스토어별 수집 (StoreFetcher + CheapSharkFetcher)
│       │   ├── scheduler/        # @Scheduled 수집 잡
│       │   ├── service/          # 정규화 + 저장 로직
│       │   ├── repository/       # MyBatis 매퍼 인터페이스
│       │   ├── controller/       # REST API
│       │   ├── domain/           # 엔티티 (Store, Game, Deal)
│       │   └── dto/              # 요청/응답 DTO
│       └── resources/
│           ├── mapper/           # MyBatis XML
│           ├── db/migration/     # Flyway (V1__init_schema.sql)
│           └── application.yml
├── frontend/                     # React
│   └── src/
├── docs/                         # 프로젝트 문서
│   ├── game-deal-project-overview.md
│   ├── game-deal-spec.md
│   └── figma-design-brief.md
└── README.md
```

## 시작하기

### 요구사항
- JDK 21+
- PostgreSQL 16
- Node.js 18+ (프론트)

### 백엔드
```bash
cd backend
# application.yml (또는 .env) 에 PostgreSQL 접속정보 설정
./gradlew bootRun
```

- **Flyway는 앱 시작 시 자동 실행**됩니다 (`flyway-core` 의존성 존재 시). `V1__init_schema.sql`이 자동으로 스키마를 생성합니다.
- CheapShark는 **API 키가 필요 없습니다**.
- `.env`로 환경변수를 관리한다면, IDE 실행 구성(F5 / `launch.json`)이나 `run.sh`로 실행하세요. 직접 실행하면 환경변수가 누락될 수 있습니다.

### 프론트엔드
```bash
cd frontend
npm install
npm run dev
```

## API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/deals` | 할인 목록 (정렬·필터·페이징) |
| GET | `/api/deals/{dealId}` | 딜 상세 |
| GET | `/api/games/{gameId}` | 게임 상세 + 스토어별 가격 비교 |
| GET | `/api/games/search` | 게임 제목 검색 |
| GET | `/api/stores` | 활성 스토어 목록 |

상세 명세: `docs/game-deal-spec.md`

## 데이터베이스

3 테이블: `stores` / `games` / `deals`. deal 하나 = 게임 × 스토어 × 가격.
ERD · DDL: `docs/game-deal-spec.md`, `V1__init_schema.sql`

## 로드맵

- [ ] Spring Boot 뼈대 + `CheapSharkFetcher`
- [ ] 수집 스케줄러 + MyBatis 매퍼 (store → game → deal upsert)
- [ ] REST API + 프론트 목록 / 가격 비교
- [ ] Steam 직접 연동 (실제 KRW + 리치 메타)
- [ ] (미정) 회원 기능 / 역대 최저가

## 문서

- `docs/game-deal-project-overview.md` — 프로젝트 전체 개요 · 결정 로그
- `docs/game-deal-spec.md` — 요구사항 + ERD + API 명세
- `docs/figma-design-brief.md` — 화면 설계 · Figma 브리프
- `V1__init_schema.sql` — DB 스키마