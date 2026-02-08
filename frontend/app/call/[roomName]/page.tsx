'use client';

import { useParams } from 'next/navigation';
import VideoCall from '@/components/calls/VideoCall';

export default function CallPage() {
    const params = useParams();
    const roomName = params.roomName as string;

    return <VideoCall roomName={roomName} />;
}
