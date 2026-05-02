import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Plus, ArrowRight, Users, Shield, Zap, Copy, Check, Link, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createMeeting, generateVisitorId } from '@/lib/meeting';
import { generateClassRoomId } from '@/utils/classAccess';
import { toast } from 'sonner';

export default function Index() {
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [createdMeetingId, setCreatedMeetingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Live class states
  const [classId, setClassId] = useState('');
  const [classRole, setClassRole] = useState<'student' | 'teacher'>('student');
  const [createdClassId, setCreatedClassId] = useState<string | null>(null);
  const [copiedClass, setCopiedClass] = useState(false);

  // Load or generate visitor ID and display name
  useEffect(() => {
    let storedName = localStorage.getItem('displayName');
    if (!storedName) {
      storedName = 'Guest ' + Math.floor(Math.random() * 1000);
      localStorage.setItem('displayName', storedName);
    }
    setDisplayName(storedName);

    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = generateVisitorId();
      localStorage.setItem('visitorId', visitorId);
    }
  }, []);

  const getMeetingLink = (id: string) => `${window.location.origin}/meeting/${id}`;
  const getClassLink = (id: string, role: 'teacher' | 'student') => 
    `${window.location.origin}/class/${id}?role=${role}`;

  const copyMeetingLink = async () => {
    if (!createdMeetingId) return;
    await navigator.clipboard.writeText(getMeetingLink(createdMeetingId));
    setCopied(true);
    toast.success('Meeting link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyClassLink = async (role: 'teacher' | 'student') => {
    if (!createdClassId) return;
    await navigator.clipboard.writeText(getClassLink(createdClassId, role));
    setCopiedClass(true);
    toast.success(`${role === 'teacher' ? 'Teacher' : 'Student'} link copied!`);
    setTimeout(() => setCopiedClass(false), 2000);
  };

  const handleCreateMeeting = async () => {
    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsCreating(true);
    try {
      localStorage.setItem('displayName', displayName);
      const visitorId = localStorage.getItem('visitorId') || generateVisitorId();
      const meeting = createMeeting(visitorId);
      setCreatedMeetingId(meeting.meetingId);
      toast.success('Meeting created!');
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Failed to create meeting');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinCreatedMeeting = () => {
    if (createdMeetingId) {
      navigate(`/meeting/${createdMeetingId}`);
    }
  };

  const handleJoinMeeting = async () => {
    if (!meetingId.trim()) {
      toast.error('Please enter a meeting ID');
      return;
    }

    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsJoining(true);
    try {
      localStorage.setItem('displayName', displayName);
      // For demo, we allow joining any meeting ID
      navigate(`/meeting/${meetingId.trim()}`);
    } catch (error) {
      console.error('Error joining meeting:', error);
      toast.error('Failed to join meeting');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateClass = () => {
    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    localStorage.setItem('displayName', displayName);
    const newClassId = generateClassRoomId(`class-${Date.now()}`);
    setCreatedClassId(newClassId);
    toast.success('Live class created!');
  };

  const handleJoinClass = () => {
    if (!classId.trim()) {
      toast.error('Please enter a class ID');
      return;
    }
    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    localStorage.setItem('displayName', displayName);
    localStorage.setItem('liveclass-username', displayName);
    navigate(`/class/${classId.trim()}?role=${classRole}`);
  };

  const handleJoinCreatedClass = (role: 'teacher' | 'student') => {
    if (createdClassId) {
      localStorage.setItem('liveclass-username', displayName);
      navigate(`/class/${createdClassId}?role=${role}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent shadow-lg">
            <Video className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold text-foreground">MeetFlow</span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-12 pb-24">
        <div className="max-w-4xl text-center mb-12 animate-fade-in">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-6">
            Video meetings for{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">everyone</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect instantly in high-quality video calls. No sign-up required. Create or join meetings with a simple code.
          </p>
        </div>

        {/* Name input */}
        <div className="w-full max-w-md mb-8 animate-slide-up">
          <Card className="glass border-border/50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Your Name</Label>
                <Input
                  id="displayName"
                  placeholder="Enter your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Meetings vs Live Classes */}
        <Tabs defaultValue="meetings" className="w-full max-w-2xl animate-slide-up">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="meetings" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Meetings
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Live Classes
            </TabsTrigger>
          </TabsList>

          {/* Meetings Tab */}
          <TabsContent value="meetings">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass border-border/50 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-2">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-display">New Meeting</CardTitle>
                  <CardDescription>
                    Create a new meeting and invite others to join
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    onClick={handleCreateMeeting}
                    disabled={isCreating || !displayName.trim()}
                  >
                    {isCreating ? 'Creating...' : 'Start New Meeting'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass border-border/50 hover:border-accent/30 transition-colors">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 mb-2">
                    <ArrowRight className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="font-display">Join Meeting</CardTitle>
                  <CardDescription>
                    Enter a meeting code to join an existing call
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Enter meeting code (e.g., abc-defg-hij)"
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinMeeting()}
                    className="bg-secondary/50"
                  />
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleJoinMeeting}
                    disabled={isJoining || !meetingId.trim() || !displayName.trim()}
                  >
                    {isJoining ? 'Joining...' : 'Join Meeting'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Live Classes Tab */}
          <TabsContent value="classes">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass border-border/50 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-2">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-display">Start Live Class</CardTitle>
                  <CardDescription>
                    Create a live class with teacher controls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    onClick={handleCreateClass}
                    disabled={!displayName.trim()}
                  >
                    Start Teaching
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass border-border/50 hover:border-accent/30 transition-colors">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 mb-2">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="font-display">Join Class</CardTitle>
                  <CardDescription>
                    Enter a class ID to join a live session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Enter class ID"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinClass()}
                    className="bg-secondary/50"
                  />
                  <Select value={classRole} onValueChange={(v: 'student' | 'teacher') => setClassRole(v)}>
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue placeholder="Join as..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">👨‍🎓 Student</SelectItem>
                      <SelectItem value="teacher">👨‍🏫 Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleJoinClass}
                    disabled={!classId.trim() || !displayName.trim()}
                  >
                    Join Class
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Meeting Link Dialog */}
        <Dialog open={!!createdMeetingId} onOpenChange={(open) => !open && setCreatedMeetingId(null)}>
          <DialogContent className="glass-dark border-border/50 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-xl flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/20">
                  <Check className="h-5 w-5 text-success" />
                </div>
                Meeting Ready!
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Share this link with others to invite them to your meeting
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Meeting Link */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Meeting Link</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 rounded-lg bg-secondary/50 border border-border/50 px-3 py-2.5">
                    <Link className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground truncate font-mono">
                      {createdMeetingId && getMeetingLink(createdMeetingId)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyMeetingLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Meeting Code */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Meeting Code</Label>
                <div className="flex items-center gap-2 rounded-lg bg-secondary/50 border border-border/50 px-3 py-2.5">
                  <span className="text-lg font-mono font-semibold text-foreground tracking-wider">
                    {createdMeetingId}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={copyMeetingLink}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                onClick={handleJoinCreatedMeeting}
              >
                Join Meeting
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Live Class Link Dialog */}
        <Dialog open={!!createdClassId} onOpenChange={(open) => !open && setCreatedClassId(null)}>
          <DialogContent className="glass-dark border-border/50 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-xl flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/20">
                  <GraduationCap className="h-5 w-5 text-success" />
                </div>
                Live Class Ready!
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Share these links with your students or co-teachers
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Teacher Link */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">👨‍🏫 Teacher Link (Full Controls)</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 rounded-lg bg-secondary/50 border border-border/50 px-3 py-2.5">
                    <Link className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-xs text-foreground truncate font-mono">
                      {createdClassId && getClassLink(createdClassId, 'teacher')}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyClassLink('teacher')}
                    className="shrink-0"
                  >
                    {copiedClass ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Student Link */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">👨‍🎓 Student Link (Limited Controls)</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 rounded-lg bg-secondary/50 border border-border/50 px-3 py-2.5">
                    <Link className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-xs text-foreground truncate font-mono">
                      {createdClassId && getClassLink(createdClassId, 'student')}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyClassLink('student')}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Class ID */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Class ID</Label>
                <div className="flex items-center gap-2 rounded-lg bg-secondary/50 border border-border/50 px-3 py-2.5">
                  <span className="text-sm font-mono font-semibold text-foreground tracking-wider">
                    {createdClassId}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleJoinCreatedClass('student')}
              >
                <Users className="h-4 w-4 mr-2" />
                Join as Student
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                onClick={() => handleJoinCreatedClass('teacher')}
              >
                Start Teaching
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Features */}
        <div className="mt-24 grid gap-8 md:grid-cols-2 lg:grid-cols-4 w-full max-w-5xl animate-fade-in">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Secure & Encrypted
            </h3>
            <p className="text-sm text-muted-foreground">
              End-to-end encrypted video streams keep your conversations private
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
              <Users className="h-7 w-7 text-accent" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Easy Collaboration
            </h3>
            <p className="text-sm text-muted-foreground">
              Share your screen, chat in real-time, and collaborate seamlessly
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10">
              <Zap className="h-7 w-7 text-success" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              No Sign-up Required
            </h3>
            <p className="text-sm text-muted-foreground">
              Start or join meetings instantly without creating an account
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Live Classes
            </h3>
            <p className="text-sm text-muted-foreground">
              Host live classes with 25-35 students using Jitsi Meet
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
