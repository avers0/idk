/* AiR — shared interactions (vanilla, no dependencies) */
(function(){
  "use strict";
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.getElementById('nav');

  /* ── Mobile menu ───────────────────────────────── */
  var burger = document.getElementById('nav-burger');
  var navLinksWrap = document.getElementById('nav-links');
  function closeMenu(){
    if(!nav) return;
    nav.classList.remove('mobile-open');
    if(burger){ burger.classList.remove('open'); burger.setAttribute('aria-expanded','false'); }
    document.body.style.overflow = '';
  }
  if(burger){
    burger.addEventListener('click', function(){
      var open = nav.classList.toggle('mobile-open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }
  if(navLinksWrap){
    navLinksWrap.addEventListener('click', function(e){ if(e.target.closest('a')) closeMenu(); });
  }
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeMenu(); });

  /* ── Marquee seamless loop ─────────────────────── */
  var marquee = document.getElementById('marquee-inner');
  if(marquee){
    var base = marquee.innerHTML;
    marquee.innerHTML = base + base + base + base + base + base + base + base;
  }

  /* ── Hero word rise ────────────────────────────── */
  var h1 = document.querySelector('.hero h1');
  if(h1 && !reduceMotion){
    h1.innerHTML = h1.innerHTML.replace(/(<[^>]+>)|([^\s<]+)/g, function(m, tag, word){
      if(tag) return tag;
      return '<span class="word">' + word + '</span> ';
    });
    h1.querySelectorAll('.word').forEach(function(w, i){
      w.style.animationDelay = (0.22 + i * 0.09) + 's';
    });
  }

  /* ── Scroll: progress bar, nav state, floats ───── */
  var bar = document.getElementById('scroll-bar');
  var floatCta = document.getElementById('float-cta');
  var backToTop = document.getElementById('back-to-top');
  var hero = document.querySelector('.hero');

  function onScroll(){
    var max = document.body.scrollHeight - window.innerHeight;
    var pct = max > 0 ? window.scrollY / max : 0;
    if(bar) bar.style.transform = 'scaleX(' + Math.min(pct, 1) + ')';
    if(nav) nav.classList.toggle('on', window.scrollY > 40);

    var heroBottom = hero ? hero.offsetTop + hero.offsetHeight : window.innerHeight;
    if(floatCta) floatCta.classList.toggle('show', window.scrollY > heroBottom - 100);
    if(backToTop) backToTop.classList.toggle('show', window.scrollY > window.innerHeight * 1.2);
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll, { passive:true });
  onScroll();

  if(backToTop){
    backToTop.addEventListener('click', function(){
      window.scrollTo({ top:0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ── Scroll reveal + auto-stagger ──────────────── */
  var staggerGroups = [
    { sel:'.stats__item', ms:90 }, { sel:'.value-row', ms:70 },
    { sel:'.diff__card', ms:100 }, { sel:'.industries__chip', ms:45 },
    { sel:'.methodology__domain', ms:60 }, { sel:'.phase-card', ms:80 },
    { sel:'.offering-block', ms:100 }, { sel:'.faq__item', ms:60 },
    { sel:'.team__person', ms:80 }, { sel:'.career__belong li', ms:50 },
    { sel:'.footer__col', ms:70 }
  ];
  staggerGroups.forEach(function(g){
    document.querySelectorAll(g.sel).forEach(function(el, i){
      el.style.transitionDelay = (i * g.ms) + 'ms';
    });
  });

  var srEls = document.querySelectorAll('.sr, .sr-left, .sr-right, .sr-scale, .ledger');
  if(reduceMotion){
    srEls.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold:0.06, rootMargin:'0px 0px -30px 0px' });
    srEls.forEach(function(el){ io.observe(el); });
  }

  /* ── Stat count-up ─────────────────────────────── */
  var statNums = document.querySelectorAll('.stats__num span[data-target]');
  function animateCount(el){
    var target = parseFloat(el.dataset.target || '0');
    if(reduceMotion){ el.textContent = target.toLocaleString('en-IN'); return; }
    var dur = 1600, start = performance.now();
    function tick(now){
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * eased).toLocaleString('en-IN');
      if(p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if(statNums.length){
    var statIo = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ animateCount(e.target); statIo.unobserve(e.target); }
      });
    }, { threshold:0.4 });
    statNums.forEach(function(el){ statIo.observe(el); });
  }

  /* ── Form field stagger + Formspree submit ─────── */
  var form = document.getElementById('contact-form');
  if(form){
    if(!reduceMotion){
      var fields = form.querySelectorAll('.field');
      fields.forEach(function(f, i){
        f.style.opacity = '0'; f.style.transform = 'translateY(14px)';
        f.style.transition = 'opacity .55s cubic-bezier(.16,1,.3,1), transform .55s cubic-bezier(.16,1,.3,1)';
        f.style.transitionDelay = (50 + i * 65) + 'ms';
      });
      var fIo = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){
            e.target.querySelectorAll('.field').forEach(function(f){ f.style.opacity='1'; f.style.transform='none'; });
            fIo.unobserve(e.target);
          }
        });
      }, { threshold:0.08 });
      fIo.observe(form);
    }

    var btn = document.getElementById('submit-btn');
    var label = document.getElementById('submit-label');
    var arrow = document.getElementById('submit-arrow');
    var errBox = document.getElementById('form-error');

    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(!form.checkValidity()){ form.reportValidity(); return; }
      if(errBox) errBox.hidden = true;
      btn.disabled = true;
      if(arrow) arrow.style.display = 'none';
      if(label) label.textContent = 'Sending...';

      fetch(form.action, { method:'POST', body:new FormData(form), headers:{ Accept:'application/json' } })
      .then(function(res){
        if(res.ok){
          if(label) label.textContent = 'Message sent \u2713';
          btn.classList.add('sent');
          form.reset();
        } else { throw new Error('send-failed'); }
      }).catch(function(){
        btn.disabled = false;
        if(arrow) arrow.style.display = '';
        if(label) label.textContent = 'Failed \u2014 try again';
        if(errBox) errBox.hidden = false;
      });
    });
  }

  /* ── Photo fallback: navy initials placeholder ── */
  document.querySelectorAll('.team__photo, .founder-card__photo').forEach(function(img){
    img.addEventListener('error', function(){
      var name = img.getAttribute('alt') || 'A R';
      var initials = name.split(/\s+/).map(function(w){ return w[0]; }).slice(0,2).join('');
      var isFounder = img.classList.contains('founder-card__photo');
      var w = isFounder ? 280 : 200, h = isFounder ? 350 : 200, fs = isFounder ? 72 : 56;
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'">' +
        '<rect width="100%" height="100%" fill="%23012257"/>' +
        '<text x="50%" y="54%" fill="%237FB2E6" font-family="Georgia, serif" font-size="'+fs+'" font-weight="700" text-anchor="middle" dominant-baseline="middle">'+initials+'</text></svg>';
      img.src = 'data:image/svg+xml;utf8,' + svg;
    }, { once:true });
  });
})();
