"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@huddle01/server-sdk/auth";
import { getAccessToken } from "../../actions/getAccessToken";
import { createRoom } from "../../actions/createRoom";

import { useRoom } from "@huddle01/react";

export default function Home() {
  const router = useRouter();//for navigation
  const [roomId, setRoomId] = useState("");

  const { joinRoom, leaveRoom } = useRoom({
    onJoin: () => {
      console.log("Joined the room");
    },
    onPeerJoin: (peer) => {
      console.log("peer joined: ", peer);
    },
  });

  //create a room for a person to join
  const getRoomId = async () => {
    const roomIdentifier = await createRoom();
    setRoomId(roomIdentifier as string);
  };

  //join a room
  const getAccessTokenData = async (
    { roomId, role }: { roomId: string; role: Role }
  ) => {
    const tokenData = await getAccessToken({ roomId, role });
    return tokenData;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-sky-100">
      <h1 className="text-9xl text-blue-500 font-bold">Meet</h1>
      <div className="container p-16 flex items-center">
        <div className="flex flex-col items-center justify-center border-r-2 p-5 border-blue-900 w-full h-full">
          <input type="text" id="meetcode" className="w-5/12 m-5 p-2 text-blue-900" placeholder="Enter meeting code"/>
          <button
            onClick={async () => {
              const input = document.getElementById("meetcode")  as HTMLInputElement;
              console.log(input.value as string);
              
              setRoomId(input.value as string);
              const tokenData = await getAccessTokenData({ roomId, role: Role.GUEST });
              joinRoom({ roomId: roomId, token: tokenData });
              router.push(`/${roomId}`);
            }}
            type="button"
            className="bg-blue-500 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold"
          >
            Join Meet
          </button>
        </div>
        <div className="flex flex-col items-center justify-center border-l-2 p-5 border-blue-900 w-full h-full">
          <p className="text-blue-900 text-2xl p-5">Start a new meet with your friends</p>
          <button
            onClick={async () => {
              await getRoomId();//set a roomId
              const tokenData = await getAccessTokenData({ roomId, role: Role.HOST });
              console.log("Joined as Host with id:", tokenData);
              router.push(`/${roomId}`);
            }}
            type="button"
            className="bg-blue-500 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold"
          >
            Create a New Meet
          </button>
        </div>
      </div>
    </div>
  );
}
