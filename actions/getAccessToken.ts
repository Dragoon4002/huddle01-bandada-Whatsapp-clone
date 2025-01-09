"use server";

import { Role } from "@huddle01/server-sdk/auth";

export const getAccessToken = async ({
  roomId,
  role,
}: {
  roomId: string;
  role: Role;
}) => {
  const response = await fetch(
    `http://localhost:3000/api/token?roomId=${roomId}&role=${role}`
  );

  const token = await response.text();
  console.log(token);
  
  return token;
};