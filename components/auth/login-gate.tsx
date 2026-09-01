import type { ReactNode } from "react";

import GuestPreview from "@/components/auth/guest-preview";

type Props = {
  children: ReactNode;
  isAuthenticated: boolean;
};

export default function LoginGate({ children, isAuthenticated }: Props) {
  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      {isAuthenticated ? children : <GuestPreview />}
    </div>
  );
}
