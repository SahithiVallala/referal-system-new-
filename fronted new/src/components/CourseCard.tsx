import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Clock, Users, Star } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  students: number;
  rating: number;
  progress: number;
  category: string;
  isCompleted?: boolean;
  onClick?: () => void;
}

export function CourseCard({
  title,
  instructor,
  thumbnail,
  duration,
  students,
  rating,
  progress,
  category,
  isCompleted = false,
  onClick
}: CourseCardProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      'Programming': 'bg-gradient-to-r from-blue-500 to-purple-600',
      'Design': 'bg-gradient-to-r from-pink-400 to-orange-400',
      'Business': 'bg-gradient-to-r from-green-400 to-blue-500',
      'Data Science': 'bg-gradient-to-r from-purple-400 to-pink-500',
      'Languages': 'bg-gradient-to-r from-green-400 to-cyan-500',
      'Mathematics': 'bg-gradient-to-r from-purple-500 to-blue-600'
    };
    return colors[category as keyof typeof colors] || 'bg-gradient-to-r from-gray-400 to-gray-600';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-gradient-to-r from-green-400 to-emerald-500';
    if (progress >= 50) return 'bg-gradient-to-r from-blue-400 to-cyan-500';
    if (progress >= 20) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    return 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <ImageWithFallback
            src={thumbnail}
            alt={title}
            className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <Badge className={`${getCategoryColor(category)} text-white border-0 shadow-lg`}>
              {category}
            </Badge>
          </div>
          {isCompleted && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white border-0 shadow-lg">
                ✅ Completed
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-medium line-clamp-2 mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {instructor}
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {duration}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {students.toLocaleString()}
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            {rating}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}