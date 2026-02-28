"use client";

interface MemberAvatarProps {
  emoji: string;
  profileImage?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_MAP = {
  sm: { imgSize: 20, textClass: "text-sm" },
  md: { imgSize: 28, textClass: "text-base md:text-lg" },
  lg: { imgSize: 36, textClass: "text-xl md:text-2xl" },
  xl: { imgSize: 48, textClass: "text-2xl md:text-3xl" },
};

export function MemberAvatar({
  emoji,
  profileImage,
  name,
  size = "md",
  className = "",
}: MemberAvatarProps) {
  const { imgSize, textClass } = SIZE_MAP[size];

  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt={name}
        width={imgSize}
        height={imgSize}
        className={`object-contain ${className}`}
        style={{ imageRendering: "pixelated" }}
        draggable={false}
      />
    );
  }

  return <span className={`${textClass} ${className}`}>{emoji}</span>;
}
