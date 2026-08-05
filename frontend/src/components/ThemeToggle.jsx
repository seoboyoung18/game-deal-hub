import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

// 라이트/다크 토글. <html data-theme="..."> 로 반영, 선택은 localStorage 저장.
export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button className="theme-toggle" onClick={() => setDark((d) => !d)} aria-label="테마 전환">
      {dark ? <Sun size={18} strokeWidth={2.2} /> : <Moon size={18} strokeWidth={2.2} />}
    </button>
  )
}
