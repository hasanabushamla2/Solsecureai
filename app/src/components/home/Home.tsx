import CoinMetal from "../three/design";
import Hero from "./Hero";

export default function Home() {
  return (
    <div className="container gap-5">
      <Hero />
      <div className=" flex justify-center">
        {" "}
        <CoinMetal logoSrc="/emblem.svg" logoScale={0.5} />
      </div>
    </div>
  );
}
