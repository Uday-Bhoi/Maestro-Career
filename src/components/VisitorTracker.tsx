"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TRACKER_SESSION_KEY = "maestro-visitor-tracked";

function shouldSkipTracking(pathname: string | null) {
    if (!pathname) {
        return true;
    }

    return pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname.startsWith("/api");
}

export default function VisitorTracker() {
    const pathname = usePathname();

    useEffect(() => {
        if (shouldSkipTracking(pathname)) {
            return;
        }

        try {
            if (window.sessionStorage.getItem(TRACKER_SESSION_KEY) === "1") {
                return;
            }
        } catch {
            // Ignore session storage access errors and still attempt tracking.
        }

        const controller = new AbortController();

        void fetch("/api/analytics/visitor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: pathname }),
            cache: "no-store",
            signal: controller.signal,
        })
            .then((response) => response.json().catch(() => ({})))
            .then((data) => {
                if (data?.success) {
                    try {
                        window.sessionStorage.setItem(TRACKER_SESSION_KEY, "1");
                    } catch {
                        // Ignore storage write failures.
                    }
                }
            })
            .catch(() => {
                // Ignore tracking failures to keep navigation silent.
            });

        return () => controller.abort();
    }, [pathname]);

    return null;
}
