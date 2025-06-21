
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, BookOpen, Clock, Star, CheckCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Topic = Tables<'topics'>;
type Lesson = Tables<'lessons'>;
type UserProgress = Tables<'user_progress'>;

const Topic = () => {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTopicData();
    }
  }, [id]);

  const fetchTopicData = async () => {
    try {
      // Fetch topic
      const { data: topicData } = await supabase
        .from('topics')
        .select('*')
        .eq('id', id)
        .single();

      // Fetch lessons for this topic
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('topic_id', id)
        .eq('is_active', true)
        .order('order_index');

      // Fetch user progress for these lessons
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*');

      setTopic(topicData);
      setLessons(lessonsData || []);
      setProgress(progressData || []);
    } catch (error) {
      console.error('Error fetching topic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.lesson_type === 'video') return <Play className="h-4 w-4" />;
    return <BookOpen className="h-4 w-4" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Topic not found</h2>
          <Link to="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const completedCount = lessons.filter(lesson => isLessonCompleted(lesson.id)).length;
  const progressPercentage = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-4xl">{topic.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{topic.name}</h1>
              <p className="text-gray-600">{topic.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span>{lessons.length} lessons</span>
            <span>{completedCount} completed</span>
            <span>{progressPercentage}% progress</span>
          </div>
        </div>

        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getLessonIcon(lesson)}
                        <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                        {isLessonCompleted(lesson.id) && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">{lesson.description}</p>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getDifficultyColor(lesson.difficulty)}>
                          {lesson.difficulty}
                        </Badge>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {lesson.duration_minutes} min
                        </div>
                        
                        {lesson.is_premium && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            <Star className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Link to={`/lesson/${lesson.id}`}>
                    <Button>
                      {isLessonCompleted(lesson.id) ? 'Review' : 'Start Lesson'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {lessons.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
              <p className="text-gray-600">Lessons for this topic are coming soon!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Topic;
