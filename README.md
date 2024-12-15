# 구인구직 백엔드 서버 프로젝트

## 프로젝트 개요

이 프로젝트는 사람인 데이터를 활용하여 구인구직 정보를 제공하는 백엔드 서버를 구축하는 것을 목표로 합니다. 프로젝트는 Node.js(Express.js)와 MongoDB를 사용하여 RESTful API, 인증 시스템, 크롤링 기능, 그리고 Swagger 기반 API 문서화를 포함합니다. Jcloud 원격 서버에 forever 라이브러리를 이용하여 Restful API 서버를 백그라운드 실행중입니다.

---

## 주요 기능

### 1. **크롤링**
- 사람인 웹사이트에서 채용 공고 데이터를 크롤링하여 MongoDB에 저장.
- 최소 100개 이상의 채용 공고 데이터를 수집하고 정제.
- 중복 데이터 방지 및 업데이트 로직 구현.

### 2. **데이터베이스**
- MongoDB를 사용하여 주요 데이터 모델 정의:
  - **Job**: 채용 공고 정보
  - **Company**: 회사 정보
  - **User**: 사용자 정보
  - **Application**: 지원 내역
  - **Bookmark**: 관심 공고
- 빠른 탐색을 위해 주요 필드에 인덱스 적용.

### 3. **REST API**
- 회원 관리 API: 회원가입, 로그인, 정보 수정/조회, 회원 탈퇴.
- 채용 공고 API: CRUD, 검색, 필터링, 정렬, 페이지네이션.
- 지원 관리 API: 지원, 지원 취소, 지원 내역 조회.
- 북마크 API: 북마크 추가/제거, 목록 조회.
- JWT 기반 인증 및 인증 미들웨어.

### 4. **Swagger 문서화**
- Swagger를 이용한 자동화된 API 문서 작성.
- `/api-docs` 엔드포인트에서 API 테스트 가능.

---

## 기술 스택

### **Backend**
- **Node.js (Express.js)**: 서버 구현.
- **MongoDB**: 데이터베이스.
- **Swagger**: API 문서화.
- **JWT (jsonwebtoken)**: 인증 및 보안.
- **bcrypt**: 비밀번호 암호화.
- **axios + cheerio**: 웹 크롤링.

### **DevOps**
- JCloud를 사용하여 서버 배포.
- `.env` 파일을 통한 환경 변수 관리.

---

## API 주요 엔드포인트

### **회원 관리**
- `POST /auth/register`: 회원가입.
- `POST /auth/login`: 로그인 및 JWT 발급.
- `POST /auth/refresh`: Access Token 갱신.
- `GET /auth/profile`: 회원 정보 조회.
- `PUT /auth/profile`: 회원 정보 수정.
- `DELETE /auth/profile`: 회원 탈퇴.

### **채용 공고**
- `GET /jobs`: 공고 목록 조회 (페이지네이션, 필터링, 검색).
- `POST /jobs`: 공고 등록.
- `GET /jobs/:id`: 공고 상세 조회.
- `PUT /jobs/:id`: 공고 수정.
- `DELETE /jobs/:id`: 공고 삭제.

### **지원 관리**
- `POST /applications`: 지원 등록.
- `GET /applications`: 지원 내역 조회.
- `DELETE /applications/:id`: 지원 취소.

### **북마크**
- `POST /bookmarks`: 북마크 추가/제거.
- `GET /bookmarks`: 북마크 목록 조회.

---

## 설치 및 실행 방법

**패키지 설치 및 실행**
   ```bash
   cd node-project
   npm install
   sudo node app.js
   ```
### Swagger 문서 확인

- 브라우저에서 http://113.198.66.75:17114/api-docs로 접속.