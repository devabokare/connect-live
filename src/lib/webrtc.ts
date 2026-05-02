

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

export interface PeerConnection {
  peerId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export class WebRTCManager {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private peers: Map<string, PeerConnection> = new Map();
  private meetingId: string;
  private visitorId: string;
  private onRemoteStream: (peerId: string, stream: MediaStream) => void;
  private onPeerDisconnected: (peerId: string) => void;

  constructor(
    meetingId: string,
    visitorId: string,
    onRemoteStream: (peerId: string, stream: MediaStream) => void,
    onPeerDisconnected: (peerId: string) => void
  ) {
    this.meetingId = meetingId;
    this.visitorId = visitorId;
    this.onRemoteStream = onRemoteStream;
    this.onPeerDisconnected = onPeerDisconnected;
  }

  async initializeMedia(video: boolean = true, audio: boolean = true): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        } : false,
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } : false,
      });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  async startScreenShare(): Promise<MediaStream> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      // Replace video track in all peer connections
      const videoTrack = this.screenStream.getVideoTracks()[0];
      this.peers.forEach((peer) => {
        const sender = peer.connection.getSenders().find(s => s.track?.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });

      // When screen share ends, revert to camera
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      return this.screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  async stopScreenShare(): Promise<void> {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;

      // Revert to camera track
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        this.peers.forEach((peer) => {
          const sender = peer.connection.getSenders().find(s => s.track?.kind === 'video');
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack);
          }
        });
      }
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  private createPeerConnection(peerId: string): PeerConnection {
    if (this.peers.has(peerId)) {
      return this.peers.get(peerId)!;
    }

    const connection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        connection.addTrack(track, this.localStream!);
      });
    }

    // Handle incoming tracks
    connection.ontrack = (event) => {
      console.log('Received remote track from:', peerId);
      const [remoteStream] = event.streams;
      this.onRemoteStream(peerId, remoteStream);
    };

    // Handle ICE candidates - log them for debugging
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate:', event.candidate);
      }
    };

    // Handle connection state changes
    connection.onconnectionstatechange = () => {
      console.log('Connection state:', connection.connectionState);
      if (connection.connectionState === 'disconnected' || 
          connection.connectionState === 'failed' ||
          connection.connectionState === 'closed') {
        this.onPeerDisconnected(peerId);
        this.peers.delete(peerId);
      }
    };

    const peer: PeerConnection = { peerId, connection };
    this.peers.set(peerId, peer);
    return peer;
  }

  async connectToPeer(peerId: string): Promise<void> {
    const peer = this.createPeerConnection(peerId);
    
    const offer = await peer.connection.createOffer();
    await peer.connection.setLocalDescription(offer);

    console.log('Created offer for peer:', peerId);
  }

  disconnect(): void {
    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    // Close all peer connections
    this.peers.forEach(peer => {
      peer.connection.close();
    });
    this.peers.clear();
  }

  getLocalStream(): MediaStream | null {
    return this.screenStream || this.localStream;
  }

  isScreenSharing(): boolean {
    return this.screenStream !== null;
  }
}
