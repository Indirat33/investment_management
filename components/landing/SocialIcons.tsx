import React from "react";

export interface SocialLinkItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  hoverColor: string;
  bgHoverColor: string;
}

export const defaultSocialLinks: SocialLinkItem[] = [
  {
    name: "X (Twitter)",
    href: "https://twitter.com",
    hoverColor: "hover:text-sky-400",
    bgHoverColor: "hover:bg-slate-800 hover:border-sky-500/40 hover:text-sky-400",
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    hoverColor: "hover:text-blue-500",
    bgHoverColor: "hover:bg-slate-800 hover:border-blue-500/40 hover:text-blue-400",
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.67 1.67 0 0 0-1.67 1.67 1.67 1.67 0 0 0 1.67 1.67 1.67 1.67 0 0 0 1.67-1.67 1.67 1.67 0 0 0-1.67-1.67z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://facebook.com",
    hoverColor: "hover:text-blue-600",
    bgHoverColor: "hover:bg-slate-800 hover:border-blue-600/40 hover:text-blue-500",
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    hoverColor: "hover:text-pink-500",
    bgHoverColor: "hover:bg-slate-800 hover:border-pink-500/40 hover:text-pink-400",
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
];

interface SocialIconsProps {
  className?: string;
  itemClassName?: string;
  variant?: "minimal" | "button" | "pill";
  size?: "sm" | "md" | "lg";
  links?: SocialLinkItem[];
}

export default function SocialIcons({
  className = "flex items-center gap-3",
  itemClassName = "",
  variant = "button",
  size = "md",
  links = defaultSocialLinks,
}: SocialIconsProps) {
  const iconSizeClasses = {
    sm: "[&_svg]:w-4 [&_svg]:h-4",
    md: "[&_svg]:w-5 [&_svg]:h-5",
    lg: "[&_svg]:w-6 [&_svg]:h-6",
  };

  const buttonSizeClasses = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-10 w-10 rounded-xl",
    lg: "h-12 w-12 rounded-xl text-base",
  };

  const pillSizeClasses = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3.5 py-1.5 text-xs",
    lg: "px-4 py-2 text-sm",
  };

  return (
    <div className={`${className} ${iconSizeClasses[size]}`}>
      {links.map((item) => {
        if (variant === "minimal") {
          return (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              title={`Visit our ${item.name}`}
              aria-label={item.name}
              className={`text-slate-400 transition-colors duration-200 hover:-translate-y-0.5 transform ${item.hoverColor} ${itemClassName}`}
            >
              {item.icon}
            </a>
          );
        }

        if (variant === "pill") {
          return (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              title={`Visit our ${item.name}`}
              aria-label={item.name}
              className={`inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/80 font-medium text-slate-300 transition-all duration-200 hover:-translate-y-0.5 ${pillSizeClasses[size]} ${item.bgHoverColor} ${itemClassName}`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.name}</span>
            </a>
          );
        }

        // Default: "button" (rounded square badge)
        return (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Visit our ${item.name}`}
            aria-label={item.name}
            className={`inline-flex items-center justify-center border border-slate-800 bg-slate-900 text-slate-300 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${buttonSizeClasses[size]} ${item.bgHoverColor} ${itemClassName}`}
          >
            {item.icon}
          </a>
        );
      })}
    </div>
  );
}
