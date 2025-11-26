import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp,
  Target,
  Calendar
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  progress?: number;
  progressLabel?: string;
}

function StatCard({ title, value, change, changeType, icon, progress, progressLabel }: StatCardProps) {
  const getCardGradient = (title: string) => {
    const gradients = {
      'Enrolled Courses': 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200',
      'Learning Hours': 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200',
      'Certificates': 'bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200',
      'Average Progress': 'bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200'
    };
    return gradients[title as keyof typeof gradients] || 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200';
  };

  const getIconGradient = (title: string) => {
    const gradients = {
      'Enrolled Courses': 'bg-gradient-to-r from-blue-500 to-indigo-600',
      'Learning Hours': 'bg-gradient-to-r from-green-500 to-emerald-600',
      'Certificates': 'bg-gradient-to-r from-yellow-500 to-orange-600',
      'Average Progress': 'bg-gradient-to-r from-purple-500 to-pink-600'
    };
    return gradients[title as keyof typeof gradients] || 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  return (
    <Card className={`${getCardGradient(title)} border-2 shadow-lg hover:shadow-xl transition-all duration-300`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${getIconGradient(title)} text-white shadow-md`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        {change && (
          <p className={`text-xs ${
            changeType === 'positive' ? 'text-green-600' :
            changeType === 'negative' ? 'text-red-600' : 
            'text-muted-foreground'
          }`}>
            {change}
          </p>
        )}
        {progress !== undefined && (
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{progressLabel}</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Enrolled Courses"
        value="12"
        change="+2 this month"
        changeType="positive"
        icon={<BookOpen className="h-4 w-4" />}
      />
      
      <StatCard
        title="Learning Hours"
        value="47.2h"
        change="+5.2h this week"
        changeType="positive"
        icon={<Clock className="h-4 w-4" />}
      />
      
      <StatCard
        title="Certificates"
        value="8"
        change="+3 this month"
        changeType="positive"
        icon={<Award className="h-4 w-4" />}
      />
      
      <StatCard
        title="Average Progress"
        value="68%"
        change="+12% this month"
        changeType="positive"
        icon={<TrendingUp className="h-4 w-4" />}
        progress={68}
        progressLabel="Overall completion"
      />
    </div>
  );
}

export function WeeklyGoals() {
  const goals = [
    {
      title: "Complete 3 lessons",
      progress: 67,
      current: 2,
      target: 3,
      icon: <Target className="h-4 w-4" />,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      title: "Study 10 hours",
      progress: 80,
      current: 8,
      target: 10,
      icon: <Clock className="h-4 w-4" />,
      color: 'from-green-400 to-emerald-500'
    },
    {
      title: "Attend 2 live sessions",
      progress: 50,
      current: 1,
      target: 2,
      icon: <Calendar className="h-4 w-4" />,
      color: 'from-purple-400 to-pink-500'
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-white to-indigo-50 border-indigo-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <Target className="h-4 w-4" />
          </div>
          Weekly Goals 🎯
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-gradient-to-r ${goal.color} text-white`}>
                  {goal.icon}
                </div>
                <span className="font-medium text-sm">{goal.title}</span>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {goal.current}/{goal.target}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${goal.color} transition-all duration-500`}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}