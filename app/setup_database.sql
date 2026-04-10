-- Supabase SQL Schema for Meeting Management System

-- 1. 사용자 프로필 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 회의 회차 관리
CREATE TABLE IF NOT EXISTS public.meeting_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  round INTEGER NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT,
  attendees TEXT[] DEFAULT '{}',
  ai_summary TEXT,
  duration TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'ongoing', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, round)
);

-- 3. 안건별 의결 결과 및 기록
CREATE TABLE IF NOT EXISTS public.agendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES public.meeting_rounds(id) ON DELETE CASCADE,
  index INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  vote_result TEXT CHECK (vote_result IN ('approved', 'conditional', 'review', 'pending')),
  vote_comment TEXT,
  transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CEO 보고서
CREATE TABLE IF NOT EXISTS public.ceo_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID REFERENCES public.meeting_rounds(id) ON DELETE CASCADE UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  key_decisions TEXT[] DEFAULT '{}',
  action_items TEXT[] DEFAULT '{}',
  risks TEXT[] DEFAULT '{}',
  opportunities TEXT[] DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) 설정
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ceo_reports ENABLE ROW LEVEL SECURITY;

-- 정책: 로그인한 모든 사용자는 데이터 조회 가능
CREATE POLICY "Allow authenticated read on rounds" ON public.meeting_rounds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on agendas" ON public.agendas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on reports" ON public.ceo_reports FOR SELECT TO authenticated USING (true);

-- 정책: 관리자(admin)만 데이터 수정 가능
CREATE POLICY "Allow admin all on rounds" ON public.meeting_rounds FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow admin all on agendas" ON public.agendas FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow admin all on reports" ON public.ceo_reports FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
