"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  useRoom,
  useLocalScreenShare,
  useLocalVideo,
  usePeerIds,
  useLocalAudio,
} from "@huddle01/react/hooks";
import { Role } from "@huddle01/server-sdk/auth";
import { getAccessToken } from "../../../actions/getAccessToken";
import ShowPeers from "../components/ShowPeers";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  Pin,
} from "lucide-react";

const MeetPage = () => {
  const { "meet-code": meetCode } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [pinnedPeer, setPinnedPeer] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);

  const { joinRoom, leaveRoom } = useRoom({
    onJoin: () => {
      console.log("Joined the room");
      setIsInitialized(true);
    },
    onLeave: () => {
      console.log("Left the room");
      router.push("/");
    },
    onPeerJoin: (peer) => {
      console.log("peer joined:", peer);
    },
  });

  const { stream, enableVideo, disableVideo, isVideoOn } = useLocalVideo();
  const { enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { startScreenShare, stopScreenShare, shareStream } = useLocalScreenShare();
  const { peerIds } = usePeerIds();

  // Initialize room connection
  useEffect(() => {
    const initializeRoom = async () => {
      if (meetCode && !isInitialized) {
        try {
          const role = searchParams.get('role') === 'host' ? Role.HOST : Role.GUEST;
          setIsHost(role === Role.HOST);

          const tokenData = await getAccessToken({ 
            roomId: meetCode as string, 
            role: role
          });
          
          if (tokenData) {
            await joinRoom({ 
              roomId: meetCode as string, 
              token: tokenData 
            });
          }
        } catch (error) {
          console.error("Error initializing room:", error);
          router.push("/");
        }
      }
    };

    initializeRoom();
  }, [meetCode, isInitialized, joinRoom, router, searchParams]);

  // Handle video streams
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (shareStream && screenRef.current) {
      screenRef.current.srcObject = shareStream;
    }
  }, [shareStream]);

  // Filter out invalid peer IDs
  const validPeerIds = useMemo(() => 
    peerIds.filter((peerId): peerId is string => Boolean(peerId)),
    [peerIds]
  );

  const handlePinPeer = useCallback((peerId: string) => {
    if (shareStream) return; // Don't allow pinning when screen is shared
    setPinnedPeer(prevPinnedPeer => prevPinnedPeer === peerId ? null : peerId);
  }, [shareStream]);

  const renderLocalVideo = useCallback(() => (
    <div className={`relative rounded-xl overflow-hidden ${shareStream ? 'h-24' : 'h-full'}`}>
      {isVideoOn ? (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
          No video
        </div>
      )}
      <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
        You {isHost ? '(Host)' : '(Guest)'}
      </div>
    </div>
  ), [isVideoOn, isHost, shareStream]);

  const renderPeers = useCallback(() => {
    if (!validPeerIds.length) return null;

    return validPeerIds.map((peerId) => (
      <div 
        key={peerId}
        className={`relative rounded-xl overflow-hidden ${shareStream || pinnedPeer ? 'h-24' : 'h-full'}`}
      >
        <ShowPeers peerId={peerId} />
        {!shareStream && (
          <button
            onClick={() => handlePinPeer(peerId)}
            className="absolute top-2 right-2 p-2 bg-black/50 rounded-full"
          >
            <Pin className={`h-4 w-4 ${pinnedPeer === peerId ? 'text-blue-500' : 'text-white'}`} />
          </button>
        )}
      </div>
    ));
  }, [validPeerIds, pinnedPeer, handlePinPeer, shareStream]);

  const toggleAudio = useCallback(() => {
    isAudioOn ? disableAudio() : enableAudio();
  }, [isAudioOn, disableAudio, enableAudio]);

  const toggleVideo = useCallback(() => {
    isVideoOn ? disableVideo() : enableVideo();
  }, [isVideoOn, disableVideo, enableVideo]);

  const toggleScreenShare = useCallback(() => {
    if (shareStream) {
      stopScreenShare();
      setPinnedPeer(null);
    } else {
      startScreenShare();
    }
  }, [shareStream, stopScreenShare, startScreenShare]);

  return (
    <div className="h-screen bg-secondary overflow-hidden">
      <div className="container h-full mx-auto p-4 flex flex-col max-h-screen">
        {/* Main content area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Shared screen or pinned peer */}
          {(shareStream || pinnedPeer) && (
            <div className="absolute top-0 left-0 right-0 h-3/4 p-2">
              <div className="w-full h-full rounded-xl overflow-hidden border-2 border-blue-400">
                {shareStream ? (
                  <video
                    ref={screenRef}
                    className="w-full h-full object-contain bg-black"
                    autoPlay
                    muted
                  />
                ) : pinnedPeer ? (
                  <div className="w-full h-full">
                    <ShowPeers peerId={pinnedPeer} />
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Bottom row for all participants */}
          <div className={`absolute ${shareStream || pinnedPeer ? 'bottom-0 h-1/4' : 'inset-0'} w-full p-2`}>
            <div className={`grid gap-2 h-full ${
              shareStream || pinnedPeer 
                ? 'grid-flow-col auto-cols-fr'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
              {renderLocalVideo()}
              {renderPeers()}
            </div>
          </div>
        </div>

        {/* Control Bar */}
        <div className="mt-4 flex justify-center mb-2">
          <div className="flex items-center gap-4 p-4 rounded-full bg-blue-400/10 backdrop-blur-sm">
            <button
              type="button"
              className="p-3 hover:bg-muted rounded-full transition-colors"
              onClick={toggleAudio}
            >
              {isAudioOn ? (
                <Mic className="h-6 w-6 text-secondary-foreground" />
              ) : (
                <MicOff className="h-6 w-6 text-secondary-foreground" />
              )}
            </button>
            <button
              type="button"
              className="p-3 hover:bg-muted rounded-full transition-colors"
              onClick={toggleVideo}
            >
              {isVideoOn ? (
                <Video className="h-6 w-6 text-secondary-foreground" />
              ) : (
                <VideoOff className="h-6 w-6 text-secondary-foreground" />
              )}
            </button>
            <button
              type="button"
              className="p-3 hover:bg-muted rounded-full transition-colors"
              onClick={toggleScreenShare}
            >
              {shareStream ? (
                <ScreenShare className="h-6 w-6 text-secondary-foreground" />
              ) : (
                <ScreenShareOff className="h-6 w-6 text-secondary-foreground" />
              )}
            </button>
            <button
              onClick={() => {
                leaveRoom();
                router.push("/");
              }}
              type="button"
              className="p-3 bg-destructive hover:bg-destructive/80 rounded-full transition-colors"
            >
              <PhoneOff className="h-6 w-6 text-destructive-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetPage;
//done