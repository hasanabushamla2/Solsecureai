import Card from "@/components/home/Card";
import Home from "@/components/home/Home";
import CoinMetal from "@/components/three/design";
import Image from "next/image";

export default function MarketPage() {
  return (
    <>
      <div className="absolute inset-0 z-0 overflow-hidden">
        
          <picture className="block h-full w-full">
            <source
              srcSet="/enhanced/solsecure-hero-2560.avif 2560w,
                    /enhanced/solsecure-hero-4k.avif 3840w"
              sizes="100vw"
              type="image/avif"
            />
            <source
              srcSet="/enhanced/solsecure-hero-2560.webp 2560w,
                    /enhanced/solsecure-hero-4k.webp 3840w"
              sizes="100vw"
              type="image/webp"
            />
            <source
              media="(max-width: 640px) and (orientation: portrait)"
              srcSet="/enhanced/solsecure-hero-portrait-1080x1920.jpg 1080w,
                    /enhanced/solsecure-hero-portrait-1440x2560.jpg 1440w"
              sizes="100vw"
              type="image/jpeg"
            />

            <source
              media="(min-aspect-ratio: 2/1)"
              srcSet="/enhanced/solsecure-hero-ultrawide-3440x1440.jpg 3440w,
                    /enhanced/solsecure-hero-superultrawide-5120x1440.jpg 5120w"
              sizes="100vw"
              type="image/jpeg"
            />

            <img
              src="/enhanced/solsecure-hero-2560.jpg"
              srcSet="/enhanced/solsecure-hero-1080.jpg 1920w,
          /enhanced/solsecure-hero-2560.jpg 2560w,
          /enhanced/solsecure-hero-4k.jpg 3840w"
              sizes="100vw"
              alt=""
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover object-center"
            />
          </picture>
        
      </div>
      <div className="relative z-10">
        <Home />
        <Card />
      </div>
    </>
  );
}
