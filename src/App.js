import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

/*
  Cara pakai:
  1) npx create-react-app my-hbd
  2) cd my-hbd && npm install framer-motion
  3) Simpan file ini sebagai src/App.jsx
  4) Jalankan npm start
*/

const GOJO_SRC = "/JADI.png"; // sesuaikan path
const SURPRISE_MEDIA = "/gojo1.jpg"; // bisa mp4 atau jpg

const RED_MESSAGES = [
  "Mama sayang kakak 💗",
  "Selamat ulang tahun kak 🍰",
  "Teteh sayang kakak",
];
const BLUE_MESSAGES = [
  "Dede sayang kakak ✨",
  "PAPA sayang kakak☀️",
  "Ikuti petunjuk untuk melanjutkan...",
];

function rnd(min, max) {
  return Math.random() * (max - min) + min;
}

// inject CSS sekali saja
const css = `
/* …(CSS panjang sama seperti kode kamu di atas)… */
`;
(function inject() {
  if (typeof document === "undefined") return;
  if (document.getElementById("hbd-styles")) return;
  const s = document.createElement("style");
  s.id = "hbd-styles";
  s.innerHTML = css;
  document.head.appendChild(s);
})();

/* Portal */
function Portal({ onNext }) {
  const balloons = new Array(14).fill(0).map((_, i) => ({
    id: i,
    left: `${5 + Math.round(Math.random() * 90)}%`,
    delay: `${-Math.random() * 8}s`,
    scale: 0.8 + Math.random() * 0.6,
    colorIdx: i % 6,
  }));
  return (
    <motion.div
      className="page portal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-layer bokeh-layer" />
      <div className="balloon-layer">
        {balloons.map((b) => (
          <div
            key={b.id}
            className={`balloon b${b.colorIdx}`}
            style={{
              left: b.left,
              animationDelay: b.delay,
              transform: `scale(${b.scale})`,
            }}
          />
        ))}
      </div>
      <motion.div
        className="gojo-chibi"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <img src={GOJO_SRC} alt="Gojo chibi" className="gojo-img" />
      </motion.div>
      <motion.h1
        className="glitter-text"
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        Happy Birthday Maghfirah Ramadhani
      </motion.h1>
      <p className="subtext">
        Semoga panjang umur — sentuh orb merah & biru untuk menemukan kejutan.
      </p>
      <motion.button
        className="cta-btn"
        whileHover={{ scale: 1.05 }}
        onClick={onNext}
      >
        Mulai Petualangan
      </motion.button>
    </motion.div>
  );
}

/* OrbPage */
function OrbPage({ onNext }) {
  const [messages, setMessages] = useState([]);
  const [mixed, setMixed] = useState(false);
  const [rpos, setRpos] = useState({ x: 30, y: 45 });
  const [bpos, setBpos] = useState({ x: 70, y: 45 });

  const pushMessage = (text) => {
    const id = Date.now() + Math.random();
    const x = 50 + rnd(-18, 18);
    const y = 42 + rnd(-18, 18);
    setMessages((m) => [...m, { id, text, x, y }]);
    setTimeout(() => setMessages((m) => m.filter((mm) => mm.id !== id)), 3000);
  };

  const handleClick = (which) => {
    if (mixed) return;
    if (which === "R") {
      pushMessage(
        RED_MESSAGES[Math.floor(Math.random() * RED_MESSAGES.length)]
      );
      setRpos((p) => ({ ...p, x: Math.min(50, p.x + 4) }));
      setBpos((p) => ({ ...p, x: Math.max(50, p.x - 1) }));
    } else {
      pushMessage(
        BLUE_MESSAGES[Math.floor(Math.random() * BLUE_MESSAGES.length)]
      );
      setBpos((p) => ({ ...p, x: Math.max(50, p.x - 4) }));
      setRpos((p) => ({ ...p, x: Math.min(50, p.x + 1) }));
    }
  };

  // animasi floating
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (t) => {
      if (mixed) return;
      const dt = (t - start) / 1000;
      setRpos((p) => ({ ...p, x: p.x + Math.sin(dt + p.x) * 0.02 }));
      setBpos((p) => ({ ...p, x: p.x + Math.cos(dt + p.x) * 0.02 }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mixed]);

  useEffect(() => {
    const dx = rpos.x - bpos.x;
    const dy = rpos.y - bpos.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 12 && !mixed) {
      setMixed(true);
      setTimeout(() => onNext(), 1200);
    }
  }, [rpos, bpos, mixed, onNext]);

  return (
    <motion.div className="page orb" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="page-title">Sentuh / Klik Orb merah & biru</h2>
      <p className="subtext">
        Orb mengeluarkan pesan bila disentuh. Dekatkan keduanya hingga bercampur
        menjadi ungu — lalu kejutan akan terbuka.
      </p>
      <div className="orb-stage">
        <div
          role="button"
          onClick={() => handleClick("R")}
          className={`orb-sphere red ${mixed ? "mixed" : ""}`}
          style={{ left: `calc(${rpos.x}% )`, top: `calc(${rpos.y}% )` }}
        />
        <div
          role="button"
          onClick={() => handleClick("B")}
          className={`orb-sphere blue ${mixed ? "mixed" : ""}`}
          style={{ left: `calc(${bpos.x}% )`, top: `calc(${bpos.y}% )` }}
        />
        <div className="floating-messages">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              className="float-msg"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
            >
              {m.text}
            </motion.div>
          ))}
        </div>
        {mixed && (
          <motion.div
            className="mix-glow"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9 }}
          >
            <div className="mix-text">✨ Berhasil! Menyiapkan kejutan... ✨</div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* GiftBox */
function GiftBox({ onNext }) {
  const [opened, setOpened] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  const openBox = () => {
    if (opened) return;
    setOpened(true);
    const pieces = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: rnd(4, 96),
      rotate: rnd(0, 360),
      delay: rnd(0, 0.8),
      size: 6 + rnd(4, 12),
      colorIdx: Math.floor(rnd(0, 6)),
    }));
    setConfettiPieces(pieces);
    setTimeout(() => onNext(), 2000);
  };

  return (
    <motion.div className="page gift" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2>Buka Kotak Hadiah</h2>
      <p className="subtext">Klik kotak untuk membukanya</p>
      <motion.div
        className={`gift-box ${opened ? "opened" : ""}`}
        onClick={openBox}
        whileHover={{ scale: opened ? 1 : 1.03 }}
      >
        {!opened ? (
          <div className="gift-emoji">🎁</div>
        ) : (
          <div className="gift-content">
            <p>🎉 Yeay! Sebuah pesan spesial sedang dipersiapkan...</p>
          </div>
        )}
      </motion.div>
      <div className="confetti-layer">
        {confettiPieces.map((c) => (
          <span
            key={c.id}
            className={`confetti c${c.colorIdx}`}
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.size * 1.6,
              transform: `rotate(${c.rotate}deg)`,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* Surprise */
function Surprise() {
  const isVideo = /\.(mp4|webm|ogg)$/i.test(SURPRISE_MEDIA);
  return (
    <motion.div className="page surprise" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2>🎉 Kejutan Untukmu 🎉</h2>
      {isVideo ? (
        <video
          src={SURPRISE_MEDIA}
          controls
          autoPlay
          loop
          style={{ maxWidth: 320, borderRadius: 12 }}
        />
      ) : (
        <img
          src={SURPRISE_MEDIA}
          alt="kejutan"
          style={{ maxWidth: 320, borderRadius: 12 }}
        />
      )}
    </motion.div>
  );
}

/* App utama */
export default function App() {
  const [page, setPage] = useState(0);

  return (
    <div className="App">
      {page === 0 && <Portal onNext={() => setPage(1)} />}
      {page === 1 && <OrbPage onNext={() => setPage(2)} />}
      {page === 2 && <GiftBox onNext={() => setPage(3)} />}
      {page === 3 && <Surprise />}
    </div>
  );
}
