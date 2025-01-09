"use client";

import React from "react";

import { HuddleClient, HuddleProvider } from "@huddle01/react";

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const huddleClient = new HuddleClient({
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  });

  return (
    <html lang="en">
      <body>
        <HuddleProvider client={huddleClient}>{children}</HuddleProvider>
      </body>
    </html>
  );
}
