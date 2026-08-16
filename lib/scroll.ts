export function smoothScrollToId(id: string, duration = 800) {
  const el = document.getElementById(id)
  if (!el) return

  const startY = window.scrollY
  const targetY = startY + el.getBoundingClientRect().top
  const distance = targetY - startY
  if (distance === 0) return

  let startTime: number | null = null

  function step(timestamp: number) {
    if (startTime === null) startTime = timestamp
    const progress = Math.min((timestamp - startTime) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    window.scrollTo({ top: startY + distance * eased, behavior: 'instant' })
    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}
