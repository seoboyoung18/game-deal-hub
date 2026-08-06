// 스팀 CDN 고해상도 이미지 치환.
// DB에는 header.jpg(460x215)가 저장돼 있지만, 같은 경로에 더 큰 이미지들이 있다:
//   capsule_616x353.jpg (카드용 616x353) · library_hero.jpg (배너용 1920x620)
// 일부(주로 옛날) 게임엔 큰 이미지가 없어서 <img onError={fallbackTo(원본)}> 폴백 필수.

const STEAM_HEADER = '/header.jpg'

function swap(thumbUrl, file) {
  if (!thumbUrl || !thumbUrl.includes('/steam/apps/') || !thumbUrl.endsWith(STEAM_HEADER)) {
    return thumbUrl
  }
  return thumbUrl.slice(0, -STEAM_HEADER.length) + '/' + file
}

/** 카드 커버용 616x353 */
export function hiResCard(thumbUrl) {
  return swap(thumbUrl, 'capsule_616x353.jpg')
}

/** 상세 히어로 배너용 1920x620 */
export function hiResHero(thumbUrl) {
  return swap(thumbUrl, 'library_hero.jpg')
}

/** 고해상도가 404면 원본으로 1회 폴백하는 onError 핸들러 */
export function fallbackTo(original) {
  return (e) => {
    const img = e.currentTarget
    if (img.dataset.fb || !original || img.src === original) return
    img.dataset.fb = '1'
    img.src = original
  }
}
