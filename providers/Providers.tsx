'use client';

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from "framer-motion";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    
    // const [loading, setLoading] = useState(true);
    // const [mounted, setMounted] = useState(false);

    // useEffect(() => {
    //     setMounted(true);
    //     const isMobile = ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth < 768;
    //     const delay = isMobile ? 800 : 1000;

    //     const timer = setTimeout(() => {
    //         setLoading(false);
    //     }, delay);

    //     return () => clearTimeout(timer);
    // }, []);

    // if (!mounted) return;

    return (
        <AnimatePresence mode="sync">
            <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={true} storageKey="nestify-theme">
                <TooltipProvider>
                    <Toaster position="top-center" closeButton={true} />
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                </TooltipProvider>
            </NextThemesProvider>
        </AnimatePresence>
    )

}