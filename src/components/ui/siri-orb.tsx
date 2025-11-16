"use client"

import { cn } from "@/lib/utils"

interface SiriOrbProps {
  size?: string
  className?: string
  colors?: {
    bg?: string
    c1?: string
    c2?: string
    c3?: string
  }
  animationDuration?: number
  isActive?: boolean
}

const SiriOrb: React.FC<SiriOrbProps> = ({
  size = "64px",
  className,
  colors,
  animationDuration = 20,
  isActive = true,
}) => {
  const defaultColors = {
    bg: "transparent",
    c1: "#E74C3C",  // Stellar Orange (primary)
    c2: "#FF9A76",  // Peach (harmonious)
    c3: "#FFC5BF",  // Soft Rose (gentle accent)
  }

  const finalColors = { ...defaultColors, ...colors }
  const sizeValue = parseInt(size.replace("px", ""), 10)

  const blurAmount = Math.max(sizeValue * 0.08, 8)
  const contrastAmount = Math.max(sizeValue * 0.003, 1.8)

  return (
    <div
      className={cn("siri-orb rounded-full relative overflow-hidden", className)}
      style={
        {
          width: size,
          height: size,
          display: "grid",
          gridTemplateAreas: '"stack"',
          background: `radial-gradient(circle, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.03) 30%, transparent 70%)`,
          "--bg": finalColors.bg,
          "--c1": finalColors.c1,
          "--c2": finalColors.c2,
          "--c3": finalColors.c3,
          "--animation-duration": `${animationDuration}s`,
          "--blur-amount": `${blurAmount}px`,
          "--contrast-amount": contrastAmount,
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          gridArea: "stack",
          background: `
            conic-gradient(from calc(var(--angle, 0deg) * 1.2) at 30% 65%, var(--c3) 0deg, transparent 45deg 315deg, var(--c3) 360deg),
            conic-gradient(from calc(var(--angle, 0deg) * 0.8) at 70% 35%, var(--c2) 0deg, transparent 60deg 300deg, var(--c2) 360deg),
            conic-gradient(from calc(var(--angle, 0deg) * -1.5) at 65% 75%, var(--c1) 0deg, transparent 90deg 270deg, var(--c1) 360deg),
            conic-gradient(from calc(var(--angle, 0deg) * 2.1) at 25% 25%, var(--c2) 0deg, transparent 30deg 330deg, var(--c2) 360deg),
            conic-gradient(from calc(var(--angle, 0deg) * -0.7) at 80% 80%, var(--c1) 0deg, transparent 45deg 315deg, var(--c1) 360deg),
            radial-gradient(ellipse 120% 80% at 40% 60%, var(--c3) 0%, transparent 50%)
          `,
          filter: `blur(${blurAmount}px) contrast(${contrastAmount}) saturate(1.5) brightness(1.1)`,
          animation: isActive ? `siriOrbRotate ${animationDuration}s linear infinite` : "none",
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          gridArea: "stack",
          background: `radial-gradient(circle at 45% 55%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 30%, transparent 60%)`,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  )
}

export default SiriOrb