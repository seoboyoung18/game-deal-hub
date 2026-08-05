import { Store, RefreshCw, ShieldCheck, Bell } from 'lucide-react'

// 홈 R2: 기능 소개 4칸 (정적)
const PERKS = [
  {
    Icon: Store,
    title: '스토어 통합 비교',
    desc: 'Steam·Epic·GOG 등 여러 스토어의 할인을 한 화면에서 비교해요.',
  },
  {
    Icon: RefreshCw,
    title: '주기적 자동 갱신',
    desc: '수집 파이프라인이 최신 할인 정보를 주기적으로 새로 고쳐요.',
  },
  {
    Icon: ShieldCheck,
    title: '안전한 구매 링크',
    desc: '구매 버튼은 항상 공식 스토어 페이지로만 연결돼요.',
  },
  {
    Icon: Bell,
    title: '가격 알림',
    desc: '원하는 게임이 목표 가격에 도달하면 알려드릴 기능을 만들고 있어요.',
    soon: true,
  },
]

export default function PerkStrip() {
  return (
    <section className="perks" aria-label="딜모아 기능 소개">
      {PERKS.map(({ Icon, title, desc, soon }) => (
        <div key={title} className="perk">
          <span className="perk__icon" aria-hidden>
            <Icon size={22} strokeWidth={2.2} />
          </span>
          <div>
            <h3 className="perk__title">
              {title} {soon && <em className="perk__soon">준비 중</em>}
            </h3>
            <p className="perk__desc">{desc}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
