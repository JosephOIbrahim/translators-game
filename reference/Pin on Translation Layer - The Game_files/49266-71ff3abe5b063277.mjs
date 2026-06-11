(self.modernJsonp=self.modernJsonp||[]).push([["49266"],{284387(e,t,r){r.d(t,{A:()=>A});var o=r(61163),l=r(859471),n=r(97500),a=r.n(n),i=r(19821);function s(e,t){return Math.max(0,((t<=0?0:Math.ceil(e/t))-1)*t)}function c(e,t,r){return r<=1?Math.max(0,Math.min(e,t-1)):Math.min(Math.max(0,Math.floor(e/r)*r),s(t,r))}var u=r(538329),d=r(562615);let h="12px";function g({containerRef:e,carouselClassName:t,currentIndex:r=0,itemCount:n,itemHeight:a,itemsPerPage:g,onIndexChange:m,showNavigationArrows:p=!1}){(0,l.useEffect)(()=>{(0,o.A)("CarouselOverlay","/app/packages/gestaltExtensions/Carousel/CarouselOverlay.tsx")},[]);let f=(0,l.useRef)(null),b=(0,u.A)(),[v,x]=(0,l.useState)(void 0),[y,w]=(0,l.useState)(0);(0,l.useLayoutEffect)(()=>{let r,o=!1,l=()=>{if(o)return;let n=e.current,a=n?.querySelector(`.${t}`),i=a?.querySelector("li"),s=i?.querySelector('[data-test-id="pinrep-image"]')||i?.querySelector("img");if(s&&n&&a){let e=s.getBoundingClientRect(),t=n.getBoundingClientRect();if(e.height>0){x(e.height),w(e.top-t.top),o=!0;return}}r=setTimeout(l,100)};return l(),()=>{o=!0,r&&clearTimeout(r)}},[e,t]);let _=v??a,k=_?`calc(${_}px / 2 - 18px)`:"calc(50% - 18px)",C=(0,l.useCallback)(()=>{if(g&&g>1){let e=Math.max(0,c(r,n,g)-g);m?.(e)}else{let e=Math.max(0,r-1);m?.(e)}},[r,n,g,m]),S=(0,l.useCallback)(()=>{if(g&&g>1){let e=c(r,n,g),t=Math.min(s(n,g),e+g);m?.(t)}else{let e=Math.min(n-1,r+1);m?.(e)}},[r,n,g,m]),{showPrevious:A,showNext:M}=(()=>{if(!p)return{showPrevious:!1,showNext:!1};if(g&&g>1){let e=c(r,n,g);return{showPrevious:e>0,showNext:e<s(n,g)}}return{showPrevious:r>0,showNext:r<n-1}})();return(0,d.jsxs)(i.az,{ref:f,dangerouslySetInlineStyle:{__style:{height:_?`${_}px`:"100%",pointerEvents:"none",top:`${y}px`}},left:!0,position:"absolute",right:!0,zIndex:new i.rk(100),children:[(0,d.jsx)(i.az,{dangerouslySetInlineStyle:{__style:{left:h,pointerEvents:"auto",top:k}},opacity:100*!!A,position:"absolute",children:(0,d.jsx)(i.K0,{accessibilityLabel:b._('View Previous', 'CarouselOverlay.scrollButton.viewPrevious', 'Accessibility label for button to navigate to the previous item in the carousel'),bgColor:"default",dataTestId:"carousel-overlay-previous",icon:"chevron-left",onClick:C,size:"md"})}),(0,d.jsx)(i.az,{dangerouslySetInlineStyle:{__style:{pointerEvents:"auto",right:h,top:k}},opacity:100*!!M,position:"absolute",children:(0,d.jsx)(i.K0,{accessibilityLabel:b._('View Next', 'CarouselOverlay.scrollButton.viewNext', 'Accessibility label for button to navigate to the next item in the carousel'),bgColor:"default",dataTestId:"carousel-overlay-next",icon:"chevron-right",onClick:S,size:"md"})})]})}let m={bottom:"15px",boxShadow:"0 1px 0px rgba(0, 0, 0, 0.1)",left:0,position:"absolute",right:0};function p({index:e,isActive:t,mode:r,onClick:o,label:l}){return(0,d.jsx)(i.az,{height:8,width:8,children:(0,d.jsx)(i.Rp,{accessibilityLabel:l||`Navigate to slide ${e+1}`,onTap:()=>o(e),rounding:"circle",children:(0,d.jsx)(i.az,{dangerouslySetInlineStyle:{__style:{backgroundColor:t?"single"===r?"var(--sema-color-background-default)":"var(--sema-color-background-inverse)":"single"===r?"rgba(255, 255, 255, 0.6)":"var(--sema-color-background-secondary)",transition:"background-color 0.2s ease"}},height:8,rounding:"circle",width:8})})},e)}function f({currentIndex:e,itemCount:t,itemLabels:r,itemsPerPage:n,mode:a,onNavigateToIndex:s}){(0,l.useEffect)(()=>{(0,o.A)("FallbackScrollMarkers","/app/packages/gestaltExtensions/Carousel/FallbackScrollMarkers.tsx")},[]);let u=n?c(e,t,n):e,h=(0,l.useCallback)(e=>{s(e)},[s]),g=n?Math.ceil(t/n):t,f=n?n<=1?Math.max(0,Math.min(u,t-1)):Math.floor(c(u,t,n)/n):u;return g<=1?null:(0,d.jsx)(i.az,{alignItems:"center",dangerouslySetInlineStyle:{__style:{..."single"===a&&m}},"data-test-id":"scroll-markers-fallback",display:"flex",justifyContent:"center",zIndex:"single"===a?new i.rk(100):void 0,children:(0,d.jsx)(i.az,{dangerouslySetInlineStyle:{__style:{display:"grid",gridAutoColumns:"1rem",gridAutoFlow:"column",placeItems:"center"}},width:"fit-content",children:[...Array(g).keys()].map(e=>{let t=n?e*n:e;return(0,d.jsx)(p,{index:t,isActive:e===f,label:r?.[t],mode:a,onClick:h},e)})})})}var b=r(844255);let v=function({mode:e,forceShowNavigationButtons:t,showNavigationButtons:r=!1,showScrollMarkers:o=!1}){let{userAgent:{browserName:l,browserVersion:n}}=(0,b._8)(),a="Chrome"===l&&Number(n.split(".")[0])>=135&&("u"<typeof window||void 0===window.Cypress);return"multi"===e?{enableCssScrollButtons:!1,enableCssScrollMarkers:!1,enableFallbackScrollButtons:r,enableFallbackScrollMarkers:o}:a&&void 0===t?{enableCssScrollButtons:r,enableCssScrollMarkers:o,enableFallbackScrollButtons:!1,enableFallbackScrollMarkers:!1}:{enableCssScrollButtons:!1,enableCssScrollMarkers:!1,enableFallbackScrollButtons:r,enableFallbackScrollMarkers:o}};var x=r(168079),y=r(81920);let w=e=>`
  --scroll-button-size: 36px;
  --scroll-button-offset: 1rem;

  &::scroll-button(*) {
    opacity: 0;
    pointer-events: auto;
    position: absolute;
    position-anchor: --${e};
    background-color: var(--sema-color-background-default);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    display: inline-block;
    margin-block-start: calc(var(--carousel-item-height) / 2 - var(--scroll-button-size) / 2);
    height: var(--scroll-button-size);
    line-height: 0;
    vertical-align: middle;
    width: var(--scroll-button-size);
    transition: opacity 50ms cubic-bezier(0, 0, 1, 1), transform 50ms cubic-bezier(0, 0, 1, 1);
  }

  /* Show scroll buttons when hovering on the parent <ul>. */
  &:hover::scroll-button(*) {
    opacity: 1;
    transition: opacity 100ms cubic-bezier(0, 0, 1, 1), transform 100ms cubic-bezier(0, 0, 1, 1);
  }

  &::scroll-button(inline-end) {
    content: "";
    background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' role='img' viewBox='0 0 24 24' width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='white' d='M8.7.3 20.42 12 8.71 23.7l-1.42-1.4L17.6 12 7.29 1.7z' /%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 16px 16px;
    background-blend-mode: difference;
    right: anchor(--${e} right);
    margin-inline-end: var(--scroll-button-offset);
    top: anchor(--${e} start);
  }

  &::scroll-button(inline-start) {
    content: "";
    background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' role='img' viewBox='0%200%2024%2024' width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='white' d='m6.41%2012%2010.3-10.3L15.29.3%203.6%2012l11.7%2011.7%201.42-1.4z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 16px 16px;
    background-blend-mode: difference;
    left: anchor(--${e} left);
    margin-inline-start: var(--scroll-button-offset);
    top: anchor(--${e} start);
  }

  /* CSS specificity order matters: hover/focus → active → disabled (most specific last) */
  &::scroll-button(*):is(:hover, :focus-visible) {
    background-color: var(--sema-color-hover-background-default);
    opacity: 1;
  }

  &::scroll-button(*):active {
    background-color: var(--sema-color-pressed-background-default);
    transform: scale(0.90);
  }

  &::scroll-button(*):disabled {
    background-color: var(--sema-color-background-disabled);
    opacity: 0;
    cursor: not-allowed;
    interactivity: inert;
  }

`,_=(e,t="multi",r=1)=>{let o="multi"===t;return`
  scroll-marker-group: after;

  &::scroll-marker-group {
    display: grid;
    grid-auto-columns: 1rem;
    grid-auto-flow: column;
    height: 8px;
    justify-content: center;
    margin-block-start: ${o?"16px":"-1.25rem"};
    position-anchor: --${e};
    position-area: bottom;
    ${o?"position: fixed; align-items: center;":"scroll-snap-type: y mandatory;"}
    transition: all 150ms ease-out;
    @media (prefers-reduced-motion: no-preference) {
      scroll-behavior: smooth;
    }
  }

  > li:nth-child(${r}n + 1)::scroll-marker {
    aspect-ratio: 1;
    border-radius: 50% ;
    background: ${o?"var(--sema-color-background-secondary)":"rgba(255, 255, 255, 0.6)"};
    content: ' ';
    width: 50%;
    box-shadow: ${o?"none":"0 1px 0px rgba(0, 0, 0, 0.1)"};
    animation-timeline: view(x);
    interactivity: auto;
    transition: all 150ms ease-out;
    place-self: center;
  }

  > li:nth-child(${r}n + 1)::scroll-marker:target-current {
    background: ${o?"var(--sema-color-background-inverse)":"var(--sema-color-background-default)"};
  }
`},k=function({cls:e,inset:t,isMobile:r=!1,itemsPerPage:o}){let l="none"===t,n=r?"0rem":"1rem";return`
  .${e} {
    --carousel-edge-padding: ${l?"0":r?"0.5rem":"1rem"};
    --carousel-gap: 0.5rem;
    --calculated-column-width: calc(
      (
        100cqw
        - var(--carousel-edge-padding)
        - (var(--carousel-gap) * (var(--carousel-item-count) + 1))
      ) / var(--carousel-item-count)
    );
    anchor-name: --${e};
    counter-reset: item;
    display: grid;
    gap: var(--carousel-gap);
    grid-auto-flow: column;
    grid-auto-columns: var(--calculated-column-width, var(--carousel-item-width, min-content));
    list-style-type: none;
    margin-block: 0rem;
    margin-inline: auto;
    overscroll-behavior-x: contain;
    overflow-y: hidden;
    overflow-x: auto;
    padding-block-start: ${l?"0":n};
    padding-block-end: ${l?"0":n};
    padding-inline: var(--carousel-edge-padding);
    scroll-padding-inline-start: var(--carousel-edge-padding);
    scroll-padding-inline-end: var(--carousel-edge-padding);
    scrollbar-width: none;

    @media (prefers-reduced-motion: no-preference) {
      scroll-behavior: smooth;
    }

    >li {
      block-size: auto;
      overflow: visible;
      display: flex;
      flex-direction: column;
      container-type: scroll-state;
    }

    &.scroll-markers {
      ${l?`padding-block-end: ${n};`:""}
      ${_(e,"multi",o)}
    }

    &.scroll-buttons {
      ${w(e)}
    }
  } `};var C=r(131094),S=r(971289);function A({forceShowNavigationButtons:e,inset:t="default",itemHeight:r,items:n,itemWidth:s,mode:c,onIndexChange:u,accessibilityLabelledBy:h,renderItem:m,selectedIndex:p,showNavigationButtons:b,showScrollMarkers:A}){(0,l.useEffect)(()=>{(0,o.A)("CSSCarousel","/app/packages/gestaltExtensions/Carousel/CSSCarousel.tsx")},[]);let{enableCssScrollMarkers:M,enableCssScrollButtons:z,enableFallbackScrollMarkers:$,enableFallbackScrollButtons:I}=v({mode:c,forceShowNavigationButtons:e,showScrollMarkers:A,showNavigationButtons:b}),[E,j]=(0,l.useState)(0),P=(0,l.useRef)(null),R=(0,l.useRef)(null),L=(e=>{let[t,r]=(0,l.useState)(1),o=(0,l.useRef)(null);return(0,x.A)(()=>{let t=null;if(e.current){let l=()=>{o.current&&cancelAnimationFrame(o.current),o.current=requestAnimationFrame(()=>{(()=>{let t=e.current;if(t){let e=t.offsetWidth,o=t.querySelector("li");if(o){let t=o.offsetWidth;if(t>0&&e>0){let o=Math.max(1,Math.floor((e-32+8)/(t+8)));r(e=>e!==o?o:e)}}}})(),o.current=null})};l(),(t=new ResizeObserver(l)).observe(e.current)}return()=>{o.current&&cancelAnimationFrame(o.current),t&&t.disconnect()}}),t})(P),B=(0,i.Ib)(),{isInteractive:T,onKeyboardFocus:W,onKeyboardBlur:F,onMouseOver:N,onMouseOut:O}=function(){let[e,t]=(0,l.useState)(!1),[r,o]=(0,l.useState)(!1),n=(0,l.useCallback)(e=>{e.target.matches(":focus-visible")&&t(!0)},[]);return{keyboardFocused:e,hovered:r,isInteractive:e||r,onKeyboardFocus:n,onKeyboardBlur:(0,l.useCallback)(()=>{t(!1)},[]),onMouseOver:(0,l.useCallback)(()=>{o(!0)},[]),onMouseOut:(0,l.useCallback)(()=>{o(!1)},[])}}(),{setNavigationIntent:D}=function({scrollerRef:e,itemsLength:t,itemsPerPage:r,mode:o,focusedIndex:n,setFocusedIndex:a,onIndexChange:i}){let s=(0,l.useRef)([]),c=(0,l.useRef)(null),u=(0,l.useRef)(!0),d=(0,l.useRef)(null),h=(0,l.useRef)(-1),g=(0,l.useRef)(0),m=(0,l.useRef)(0),p=(0,l.useRef)(null),f=(0,l.useCallback)(e=>{let{direction:t}=getComputedStyle(e),{scrollLeft:r,scrollWidth:o,clientWidth:l}=e;return"rtl"!==t?r:r<0?-r:o-l-r},[]),b=(0,l.useCallback)(()=>{let t=e.current;if(!t||!s.current.length)return;let l=d.current,c=t.children.length;if(u.current||!l||l.scrollWidth!==t.scrollWidth||l.clientWidth!==t.clientWidth||l.childrenCount!==c||s.current.length!==c){let e=Array.from(t.children);s.current=e.map(e=>e.offsetLeft+e.offsetWidth/2),d.current={scrollWidth:t.scrollWidth,clientWidth:t.clientWidth,childrenCount:e.length},u.current=!1}let b=f(t),v=t.scrollWidth-t.clientWidth,x=b+t.clientWidth/2,w=s.current,_=0,k=1/0;w.forEach((e,t)=>{let r=Math.abs(e-x);r<k&&(k=r,_=t)});let C=_;if("multi"===o&&r>1){let e=Math.floor(_/r)*r,t=Math.max(0,Math.floor((w.length-1)/r)*r),o=Math.min(e,t),l=g.current;if(l!==o){let e=o>l?1:-1,t=(w[l+(e>0?r-1:0)]+w[o+(e>0?0:Math.min(r-1,w.length-o-1))])/2+e*(x>w[w.length-1]-24||x<w[0]+24?6:24),n=b-m.current;(!(e>0?x>=t:x<=t)||e>0&&n<-.5||e<0&&n>.5)&&(o=l)}(b/v>.98||v-b<=8)&&(o=t),g.current=C=o}let S=performance.now(),A=p.current,M=A&&S-A.timestamp<500;C===n||M||(h.current!==C&&((0,y.GV)("closeup.dweb.css_carousel.enabled.carousel_index_change",{sampleRate:1}),h.current=C),a(C),i?.({currentIndex:n,nextIndex:C})),A&&(C===A.targetIndex||S-A.timestamp>500)&&(p.current=null),m.current=b},[n,r,o,i,e,a,f]),v=(0,l.useCallback)(()=>{let e=performance.now(),t=p.current;t&&e-t.timestamp<500||(c.current&&cancelAnimationFrame(c.current),c.current=requestAnimationFrame(()=>{c.current=null,b()}))},[b]),x=(0,l.useCallback)(()=>{u.current=!0,v()},[v]);return(0,l.useLayoutEffect)(()=>{let t=e.current;if(!t)return;let r=Array.from(t.children);s.current=r.map(e=>e.offsetLeft+e.offsetWidth/2),d.current={scrollWidth:t.scrollWidth,clientWidth:t.clientWidth,childrenCount:r.length},u.current=!1;let o="u">typeof ResizeObserver?new ResizeObserver(x):null,l=new MutationObserver(x);return o&&o.observe(t),l.observe(t,{childList:!0}),t.addEventListener("scroll",v,{passive:!0}),window.addEventListener("resize",x),()=>{t.removeEventListener("scroll",v),window.removeEventListener("resize",x),l.disconnect(),o&&o.disconnect(),c.current&&(cancelAnimationFrame(c.current),c.current=null)}},[v,x,e]),(0,l.useLayoutEffect)(()=>{u.current=!0,v()},[t,r,v]),{setNavigationIntent:(0,l.useCallback)(e=>{p.current={targetIndex:e,timestamp:performance.now()}},[])}}({scrollerRef:P,itemsLength:n.length,itemsPerPage:L,mode:c,focusedIndex:E,setFocusedIndex:j,onIndexChange:u}),U=(0,l.useCallback)(e=>{let t=P.current;if(!t)return;let r=Array.from(t.children),o=Math.max(0,Math.min(e,r.length-1)),l=r[o];if(l&&"number"==typeof l.offsetLeft){let e=parseInt(getComputedStyle(t).paddingInlineStart,10)||0;t.scrollTo({left:l.offsetLeft-e,behavior:B?"auto":"smooth"})}},[B]),V=(0,l.useCallback)(e=>{D(e),U(e),j(e),u?.({currentIndex:E,nextIndex:e})},[E,u,U,D]);(0,l.useLayoutEffect)(()=>{void 0!==p&&p!==E&&n.length&&V(p)},[p,E,V,n.length]);let q=(0,l.useCallback)(e=>()=>j(e),[]),H=(0,l.useCallback)(()=>j(-1),[]),K=(0,l.useRef)(new Map),J=(0,l.useCallback)(e=>(K.current.has(e)||K.current.set(e,q(e)),K.current.get(e)),[q]);(0,l.useLayoutEffect)(()=>{K.current.clear()},[n]);let G=(0,S.Ay)(),X=!(0,S.bh)(G),Y="none"===t,Q="single"===c,Z=`carousel--mode-${c}`,ee=Q?`
  .${Z} {
    anchor-name: --${Z};
    container-type: inline-size scroll-state;
    counter-reset: item;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 100%;
    height: 100%;
    list-style-type: none;
    overscroll-behavior-x: contain;
    overflow-x: auto;
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;

    @media (hover) {
      &:not(:hover,
      :focus-within)::scroll-button(*) {
        opacity: 0;
      }
    }

    > li {
      container-type: scroll-state;
      scroll-snap-align: center;
      scroll-snap-stop: always;
      width: 100%;
      height: 100%;
      overflow: hidden;

      & img {
        height: 100%;
        width: 100%;
      }
    }

    &.scroll-markers {
      ${_(Z,"single")}
    }

    &.scroll-buttons {
      ${w(Z)}
    }
  }
`:k({cls:Z,inset:t,isMobile:X,itemsPerPage:L}),et={...r&&{"--carousel-item-height":`${r}px`},...s&&{"--carousel-item-width":`${s}px`}},er=a()(Z,{"scroll-markers":M,"scroll-buttons":z});return(0,d.jsxs)(i.az,{ref:R,"aria-labelledby":h,as:"section",dangerouslySetInlineStyle:{__style:{containerType:"inline-size"}},height:"100%",onBlur:F,onFocus:W,onMouseOut:O,onMouseOver:N,position:"relative",width:"100%",children:[(0,d.jsx)(C.A,{unsafeCSS:ee}),I&&(0,d.jsx)(g,{carouselClassName:Z,containerRef:R,currentIndex:E,itemCount:n.length,itemHeight:r,itemsPerPage:L,onIndexChange:V,showNavigationArrows:e??T}),(0,d.jsx)("ul",{ref:P,className:er,style:et,children:n.map((e,t)=>(0,d.jsx)("li",{children:m({item:e,index:t,isFocused:E===t,onFocus:J(t),onUnfocus:H})},e?.id??e?.entityId??t))}),$&&(0,d.jsx)(i.az,{marginBottom:Y||"multi"!==c?void 0:4,marginTop:Y?4:void 0,children:(0,d.jsx)(f,{currentIndex:E,itemCount:n.length,itemsPerPage:L,mode:c,onNavigateToIndex:V})})]})}},470820(e,t,r){r.d(t,{A:()=>s});var o=r(61163),l=r(859471),n=r(19821),a=r(194046),i=r(562615);function s({carouselData:e,contextLogData:t,height:r,id:s,index:c,slideWidth:u,view:d,impressionType:h,viewParameter:g}){(0,l.useEffect)(()=>{(0,o.A)("CarouselImpressionItem","/app/packages/gestaltExtensions/Carousel/CarouselImpressionItem.tsx")},[]);let[m,p]=(0,l.useState)(null),[f,b]=(0,l.useState)(!1);return((0,l.useEffect)(()=>{m!==c?(p(c),b(!1)):b(!0)},[c,m]),e)?(0,i.jsx)(a.oc,{carouselData:{...e,type:"canonical"},contextLogData:t,impressionType:h??"Pin",isPaused:!f,loggingId:s,slotIndex:c,viewParameter:g,viewType:d,children:({impressionTrackerRef:e})=>(0,i.jsx)(n.az,{ref:e,"data-test-id":`carousel-impression-ref-${s}-${c}`,height:r,overflow:"hidden",position:"absolute",width:u})},`carousel-impression-key-${c}`):null}},131321(e,t,r){r.d(t,{A:()=>o});function o(e,t){return t in e}},805863(e,t,r){r.d(t,{A:()=>n});var o=r(457315),l=r(752159);function n(){let e=navigator.serviceWorker;return e&&e.getRegistration?((0,l.PM)("mweb_service_worker.unregister_attempt"),e.getRegistration().then(e=>{if(e)return e.unregister().then(()=>((0,l.PM)("mweb_service_worker.unregister_success"),navigator.serviceWorker&&window.caches?window.caches.keys().then(e=>{let t=e.find(e=>e.startsWith("workbox-precaching"));return t?window.caches.delete(t):null}).then(()=>(0,l.PM)("mweb_service_worker.clear_app_shell")):Promise.resolve())).catch(e=>{(0,l.fu)("mweb_service_worker.unregister_fail",{error:(0,o.A)(e,"message")})})})):Promise.resolve()}},987055(e,t,r){r.d(t,{A:()=>o});function o(e,t){if(!t)return e;let r=new RegExp(/http(s?):/);if(!r.test(e)){let o=r.exec(t);o&&o.length&&(e=o[0]+e)}return e}},385800(e,t,r){r.d(t,{A:()=>a,e:()=>n});var o=r(859471);let l=()=>{let[e,t]=(0,o.useState)(!1),[r,l]=(0,o.useState)(!1),[n,a]=(0,o.useState)(!1);return{active:e,focused:r,hovered:n,onBlur:()=>{l(!1),t(!1)},onFocus:()=>l(!0),onMouseDown:()=>t(!0),onMouseEnter:()=>a(!0),onMouseLeave:()=>{a(!1),t(!1)},onMouseUp:()=>t(!1)}};function n({children:e}){return e(l())}let a=l},310065(e,t,r){r.d(t,{o:()=>c,p:()=>s});var o=r(859471),l=r(987628),n=r(652567),a=r(562615);let{Provider:i,get:s}=(0,l.A)("LastSavedTo");function c({children:e}){let[t,r]=(0,o.useState)();(0,n.jY)("BoardPickerBoardsShortlistResource",e=>{if(!t){let{data:t}=e.response.resource_response;r(t)}});let l=(0,o.useCallback)(e=>{let o=t?t.filter(t=>t.id!==e.id):[];r([e,...o])},[t]),s=(0,o.useMemo)(()=>({lastSavedTo:t,saveToBoard:l}),[t,l]);return(0,a.jsx)(i,{value:s,children:e})}},878913(e,t,r){r.d(t,{P:()=>o,y:()=>l});let{Provider:o,getMaybe:l}=(0,r(987628).A)("PinCreateDeleteContext")},463530(e,t,r){r.d(t,{A:()=>C});var o=r(61163),l=r(859471),n=r(19821),a=r(154508),i=r(971987),s=r(586733),c=r(296221),u=r(470820),d=r(538329),h=r(726329),g=r(131094),m=r(542975),p=r(844255),f=r(168079),b=r(678358),v=r(562615);function x({index:e,length:t,showBadge:r}){return(0,l.useEffect)(()=>{(0,o.A)("CarouselBadge","/app/www/common/Carousel/CarouselBadge.tsx")},[]),(0,v.jsx)(n.az,{alignItems:"center",color:"selected",dangerouslySetInlineStyle:{__style:{opacity:80*!!r,transition:"opacity .3s"}},display:"flex",height:35,justifyContent:"center",marginEnd:5,marginTop:5,position:"absolute",right:!0,rounding:200,width:35,zIndex:new n.rk(1),children:(0,v.jsx)(n.KJ,{color:"inverse",children:`${(e??0)+1}/${t}`})})}var y=r(381786),w=r(699613),_=r(788446);let k=`
  .horizontal-scroll-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  ::-webkit-scrollbar {
    display: none;
  }`;function C(e){let t;(0,l.useEffect)(()=>{(0,o.A)("Carousel","/app/www/common/Carousel/Carousel.tsx")},[]);let{backgroundColor:r="transparent",children:C,componentType:S,containerRef:A,contextLogData:M,disableTransition:z,gap:$=0,height:I,id:E,impressionType:j,index:P,responsiveSizing:R=!1,shouldBeDragCarousel:L,showCarouselBadge:B,styleOverrides:T,innerCarouselWidthRef:W,slideWidth:F,surface:N,paddingX:O,view:D,viewParameter:U,widthRatio:V=1,setSlideIndex:q,sliderRef:H,showCarouselOverflow:K,isHorizontalScrollable:J}=e,{showBadge:G}=(({index:e})=>{let[t,r]=(0,l.useState)(!0),o=(0,l.useRef)(void 0),n=(0,l.useRef)(void 0);return(0,l.useEffect)(()=>(o.current=setTimeout(()=>{r(!1)},3e3),()=>{clearTimeout(o.current)}),[]),(0,l.useEffect)(()=>{if(!n.current){n.current=e;return}clearTimeout(o.current),r(!0)},[e]),{showBadge:t}})({index:P}),{logContextEvent:X}=(0,s.o)(),Y=(0,w.HR)()(E),Q=(0,d.A)(),{isRTL:Z}=(0,p._8)(),ee=(0,l.useRef)(void 0),et=(0,l.useRef)(null),er=(0,l.useRef)(0),eo=(0,l.useRef)(void 0),el=(0,_.A)(),{peekCloseupEnabled:en,viewportSize:ea}=(0,b._G)();if((0,f.A)(()=>{let e=et.current;if(!e)return;H&&e&&(H.current=e);let t=()=>{let e=er.current;if(J){let t=new IntersectionObserver(([r])=>{let o=-(r.boundingClientRect.x??0),n=l.Children.toArray(C),a=H?(0,y.jV)(H.current,o+el,F,V,$,n.length):0;q?.(a),Math.abs(e-o)>=10&&X({aux_data:{...M},component:S,event_type:"right"==(e<o?"right":"left")?9315:9316,view_type:D,view_parameter:U}),er.current=o,eo.current&&t.unobserve(eo.current)});eo.current&&t.observe(eo.current)}else{let t=-(eo.current?.getBoundingClientRect().x??0);Math.abs(e-t)>=10&&X({aux_data:{...M},component:S,event_type:"right"==(e<t?"right":"left")?9315:9316,view_type:D,view_parameter:U}),er.current=t}};return L&&(J&&e?.addEventListener("scroll",t),e?.addEventListener("touchend",t)),()=>{L&&(J&&e?.removeEventListener("scroll",t),e?.removeEventListener("touchend",t))}}),V>1||V<0)throw Error("widthRatio should be between 0 and 1 inclusive");let ei=Math.floor(F*V),es=l.Children.toArray(C),ec=es.length*ei,eu=A?.clientWidth||ec,{maxHeight:ed,fiftyPercentHeight:eh,fiftyPercentWidth:eg}=(0,a.Vc)(),em=en&&"lg"===ea&&"ShoppingGridSmallCarousel"===N;en&&(t="sm"===ea?eh:ed);let ep=T?.justifyContent??(eu>ec?"center":"start"),ef=e=>void 0!==e?`${e}px`:L?"8px":void 0,eb=ef(T?.horizontalScrollContainerPaddingLeft),ev=ef(T?.horizontalScrollContainerPaddingRight);W&&(W.current="center"===ep?et.current:null);let ex=R||L?void 0:(0,y.oz)({slotWidth:ei,gap:$,numberOfSlides:es.length,index:P,containerWidth:eu,paddingX:O});return(0,v.jsxs)("div",{className:"BoardMoreIdeasRep"===j?"moreIdeasBoardRepCarousel":"",style:R?{height:"inherit"}:{},children:[(0,v.jsxs)(n.az,{alignItems:"center","data-test-id":"carousel-pin",display:"flex",height:R?"inherit":void 0,justifyContent:ep,overflow:em||K?void 0:"hidden",children:[B&&(0,v.jsx)(x,{index:P,length:es.length,showBadge:G}),"BoardMoreIdeasRep"!==j&&(0,v.jsx)(i.P,{pinKey:null!=Y?{type:"Legacy",data:Y}:null,children:e=>(0,v.jsx)(u.A,{carouselData:{...e,type:"canonical"},contextLogData:M,height:I??ee.current?.clientHeight??1,id:E,impressionType:"Pin",index:P,slideWidth:F,view:D??1,viewParameter:U??72},`carousel-impression-key-${P}`)}),L&&(0,v.jsx)(g.A,{unsafeCSS:k}),(0,v.jsx)("div",{ref:et,className:"horizontal-scroll-container","data-test-id":"carousel-container",style:{backgroundColor:r,overflowX:L?"scroll":"visible",paddingLeft:eb,paddingRight:ev,display:"flex",flexDirection:T?.flexDirection??"row",height:R?"inherit":void 0,marginLeft:O?`${O}px`:void 0,marginRight:O?`${O}px`:void 0,position:"relative",scrollbarWidth:0,transition:L||z?void 0:Z?"right .5s":"left .5s",right:Z?ex:void 0,left:Z?void 0:ex,width:R?"100%":void 0},children:es.map((e,r)=>{let o=r===es.length-1,l=Math.ceil($/4),i=0;l>=-12&&l<=12&&(i=l);let s=(0,v.jsx)(n.az,{ref:e=>{ee.current=e,0===r&&(eo.current=e)},"aria-label":(0,m.$)(Q._('Slide {{ currentSlide }} of {{ totalSlides }}', 'CloseupCarousel.Carousel.labelSlide', 'Accessibility label that defines a carousel slide. currentSlide: current slide number. totalSlides: total number of slides in carousel.'),{currentSlide:`${r+1}`,totalSlides:`${es.length}`}),"data-carousel-indicator":"carousel-card","data-test-id":`carousel-img-${r}`,display:r!==P&&R?"none":"block",height:R?"100%":I??void 0,marginEnd:o?0:i,maxHeight:t,maxWidth:em?`calc(${a.aP}px - ${a.T3}px * 2)`:eg,role:"group",width:R?"100%":ei,children:e},`carousel-slot-${E}-${r}`);if("BoardMoreIdeasRep"===j){let t=e.props,o={total_object_count:t?.story.objects?.length??0,storyType:t?.story.story_type,boardIdStr:t?.item.board_id,slotIndex:t?.slotIndex,story_id:t?.story.id};return(0,v.jsx)(h.g$,{componentType:S,contextLogData:o,impressionAuxFields:o,impressionType:"BoardMoreIdeasRep",loggingId:E,slotIndex:r,viewParameter:U??72,viewType:D??1,children:({impressionTrackerRef:e})=>(0,v.jsx)(n.az,{ref:e,children:s})},`carousel-slot-${E}-${r}`)}return s})})]}),14114===S&&(0,v.jsx)(c.En,{anchor:eo.current,experienceIds:[506684],idealDirection:"down",placementId:11,positionRelativeToAnchor:!0,showCaret:!0,textWeight:"normal",useMasonryFlyout:!0})]})}},823284(e,t,r){r.d(t,{A:()=>s});var o=r(61163),l=r(859471),n=r(19821),a=r(538329),i=r(562615);let s=({iconType:e,showFab:t,moduleHovered:r,opacity:s=80})=>{(0,l.useEffect)(()=>{(0,o.A)("NavigationFab","/app/www/common/Carousel/NavigationFab.tsx")},[]);let c=(0,a.A)(),[u,d]=(0,l.useState)(!1),h=r??u;return(0,i.jsx)(n.az,{"data-test-id":"navigation-fab-container",onMouseEnter:()=>d(!0),onMouseLeave:()=>d(!1),opacity:h?100:h===r?0:s,children:(0,i.jsx)(n.az,{dangerouslySetInlineStyle:{__style:{transition:"opacity 0.3s linear"}},opacity:100*!!t,children:(0,i.jsx)(n.K0,{accessibilityLabel:"forward"===e?c._('View Next', 'Button to advance carousel to the next image', 'Button to advance carousel to the next image'):c._('View Previous', 'Button to advance carousel to the previous image', 'Button to advance carousel to the previous image'),bgColor:"default",dataTestId:"navigation-fab",icon:"forward"===e?"chevron-right":"chevron-left",size:"md"})})})}},381786(e,t,r){r.d(t,{JF:()=>i,Jf:()=>n,KJ:()=>a,UV:()=>d,WD:()=>c,jV:()=>u,oz:()=>l,tS:()=>s});let o=({containerWidth:e,contentWidth:t,index:r,slotAndGapWidth:l})=>{let n=r-1,a=n*l;return t-a>=e?a:o({index:n,slotAndGapWidth:l,containerWidth:e,contentWidth:t})},l=({containerWidth:e,gap:t,index:r,numberOfSlides:l,slotWidth:n,paddingX:a})=>{let i=n+t,s=i*l,c=a?e-a:e;if(s<=c)return 0;let u=c/i,d=(({index:e,numberOfSlides:t,slidesShownPerPosition:r})=>t-e-Math.floor(r)<1)({index:r,numberOfSlides:l,slidesShownPerPosition:u})?(({containerWidth:e,contentWidth:t,gap:r,index:l,slidesShownPerPosition:n,slotAndGapWidth:a,paddingX:i=0})=>o({containerWidth:e,contentWidth:t,index:l,slotAndGapWidth:a})+(({slidesShownPerPosition:e,slotAndGapWidth:t})=>t-(e-parseInt(e,10))*t)({slidesShownPerPosition:n,slotAndGapWidth:a})-r+i)({containerWidth:c,contentWidth:s,gap:t,index:r,slidesShownPerPosition:u,slotAndGapWidth:i,paddingX:a}):r*i;return d?Math.round(-d):0},n=({containerWidth:e,gap:t,index:r,numberOfSlides:o,slotWidth:n,isHorizontalScrollable:a,paddingX:i,rows:s=1})=>{let c=o/s*n+t*(o-1),u=i?e-i:e;return 0!==e&&(c<=u||(a?c<=u:Math.abs(l({containerWidth:e,gap:t,index:r,numberOfSlides:o,slotWidth:n,paddingX:i}))+t>=c-u))},a=({containerWidth:e,currentIndex:t,gap:r,index:o,numberOfSlides:n,slotWidth:a,paddingX:i})=>{let s=a+r,c=i?e-i:e;if(s*n<=c||0===e)return!0;let u=l({containerWidth:e,gap:r,index:t,numberOfSlides:n,slotWidth:a,paddingX:i}),d=i?c+s+i:e+s;return u+s*o<d},i=(e,t,r)=>e||`${t._('carousel image', 'Alternate text for a carousel image that indicates it is a carousel pin, with carousel index followed', 'Alternate text for a carousel image that indicates it is a carousel pin, with carousel index followed')} ${r}`;function s({highResOnly:e,slot:t}){let{images:r}=t;return e?`${r?.["564x"]?.url??""} 1x`:[r?.["474x"]&&`${r["474x"].url??""} 2x`,r?.["736x"]&&`${r["736x"].url??""} 3x`,r?.orig&&`${r.orig.url??""} 4x`].filter(Boolean).join(", ")}let c=(e,t,r,o,l=0,n)=>{let a=n?r-n:r;if(a===t)return-(o*t*1)+(n||0);let i=Math.floor(a-t),s=t+l;return o===e-1?-1*o*s+i+(n||0):-1*o*s+(n||0)},u=(e,t,r,o,l,n,a)=>{if(!e||t<=0)return 0;let i=Math.floor(r*o),s=e?.clientWidth||n*i;return Math.round(((a?t-a:t)+(a?s-a:s)-i/2)/(i+l))-1},d=(e,t,r,o,l,n)=>{e.current&&t&&e.current.scrollBy({left:(r-o)*(l+n),behavior:"smooth"})}},974694(e,t,r){r.d(t,{Bt:()=>u,Fq:()=>h,LR:()=>n,Wi:()=>g,oH:()=>d,om:()=>c,pV:()=>a,yX:()=>i});var o=r(257300),l=r(805863);function n(e){return{type:"UPDATE_USER_PIN_COUNT",payload:e}}let a=(e,t)=>({type:"USER_FOLLOW",payload:{id:e,value:t}}),i=(e,t)=>({type:"USER_FOLLOWING_COUNT",payload:{id:e,following:t}}),s=(e,t)=>({type:"USER_BLOCK",payload:{id:e,value:t}}),c=({id:e,orbacSubjectId:t,blockSource:r,blockContext:l,logContextEvent:n})=>async a=>{a(s(e,!0));let i=await (0,o.A)({url:"/v3/users/{blocked_user}/block/",urlParams:{blocked_user:e},method:"PUT",data:{orbac_subject_id:t,block_source:r,block_context:l}}).catch(()=>a(s(e,!1)));return n({event_type:54,object_id_str:e}),i},u=(e,t)=>async r=>{r(s(e,!1));let l=await (0,o.A)({url:"/v3/users/{blocked_user}/block/",urlParams:{blocked_user:e},method:"DELETE"}).catch(()=>r(s(e,!0)));return t({event_type:55,object_id_str:e}),l};function d(e){return{type:"UPDATE_USER_SCHEDULED_PIN_COUNT",payload:e}}let h=(e,t)=>()=>(0,o.A)({url:"/v3/users/state/{state}/",urlParams:{state:e},method:"PUT",data:{value:t}}),g=(e,t,r)=>(n,a)=>{(0,o.A)({url:"/v3/users/me/",method:"POST"}).then(()=>{r({event_type:48,object_id_str:a().session.userId}),e(),(0,l.A)()},t)}}}]);
//# sourceMappingURL=https://sm.pinimg.com/webapp/49266-71ff3abe5b063277.mjs.map