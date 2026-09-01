import LoginGate from "@/components/auth/login-gate";
import { createClient } from "@/libs/db/server";

export default async function PrivateLayout({
  children,
}: Pick<LayoutProps<"/">, "children">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <LoginGate isAuthenticated={user !== null}>{children}</LoginGate>;
}
