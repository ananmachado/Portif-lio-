import { trpc } from "@/lib/trpc";
import { signOut } from "@/lib/supabaseAuth";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const utils = trpc.useUtils();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
      setIsLoggingOut(false);
    }
  }, [utils]);

  const state = useMemo(
    () => ({
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || isLoggingOut,
      error: meQuery.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    }),
    [meQuery.data, meQuery.error, meQuery.isLoading, isLoggingOut],
  );

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (state.loading || state.user) return;
    if (typeof window === "undefined") return;

    const destination = redirectPath || "/admin-login";
    if (window.location.pathname === destination) return;
    window.location.href = destination;
  }, [redirectOnUnauthenticated, redirectPath, state.loading, state.user]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
