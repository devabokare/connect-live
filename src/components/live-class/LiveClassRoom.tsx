import { JitsiMeeting } from "@jitsi/react-sdk";
import logo from "@/assets/liftuplabs-logo.png";


interface LiveClassRoomProps {
  classId: string;
  userName: string;
  role?: 'teacher' | 'student';
  onLeave?: () => void;
}

export function LiveClassRoom({
  classId,
  userName,
  role = 'student',
  onLeave,
}: LiveClassRoomProps) {
  const isTeacher = role === 'teacher';

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col bg-background rounded-lg overflow-hidden">
      {/* Custom Header with LiftUpLabs Logo */}
      <div className="flex items-center justify-center py-3 bg-card border-b border-border">
        <img 
          src={logo} 
          alt="LiftUpLabs" 
          className="h-8 w-auto object-contain"
        />
      </div>
      
      <div className="flex-1 relative">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={classId}
          configOverwrite={{
            startWithAudioMuted: !isTeacher,
            startWithVideoMuted: !isTeacher,
            disableModeratorIndicator: false,
            enableEmailInStats: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            requireDisplayName: false,
            toolbarButtons: isTeacher
              ? [
                  'microphone',
                  'camera',
                  'closedcaptions',
                  'desktop',
                  'fullscreen',
                  'fodeviceselection',
                  'hangup',
                  'chat',
                  'recording',
                  'livestreaming',
                  'etherpad',
                  'sharedvideo',
                  'settings',
                  'raisehand',
                  'videoquality',
                  'filmstrip',
                  'participants-pane',
                  'tileview',
                  'mute-everyone',
                  'security',
                ]
              : [
                  'microphone',
                  'camera',
                  'fullscreen',
                  'hangup',
                  'chat',
                  'raisehand',
                  'tileview',
                ],
          }}
          interfaceConfigOverwrite={{
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            SHOW_POWERED_BY: false,
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            MOBILE_APP_PROMO: false,
            TOOLBAR_ALWAYS_VISIBLE: true,
            DEFAULT_LOGO_URL: '',
            JITSI_WATERMARK_LINK: '',
          }}
          userInfo={{
            displayName: userName,
            email: '',
          }}
          onApiReady={(externalApi) => {
            console.log('Jitsi API ready');
            
            externalApi.addListener('videoConferenceLeft', () => {
              console.log('Left the video conference');
              onLeave?.();
            });

            externalApi.addListener('participantJoined', (participant: { id: string; displayName: string }) => {
              console.log('Participant joined:', participant);
            });

            externalApi.addListener('participantLeft', (participant: { id: string }) => {
              console.log('Participant left:', participant);
            });
          }}
          getIFrameRef={(iframe) => {
            iframe.style.height = '100%';
            iframe.style.width = '100%';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '0';
          }}
        />
      </div>
    </div>
  );
}
