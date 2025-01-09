"use client"
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Mic, Video, PhoneOff, Share2, Settings, Users, MicOff, VideoOff, ScreenShare, ScreenShareOff } from 'lucide-react';

import {
  useRoom,
  useLocalScreenShare,
  useLocalVideo,
  usePeerIds,
  useLocalAudio,
} from "@huddle01/react/hooks";
import ShowPeers from '../components/ShowPeers';

const MeetPage = () => {
  const { 'meet-code': meetCode } = useParams(); //roomId

  const videoRef  = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);

  const { joinRoom, leaveRoom } = useRoom({
    onPeerJoin: (peer) => {
      console.log("peer joined: ", peer);
    },
    onPeerLeft: (peer) => {
      console.log("peer left: ", peer);
    },
    onJoin: () => {console.log("Joined the room id: ", meetCode)},
    onLeave: () => {console.log("Left the room id: ", meetCode)},
  });

  const { stream, enableVideo, disableVideo,isVideoOn } = useLocalVideo();
  const { enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { startScreenShare, stopScreenShare, shareStream } = useLocalScreenShare();
  const { peerIds } = usePeerIds();

  peerIds.map((peerId) => {
    console.log(peerId);
  });
  //video sharing
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  //screen sharing
  useEffect(() => {
    if (shareStream && screenRef.current) {
      screenRef.current.srcObject = shareStream;
    }
  }, [shareStream]);

  console.log("meetcode recieved: ", meetCode);
  

  return (
    // <div>
    //   <h1>Meet Page</h1>
    //   <p>Meet Code: {meetCode}</p>
    // </div>

    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto p-4 h-screen flex flex-col">
        {/* Video */}
        <div className="flex-1 mb-20">
          {/* Video Component */}
          <div className="relative w-full h-full bg-secondary rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex-1 justify-between items-center flex flex-col">
              <div className="relative flex place-items-center before:absolute before:size-80 before:-translate-x-1/2  before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3  after:content-[''] before:lg:h-[360px]">
                <div className="relative flex gap-2">
                  {isVideoOn ? (
                    <div className="w-1/2 mx-auto border-2 rounded-xl border-blue-400">
                      <video
                        ref={videoRef}
                        className="aspect-video rounded-xl"
                        autoPlay
                        muted
                      />
                    </div>
                  ) : (
                    <div className="size-[300px] flex items-center justify-center mx-auto border-2 rounded-xl border-blue-400">
                      No videos turned on
                    </div>
                  )}
                  {shareStream && (
                    <div className="w-1/2 mx-auto border-2 rounded-xl border-blue-400">
                      <video
                        ref={screenRef}
                        className="aspect-video rounded-xl"
                        autoPlay
                        muted
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 mb-10 grid gap-2 text-center">
                {peerIds.map((peerId) =>
                  peerId ? <ShowPeers key={peerId} peerId={peerId} /> : null
                )}
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Control Bar */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 p-4 rounded-full bg-blue-400/10 backdrop-blur-sm">
        {/* <button
            onClick={getRoomId}
            type="button"
            className="bg-blue-500 p-2 rounded-md"
          >
            Get room id
          </button>
        <input
          onChange={(e) => {
            setRoomId(e.target.value);
          }}
          value={roomId}
          className="text-black mx-auto w-[200px] rounded p-2"
        />
        <button
            onClick={async () => {
              const tokenData = await getAccessTokenData({
                roomId,
                role: Role.HOST,
              });
              joinRoom({
                roomId: roomId,
                token: tokenData,
              });
              console.log("Joined as Host");
            }}
            type="button"
            className="bg-blue-500 p-2 rounded-md"
          >
            Join as Host
          </button>
          <button
            onClick={async () => {
              const tokenData = await getAccessTokenData({
                roomId,
                role: Role.GUEST,
              });
              joinRoom({
                roomId: roomId,
                token: tokenData,
              });
            }}
            type="button"
            className="bg-blue-500 p-2 rounded-md"
          >
            Join as Guest
          </button>
         */}
          <button
            type="button"
            className="p-3 hover:bg-muted rounded-full transition-colors"
            onClick={async () => {
              isAudioOn ? await disableAudio() : await enableAudio();
            }}
          >
            {isAudioOn ?  <Mic className="h-6 w-6 text-secondary-foreground" /> : <MicOff className="h-6 w-6 text-secondary-foreground" />}
          </button>
          <button
            type="button"
            className="p-3 hover:bg-muted rounded-full transition-colors"
            onClick={() => {
              isVideoOn ? disableVideo() : enableVideo();
            }}
          >
            {isVideoOn ? <Video className="h-6 w-6 text-secondary-foreground" /> : <VideoOff className="h-6 w-6 text-secondary-foreground" />}
          </button>
          <button
          onClick={leaveRoom}
          type="button"
          className="p-3 bg-destructive hover:bg-destructive/80 rounded-full transition-colors"
        >
          <PhoneOff className="h-6 w-6 text-destructive-foreground" />
        </button>
          <button
            type="button"
            className="p-3 hover:bg-muted rounded-full transition-colors"
            onClick={() => {
              shareStream ? stopScreenShare() : startScreenShare();
            }}
          >
            {shareStream ? <ScreenShare className="h-6 w-6 text-secondary-foreground" /> : <ScreenShareOff className="h-6 w-6 text-secondary-foreground" />}
          </button>
          <button className="p-3 hover:bg-muted rounded-full transition-colors">
            <Users className="h-6 w-6 text-secondary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetPage;