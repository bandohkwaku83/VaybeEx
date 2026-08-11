"use client";

import { useGoogleOAuth } from "@react-oauth/google";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getGoogleClientId } from "@/components/auth/google-auth-provider";
import { cn } from "@/lib/utils";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (
            momentListener?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              isDismissedMoment: () => boolean;
            }) => void
          ) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  /** Called with the Google ID token (JWT), not an access token. */
  onCredential: (idToken: string) => void | Promise<void>;
  disabled?: boolean;
  label?: string;
  className?: string;
}

function requestGoogleIdToken(clientId: string, host: HTMLElement) {
  return new Promise<string>((resolve, reject) => {
    const google = window.google?.accounts?.id;
    if (!google) {
      reject(new Error("Google sign-in is still loading. Try again in a moment."));
      return;
    }

    let settled = false;
    const timeout = window.setTimeout(() => {
      finish(undefined, new Error("Google sign-in timed out. Please try again."));
    }, 120_000);

    const finish = (credential?: string, error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      if (credential) resolve(credential);
      else reject(error ?? new Error("Google sign-in was cancelled."));
    };

    google.initialize({
      client_id: clientId,
      callback: (response) => finish(response.credential),
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    google.prompt((notification) => {
      if (
        notification.isNotDisplayed() ||
        notification.isSkippedMoment() ||
        notification.isDismissedMoment()
      ) {
        host.innerHTML = "";
        google.renderButton(host, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: 320,
        });
        const btn = host.querySelector('div[role="button"]') as HTMLElement | null;
        if (btn) btn.click();
        else finish(undefined, new Error("Google sign-in unavailable."));
      }
    });
  });
}

function GoogleSignInButtonInner({
  onCredential,
  disabled,
  label = "Continue with Google",
  className,
}: GoogleSignInButtonProps) {
  const { scriptLoadedSuccessfully } = useGoogleOAuth();
  const [busy, setBusy] = useState(false);
  const hiddenHostRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(async () => {
    const clientId = getGoogleClientId();
    if (!clientId) {
      toast.error("Google sign-in is not configured.");
      return;
    }
    if (!scriptLoadedSuccessfully || !hiddenHostRef.current) {
      toast.error("Google sign-in is still loading. Try again in a moment.");
      return;
    }

    setBusy(true);
    try {
      const idToken = await requestGoogleIdToken(clientId, hiddenHostRef.current);
      await onCredential(idToken);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Google sign-in failed.";
      if (!/cancelled/i.test(message)) toast.error(message);
    } finally {
      setBusy(false);
      if (hiddenHostRef.current) hiddenHostRef.current.innerHTML = "";
    }
  }, [onCredential, scriptLoadedSuccessfully]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={cn(
          "w-full border-stone-200 bg-white hover:bg-stone-50",
          className
        )}
        onClick={() => void handleClick()}
        disabled={disabled || busy || !scriptLoadedSuccessfully}
      >
        <GoogleIcon className="h-5 w-5" />
        {busy ? "Connecting..." : label}
      </Button>
      <div
        ref={hiddenHostRef}
        aria-hidden
        className="pointer-events-none fixed left-[-9999px] top-0 h-0 w-0 overflow-hidden opacity-0"
      />
    </>
  );
}

function GoogleSignInButtonFallback({
  label = "Continue with Google",
  className,
  disabled,
}: Omit<GoogleSignInButtonProps, "onCredential">) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={cn(
        "w-full border-stone-200 bg-white hover:bg-stone-50",
        className
      )}
      disabled={disabled ?? true}
      onClick={() =>
        toast.error(
          "Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment to enable Google sign-in."
        )
      }
    >
      <GoogleIcon className="h-5 w-5" />
      {label}
    </Button>
  );
}

export function GoogleSignInButton(props: GoogleSignInButtonProps) {
  if (!getGoogleClientId()) {
    return <GoogleSignInButtonFallback {...props} />;
  }
  return <GoogleSignInButtonInner {...props} />;
}
