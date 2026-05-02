import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { LiveClassRoom } from '@/components/live-class/LiveClassRoom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Video, Users, Shield } from 'lucide-react';
import logo from '@/assets/liftuplabs-logo.png';

function Header() {
  return (
    <div className="flex items-center justify-center py-6">
      <img src={logo} alt="LiftUpLabs" className="h-10 w-auto object-contain" />
    </div>
  );
}

export default function LiveClass() {
  const { classId } = useParams<{ classId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [joined, setJoined] = useState(false);
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('student');

  // Get role from URL params if provided
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'teacher' || roleParam === 'student') {
      setRole(roleParam);
    }
    
    // Try to get saved name from localStorage
    const savedName = localStorage.getItem('liveclass-username');
    if (savedName) {
      setUserName(savedName);
    }
  }, [searchParams]);

  const handleJoinClass = () => {
    if (!userName.trim()) return;
    localStorage.setItem('liveclass-username', userName);
    setJoined(true);
  };

  const handleLeaveClass = () => {
    setJoined(false);
    navigate('/');
  };

  if (!classId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Class</CardTitle>
            <CardDescription>No class ID provided.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Header />
            <CardTitle className="text-2xl">Join Live Class</CardTitle>
            <CardDescription>
              Class ID: <span className="font-mono text-foreground">{classId}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinClass()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Join as</Label>
              <Select value={role} onValueChange={(value: 'teacher' | 'student') => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Student
                    </div>
                  </SelectItem>
                  <SelectItem value="teacher">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Teacher (Moderator)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">
                {role === 'teacher' ? '👨‍🏫 Teacher Features' : '👨‍🎓 Student Features'}
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {role === 'teacher' ? (
                  <>
                    <li>• Start with camera & mic enabled</li>
                    <li>• Screen sharing & recording</li>
                    <li>• Mute all participants</li>
                    <li>• Full moderator controls</li>
                  </>
                ) : (
                  <>
                    <li>• Start with camera & mic muted</li>
                    <li>• Raise hand to speak</li>
                    <li>• Chat with class</li>
                    <li>• No app install required</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleJoinClass} 
                disabled={!userName.trim()}
                className="flex-1"
              >
                <Video className="w-4 h-4 mr-2" />
                Join Class
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="flex-shrink-0 h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleLeaveClass}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave
          </Button>
          <div className="h-6 w-px bg-border" />
          <span className="text-sm text-muted-foreground">
            Class: <span className="font-mono text-foreground">{classId}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            role === 'teacher' 
              ? 'bg-primary/10 text-primary' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
          </span>
        </div>
      </header>
      
      <main className="flex-1 p-4 overflow-hidden">
        <LiveClassRoom
          classId={classId}
          userName={userName}
          role={role}
          onLeave={handleLeaveClass}
        />
      </main>
    </div>
  );
}
