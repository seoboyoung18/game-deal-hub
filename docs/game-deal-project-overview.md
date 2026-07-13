# 딜모아(DEALMOA) — 프로젝트 전체 개요 · 결정 로그

> 여러 게임 스토어(Steam, Epic, GOG 등)의 할인 정보를 한 곳에 모아 보여주는 웹 서비스.
> 개인 사이드 프로젝트 · **무료 티어 운영 목표** · Spring Boot 3.5 + MyBatis + PostgreSQL 17 + React(Vite).
>
> 이 문서는 프로젝트 전체를 한눈에 보는 허브. 세부는 아래 참고.
> - [`game-deal-spec.md`](./game-deal-spec.md) — 요구사항 + ERD + API 명세
> - [`figma-design-brief.md`](./figma-design-brief.md) — 화면 설계 · 디자인 시스템
> - `backend/src/main/resources/db/migration/V1__init_schema.sql` — DB 스키마(Flyway)

---

## 1. 무엇을 만드나

- **문제**: 게임을 스토어마다 따로 뒤져야 하고, 같은 게임이 어디서 제일 싼지 비교가 번거로움.
- **해결**: 여러 스토어의 할인 정보를 주기적으로 수집·정규화해서, 통합 목록 + 게임별 스토어 가격 비교 제공.
- **핵심 기능**: 통합 할인 목록 / 할인율·가격 정렬 / 스토어·가격 필터 / 게임 검색 / **스토어별 가격 비교**.
- **실현 가능성**: 유사 서비스(IsThereAnyDeal, SteamDB, CheapShark) 존재로 검증됨. 진짜 어려운 "같은 게임 매칭"은 집계 API(CheapShark)로 우회.

---

## 2. 데이터 소스 전략

### 뼈대: CheapShark (MVP의 핵심)

- 무료, **API 키 불필요**.
- Steam·GMG·GOG·Humble·Fanatical·Epic 등 **약 20개 PC 스토어를 이미 집계**해 JSON 제공.
- **가장 큰 이점**: `gameID`로 같은 게임을 스토어 넘어 묶어줌 → "게임 매칭/중복제거" 지옥을 건너뜀. 가격 비교가 사실상 공짜.
- 주의사항(실측 반영):
  - **USD 전용**.
  - 응답의 `isActive`로 문 닫은 스토어를 걸러야 함.
  - 가격·할인율·판매여부는 **문자열**(`"7.49"`), 시간은 **epoch 정수**로 옴 → 수집 단계에서 변환 필수.
  - **서술적 `User-Agent` 헤더를 요구**(없으면 요청 거부). 현재 `DealMoa/1.0 (연락처)` 로 전송.

주요 엔드포인트: `/stores`(스토어 목록), `/deals`(할인 목록, 메인), `/games?id=`(역대 최저가, 향후).

### 직접 연동 (향후 보강)

| 스토어 | 난이도 | 붙이는 이유 |
|--------|--------|-------------|
| Steam | 쉬움(반공식) | 리치 메타(리뷰·태그·출시일) + **`cc=kr`로 진짜 원화 정가** |
| Epic | 중간(GraphQL) | 커버리지 보강 + 매주 무료게임 |
| GOG | 중간 | DRM-free 유저층 + 지역 가격 |
| itch.io | 쉬움 | **유일하게 공식 문서화 API**, 인디 중심 |

### 거의 불가능 (지금은 제외)

Rockstar / EA App / Ubisoft Connect / Battle.net — 공개 API 없음, 로그인·봇차단 벽. MVP 제외.

---

## 3. 아키텍처

**핵심 설계: 수집(쓰기)과 서빙(읽기)을 DB로 완전히 분리.** 무료 운영·안정성의 근거.

```
[외부 소스]  CheapShark  ·  (향후) Steam / Epic / GOG / itch
     │  @Scheduled 주기 수집 (기본 6시간, 실시간 아님)
     ▼
[수집 파이프라인 · Spring Boot]
   스토어별 Fetcher(분리) → Normalizer(공통 포맷 변환) → Service(저장)
     │  저장·캐싱
     ▼
[PostgreSQL]  ← 할인 데이터 캐시
     │  조회 (외부 API 절대 직접 호출 안 함)
     ▼
[REST API]  →  [Frontend · React/Vite]  (Vercel / Netlify)
```

- **@Scheduled 수집**: 프론트 요청마다 외부를 때리지 않고 정해진 주기에만 수집 → rate limit·무료 티어 동시 해결. 주기는 `application.yml`에서 조정(기본 6h, 8h/12h로 변경 가능).
- **Fetcher 분리**: 스토어마다 별도 구현체(`StoreFetcher` 인터페이스). 하나가 깨져도 나머지 무중단.
- **Normalizer**: 스토어별 제각각 JSON을 하나의 형태(게임명/원가/할인가/할인율/스토어/시간)로 변환.
- **PostgreSQL = 캐시**: 사용자 요청은 전부 DB에서만 응답 → 빠르고, 외부 스토어가 잠깐 죽어도 마지막 수집분으로 서비스 유지.

### 백엔드 패키지 구성 (실제)

```
com.example.deal
├─ fetcher      StoreFetcher(공통 인터페이스) · CheapSharkFetcher(RestClient) · dto/(CheapShark 원본)
├─ scheduler    DealCollectScheduler(@Scheduled, 장애 격리)
├─ service      DealService(수집 오케스트레이션) · Normalizer(raw→도메인 변환)
├─ repository   DealMapper(MyBatis) — resources/mapper/DealMapper.xml
├─ domain       Store · Game · Deal (스키마 일치 엔티티)
├─ dto          응답 DTO (API 단계)
└─ controller   REST 컨트롤러 (API 단계)
```

---

## 4. 데이터 모델

3개 테이블. deal 하나 = **게임 × 스토어 × 가격**. (ERD/DDL 상세는 spec 문서·V1 스키마)

- **stores** — `store_id`(PK), `store_name`, `is_active`, `icon_url`
- **games** — `game_id`(PK, 같은 게임이면 스토어 달라도 동일), `title`, `steam_app_id`, `thumb_url`, 평점, `release_date`
- **deals** — `deal_id`(PK), `game_id`(FK), `store_id`(FK), `sale_price`, `normal_price`, `savings`, `currency`, `is_on_sale`, `last_change`, `updated_at`

**꼭 기억할 함정 3가지 (실측 확인됨)**
1. **가격이 문자열**(`"7.49"`) → `BigDecimal` 파싱 후 `NUMERIC` 저장 (FLOAT 금지, 돈 계산 오차).
2. **시간이 Unix epoch 정수**(`1687058152`) → `Instant.ofEpochSecond()` → `LocalDateTime`(UTC) → `TIMESTAMP`.
3. **한글 게임명** → DB UTF8 인코딩 (dealmoa DB를 UTF8/template0 로 생성).

**수집 순서 주의**: FK 때문에 `store upsert → game upsert → deal upsert`. Postgres `INSERT ... ON CONFLICT DO UPDATE`로 중복 없이 upsert.

---

## 5. 핵심 결정 로그 (왜 이렇게 했나)

| # | 결정 | 이유 |
|---|------|------|
| D1 | 스토어 직접 연동보다 **집계 API(CheapShark) 우선** | `gameID`로 게임 매칭이 공짜. 직접 하면 매칭 지옥 |
| D2 | 값은 **USD 먼저**, **환율 변환 안 함** | 게임은 지역별 독립 가격. 환율 변환 KRW는 실제 결제가와 달라 사용자를 속임 |
| D3 | 스키마에 **`currency` 컬럼** 미리 배치 | 지금은 USD, 나중에 KRW 행만 추가(마이그레이션 불필요) |
| D4 | 진짜 KRW는 **Steam `cc=kr`**로 나중에 | 환율이 아니라 실제 한국 원화 정가를 받아옴 |
| D5 | **캐싱 필수(PostgreSQL) + `@Scheduled` 주기 수집** | rate limit 회피 + 무료 티어 생존. 할인 정보는 실시간일 필요 없음(기본 6h) |
| D6 | **Fetcher 스토어별 분리** | 하나 깨져도 전체 무중단(장애 격리) |
| D7 | **API는 DB에서만 조회** | 외부 API 직접 호출 안 함 → 빠르고 외부 장애에 강함 |
| D8 | 무료 배포 = **Oracle Cloud Free Tier**(백+DB) + **Vercel/Netlify**(프론트) | 총비용 0원 목표 |
| D9 | 프론트 **React** · DB **PostgreSQL** | 데이터가 관계형(games×stores×deals 조인)이라 NoSQL 부적합 |
| D10 | **Spring Boot 3.5.16 고정** (4.x 아님) | Initializr 기본값 4.1.0은 mybatis-spring-boot-starter와 비호환. 3.5는 성숙·문서 풍부, Java 21 LTS와 최적 |

---

## 6. API 요약

Base URL `/api` · JSON · 인증 없음(공개 조회) · 금액은 `price`+`currency` 쌍. (상세는 spec 문서)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/deals` | 할인 목록 (정렬·필터·페이징) |
| GET | `/api/deals/{dealId}` | 딜 상세 |
| GET | `/api/games/{gameId}` | 게임 상세 + 스토어별 가격 비교 |
| GET | `/api/games/search` | 게임 제목 검색 |
| GET | `/api/stores` | 활성 스토어 목록 |

---

## 7. 구현 현황 (2026-07-13 기준)

| 단계 | 상태 | 비고 |
|------|------|------|
| **Phase 0 — 셋업** | ✅ 완료 | JDK 21(Temurin)·Node 24, Spring Boot 3.5.16 스캐폴드, Gradle 8.14.5 래퍼, dealmoa DB(UTF8), Flyway V1(표 3·인덱스·트리거) 자동 생성 검증 |
| **Phase 1 — 수집 파이프라인** | ✅ 완료 (M1) | CheapSharkFetcher(User-Agent·타임아웃) · Normalizer · MyBatis upsert · DealService · `@Scheduled`(기본 6h). **실측: 상점 35·게임 267·딜 300건 자동 적재, 약 2초** |
| **Phase 2 — REST API** | ⬜ 진행 예정 | `/api/deals`부터 |
| **Phase 3 — 프론트(React)** | ⬜ | 목록·검색·가격비교 |
| **Phase 4 — 무료 배포** | ⬜ | Oracle Cloud + Vercel |
| **Phase 5 — 확장** | ⬜ | Steam KRW · 역대 최저가 · Epic/GOG/itch |

---

## 8. 미해결 / 결정 대기

- **회원 기능** — 위시리스트·가격 알림을 하려면 필요(스키마·API 확장 큼). 현재는 "로그인 없는 공개 조회" 전제.
- **역대 최저가** — `price_history` 테이블을 MVP에 넣을지 향후로 뺄지. (현재 향후, CheapShark `/games` 활용 예정)
- **퍼블리셔·연도·장르** (상세 화면) — CheapShark가 안 주는 정보. Steam `appdetails` 연동 선행 필요.
