"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  /** Path of your logo inside /public. It is drawn as is, with its original colors. */
  logoSrc?: string;
  /** Logo width as a share of the coin face (0 to 1). */
  logoScale?: number;
};

const R = 1.5; // coin radius
const H = 0.3; // coin thickness
const B = 0.09; // bevel size

function lathe() {
  const p: THREE.Vector2[] = [new THREE.Vector2(0, -H / 2), new THREE.Vector2(R - B, -H / 2)];
  for (let i = 1; i <= 6; i++) {
    const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2);
    p.push(new THREE.Vector2(R - B + Math.cos(a) * B, -H / 2 + B + Math.sin(a) * B));
  }
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    p.push(new THREE.Vector2(R - B + Math.cos(a) * B, H / 2 - B + Math.sin(a) * B));
  }
  p.push(new THREE.Vector2(0, H / 2));
  return new THREE.LatheGeometry(p, 96);
}

function makeEnv(renderer: THREE.WebGLRenderer) {
  const s = new THREE.Scene();
  s.background = new THREE.Color(0x07060d);
  const add = (w: number, h: number, x: number, y: number, z: number, col: number, k: number) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })
    );
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    s.add(m);
  };
  add(8, 3, 0, 6, 2, 0xffffff, 3);
  add(3, 8, -6, 0, 2, 0xb48cff, 3);
  add(3, 8, 6, 0, 2, 0x7dffd0, 3);
  add(8, 2, 0, -5, 3, 0xffffff, 1.5);
  add(6, 6, 0, 0, -7, 0x221a44, 1);
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(s, 0.02).texture;
  pm.dispose();
  return tex;
}

function faceTexture(logo: HTMLImageElement | null, logoScale: number) {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const g = c.getContext("2d")!;
  const bg = g.createRadialGradient(380, 320, 40, 512, 512, 600);
  bg.addColorStop(0, "#4a3a86");
  bg.addColorStop(1, "#1b1438");
  g.fillStyle = bg;
  g.fillRect(0, 0, 1024, 1024);

  g.translate(512, 512);
  g.strokeStyle = "#cdb8ff";
  g.lineWidth = 14;
  g.beginPath();
  g.arc(0, 0, 472, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = 5;
  g.strokeStyle = "rgba(205,184,255,0.55)";
  g.beginPath();
  g.arc(0, 0, 424, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = 6;
  for (let i = 0; i < 72; i++) {
    const t = (i / 72) * Math.PI * 2;
    const r1 = i % 6 === 0 ? 408 : 392;
    g.beginPath();
    g.moveTo(Math.cos(t) * 372, Math.sin(t) * 372);
    g.lineTo(Math.cos(t) * r1, Math.sin(t) * r1);
    g.stroke();
  }

  if (logo) {
    const w = 1024 * logoScale;
    const ratio = logo.naturalWidth && logo.naturalHeight ? logo.naturalHeight / logo.naturalWidth : 1;
    const h = w * ratio;
    g.drawImage(logo, -w / 2, -h / 2, w, h);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export default function CoinMetal({ logoSrc = "/emblem.svg", logoScale = 0.5 }: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let raf = 0;
    let disposed = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    scene.environment = makeEnv(renderer);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, 0, 6.4);

    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(3, 4, 5);
    scene.add(key);

    const group = new THREE.Group();
    const coin = new THREE.Group();
    coin.rotation.x = Math.PI / 2;
    group.add(coin);
    scene.add(group);

    const bodyGeo = lathe();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8d78d8, metalness: 1, roughness: 0.24, envMapIntensity: 1.25 });
    coin.add(new THREE.Mesh(bodyGeo, bodyMat));

    const ringGeo = new THREE.TorusGeometry(R - 0.2, 0.02, 16, 128);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xcdb8ff, metalness: 1, roughness: 0.15 });
    const discGeo = new THREE.CircleGeometry(R - B - 0.02, 96);

    const faceMat = new THREE.MeshStandardMaterial({ metalness: 0.85, roughness: 0.38, envMapIntensity: 1 });
    const top = new THREE.Mesh(discGeo, faceMat);
    top.rotation.x = -Math.PI / 2;
    top.position.y = H / 2 + 0.003;
    const bot = new THREE.Mesh(discGeo, faceMat);
    bot.rotation.set(Math.PI / 2, 0, Math.PI);
    bot.position.y = -H / 2 - 0.003;
    coin.add(top, bot);
    [1, -1].forEach((s) => {
      const t = new THREE.Mesh(ringGeo, ringMat);
      t.rotation.x = Math.PI / 2;
      t.position.y = s * (H / 2 + 0.006);
      coin.add(t);
    });

    const applyFace = (img: HTMLImageElement | null) => {
      if (disposed) return;
      faceMat.map?.dispose();
      faceMat.map = faceTexture(img, logoScale);
      faceMat.needsUpdate = true;
    };
    applyFace(null);
    const img = new Image();
    img.onload = () => applyFace(img);
    img.src = logoSrc;

    const size = () => {
      const w = el.clientWidth || 300;
      renderer.setSize(w, w, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    let visible = true;
    const io = new IntersectionObserver((e) => {
      visible = e[0].isIntersecting;
    });
    io.observe(el);

    const frame = (ms: number) => {
      const t = reduce ? 0.8 : ms / 1000;
      if (visible || reduce) {
        group.rotation.y = reduce ? 0.6 : t * 0.8;
        group.rotation.x = -0.2 + Math.sin(t * 0.6) * 0.08;
        group.position.y = Math.sin(t * 1.2) * 0.07;
        renderer.render(scene, camera);
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      faceMat.map?.dispose();
      bodyGeo.dispose();
      bodyMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      discGeo.dispose();
      faceMat.dispose();
      scene.environment?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [logoSrc, logoScale]);

  return <div ref={host} style={{ width: "100%", maxWidth: 400, aspectRatio: "1" }} />;
}
