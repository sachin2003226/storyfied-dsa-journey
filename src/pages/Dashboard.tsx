
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Trophy, Star } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Topic = Tables<'topics'>;
type Lesson = Tables<'lessons'>;
type UserProgress = Tables<'user_progress'>;

const Dashboard = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [recentLessons, setRecentLessons] = useState<(Lesson & { topic: Topic })[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch topics
      const { data: topicsData } = await supabase
        .from('topics')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      // Fetch recent lessons with topics
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select(`
          *,
          topic:topics(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(4);

      // Fetch user progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*');

      setTopics(topicsData || []);
      setRecentLessons(lessonsData || []);
      setProgress(progressData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopicProgress = (topicId: string) => {
    const topicLessons = recentLessons.filter(lesson => lesson.topic_id === topicId);
    const completedLessons = progress.filter(p => 
      topicLessons.some(lesson => lesson.id === p.lesson_id) && p.completed
    );
    
    if (topicLessons.length === 0) return 0;
    return Math.round((completedLessons.length / topicLessons.length) * 100);
  };

  const completedLessonsCount = progress.filter(p => p.completed).length;
  const totalTimeSpent = progress.reduce((acc, p) => acc + (p.time_spent_minutes || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Track your DSA learning progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Lessons</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedLessonsCount}</div>
              <p className="text-xs text-muted-foreground">
                Keep up the great work!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTimeSpent}m</div>
              <p className="text-xs text-muted-foreground">
                Total learning time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Topics</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topics.length}</div>
              <p className="text-xs text-muted-foreground">
                Available to learn
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Topics Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Topics Progress</CardTitle>
              <CardDescription>Your progress across different DSA topics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topics.map((topic) => (
                <div key={topic.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{topic.icon}</span>
                      <span className="font-medium">{topic.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {getTopicProgress(topic.id)}%
                    </span>
                  </div>
                  <Progress value={getTopicProgress(topic.id)} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Lessons */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Lessons</CardTitle>
              <CardDescription>Continue your learning journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentLessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{lesson.title}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{lesson.topic.name}</Badge>
                      <Badge 
                        variant={lesson.difficulty === 'easy' ? 'default' : 
                                lesson.difficulty === 'medium' ? 'secondary' : 'destructive'}
                      >
                        {lesson.difficulty}
                      </Badge>
                      {lesson.is_premium && (
                        <Badge variant="outline">
                          <Star className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {lesson.duration_minutes} minutes
                    </p>
                  </div>
                  <Link to={`/lesson/${lesson.id}`}>
                    <Button size="sm">
                      {progress.some(p => p.lesson_id === lesson.id && p.completed) 
                        ? 'Review' : 'Start'}
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Topics Grid */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Link key={topic.id} to={`/topic/${topic.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{topic.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{topic.name}</CardTitle>
                        <CardDescription>{topic.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{getTopicProgress(topic.id)}%</span>
                      </div>
                      <Progress value={getTopicProgress(topic.id)} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
