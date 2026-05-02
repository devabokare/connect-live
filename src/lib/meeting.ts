export function generateMeetingId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const segments = [];
  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  return segments.join('-');
}

export function generateVisitorId(): string {
  return 'visitor-' + Math.random().toString(36).substring(2, 15);
}

export interface LocalMeeting {
  id: string;
  meetingId: string;
  title: string;
  hostId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface LocalParticipant {
  id: string;
  visitorId: string;
  displayName: string;
  isHost: boolean;
  joinedAt: Date;
}

// Store meetings in memory (for demo purposes - in production you'd use the database)
const activeMeetings = new Map<string, LocalMeeting>();
const meetingParticipants = new Map<string, LocalParticipant[]>();

export function createMeeting(hostId: string, title: string = 'Untitled Meeting'): LocalMeeting {
  const meetingId = generateMeetingId();
  const meeting: LocalMeeting = {
    id: crypto.randomUUID(),
    meetingId,
    title,
    hostId,
    isActive: true,
    createdAt: new Date(),
  };
  
  activeMeetings.set(meetingId, meeting);
  meetingParticipants.set(meetingId, []);
  
  return meeting;
}

export function getMeeting(meetingId: string): LocalMeeting | null {
  return activeMeetings.get(meetingId) || null;
}

export function endMeeting(meetingId: string): void {
  const meeting = activeMeetings.get(meetingId);
  if (meeting) {
    meeting.isActive = false;
    activeMeetings.delete(meetingId);
    meetingParticipants.delete(meetingId);
  }
}

export function joinMeeting(
  meetingId: string,
  visitorId: string,
  displayName: string,
  isHost: boolean = false
): LocalParticipant {
  const participant: LocalParticipant = {
    id: crypto.randomUUID(),
    visitorId,
    displayName,
    isHost,
    joinedAt: new Date(),
  };
  
  const participants = meetingParticipants.get(meetingId) || [];
  participants.push(participant);
  meetingParticipants.set(meetingId, participants);
  
  return participant;
}

export function leaveMeeting(meetingId: string, visitorId: string): void {
  const participants = meetingParticipants.get(meetingId) || [];
  const updatedParticipants = participants.filter(p => p.visitorId !== visitorId);
  meetingParticipants.set(meetingId, updatedParticipants);
}

export function getParticipants(meetingId: string): LocalParticipant[] {
  return meetingParticipants.get(meetingId) || [];
}

export function removeParticipant(meetingId: string, participantId: string): void {
  const participants = meetingParticipants.get(meetingId) || [];
  const updatedParticipants = participants.filter(p => p.id !== participantId);
  meetingParticipants.set(meetingId, updatedParticipants);
}
