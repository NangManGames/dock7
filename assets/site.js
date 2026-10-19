// Dock 7 프레스 킷: 복사 단추, 보일 때만 도는 짧은 영상, 누르면 뜨는 유튜브, 스크린샷 크게 보기, 위 띠의 지금 자리.
(() => {
  'use strict';

  // 복사
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = document.getElementById(btn.dataset.copy).textContent;
      try { await navigator.clipboard.writeText(text); } catch (e) {
        const t = document.createElement('textarea'); t.value = text; document.body.append(t); t.select(); document.execCommand('copy'); t.remove();
      }
      const was = btn.textContent;
      btn.textContent = btn.dataset.done; btn.classList.add('done');
      setTimeout(() => { btn.textContent = was; btn.classList.remove('done'); }, 1400);
    });
  });

  // 색 칸: 누르면 hex 복사
  document.querySelectorAll('.sw').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.hex); } catch (e) {}
    const code = b.querySelector('code'), was = code.textContent;
    code.textContent = b.dataset.done; b.classList.add('done');
    setTimeout(() => { code.textContent = was; b.classList.remove('done'); }, 1200);
  }));

  // 정산서가 화면에 들어오면 D7 도장을 한 번 찍는다
  const slip = document.querySelector('.slip');
  if (slip) {
    const seen = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { setTimeout(() => slip.classList.add('stamped'), 350); seen.disconnect(); }
    }, { threshold: .6 });
    seen.observe(slip);
  }

  // 짧은 영상은 화면에 들어올 때만 받아서 돌린다
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clips = new IntersectionObserver(entries => {
    for (const e of entries) {
      const v = e.target;
      if (e.isIntersecting) {
        if (!v.src) v.src = v.dataset.src;
        if (!still) v.play().catch(() => {});
      } else v.pause();
    }
  }, { rootMargin: '200px 0px' });
  document.querySelectorAll('video[data-src]').forEach(v => clips.observe(v));

  // 유튜브는 누른 뒤에야 불러온다
  document.querySelectorAll('.facade').forEach(f => f.addEventListener('click', () => {
    const i = document.createElement('iframe');
    i.src = `https://www.youtube-nocookie.com/embed/${f.dataset.yt}?autoplay=1&rel=0`;
    i.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    i.allowFullscreen = true;
    i.title = f.getAttribute('aria-label');
    f.replaceWith(i);
  }));

  // 스크린샷 크게 보기
  const lb = document.querySelector('.lb'), shots = [...document.querySelectorAll('[data-lb]')];
  let at = 0, back = null;
  const show = n => {
    at = (n + shots.length) % shots.length;
    lb.querySelector('img').src = shots[at].href;
    lb.querySelector('.lb-d').href = shots[at].href;
  };
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; back && back.focus(); };
  shots.forEach((a, n) => a.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); back = a; show(n); lb.hidden = false; document.body.style.overflow = 'hidden'; lb.querySelector('.lb-x').focus();
  }));
  lb.querySelector('.lb-x').addEventListener('click', close);
  lb.querySelector('.lb-p').addEventListener('click', () => show(at - 1));
  lb.querySelector('.lb-n').addEventListener('click', () => show(at + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(at - 1);
    else if (e.key === 'ArrowRight') show(at + 1);
  });

  // 위 띠: 지금 보고 있는 갈래
  const links = new Map([...document.querySelectorAll('.jump a')].map(a => [a.hash.slice(1), a]));
  const spy = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) {
      links.forEach(a => a.classList.remove('on'));
      links.get(e.target.id)?.classList.add('on');
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((a, id) => { const s = document.getElementById(id); s && spy.observe(s); });
})();
