'use client'

import * as React from "react"
import { SwipeableCardStack } from "@/components/ui/tinder-like-swipe"

export default function TinderSwipeDemo() {
  // Demo data that would come from Framer property controls
  const demoProps = {
    images: [
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1462&q=80",
    ],
    rightIcon: "https://uploads-ssl.webflow.com/6226162356726c4835057a73/6232367c3761286ddff6004c_icon-like.svg",
    leftIcon: "https://uploads-ssl.webflow.com/6226162356726c4835057a73/6232367c825de783a6697a3c_icon-dislike.svg",
    borderRadius: 20,
  }

  return (
    // 1. Container for centering and beautiful background
    <div 
      style={{
        display: "grid",
        placeItems: "center",
        width: "100vw",
        height: "100vh",
        background: "#e0e0e0",
      }}
    >
      {/* 2. Wrapper that sets the card size */}
      <div style={{ width: "300px", height: "400px" }}>
        {/* 3. Call the pure component with our demo props */}
        <SwipeableCardStack {...demoProps} />
      </div>
    </div>
  )
}