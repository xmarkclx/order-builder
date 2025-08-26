"use client";

import React from "react";
import OrdersList from "@/components/orders/OrdersList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function ConfettiOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  const pieces = Array.from({ length: 60 });
  return (
    <>
      <div className="confetti-overlay pointer-events-none fixed inset-0 overflow-hidden z-50">
        {pieces.map((_, i) => {
          const left = Math.random() * 100; // vw%
          const delay = Math.random() * 0.8; // seconds
          const duration = 2.2 + Math.random() * 1.2; // seconds
          const size = 6 + Math.random() * 8; // px
          const hue = Math.floor(Math.random() * 360);
          const rotate = Math.random() * 360;
          const style: React.CSSProperties = {
            left: `${left}vw`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            width: `${size}px`,
            height: `${size * 0.6}px`,
            backgroundColor: `hsl(${hue} 90% 60%)`,
            transform: `rotate(${rotate}deg)`
          };
          return <span key={i} className="confetti-piece" style={style} />;
        })}
      </div>
      <style jsx global>{`
        @keyframes confettiFall {
          0% {
            transform: translate3d(0, -110%, 0) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 1; }
          100% {
            transform: translate3d(0, 110vh, 0) rotate(720deg);
            opacity: 0.9;
          }
        }
        .confetti-overlay { }
        .confetti-piece {
          position: absolute;
          top: -10vh;
          border-radius: 2px;
          display: inline-block;
          animation-name: confettiFall;
          animation-timing-function: ease-in;
          will-change: transform, opacity;
        }
      `}</style>
    </>
  );
}

export default function RecentOrdersPage() {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const flag = localStorage.getItem("orderFinalizedSuccess");
      if (flag === "1") {
        setShowConfetti(true);
        localStorage.removeItem("orderFinalizedSuccess");
        const t = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ConfettiOverlay show={showConfetti} />
      <Card className="w-full max-w-2xl shadow-xl rounded-2xl border border-amber-200">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-gray-900">Recent Orders</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Orders you have finalized will appear here.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <OrdersList />

          <div className="pt-4">
            <Button onClick={() => router.push("/")} className="w-full" size="lg">
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
