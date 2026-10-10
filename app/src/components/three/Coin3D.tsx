"use client";

import dynamic from "next/dynamic";

const CoinMetal = dynamic(() => import("@/components/three/design"), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-[400px] aspect-square" />
  ),
});

export default CoinMetal;