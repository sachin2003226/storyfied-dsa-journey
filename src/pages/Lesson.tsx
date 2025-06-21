
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Star, CheckCircle, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Lesson = Tables<'lessons'>;
type Topic = Tables<'topics'>;
type UserProgress = Tables<'user_progress'>;

const Lesson = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<(Lesson & { topic: Topic }) | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLessonData();
    }
  }, [id]);

  const fetchLessonData = async () => {
    try {
      // Fetch lesson with topic
      const { data: lessonData } = await supabase
        .from('lessons')
        .select(`
          *,
          topic:topics(*)
        `)
        .eq('id', id)
        .single();

      // Fetch user progress for this lesson
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('lesson_id', id)
        .maybeSingle();

      setLesson(lessonData);
      setProgress(progressData);
    } catch (error) {
      console.error('Error fetching lesson data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async () => {
    if (!lesson) return;
    
    setMarking(true);
    try {
      if (progress) {
        // Update existing progress
        const { error } = await supabase
          .from('user_progress')
          .update({
            completed: true,
            completion_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', progress.id);

        if (error) throw error;
      } else {
        // Create new progress entry
        const { error } = await supabase
          .from('user_progress')
          .insert({
            lesson_id: lesson.id,
            completed: true,
            completion_date: new Date().toISOString(),
            time_spent_minutes: lesson.duration_minutes || 0
          });

        if (error) throw error;
      }

      toast({
        title: "Lesson completed!",
        description: "Great job! Keep up the momentum."
      });

      // Refresh data
      await fetchLessonData();
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      toast({
        title: "Error",
        description: "Failed to mark lesson as completed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setMarking(false);
    }
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

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Lesson not found</h2>
          <Link to="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = progress?.completed || false;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to={`/topic/${lesson.topic_id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {lesson.topic.name}
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {lesson.lesson_type === 'video' && <Play className="h-5 w-5 text-gray-600" />}
                <Badge variant="outline">{lesson.topic.name}</Badge>
                {isCompleted && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
              <p className="text-gray-600 mb-4">{lesson.description}</p>
              
              <div className="flex items-center space-x-4 text-sm">
                <Badge className={getDifficultyColor(lesson.difficulty)}>
                  {lesson.difficulty}
                </Badge>
                
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  {lesson.duration_minutes} minutes
                </div>
                
                {lesson.is_premium && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    <Star className="h-4 w-4 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {!isCompleted && (
                <Button onClick={markAsCompleted} disabled={marking}>
                  {marking ? 'Marking...' : 'Mark as Complete'}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Video Section */}
          {lesson.video_url && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Video Lesson</h3>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Video player would be embedded here</p>
                    <p className="text-sm text-gray-500">URL: {lesson.video_url}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Section */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Lesson Content</h3>
              <div className="prose max-w-none">
                {lesson.content ? (
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {lesson.content}
                  </div>
                ) : (
                  <p className="text-gray-600 italic">
                    Lesson content will be available soon. This is a placeholder for the detailed lesson material.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress Section */}
          {progress && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {isCompleted ? '100%' : '0%'}
                    </div>
                    <p className="text-sm text-gray-600">Completion</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {progress.time_spent_minutes || 0}m
                    </div>
                    <p className="text-sm text-gray-600">Time Spent</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {progress.completion_date ? 
                        new Date(progress.completion_date).toLocaleDateString() : 
                        'In Progress'
                      }
                    </div>
                    <p className="text-sm text-gray-600">Completed On</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lesson;
