import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Monitor, Camera, Volume2, Settings } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, SOCKET_URL } from '@/config/env';

interface VideoCallProps {
    roomName: string;
}

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ]
};

export default function VideoCall({ roomName }: VideoCallProps) {
    const { data: session } = useSession();
    const router = useRouter();

    const [callSession, setCallSession] = useState<any>(null);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [callStarted, setCallStarted] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('Initializing...');

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const callTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchCallSession();
        initializeSocket();

        return () => {
            cleanup();
        };
    }, [roomName]);

    const initializeSocket = () => {
        socketRef.current = io(SOCKET_URL);

        socketRef.current.on('connect', () => {
            console.log('Socket connected');
        });

        socketRef.current.on('user_joined_call', async ({ userId }) => {
            console.log('User joined, creating offer');
            setStatus('User joined, connecting...');
            createOffer();
        });

        socketRef.current.on('receive_call_offer', async ({ offer, from }) => {
            console.log('Received offer');
            setStatus('Receiving call...');
            await handleOffer(offer);
        });

        socketRef.current.on('receive_call_answer', async ({ answer }) => {
            console.log('Received answer');
            setStatus('Call connected!');
            await handleAnswer(answer);
        });

        socketRef.current.on('receive_ice_candidate', async ({ candidate }) => {
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        socketRef.current.on('user_left_call', () => {
            setStatus('User left the call');
            endCall();
        });
    };

    const fetchCallSession = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/calls/${roomName}`, {
                headers: { 'x-user-email': session?.user?.email || '' }
            });

            if (response.ok) {
                const data = await response.json();
                setCallSession(data.callSession);
                setLoading(false);
            } else {
                router.push('/');
            }
        } catch (err) {
            console.error('Failed to fetch call session:', err);
            router.push('/');
        }
    };

    const startLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            localStreamRef.current = stream;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            createPeerConnection();

            // Add tracks to PeerConnection
            stream.getTracks().forEach(track => {
                if (peerConnectionRef.current) {
                    peerConnectionRef.current.addTrack(track, stream);
                }
            });

            // Notify server call started
            await fetch(`${API_BASE_URL}/api/calls/${roomName}/start`, {
                method: 'POST',
                headers: { 'x-user-email': session?.user?.email || '' }
            });

            setCallStarted(true);
            startCallTimer();

            // Join signal room
            if (socketRef.current && session?.user) {
                socketRef.current.emit('join_call', { roomId: roomName, userId: session.user.name });
            }

        } catch (err) {
            console.error('Failed to access camera/microphone:', err);
            alert('Please allow camera and microphone access to start the call.');
        }
    };

    const createPeerConnection = () => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('ice_candidate', {
                    roomId: roomName,
                    candidate: event.candidate
                });
            }
        };

        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        peerConnectionRef.current = pc;
    };

    const createOffer = async () => {
        if (!peerConnectionRef.current) return;

        try {
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);

            if (socketRef.current) {
                socketRef.current.emit('call_offer', {
                    roomId: roomName,
                    offer
                });
            }
        } catch (err) {
            console.error('Error creating offer:', err);
        }
    };

    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
        if (!peerConnectionRef.current) createPeerConnection(); // Ensure PC exists

        if (!peerConnectionRef.current) return;

        try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);

            if (socketRef.current) {
                socketRef.current.emit('call_answer', {
                    roomId: roomName,
                    answer
                });
            }
        } catch (err) {
            console.error('Error handling offer:', err);
        }
    };

    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
        if (!peerConnectionRef.current) return;
        try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
            console.error('Error handling answer:', err);
        }
    };

    const startCallTimer = () => {
        callTimerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOn(videoTrack.enabled);
            }
        }
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioOn(audioTrack.enabled);
            }
        }
    };

    const endCall = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/calls/${roomName}/end`, {
                method: 'POST',
                headers: { 'x-user-email': session?.user?.email || '' }
            });

            cleanup();
            router.push('/calls');
        } catch (err) {
            console.error('Failed to end call:', err);
        }
    };

    const cleanup = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-love-rose/20 to-love-crimson/20">
                <div className="w-12 h-12 border-4 border-love-rose border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const otherParticipant = callSession?.participants?.find(
        (p: any) => p.username !== session?.user?.name
    );

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-6">
                <div className="flex justify-between items-center">
                    <div className="text-white">
                        <h2 className="text-xl font-bold">{otherParticipant?.alias || 'Call'}</h2>
                        {callStarted && (
                            <p className="text-sm text-white/70">
                                {status === 'Call connected!' ? formatDuration(callDuration) : status}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm">
                            {callSession?.callType === 'video' ? '📹 Video Call' : '🎙️ Audio Call'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Area */}
            <div className="flex-1 relative">
                {/* Remote Video (Full Screen) */}
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                    {callStarted ? (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-center">
                            <div className="w-32 h-32 bg-love-rose/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <span className="text-6xl">{otherParticipant?.mood || '👤'}</span>
                            </div>
                            <p className="text-white text-xl mb-2">{otherParticipant?.alias}</p>
                            <p className="text-white/60">Waiting to connect...</p>
                        </div>
                    )}
                </div>

                {/* Local Video (Picture in Picture) */}
                {callStarted && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-6 right-6 w-64 h-48 bg-gray-800 rounded-2xl overflow-hidden shadow-2xl z-20"
                    >
                        {isVideoOn ? (
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-cover mirror"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                <VideoOff className="w-12 h-12 text-white/50" />
                            </div>
                        )}
                        <div className="absolute bottom-2 left-2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
                            You
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-8">
                <div className="max-w-2xl mx-auto">
                    {!callStarted ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startLocalStream}
                            className="w-full py-6 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-xl shadow-2xl flex items-center justify-center gap-3 transition-all"
                        >
                            <Video className="w-8 h-8" />
                            Start Call
                        </motion.button>
                    ) : (
                        <div className="flex justify-center items-center gap-4">
                            {/* Video Toggle */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleVideo}
                                className={`
                                    w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg
                                    ${isVideoOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'}
                                `}
                            >
                                {isVideoOn ? (
                                    <Video className="w-7 h-7 text-white" />
                                ) : (
                                    <VideoOff className="w-7 h-7 text-white" />
                                )}
                            </motion.button>

                            {/* Audio Toggle */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleAudio}
                                className={`
                                    w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg
                                    ${isAudioOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'}
                                `}
                            >
                                {isAudioOn ? (
                                    <Mic className="w-7 h-7 text-white" />
                                ) : (
                                    <MicOff className="w-7 h-7 text-white" />
                                )}
                            </motion.button>

                            {/* End Call */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={endCall}
                                className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all shadow-2xl"
                            >
                                <PhoneOff className="w-9 h-9 text-white" />
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .mirror {
                    transform: scaleX(-1);
                }
            `}</style>
        </div>
    );
}
