export type SocialProvider = "kakao" | "google";

type SocialLoginIconProps = {
  provider: SocialProvider;
};

export default function SocialLoginIcon({
  provider,
}: SocialLoginIconProps) {
  if (provider === "kakao") {
    return (
      <svg
        aria-hidden="true"
        className="size-5 shrink-0"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3.75c-5.108 0-9.25 3.034-9.25 6.777 0 2.482 1.72 4.66 4.3 5.86-.14.88-.56 2.36-.7 2.86-.1.47.17.46.38.32.17-.11 2.6-1.76 3.05-2.04.71.11 1.45.17 2.22.17 5.108 0 9.25-3.034 9.25-6.777S17.108 3.75 12 3.75Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M117.6 61.364c0-4.255-.382-8.345-1.091-12.273H60v23.21h32.291c-1.391 7.5-5.618 13.855-11.973 18.109v15.055h19.391c11.345-10.445 17.891-25.827 17.891-44.1Z"
        fill="#4285F4"
      />
      <path
        d="M60 120c16.2 0 29.782-5.373 39.709-14.536L80.318 90.409c-5.373 3.6-12.245 5.727-20.318 5.727-15.627 0-28.855-10.555-33.573-24.736H6.382v15.545C16.255 106.555 36.545 120 60 120Z"
        fill="#34A853"
      />
      <path
        d="M26.427 71.4C25.227 67.8 24.545 63.955 24.545 60s.682-7.8 1.882-11.4V33.055H6.382C2.318 41.155 0 50.318 0 60s2.318 18.845 6.382 26.945L26.427 71.4Z"
        fill="#FBBC05"
      />
      <path
        d="M60 23.864c8.809 0 16.718 3.027 22.936 8.973l17.209-17.209C89.755 5.945 76.173 0 60 0 36.545 0 16.255 13.445 6.382 33.055L26.427 48.6C31.145 34.418 44.373 23.864 60 23.864Z"
        fill="#EA4335"
      />
    </svg>
  );
}
