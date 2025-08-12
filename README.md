# 우리집 DayCareCenter

## 프로젝트 개요

이 프로젝트는 데이케어센터의 일일 활동 계획과 기록을 관리하는 웹 애플리케이션입니다. 구글 스프레드시트 기반에서 Supabase 데이터베이스로 마이그레이션되었습니다.

## 기술 스택

- HTML/CSS/JavaScript
- Supabase (백엔드 데이터베이스)

## 데이터베이스 구조

### activities_plan 테이블

일일 활동 계획과 기록을 저장하는 테이블입니다.

```sql
CREATE TABLE activities_plan (
  계획_id uuid primary key default uuid_generate_v4(),
  날짜 int4,
  시작시간 int4,
  종료시간 int4,
  직원번호 text,
  직원명 text,
  활동명 text,
  생활영역 text,
  장소 text,
  준비물품 text,
  내용및특이사항 text,
  활동기록 text,
  참고사진URL text,
  created_at timestamp with time zone default now()
);
```

### employeesinfo 테이블

직원 정보를 저장하는 테이블입니다.

## 설정 방법

1. Supabase 프로젝트 설정:

   - Supabase 계정 생성 및 새 프로젝트 생성
   - 테이블 구조에 맞게 데이터베이스 테이블 생성

2. 환경 설정:
   - `supabase.js` 파일에 API URL과 API 키 설정
   - 로컬 개발 환경 설정 (필요시)

## 사용 방법

1. 웹 브라우저에서 애플리케이션 실행
2. 날짜 선택 후 일일 계획 조회
3. 새로운 계획 추가:
   - 날짜, 시간, 활동명 등 필수 정보 입력
   - 저장 버튼 클릭
4. 기존 계획 수정/삭제:
   - 목록에서 계획 선택
   - 정보 수정 후 수정 버튼 클릭 또는 삭제 버튼 클릭

## 마이그레이션 정보

이 프로젝트는 원래 Google Apps Script와 Google Spreadsheet를 기반으로 개발되었으며, Supabase로 마이그레이션되었습니다.
