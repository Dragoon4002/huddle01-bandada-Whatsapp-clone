"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@huddle01/server-sdk/auth";
import { getAccessToken } from "../../actions/getAccessToken";
import { createRoom } from "../../actions/createRoom";

import { useRoom } from "@huddle01/react";

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinMeet = async () => {
    if (isJoining) return;
    setIsJoining(true);

    try {
      const input = document.getElementById("meetcode") as HTMLInputElement;
      const meetRoomId = input.value;
      if (!meetRoomId) return;

      // Always join as GUEST when using the join button
      const tokenData = await getAccessToken({ 
        roomId: meetRoomId, 
        role: Role.GUEST 
      });

      if (tokenData) {
        // Pass role information in the URL
        router.push(`/${meetRoomId}?role=guest`);
      }
    } catch (error) {
      console.error("Error joining meet:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateMeet = async () => {
    if (isJoining) return;
    setIsJoining(true);

    try {
      const newRoomId = await createRoom();
      if (!newRoomId) return;

      // Only get HOST token when creating a new room
      const tokenData = await getAccessToken({ 
        roomId: newRoomId as string, 
        role: Role.HOST 
      });

      if (tokenData) {
        // Pass role information in the URL
        router.push(`/${newRoomId}?role=host`);
      }
    } catch (error) {
      console.error("Error creating meet:", error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-sky-100">
      <h1 className="text-9xl text-blue-500 font-bold">Meet</h1>
      <div className="container p-16 flex items-center">
        <div className="flex flex-col items-center justify-center border-r-2 p-5 border-blue-900 w-full h-full">
          <input 
            type="text" 
            id="meetcode" 
            className="w-5/12 m-5 p-2 text-blue-900" 
            placeholder="Enter meeting code"
          />
          <button
            onClick={handleJoinMeet}
            disabled={isJoining}
            type="button"
            className={`bg-blue-500 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold ${
              isJoining ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isJoining ? 'Joining...' : 'Join Meet'}
          </button>
        </div>
        <div className="flex flex-col items-center justify-center border-l-2 p-5 border-blue-900 w-full h-full">
          <p className="text-blue-900 text-2xl p-5">Start a new meet with your friends</p>
          <button
            onClick={handleCreateMeet}
            disabled={isJoining}
            type="button"
            className={`bg-blue-500 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold ${
              isJoining ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isJoining ? 'Creating...' : 'Create a New Meet'}
          </button>
        </div>
      </div>
    </div>
  );
}