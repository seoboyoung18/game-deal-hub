import { useEffect, useState } from 'react'

// src/assets/characters/ 의 이미지들을 자동 수집 → 6초마다 크로스페이드 교체.
// 유저가 폴더에 gif/png/webp 를 넣기만 하면 반영됨.
const modules = import.meta.glob('../assets/characters/*.{png,jpg,jpeg,gif,webp}', {
  eager: true,
  import: 'default',
})
const IMAGES = Object.values(modules)

export default function HeroCharacter() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (IMAGES.length <= 1) return
    const t = setInterval(() => setIdx((v) => (v + 1) % IMAGES.length), 6000)
    return () => clearInterval(t)
  }, [])

  if (IMAGES.length === 0) {
    return (
      <div className="hero__char hero__char--empty" aria-hidden>
        <span>✨</span>
        <p className="hero__char-hint">
          캐릭터 이미지를<br />
          <code>src/assets/characters/</code><br />
          에 넣어보세요
        </p>
      </div>
    )
  }

  return (
    <div className="hero__char">
      {IMAGES.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className={`hero__char-img ${i === idx ? 'is-active' : ''}`}
        />
      ))}
    </div>
  )
}
