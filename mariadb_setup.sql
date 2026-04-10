-- MariaDB Setup for Meeting Management System

CREATE DATABASE IF NOT EXISTS meeting_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE meeting_management;

-- 1. 사용자 프로필
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 회의 회차 관리
CREATE TABLE IF NOT EXISTS meeting_rounds (
  id VARCHAR(50) PRIMARY KEY,
  year INT NOT NULL,
  round_num INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location VARCHAR(255),
  attendees JSON, -- JSON format for array
  ai_summary TEXT,
  duration VARCHAR(20),
  status ENUM('planned', 'ongoing', 'completed') DEFAULT 'planned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(year, round_num)
);

-- 3. 안건별 의결 결과 및 기록
CREATE TABLE IF NOT EXISTS agendas (
  id VARCHAR(50) PRIMARY KEY,
  meeting_id VARCHAR(50) NOT NULL,
  agenda_index INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  vote_result ENUM('approved', 'conditional', 'review', 'pending'),
  vote_comment TEXT,
  transcript TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES meeting_rounds(id) ON DELETE CASCADE
);

-- 4. CEO 보고서
CREATE TABLE IF NOT EXISTS ceo_reports (
  id VARCHAR(50) PRIMARY KEY,
  round_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  key_decisions JSON,
  action_items JSON,
  risks JSON,
  opportunities JSON,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (round_id) REFERENCES meeting_rounds(id) ON DELETE CASCADE
);

-- 데이터 삽입 (초기 관리자 계정)
INSERT IGNORE INTO profiles (id, email, name, role) VALUES 
('admin-user-id', 'admin@example.com', '방장', 'admin');

-- 샘플 회의 데이터 5개 삽입
INSERT IGNORE INTO meeting_rounds (id, year, round_num, date, time, location, attendees, ai_summary, duration, status) VALUES
('round-2024-12', 2024, 12, '2024-03-27', '14:00:00', '대회의실 A', '["홍길동", "김철수", "이영희", "박지민"]', '신규 프로젝트 및 성과급 논의가 진행되었습니다.', '01:15:30', 'completed'),
('round-2024-11', 2024, 11, '2024-03-20', '10:00:00', '대회의실 B', '["홍길동", "이영희", "박지민"]', '사옥 리모델링 계획이 원안대로 승인되었습니다.', '00:45:00', 'completed'),
('round-2024-10', 2024, 10, '2024-03-13', '15:30:00', '임원회의실', '["김철수", "이영희"]', '글로벌 마케팅 예산 추가 편성안이 통과되었습니다.', '01:20:00', 'completed'),
('round-2024-09', 2024, 9,  '2024-03-06', '09:00:00', '대회의실 A', '["홍길동", "박지민", "최민수"]', '신사업 TF 조직 개편안에 대한 보고가 있었습니다.', '02:00:00', 'completed'),
('round-2024-08', 2024, 8,  '2024-02-28', '14:00:00', '대회의실 A', '["홍길동", "김철수", "이영희", "박지민", "최민수"]', '지난 분기 실적 리뷰 및 개선 방안 수립.', '01:50:00', 'completed');

-- 샘플 안건 데이터 삽입
INSERT IGNORE INTO agendas (id, meeting_id, agenda_index, title, vote_result, vote_comment) VALUES
('agenda-1', 'round-2024-12', 1, '신규 프로젝트 개발 승인의 건', 'approved', '시장성 확인됨'),
('agenda-2', 'round-2024-12', 2, '상반기 성과급 지급 규모 확정', 'conditional', '부서별 차등 지급 기준 재검토 필요'),
('agenda-3', 'round-2024-11', 1, '사옥 리모델링 계획안', 'approved', '원안 동의'),
('agenda-4', 'round-2024-10', 1, '유럽 마케팅 비용 추가 배정', 'approved', '신제품 출시 일정에 맞춤'),
('agenda-5', 'round-2024-09', 1, '신사업 TF 멤버 차출', 'review', '각 부서 인력 공백 우려로 인한 보류');
