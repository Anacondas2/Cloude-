"use client";

interface Props {
  className?: string;
  label?: string;
}

const SHARE_TEXT =
  "Проверь, кто где был 🌍 Выбери свои страны и посмотри результаты группы.";

export function TelegramShareButton({ className = "", label = "Поделиться в Telegram" }: Props) {
  const handleShare = () => {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      appUrl
    )}&text=${encodeURIComponent(SHARE_TEXT)}`;

    const tg = (typeof window !== "undefined" && (window as any).Telegram?.WebApp) || null;
    if (tg?.openTelegramLink) tg.openTelegramLink(url);
    else window.open(url, "_blank");
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-[#229ED9] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_28px_-8px_rgba(34,158,217,0.7)] transition active:scale-95 ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.94 4.3 18.6 19.1c-.25 1.1-.92 1.37-1.86.85l-5.13-3.78-2.48 2.39c-.27.27-.5.5-1.03.5l.37-5.22 9.5-8.58c.41-.37-.09-.57-.64-.2L5.34 12.9l-5.06-1.58c-1.1-.34-1.12-1.1.23-1.63l19.78-7.62c.92-.34 1.72.2 1.65 1.23z" />
      </svg>
      {label}
    </button>
  );
}
