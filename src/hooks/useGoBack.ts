import { useRouter } from "@tanstack/react-router";

/** Back that always leaves the page: previous entry when there is one, otherwise the parent screen
 *  (a page opened directly, from a link or a notification, has no history to go back to). */
export function useGoBack(fallback: string) {
  const router = useRouter();
  return () => {
    if (router.history.canGoBack()) router.history.back();
    else router.navigate({ to: fallback, replace: true });
  };
}
