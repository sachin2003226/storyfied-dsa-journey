
-- Create enum types for better data integrity
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'expired');
CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE lesson_type AS ENUM ('video', 'article', 'interactive');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'student',
  subscription_status subscription_status DEFAULT 'inactive',
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  razorpay_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create topics table
CREATE TABLE public.topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  lesson_type lesson_type DEFAULT 'article',
  video_url TEXT,
  difficulty difficulty_level DEFAULT 'easy',
  duration_minutes INTEGER,
  order_index INTEGER,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user progress table
CREATE TABLE public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completion_date TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Create subscriptions table for payment tracking
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  razorpay_subscription_id TEXT UNIQUE,
  razorpay_order_id TEXT,
  plan_name TEXT NOT NULL,
  amount INTEGER NOT NULL, -- in paise
  currency TEXT DEFAULT 'INR',
  status subscription_status DEFAULT 'inactive',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for topics (public read, admin write)
CREATE POLICY "Anyone can view active topics" ON public.topics
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage topics" ON public.topics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for lessons
CREATE POLICY "Anyone can view active lessons" ON public.lessons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage lessons" ON public.lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for user progress
CREATE POLICY "Users can view their own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON public.user_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data for topics
INSERT INTO public.topics (name, description, icon, order_index) VALUES
('Arrays', 'Learn about arrays, indexing, and array operations', '📊', 1),
('Linked Lists', 'Understanding pointers, nodes, and linked list operations', '🔗', 2),
('Stacks & Queues', 'LIFO and FIFO data structures and their applications', '📚', 3),
('Trees', 'Binary trees, BST, tree traversals and operations', '🌳', 4),
('Graphs', 'Graph representation, traversal algorithms (BFS, DFS)', '🕸️', 5),
('Sorting Algorithms', 'Bubble sort, merge sort, quick sort and more', '🔄', 6),
('Searching Algorithms', 'Linear search, binary search, and optimization', '🔍', 7),
('Dynamic Programming', 'Memoization, tabulation, and optimization problems', '💡', 8);

-- Insert sample lessons for Arrays topic
INSERT INTO public.lessons (topic_id, title, description, lesson_type, difficulty, duration_minutes, order_index, is_premium) 
SELECT 
  t.id,
  lesson_data.title,
  lesson_data.description,
  lesson_data.lesson_type::lesson_type,
  lesson_data.difficulty::difficulty_level,
  lesson_data.duration_minutes,
  lesson_data.order_index,
  lesson_data.is_premium
FROM public.topics t,
(VALUES
  ('Introduction to Arrays', 'Basic concepts and array declaration', 'article', 'easy', 15, 1, false),
  ('Array Operations', 'Insertion, deletion, and traversal operations', 'video', 'easy', 25, 2, false),
  ('Two Pointers Technique', 'Solving array problems with two pointers', 'article', 'medium', 30, 3, true),
  ('Array Sorting', 'Different sorting techniques for arrays', 'video', 'medium', 35, 4, true)
) AS lesson_data(title, description, lesson_type, difficulty, duration_minutes, order_index, is_premium)
WHERE t.name = 'Arrays';
