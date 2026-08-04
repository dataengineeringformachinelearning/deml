var DemlUi=(function(e){Object.defineProperty(e,Symbol.toStringTag,{value:"Module"});var t=class extends HTMLElement{static{this.tagName="deml-accordion"}static{this.componentName="accordion"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="accordion">
      <details class="accordion__item" open>
        <summary class="accordion__trigger">Section one</summary>
        <div class="accordion__panel">Content for section one.</div>
      </details>
      <details class="accordion__item">
        <summary class="accordion__trigger">Section two</summary>
        <div class="accordion__panel">Content for section two.</div>
      </details>
    </div>`))}};function at(){customElements.get(t.tagName)||customElements.define(t.tagName,t)}var a=class extends HTMLElement{static{this.tagName="deml-activity-list"}static{this.componentName="activity-list"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<ul class="activity-list" aria-label="Recent activity">
      <li class="activity-list__item">
        <time datetime="2026-07-30T12:00:00Z">12:00</time>
        <p class="activity-list__title">Deploy completed</p>
        <p class="activity-list__meta">production</p>
      </li>
      <li class="activity-list__item">
        <time datetime="2026-07-30T11:40:00Z">11:40</time>
        <p class="activity-list__title">Config updated</p>
        <p class="activity-list__meta">settings</p>
      </li>
    </ul>`))}};function it(){customElements.get(a.tagName)||customElements.define(a.tagName,a)}var i=class extends HTMLElement{static{this.tagName="deml-app-footer"}static{this.componentName="app-footer"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<footer class="app-footer">
      <p class="app-footer__copy">© Product</p>
      <nav class="app-footer__nav" aria-label="Footer">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
      </nav>
    </footer>`))}};function st(){customElements.get(i.tagName)||customElements.define(i.tagName,i)}var s=class extends HTMLElement{static{this.tagName="deml-app-header"}static{this.componentName="app-header"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<header class="app-header">
      <a class="app-header__brand" href="#">Product</a>
      <nav class="app-header__nav" aria-label="App">
        <a href="#">Home</a>
        <a href="#">Docs</a>
      </nav>
      <div class="app-header__actions">
        <button type="button">Account</button>
      </div>
    </header>`))}};function lt(){customElements.get(s.tagName)||customElements.define(s.tagName,s)}var l=class extends HTMLElement{static{this.tagName="deml-app-layout"}static{this.componentName="app-layout"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="app-layout">
      <aside class="app-layout__nav" aria-label="App navigation">Nav</aside>
      <div class="app-layout__main">
        <header class="app-layout__header">Header</header>
        <main class="app-layout__content">Main content</main>
      </div>
      <aside class="app-layout__tools" aria-label="Tools">Tools</aside>
    </div>`))}};function nt(){customElements.get(l.tagName)||customElements.define(l.tagName,l)}var n=class extends HTMLElement{static{this.tagName="deml-app-sidebar"}static{this.componentName="app-sidebar"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<aside class="app-sidebar" aria-label="Dashboard">
      <p class="app-sidebar__brand">Product</p>
      <nav class="app-sidebar__nav">
        <a href="#" aria-current="page">Dashboard</a>
        <a href="#">Pipelines</a>
        <a href="#">Settings</a>
      </nav>
    </aside>`))}};function dt(){customElements.get(n.tagName)||customElements.define(n.tagName,n)}var d=class extends HTMLElement{static{this.tagName="deml-area-chart"}static{this.componentName="area-chart"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="area-chart-frame" role="img" aria-label="Area chart">
      <svg
        class="area-chart"
        viewBox="0 0 360 150"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <line class="area-chart-baseline" x1="32" y1="120" x2="348" y2="120" />
        <polyline
          class="area-chart-line"
          fill="none"
          points="32,110 80,90 140,95 200,50 260,70 320,40"
        />
      </svg>
    </div>`))}};function rt(){customElements.get(d.tagName)||customElements.define(d.tagName,d)}var r=class extends HTMLElement{static{this.tagName="deml-article"}static{this.componentName="article"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<article class="article"><h1>Article title</h1><p>Body copy.</p></article>'))}};function ct(){customElements.get(r.tagName)||customElements.define(r.tagName,r)}var c=class extends HTMLElement{static{this.tagName="deml-autocomplete"}static{this.componentName="autocomplete"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="autocomplete">
      <label for="autocomplete-input">Fruit</label>
      <input id="autocomplete-input" type="text" name="fruit" autocomplete="off" aria-autocomplete="list" aria-controls="autocomplete-list" aria-expanded="true" />
      <ul id="autocomplete-list" class="autocomplete__list" role="listbox">
        <li role="option" aria-selected="true">Apple</li>
        <li role="option">Apricot</li>
        <li role="option">Avocado</li>
      </ul>
    </div>`))}};function ot(){customElements.get(c.tagName)||customElements.define(c.tagName,c)}var o=class extends HTMLElement{static{this.tagName="deml-avatar"}static{this.componentName="avatar"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<span class="avatar" aria-label="Ada Lovelace">
      <span class="avatar__initials" aria-hidden="true">AL</span>
    </span>
    <span class="avatar" aria-label="User photo">
      <img class="avatar__image" src="" alt="" width="40" height="40" />
    </span>`))}};function mt(){customElements.get(o.tagName)||customElements.define(o.tagName,o)}var m=class extends HTMLElement{static{this.tagName="deml-badge"}static{this.componentName="badge"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<span class="badge">Badge</span>
    <span class="badge" data-tone="success">Success</span>
    <span class="badge" data-tone="warning">Warning</span>
    <span class="badge" data-tone="danger">Danger</span>`))}};function ut(){customElements.get(m.tagName)||customElements.define(m.tagName,m)}var u=class extends HTMLElement{static{this.tagName="deml-banner"}static{this.componentName="banner"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="banner banner--hero" data-variant="hero">
      <p class="preheader">DEML</p>
      <h1 class="banner-heading">Control plane for ML data.</h1>
      <p class="lede">Identity, status, analytics, and learning in one warm-ash surface.</p>
      <div class="banner-actions">
        <div class="button-group">
          <a class="button button--primary" href="#">Dashboard</a>
          <a class="button button--secondary" href="#">Explore</a>
        </div>
      </div>
    </div>`))}};function ht(){customElements.get(u.tagName)||customElements.define(u.tagName,u)}var h=class extends HTMLElement{static{this.tagName="deml-bar-chart"}static{this.componentName="bar-chart"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<ul class="bar-chart" role="list" aria-label="Bar chart">
      <li class="bar-chart-row">
        <div class="bar-chart-meta">
          <span class="bar-chart-label">Alpha</span>
          <span class="bar-chart-value">80%</span>
        </div>
        <div class="bar-chart-track" aria-hidden="true">
          <div class="bar-chart-fill" style="width: 80%"></div>
        </div>
      </li>
      <li class="bar-chart-row">
        <div class="bar-chart-meta">
          <span class="bar-chart-label">Beta</span>
          <span class="bar-chart-value">55%</span>
        </div>
        <div class="bar-chart-track" aria-hidden="true">
          <div class="bar-chart-fill" style="width: 55%"></div>
        </div>
      </li>
      <li class="bar-chart-row">
        <div class="bar-chart-meta">
          <span class="bar-chart-label">Gamma</span>
          <span class="bar-chart-value">35%</span>
        </div>
        <div class="bar-chart-track" aria-hidden="true">
          <div class="bar-chart-fill" style="width: 35%"></div>
        </div>
      </li>
    </ul>`))}};function pt(){customElements.get(h.tagName)||customElements.define(h.tagName,h)}var p=class extends HTMLElement{static{this.tagName="deml-box"}static{this.componentName="box"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="box">
      <p>Lightweight content grouping box.</p>
    </div>`))}};function ft(){customElements.get(p.tagName)||customElements.define(p.tagName,p)}var f=class extends HTMLElement{static{this.tagName="deml-brand"}static{this.componentName="brand"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<a class="brand" href="/" aria-label="Product home">
      <span class="brand__mark" aria-hidden="true"></span>
      <span class="brand__wordmark">Product</span>
    </a>`))}};function gt(){customElements.get(f.tagName)||customElements.define(f.tagName,f)}var g=class extends HTMLElement{static{this.tagName="deml-breadcrumbs"}static{this.componentName="breadcrumbs"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol class="breadcrumbs__list">
        <li><a href="#">Home</a></li>
        <li><a href="#">Library</a></li>
        <li aria-current="page">Current page</li>
      </ol>
    </nav>`))}};function bt(){customElements.get(g.tagName)||customElements.define(g.tagName,g)}var b=class extends HTMLElement{static{this.tagName="deml-bulk-toolbar"}static{this.componentName="bulk-toolbar"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="bulk-toolbar" role="toolbar" aria-label="Bulk actions">
      <span class="bulk-toolbar__count">3 selected</span>
      <button type="button">Archive</button>
      <button type="button">Delete</button>
      <button type="button">Clear selection</button>
    </div>`))}};function Nt(){customElements.get(b.tagName)||customElements.define(b.tagName,b)}var N=class extends HTMLElement{static{this.tagName="deml-button"}static{this.componentName="button"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<button type="button" class="button button--primary">Primary</button>
    <button type="button" class="button button--secondary">Secondary</button>
    <button type="button" class="button button--accent">Accent</button>
    <button type="button" class="button button--primary button--pill">Pill</button>
    <button type="button" class="button button--primary" disabled>Disabled</button>`))}};function vt(){customElements.get(N.tagName)||customElements.define(N.tagName,N)}var v=class extends HTMLElement{static{this.tagName="deml-button-group"}static{this.componentName="button-group"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="button-group" role="group" aria-label="Alignment">
      <button type="button">Left</button>
      <button type="button">Center</button>
      <button type="button">Right</button>
    </div>`))}};function _t(){customElements.get(v.tagName)||customElements.define(v.tagName,v)}var _=class extends HTMLElement{static{this.tagName="deml-callout"}static{this.componentName="callout"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<aside class="callout" role="status" data-tone="info">
      <div class="callout__body">
        <p class="callout__heading">Callout heading</p>
        <p class="callout__text">Highlighted message for the user.</p>
      </div>
      <button type="button" class="callout__close" aria-label="Dismiss">×</button>
    </aside>`))}};function yt(){customElements.get(_.tagName)||customElements.define(_.tagName,_)}var y=class extends HTMLElement{static{this.tagName="deml-card"}static{this.componentName="card"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<article class="card">
      <header class="card__header">
        <h3 class="card__title">Card title</h3>
        <p class="card__description">Optional supporting text.</p>
      </header>
      <div class="card__body">
        <p>Card body content.</p>
      </div>
      <footer class="card__footer">
        <button type="button" class="button">Action</button>
      </footer>
    </article>`))}};function Ht(){customElements.get(y.tagName)||customElements.define(y.tagName,y)}var H=class extends HTMLElement{static{this.tagName="deml-card-grid"}static{this.componentName="card-grid"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<div class="card-grid"><article class="card"><h3 class="card-heading">Card</h3></article></div>'))}};function Et(){customElements.get(H.tagName)||customElements.define(H.tagName,H)}var E=class extends HTMLElement{static{this.tagName="deml-chart"}static{this.componentName="chart"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<figure class="chart-figure">
      <div class="chart-figure__plot">
        <svg
          class="chart"
          viewBox="0 0 360 150"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Sample line chart"
        >
          <line x1="0" y1="130" x2="360" y2="130" stroke="currentColor" opacity="0.25" />
          <polyline
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            points="0,110 60,85 120,95 180,50 240,70 300,40 360,30"
          />
        </svg>
      </div>
      <figcaption>Chart placeholder (native SVG)</figcaption>
    </figure>`))}};function Ct(){customElements.get(E.tagName)||customElements.define(E.tagName,E)}var C=class extends HTMLElement{static{this.tagName="deml-chart-card"}static{this.componentName="chart-card"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<article class="chart-card" aria-labelledby="chart-card-demo-heading">
      <header class="chart-card-header">
        <h3 class="chart-card-heading" id="chart-card-demo-heading">Traffic</h3>
        <p class="chart-card-meta">Last 7 days</p>
      </header>
      <div class="chart-card-body">
        <div class="area-chart-frame" role="img" aria-label="Sample area chart">
          <svg
            class="area-chart"
            viewBox="0 0 360 150"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
            focusable="false"
          >
            <polyline
              class="area-chart-line"
              fill="none"
              points="32,110 80,90 140,95 200,50 260,70 320,40"
            />
          </svg>
        </div>
      </div>
    </article>`))}};function Tt(){customElements.get(C.tagName)||customElements.define(C.tagName,C)}var T=class extends HTMLElement{static{this.tagName="deml-chart-empty-state"}static{this.componentName="chart-empty-state"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="chart-empty-state" role="status">
      <p class="chart-empty-state__title">No chart data</p>
      <p class="chart-empty-state__description">Data will appear here once available.</p>
    </div>`))}};function Dt(){customElements.get(T.tagName)||customElements.define(T.tagName,T)}var D=class extends HTMLElement{static{this.tagName="deml-chart-panel"}static{this.componentName="chart-panel"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<section class="chart-panel" aria-labelledby="chart-panel-title">
      <header class="chart-panel__header">
        <h3 id="chart-panel-title">Chart panel</h3>
        <p class="chart-panel__value">42</p>
      </header>
      <div class="chart-panel__body" role="img" aria-label="Sample chart placeholder">
        <svg
          class="chart"
          viewBox="0 0 360 150"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          focusable="false"
        >
          <polyline
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            points="0,110 60,80 120,95 180,40 240,65 300,30 360,20"
          />
        </svg>
      </div>
    </section>`))}};function Lt(){customElements.get(D.tagName)||customElements.define(D.tagName,D)}var L=class extends HTMLElement{static{this.tagName="deml-checkbox"}static{this.componentName="checkbox"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label class="checkbox">
      <input type="checkbox" name="checkbox-demo" />
      <span class="checkbox__label">Checkbox option</span>
    </label>`))}};function Mt(){customElements.get(L.tagName)||customElements.define(L.tagName,L)}var M=class extends HTMLElement{static{this.tagName="deml-checkbox-field"}static{this.componentName="checkbox-field"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<label class="checkbox-field"><input type="checkbox" /><span>Remember me</span></label>'))}};function kt(){customElements.get(M.tagName)||customElements.define(M.tagName,M)}var k=class extends HTMLElement{static{this.tagName="deml-cluster"}static{this.componentName="cluster"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="cluster">
      <button type="button">Primary</button>
      <button type="button">Secondary</button>
      <span class="badge">Tag</span>
    </div>`))}};function St(){customElements.get(k.tagName)||customElements.define(k.tagName,k)}var S=class extends HTMLElement{static{this.tagName="deml-command"}static{this.componentName="command"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="command" role="dialog" aria-modal="true" aria-label="Command palette">
      <input class="command__input" type="search" placeholder="Type a command…" aria-controls="command-list" />
      <ul id="command-list" class="command__list" role="listbox">
        <li role="option" aria-selected="true">Go to dashboard</li>
        <li role="option">Open settings</li>
        <li role="option">Sign out</li>
      </ul>
    </div>`))}};function Pt(){customElements.get(S.tagName)||customElements.define(S.tagName,S)}var P=class extends HTMLElement{static{this.tagName="deml-confirm-dialog"}static{this.componentName="confirm-dialog"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<button type="button" class="button" data-deml-open-confirm>Delete item</button>
    <dialog class="confirm-dialog">
      <form method="dialog">
        <h3 class="confirm-dialog__title">Confirm action</h3>
        <p class="confirm-dialog__body">This cannot be undone.</p>
        <div class="confirm-dialog__actions">
          <button type="submit" class="button" value="cancel">Cancel</button>
          <button type="submit" class="button" data-variant="primary" value="confirm">Confirm</button>
        </div>
      </form>
    </dialog>`))}};function wt(){customElements.get(P.tagName)||customElements.define(P.tagName,P)}var w=class extends HTMLElement{static{this.tagName="deml-container"}static{this.componentName="container"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="container">
      <header class="container__header">
        <h3 class="container__title">Container</h3>
        <p class="container__description">Content anatomy wrapper.</p>
      </header>
      <div class="container__body">
        <p>Body content.</p>
      </div>
    </div>`))}};function At(){customElements.get(w.tagName)||customElements.define(w.tagName,w)}var A=class extends HTMLElement{static{this.tagName="deml-content-layout"}static{this.componentName="content-layout"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="content-layout">
      <nav class="content-layout__breadcrumbs" aria-label="Breadcrumb">Home / Page</nav>
      <header class="content-layout__header">
        <h1>Content layout</h1>
      </header>
      <div class="content-layout__body">Body region</div>
    </div>`))}};function Bt(){customElements.get(A.tagName)||customElements.define(A.tagName,A)}var B=class extends HTMLElement{static{this.tagName="deml-dashboard-grid"}static{this.componentName="dashboard-grid"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="dashboard-grid">
      <div class="dashboard-grid__cell" data-size="sm">Tile SM</div>
      <div class="dashboard-grid__cell" data-size="md">Tile MD</div>
      <div class="dashboard-grid__cell" data-size="sm">Tile SM</div>
    </div>`))}};function Ft(){customElements.get(B.tagName)||customElements.define(B.tagName,B)}var F=class extends HTMLElement{static{this.tagName="deml-dialog"}static{this.componentName="dialog"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<button type="button" class="button" data-deml-open-dialog>Open dialog</button>
    <dialog class="dialog" id="demo-dialog">
      <form method="dialog">
        <h3>Dialog</h3>
        <p>Native modal dialog for focused tasks.</p>
        <div class="cluster">
          <button type="submit" class="button" value="cancel">Close</button>
          <button type="submit" class="button" data-variant="primary" value="confirm">Confirm</button>
        </div>
      </form>
    </dialog>`))}};function xt(){customElements.get(F.tagName)||customElements.define(F.tagName,F)}var x=class extends HTMLElement{static{this.tagName="deml-disclosure"}static{this.componentName="disclosure"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="disclosure">
      <button type="button" class="disclosure__trigger" aria-expanded="false" aria-controls="disclosure-panel">
        Show more
      </button>
      <div id="disclosure-panel" class="disclosure__panel" hidden>
        Progressive disclosure content.
      </div>
    </div>`))}};function It(){customElements.get(x.tagName)||customElements.define(x.tagName,x)}var I=class extends HTMLElement{static{this.tagName="deml-dropdown"}static{this.componentName="dropdown"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="dropdown">
      <button type="button" class="dropdown__trigger" aria-haspopup="menu" aria-expanded="false" aria-controls="dropdown-menu">Actions</button>
      <ul id="dropdown-menu" class="dropdown__menu" role="menu" hidden>
        <li role="none"><button type="button" role="menuitem">Edit</button></li>
        <li role="none"><button type="button" role="menuitem">Duplicate</button></li>
        <li role="none"><button type="button" role="menuitem">Delete</button></li>
      </ul>
    </div>`))}};function Gt(){customElements.get(I.tagName)||customElements.define(I.tagName,I)}var G=class extends HTMLElement{static{this.tagName="deml-empty-state"}static{this.componentName="empty-state"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="empty-state" role="status">
      <p class="empty-state__eyebrow">Empty</p>
      <p class="empty-state__title">No items yet</p>
      <p class="empty-state__description">Create your first item to get started.</p>
      <div class="empty-state__actions">
        <button type="button">Create item</button>
      </div>
    </div>`))}};function Rt(){customElements.get(G.tagName)||customElements.define(G.tagName,G)}var R=class extends HTMLElement{static{this.tagName="deml-error-state"}static{this.componentName="error-state"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="error-state" role="alert">
      <p class="error-state__title">Something went wrong</p>
      <p class="error-state__description">We could not load this resource. Try again.</p>
      <div class="error-state__actions">
        <button type="button">Retry</button>
      </div>
    </div>`))}};function zt(){customElements.get(R.tagName)||customElements.define(R.tagName,R)}var z=class extends HTMLElement{static{this.tagName="deml-explore-card"}static{this.componentName="explore-card"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<article class="explore-card" data-status="operational">
      <header class="explore-card__header">
        <div class="explore-card__meta">
          <span class="status-pill" data-status="up">Operational</span>
          <span class="explore-card__tag">Public Status Page</span>
        </div>
        <h3 class="explore-card__title">Platform Status</h3>
        <p class="explore-card__lede">Live service health for the DEML control plane.</p>
      </header>
      <ul class="explore-card__metrics" role="list">
        <li class="explore-card__metric">
          <span class="explore-card__metric-label">Cumulative SLA</span>
          <span class="explore-card__metric-value">99.98%</span>
          <span class="explore-card__metric-meta">Based on real telemetry</span>
        </li>
        <li class="explore-card__metric">
          <span class="explore-card__metric-label">P99 Latency</span>
          <span class="explore-card__metric-value">42ms</span>
          <span class="explore-card__metric-meta">Last 24h</span>
        </li>
        <li class="explore-card__metric">
          <span class="explore-card__metric-label">Spike Risk</span>
          <span class="explore-card__metric-value">12.00</span>
          <span class="explore-card__metric-meta">Dynamic Temporal Forecasting</span>
        </li>
        <li class="explore-card__metric">
          <span class="explore-card__metric-label">Threat Anomaly</span>
          <span class="explore-card__metric-value">0.40%</span>
          <span class="explore-card__metric-meta">Active</span>
        </li>
      </ul>
      <div class="explore-card__uptime">
        <div class="explore-card__uptime-head">
          <span class="explore-card__uptime-label">Uptime</span>
          <span class="explore-card__uptime-value">99.9%</span>
        </div>
        <div class="explore-card__uptime-track" aria-hidden="true">
          <span class="explore-card__uptime-seg" data-status="up"></span>
          <span class="explore-card__uptime-seg" data-status="up"></span>
          <span class="explore-card__uptime-seg" data-status="partial"></span>
          <span class="explore-card__uptime-seg" data-status="up"></span>
          <span class="explore-card__uptime-seg" data-status="up"></span>
        </div>
        <p class="explore-card__uptime-summary">No current issues</p>
      </div>
      <footer class="explore-card__footer">
        <a class="button button--primary button--pill" href="#">View status</a>
      </footer>
    </article>`))}};function Ot(){customElements.get(z.tagName)||customElements.define(z.tagName,z)}var O=class extends HTMLElement{static{this.tagName="deml-field"}static{this.componentName="field"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="field" role="group" aria-labelledby="field-label">
      <label class="field__label-wrap" for="field-input">
        <span class="field__label" id="field-label">Field label <span class="field__required" aria-hidden="true">*</span></span>
        <input id="field-input" class="field__control" type="text" name="field" required aria-describedby="field-desc" />
      </label>
      <p class="field__description" id="field-desc">Helper text for the control.</p>
    </div>`))}};function Ut(){customElements.get(O.tagName)||customElements.define(O.tagName,O)}var U=class extends HTMLElement{static{this.tagName="deml-file-upload"}static{this.componentName="file-upload"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="file-upload">
      <label class="file-upload__dropzone" for="file-upload-input">
        <span class="file-upload__title">Drop files here</span>
        <span class="file-upload__hint">or click to browse</span>
        <input id="file-upload-input" class="file-upload__input" type="file" multiple />
      </label>
      <ul class="file-upload__list" aria-label="Selected files"></ul>
    </div>`))}};function Wt(){customElements.get(U.tagName)||customElements.define(U.tagName,U)}var W=class extends HTMLElement{static{this.tagName="deml-flashbar"}static{this.componentName="flashbar"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<ul class="flashbar" aria-label="Notifications">
      <li class="flashbar__item" data-tone="info">
        <p class="flashbar__message">Informational notice.</p>
        <button type="button" class="flashbar__dismiss" aria-label="Dismiss">×</button>
      </li>
      <li class="flashbar__item" data-tone="warning">
        <p class="flashbar__message">Warning notice.</p>
        <button type="button" class="flashbar__dismiss" aria-label="Dismiss">×</button>
      </li>
    </ul>`))}};function Kt(){customElements.get(W.tagName)||customElements.define(W.tagName,W)}var K=class extends HTMLElement{static{this.tagName="deml-form-grid"}static{this.componentName="form-grid"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="form-grid">
      <label>First name <input type="text" name="first" /></label>
      <label>Last name <input type="text" name="last" /></label>
      <label>Email <input type="email" name="email" /></label>
      <label>Company <input type="text" name="company" /></label>
    </div>`))}};function Jt(){customElements.get(K.tagName)||customElements.define(K.tagName,K)}var J=class extends HTMLElement{static{this.tagName="deml-form-panel"}static{this.componentName="form-panel"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<form class="form-panel"><label class="field"><span class="field__label">Email</span><input class="input-text" type="email" /></label><button class="button button--primary" type="submit">Submit</button></form>'))}};function Yt(){customElements.get(J.tagName)||customElements.define(J.tagName,J)}var Y=class extends HTMLElement{static{this.tagName="deml-form-section"}static{this.componentName="form-section"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<section class="form-section">
      <header class="form-section__header">
        <h3 class="form-section__title">Account</h3>
        <p class="form-section__description">Basic profile settings.</p>
      </header>
      <div class="form-section__body">
        <label>Name <input type="text" name="name" /></label>
        <label>Email <input type="email" name="email" /></label>
      </div>
    </section>`))}};function jt(){customElements.get(Y.tagName)||customElements.define(Y.tagName,Y)}var j=class extends HTMLElement{static{this.tagName="deml-grid"}static{this.componentName="grid"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="grid">
      <div class="grid__item">A</div>
      <div class="grid__item">B</div>
      <div class="grid__item">C</div>
      <div class="grid__item">D</div>
    </div>`))}};function qt(){customElements.get(j.tagName)||customElements.define(j.tagName,j)}var q=class extends HTMLElement{static{this.tagName="deml-help-panel"}static{this.componentName="help-panel"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<aside class="help-panel" aria-labelledby="help-panel-title">
      <h3 id="help-panel-title">Help</h3>
      <p>Contextual guidance for this page.</p>
      <a href="#">Learn more</a>
    </aside>`))}};function Vt(){customElements.get(q.tagName)||customElements.define(q.tagName,q)}var V=class extends HTMLElement{static{this.tagName="deml-hud-panel"}static{this.componentName="hud-panel"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<section class="hud-panel" aria-labelledby="hud-panel-title">
      <header class="hud-panel__header">
        <h3 id="hud-panel-title">HUD panel</h3>
      </header>
      <div class="hud-panel__body">
        <p>Dashboard panel body.</p>
      </div>
    </section>`))}};function Zt(){customElements.get(V.tagName)||customElements.define(V.tagName,V)}var Z=class extends HTMLElement{static{this.tagName="deml-icon"}static{this.componentName="icon"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<svg class="icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
      <path d="M12 8v4l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <span class="icon-label">Icon placeholder</span>`))}};function Qt(){customElements.get(Z.tagName)||customElements.define(Z.tagName,Z)}var Q=class extends HTMLElement{static{this.tagName="deml-input-date"}static{this.componentName="input-date"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="input-date-field">Date</label>
    <input id="input-date-field" name="date" type="date">`))}};function Xt(){customElements.get(Q.tagName)||customElements.define(Q.tagName,Q)}var X=class extends HTMLElement{static{this.tagName="deml-input-email"}static{this.componentName="input-email"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="input-email-field">Email</label>
    <input id="input-email-field" name="email" type="email" placeholder="you@example.com" autocomplete="email">`))}};function $t(){customElements.get(X.tagName)||customElements.define(X.tagName,X)}var $=class extends HTMLElement{static{this.tagName="deml-input-number"}static{this.componentName="input-number"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="input-number-field">Number</label>
    <input id="input-number-field" name="number" type="number" min="0" max="100" step="1" value="10">`))}};function ea(){customElements.get($.tagName)||customElements.define($.tagName,$)}var ee=class extends HTMLElement{static{this.tagName="deml-input-password"}static{this.componentName="input-password"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="input-password-field">Password</label>
    <input id="input-password-field" name="password" type="password" placeholder="Password" autocomplete="new-password">`))}};function ta(){customElements.get(ee.tagName)||customElements.define(ee.tagName,ee)}var te=class extends HTMLElement{static{this.tagName="deml-input-range"}static{this.componentName="input-range"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="input-range-field">Range</label>
    <input id="input-range-field" name="range" type="range" min="0" max="100" value="40">`))}};function aa(){customElements.get(te.tagName)||customElements.define(te.tagName,te)}var ae=class extends HTMLElement{static{this.tagName="deml-input-search"}static{this.componentName="input-search"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="input-search-field">Search</label>
    <input id="input-search-field" name="search" type="search" placeholder="Search…">`))}};function ia(){customElements.get(ae.tagName)||customElements.define(ae.tagName,ae)}var ie=class extends HTMLElement{static{this.tagName="deml-input-text"}static{this.componentName="input-text"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="input-text-field">Name</label>
    <input id="input-text-field" name="name" type="text" placeholder="Name" autocomplete="name" required>`))}};function sa(){customElements.get(ie.tagName)||customElements.define(ie.tagName,ie)}var se=class extends HTMLElement{static{this.tagName="deml-input-time"}static{this.componentName="input-time"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="input-time-field">Time</label>
    <input id="input-time-field" name="time" type="time">`))}};function la(){customElements.get(se.tagName)||customElements.define(se.tagName,se)}var le=class extends HTMLElement{static{this.tagName="deml-kbd"}static{this.componentName="kbd"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<p>Press <kbd class="kbd">⌘</kbd> <kbd class="kbd">K</kbd> to search.</p>'))}};function na(){customElements.get(le.tagName)||customElements.define(le.tagName,le)}var ne=class extends HTMLElement{static{this.tagName="deml-label"}static{this.componentName="label"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label class="label" for="label-demo-input">Label</label>
    <input id="label-demo-input" type="text" name="label-demo" />`))}};function da(){customElements.get(ne.tagName)||customElements.define(ne.tagName,ne)}var de=class extends HTMLElement{static{this.tagName="deml-loading-overlay"}static{this.componentName="loading-overlay"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="loading-overlay" role="status" aria-busy="true" aria-label="Loading">
      <span class="loading-overlay__message">Loading…</span>
    </div>`))}};function ra(){customElements.get(de.tagName)||customElements.define(de.tagName,de)}var re=class extends HTMLElement{static{this.tagName="deml-metric-card"}static{this.componentName="metric-card"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<article class="stat-card metric-card">
      <p class="stat-card__label metric-card__label">Sessions</p>
      <p class="stat-card__value metric-card__value">1.2k</p>
      <p class="stat-card__delta metric-card__trend">+4.2%</p>
    </article>`))}};function ca(){customElements.get(re.tagName)||customElements.define(re.tagName,re)}var ce=class extends HTMLElement{static{this.tagName="deml-metric-list"}static{this.componentName="metric-list"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<ul class="metric-list"><li class="metric-list__item"><span>Metric</span><strong>12</strong></li></ul>'))}};function oa(){customElements.get(ce.tagName)||customElements.define(ce.tagName,ce)}var oe=class extends HTMLElement{static{this.tagName="deml-microcard"}static{this.componentName="microcard"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<article class="microcard"><p class="microcard__label">Label</p><p class="microcard__value">42</p></article>'))}};function ma(){customElements.get(oe.tagName)||customElements.define(oe.tagName,oe)}var me=class extends HTMLElement{static{this.tagName="deml-microcard-grid"}static{this.componentName="microcard-grid"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<div class="microcard-grid"><article class="microcard"><p class="microcard__label">A</p><p class="microcard__value">1</p></article></div>'))}};function ua(){customElements.get(me.tagName)||customElements.define(me.tagName,me)}var ue=class extends HTMLElement{static{this.tagName="deml-navbar"}static{this.componentName="navbar"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<header class="site-navbar"><div class="site-navbar-branding"><a class="site-navbar-icon" href="#">DEML</a></div><nav class="main-navigation"><ul><li><a href="#">Home</a></li></ul></nav></header>'))}};function ha(){customElements.get(ue.tagName)||customElements.define(ue.tagName,ue)}var he=class extends HTMLElement{static{this.tagName="deml-navigation-menu"}static{this.componentName="navigation-menu"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<nav class="navigation-menu" aria-label="Primary">
      <ul class="navigation-menu__list">
        <li><a class="navigation-menu__link" href="#" aria-current="page">Dashboard</a></li>
        <li><a class="navigation-menu__link" href="#">Analytics</a></li>
        <li><a class="navigation-menu__link" href="#">Settings</a></li>
      </ul>
    </nav>`))}};function pa(){customElements.get(he.tagName)||customElements.define(he.tagName,he)}var pe=class extends HTMLElement{static{this.tagName="deml-page-back-link"}static{this.componentName="page-back-link"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<a class="page-back-link" href="#">← Back to list</a>'))}};function fa(){customElements.get(pe.tagName)||customElements.define(pe.tagName,pe)}var fe=class extends HTMLElement{static{this.tagName="deml-page-header"}static{this.componentName="page-header"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<header class="page-header">
      <div class="page-header__text">
        <h1 class="page-header__title">Page title</h1>
        <p class="page-header__subtitle">Short page description.</p>
      </div>
      <div class="page-header__actions">
        <button type="button">Secondary</button>
        <button type="button">Primary</button>
      </div>
    </header>`))}};function ga(){customElements.get(fe.tagName)||customElements.define(fe.tagName,fe)}var ge=class extends HTMLElement{static{this.tagName="deml-page-section"}static{this.componentName="page-section"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<section class="page-section"><div class="page-section__body">Section body</div></section>'))}};function ba(){customElements.get(ge.tagName)||customElements.define(ge.tagName,ge)}var be=class extends HTMLElement{static{this.tagName="deml-page-shell"}static{this.componentName="page-shell"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="page-shell">
      <div class="page-shell__inner">
        <p>Constrained page canvas content.</p>
      </div>
    </div>`))}};function Na(){customElements.get(be.tagName)||customElements.define(be.tagName,be)}var Ne=class extends HTMLElement{static{this.tagName="deml-page-template"}static{this.componentName="page-template"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="page-template">
      <header class="page-template__header">
        <h1>Page template</h1>
        <div class="page-template__actions"><button type="button">Action</button></div>
      </header>
      <div class="page-template__content">
        <p>Route content region.</p>
      </div>
      <footer class="page-template__footer">Footer slot</footer>
    </div>`))}};function va(){customElements.get(Ne.tagName)||customElements.define(Ne.tagName,Ne)}var ve=class extends HTMLElement{static{this.tagName="deml-pagination"}static{this.componentName="pagination"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<nav class="pagination" aria-label="Pagination">
      <button type="button" class="pagination__prev" aria-label="Previous page">Previous</button>
      <ul class="pagination__pages">
        <li><button type="button" aria-current="page">1</button></li>
        <li><button type="button">2</button></li>
        <li><button type="button">3</button></li>
      </ul>
      <button type="button" class="pagination__next" aria-label="Next page">Next</button>
    </nav>`))}};function _a(){customElements.get(ve.tagName)||customElements.define(ve.tagName,ve)}var _e=class extends HTMLElement{static{this.tagName="deml-panel-grid"}static{this.componentName="panel-grid"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="panel-grid">
      <article class="panel-grid__item">Panel A</article>
      <article class="panel-grid__item">Panel B</article>
    </div>`))}};function ya(){customElements.get(_e.tagName)||customElements.define(_e.tagName,_e)}var ye=class extends HTMLElement{static{this.tagName="deml-popover"}static{this.componentName="popover"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="popover">
      <button type="button" class="popover__trigger" aria-expanded="false" aria-controls="popover-panel">Open popover</button>
      <div id="popover-panel" class="popover__panel" role="dialog" aria-label="Popover" hidden>
        <p>Popover content for contextual actions.</p>
        <button type="button" class="button">Got it</button>
      </div>
    </div>`))}};function Ha(){customElements.get(ye.tagName)||customElements.define(ye.tagName,ye)}var He=class extends HTMLElement{static{this.tagName="deml-profile"}static{this.componentName="profile"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="profile">
      <span class="avatar" aria-hidden="true"><span class="avatar__initials">JD</span></span>
      <div class="profile__text">
        <p class="profile__name">Jane Doe</p>
        <p class="profile__meta">jane@example.com</p>
      </div>
    </div>`))}};function Ea(){customElements.get(He.tagName)||customElements.define(He.tagName,He)}var Ee=class extends HTMLElement{static{this.tagName="deml-progress"}static{this.componentName="progress"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="progress-field">Progress</label>
    <progress id="progress-field" value="70" max="100">70%</progress>`))}};function Ca(){customElements.get(Ee.tagName)||customElements.define(Ee.tagName,Ee)}var Ce=class extends HTMLElement{static{this.tagName="deml-property-filter"}static{this.componentName="property-filter"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="property-filter">
      <label for="property-filter-input">Filter</label>
      <div class="property-filter__control">
        <ul class="property-filter__tokens" aria-label="Active filters">
          <li class="property-filter__token">status = active <button type="button" aria-label="Remove">×</button></li>
        </ul>
        <input id="property-filter-input" type="search" placeholder="Filter properties…" />
      </div>
    </div>`))}};function Ta(){customElements.get(Ce.tagName)||customElements.define(Ce.tagName,Ce)}var Te=class extends HTMLElement{static{this.tagName="deml-radio-group"}static{this.componentName="radio-group"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<fieldset class="radio-group">
      <legend class="radio-group__legend">Plan</legend>
      <label class="radio-group__option"><input type="radio" name="plan" value="free" /> Free</label>
      <label class="radio-group__option"><input type="radio" name="plan" value="pro" checked /> Pro</label>
      <label class="radio-group__option"><input type="radio" name="plan" value="team" /> Team</label>
    </fieldset>`))}};function Da(){customElements.get(Te.tagName)||customElements.define(Te.tagName,Te)}var De=class extends HTMLElement{static{this.tagName="deml-scroll-area"}static{this.componentName="scroll-area"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="scroll-area" tabindex="0">
      <p>Scrollable region with constrained height.</p>
      <p>Additional content for overflow.</p>
      <p>More content.</p>
      <p>Even more content.</p>
    </div>`))}};function La(){customElements.get(De.tagName)||customElements.define(De.tagName,De)}var Le=class extends HTMLElement{static{this.tagName="deml-section"}static{this.componentName="section"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<section class="section">
      <header class="section__header">
        <h3 class="section__title">Section title</h3>
        <p class="section__description">Section supporting text.</p>
      </header>
      <div class="section__body">
        <p>Section body.</p>
      </div>
    </section>`))}};function Ma(){customElements.get(Le.tagName)||customElements.define(Le.tagName,Le)}var Me=class extends HTMLElement{static{this.tagName="deml-section-header"}static{this.componentName="section-header"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<header class="section-header"><p class="type-eyebrow">Eyebrow</p><h2 class="type-display">Section</h2><p class="type-intro">Supporting copy.</p></header>'))}};function ka(){customElements.get(Me.tagName)||customElements.define(Me.tagName,Me)}var ke=class extends HTMLElement{static{this.tagName="deml-section-template"}static{this.componentName="section-template"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<section class="section-template">
      <header class="section-template__header">
        <div>
          <h3 class="section-template__title">Section template</h3>
          <p class="section-template__description">Reusable section anatomy.</p>
        </div>
        <div class="section-template__actions"><button type="button">Action</button></div>
      </header>
      <hr class="section-template__divider" />
      <div class="section-template__body">Body content.</div>
    </section>`))}};function Sa(){customElements.get(ke.tagName)||customElements.define(ke.tagName,ke)}var Se=class extends HTMLElement{static{this.tagName="deml-select"}static{this.componentName="select"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="select-field">Country</label>
    <select id="select-field" name="country">
      <optgroup label="Americas">
        <option value="us">United States</option>
        <option value="ca">Canada</option>
      </optgroup>
      <optgroup label="Europe">
        <option value="uk">United Kingdom</option>
        <option value="de">Germany</option>
      </optgroup>
    </select>`))}};function Pa(){customElements.get(Se.tagName)||customElements.define(Se.tagName,Se)}var Pe=class extends HTMLElement{static{this.tagName="deml-separator"}static{this.componentName="separator"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<p>Above</p>
    <hr class="separator" />
    <p>Below</p>
    <div class="separator separator--vertical" role="separator" aria-orientation="vertical"></div>`))}};function wa(){customElements.get(Pe.tagName)||customElements.define(Pe.tagName,Pe)}var we=class extends HTMLElement{static{this.tagName="deml-sheet"}static{this.componentName="sheet"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<button type="button" class="button" data-deml-open-sheet>Open sheet</button>
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" hidden>
      <header class="sheet__header">
        <h3 id="sheet-title">Sheet title</h3>
        <button type="button" class="sheet__close" aria-label="Close" data-deml-close-sheet>×</button>
      </header>
      <div class="sheet__body">
        <p>Slide-over panel content.</p>
      </div>
      <footer class="sheet__footer">
        <button type="button" class="button" data-deml-close-sheet>Cancel</button>
        <button type="button" class="button" data-variant="primary">Save</button>
      </footer>
    </div>`))}};function Aa(){customElements.get(we.tagName)||customElements.define(we.tagName,we)}var Ae=class extends HTMLElement{static{this.tagName="deml-sidebar-nav"}static{this.componentName="sidebar-nav"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<nav class="sidebar-nav" aria-label="Sidebar">
      <p class="sidebar-nav__header">Workspace</p>
      <ul class="sidebar-nav__list">
        <li><a href="#" aria-current="page">Overview</a></li>
        <li>
          <button type="button" aria-expanded="true">Projects</button>
          <ul>
            <li><a href="#">Alpha</a></li>
            <li><a href="#">Beta</a></li>
          </ul>
        </li>
        <li><a href="#">Members</a></li>
      </ul>
    </nav>`))}};function Ba(){customElements.get(Ae.tagName)||customElements.define(Ae.tagName,Ae)}var Be=class extends HTMLElement{static{this.tagName="deml-site-footer"}static{this.componentName="site-footer"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<footer class="site-footer">
      <div class="site-footer__inner">
        <nav class="site-footer__directory" aria-label="Footer">
          <div class="site-footer__column">
            <h3 class="site-footer__heading">Platforms</h3>
            <ul class="site-footer__list">
              <li><a href="#">DEML</a></li>
              <li><a href="#">FORJD</a></li>
              <li><a href="#">Explore</a></li>
              <li><a href="#">Dashboard</a></li>
            </ul>
          </div>
          <div class="site-footer__column">
            <h3 class="site-footer__heading">Resources</h3>
            <ul class="site-footer__list">
              <li><a href="#">Community</a></li>
              <li><a href="#">Whitepaper</a></li>
              <li><a href="#">Book</a></li>
              <li><a href="#">Blue Notes</a></li>
              <li><a href="#">Learn</a></li>
            </ul>
          </div>
          <div class="site-footer__column">
            <h3 class="site-footer__heading">Support</h3>
            <ul class="site-footer__list">
              <li><a href="#">Platform Status</a></li>
              <li><a href="#">Report a Bug</a></li>
            </ul>
          </div>
          <div class="site-footer__column">
            <h3 class="site-footer__heading">Legal &amp; Compliance</h3>
            <ul class="site-footer__list">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">SOC2 Compliance</a></li>
              <li><a href="#">GDPR Compliance</a></li>
            </ul>
          </div>
        </nav>
        <div class="site-footer__bottom">
          <p class="site-footer__badge">Made in the U.S.A.</p>
          <p class="site-footer__copy">
            Copyright © 2026 Data Engineering for Machine Learning by
            <a href="https://joealongi.dev/" target="_blank" rel="noopener noreferrer">Joe Alongi</a>.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>`))}};function Fa(){customElements.get(Be.tagName)||customElements.define(Be.tagName,Be)}var Fe=class extends HTMLElement{static{this.tagName="deml-skeleton"}static{this.componentName="skeleton"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="skeleton" aria-hidden="true">
      <div class="skeleton__line skeleton__line--short"></div>
      <div class="skeleton__line skeleton__line--long"></div>
      <div class="skeleton__line skeleton__line--medium"></div>
    </div>`))}};function xa(){customElements.get(Fe.tagName)||customElements.define(Fe.tagName,Fe)}var xe=class extends HTMLElement{static{this.tagName="deml-skip-link"}static{this.componentName="skip-link"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<a class="skip-link" href="#main">Skip to content</a>
    <p id="main">Focus the skip link (Tab) to reveal it — first focusable control on real pages.</p>`))}};function Ia(){customElements.get(xe.tagName)||customElements.define(xe.tagName,xe)}var Ie=class extends HTMLElement{static{this.tagName="deml-spinner"}static{this.componentName="spinner"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<span class="spinner" role="status" aria-label="Loading">
      <span class="spinner__visual" aria-hidden="true"></span>
    </span>`))}};function Ga(){customElements.get(Ie.tagName)||customElements.define(Ie.tagName,Ie)}var Ge=class extends HTMLElement{static{this.tagName="deml-split-panel"}static{this.componentName="split-panel"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="split-panel">
      <div class="split-panel__main">
        <p>Main content region.</p>
      </div>
      <aside class="split-panel__side" aria-label="Details">
        <h3>Details</h3>
        <p>Contextual side panel.</p>
      </aside>
    </div>`))}};function Ra(){customElements.get(Ge.tagName)||customElements.define(Ge.tagName,Ge)}var Re=class extends HTMLElement{static{this.tagName="deml-stack"}static{this.componentName="stack"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="stack">
      <div>Stack item one</div>
      <div>Stack item two</div>
      <div>Stack item three</div>
    </div>`))}};function za(){customElements.get(Re.tagName)||customElements.define(Re.tagName,Re)}var ze=class extends HTMLElement{static{this.tagName="deml-stat-card"}static{this.componentName="stat-card"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<article class="stat-card"><p class="stat-card__label">Sessions</p><p class="stat-card__value">1.2k</p><p class="stat-card__delta">+4%</p></article>'))}};function Oa(){customElements.get(ze.tagName)||customElements.define(ze.tagName,ze)}var Oe=class extends HTMLElement{static{this.tagName="deml-status-badge"}static{this.componentName="status-badge"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<span class="status-badge" data-tone="success">
      <span class="status-badge__dot" aria-hidden="true"></span>
      Operational
    </span>
    <span class="status-badge" data-tone="danger">
      <span class="status-badge__dot" aria-hidden="true"></span>
      Degraded
    </span>`))}};function Ua(){customElements.get(Oe.tagName)||customElements.define(Oe.tagName,Oe)}var Ue=class extends HTMLElement{static{this.tagName="deml-status-card"}static{this.componentName="status-card"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<article class="status-card">
      <header class="status-card__header">
        <h3 class="status-card__title">API</h3>
        <span class="status-pill" data-status="up">Operational</span>
      </header>
      <p class="status-card__description">Public API endpoints.</p>
      <p class="status-card__uptime">Uptime 99.99%</p>
    </article>`))}};function Wa(){customElements.get(Ue.tagName)||customElements.define(Ue.tagName,Ue)}var We=class extends HTMLElement{static{this.tagName="deml-status-pill"}static{this.componentName="status-pill"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<span class="status-pill" data-status="up">Up</span>
    <span class="status-pill" data-status="down">Down</span>
    <span class="status-pill" data-status="maintenance">Maintenance</span>`))}};function Ka(){customElements.get(We.tagName)||customElements.define(We.tagName,We)}var Ke=class extends HTMLElement{static{this.tagName="deml-switch"}static{this.componentName="switch"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label class="switch">
      <span class="switch__track">
        <input type="checkbox" role="switch" name="switch-demo" aria-checked="false" />
        <span class="switch__thumb" aria-hidden="true"></span>
      </span>
      <span class="switch__content">
        <span class="switch__label">Enable notifications</span>
        <span class="switch__description">Receive product updates by email.</span>
      </span>
    </label>`))}};function Ja(){customElements.get(Ke.tagName)||customElements.define(Ke.tagName,Ke)}var Je=class extends HTMLElement{static{this.tagName="deml-table"}static{this.componentName="table"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<table>
      <caption>Sample data table</caption>
      <colgroup>
        <col span="1">
        <col span="2">
      </colgroup>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Role</th>
          <th scope="col">Score</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Ada</th>
          <td>Engineer</td>
          <td>98</td>
        </tr>
        <tr>
          <th scope="row">Grace</th>
          <td>Scientist</td>
          <td>95</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">Average</th>
          <td colspan="2">96.5</td>
        </tr>
      </tfoot>
    </table>`))}};function Ya(){customElements.get(Je.tagName)||customElements.define(Je.tagName,Je)}var Ye=class extends HTMLElement{static{this.tagName="deml-tabs"}static{this.componentName="tabs"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="tabs">
      <div class="tabs__list" role="tablist" aria-label="Sample tabs">
        <button type="button" class="tabs__tab" role="tab" aria-selected="true" aria-controls="tab-panel-1" id="tab-1" tabindex="0">Overview</button>
        <button type="button" class="tabs__tab" role="tab" aria-selected="false" aria-controls="tab-panel-2" id="tab-2" tabindex="-1">Details</button>
        <button type="button" class="tabs__tab" role="tab" aria-selected="false" aria-controls="tab-panel-3" id="tab-3" tabindex="-1">Settings</button>
      </div>
      <div class="tabs__panel" role="tabpanel" id="tab-panel-1" aria-labelledby="tab-1">Overview content.</div>
      <div class="tabs__panel" role="tabpanel" id="tab-panel-2" aria-labelledby="tab-2" hidden>Details content.</div>
      <div class="tabs__panel" role="tabpanel" id="tab-panel-3" aria-labelledby="tab-3" hidden>Settings content.</div>
    </div>`))}};function ja(){customElements.get(Ye.tagName)||customElements.define(Ye.tagName,Ye)}var je=class extends HTMLElement{static{this.tagName="deml-text-field"}static{this.componentName="text-field"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<label class="text-field"><span class="text-field__label">Name</span><input class="text-field__input" type="text" /></label>'))}};function qa(){customElements.get(je.tagName)||customElements.define(je.tagName,je)}var qe=class extends HTMLElement{static{this.tagName="deml-textarea"}static{this.componentName="textarea"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="textarea-field">Message</label>
    <textarea id="textarea-field" name="message" rows="4" cols="40" placeholder="Message"></textarea>`))}};function Va(){customElements.get(qe.tagName)||customElements.define(qe.tagName,qe)}var Ve=class extends HTMLElement{static{this.tagName="deml-theme-toggle"}static{this.componentName="theme-toggle"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<button type="button" class="theme-toggle" aria-pressed="false" aria-label="Toggle dark mode">
      Theme
    </button>`))}};function Za(){customElements.get(Ve.tagName)||customElements.define(Ve.tagName,Ve)}var Ze=class extends HTMLElement{static{this.tagName="deml-tile-board"}static{this.componentName="tile-board"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="tile-board">
      <div class="dashboard-grid">
        <article class="tile-board__cell" data-size="sm">Stat</article>
        <article class="tile-board__cell" data-size="md">Chart</article>
        <article class="tile-board__cell" data-size="sm">KPI</article>
      </div>
    </div>`))}};function Qa(){customElements.get(Ze.tagName)||customElements.define(Ze.tagName,Ze)}var Qe=class extends HTMLElement{static{this.tagName="deml-timeline"}static{this.componentName="timeline"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<ol class="timeline">
      <li class="timeline__item">
        <time datetime="2026-07-01">Jul 1</time>
        <p class="timeline__title">Created</p>
        <p class="timeline__description">Resource was created.</p>
      </li>
      <li class="timeline__item">
        <time datetime="2026-07-15">Jul 15</time>
        <p class="timeline__title">Updated</p>
        <p class="timeline__description">Configuration changed.</p>
      </li>
    </ol>`))}};function Xa(){customElements.get(Qe.tagName)||customElements.define(Qe.tagName,Qe)}var Xe=class extends HTMLElement{static{this.tagName="deml-toast"}static{this.componentName="toast"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="toast" role="status">
      <p class="toast__title">Saved</p>
      <p class="toast__description">Your changes were saved.</p>
      <button type="button" class="toast__close" aria-label="Dismiss">×</button>
    </div>`))}};function $a(){customElements.get(Xe.tagName)||customElements.define(Xe.tagName,Xe)}var $e=class extends HTMLElement{static{this.tagName="deml-toggle"}static{this.componentName="toggle"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="toggle-group" role="group" aria-label="View">
      <button type="button" class="toggle" aria-pressed="true">List</button>
      <button type="button" class="toggle" aria-pressed="false">Grid</button>
    </div>`))}};function ei(){customElements.get($e.tagName)||customElements.define($e.tagName,$e)}var et=class extends HTMLElement{static{this.tagName="deml-tooltip"}static{this.componentName="tooltip"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<button type="button" class="tooltip-trigger" aria-describedby="tooltip-demo">Hover me</button>
    <span id="tooltip-demo" class="tooltip" role="tooltip">Helpful tip</span>`))}};function ti(){customElements.get(et.tagName)||customElements.define(et.tagName,et)}var tt=class extends HTMLElement{static{this.tagName="deml-wizard"}static{this.componentName="wizard"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="wizard" role="dialog" aria-labelledby="wizard-title">
      <header class="wizard__header">
        <h3 id="wizard-title">Setup wizard</h3>
        <ol class="wizard__steps">
          <li aria-current="step">Account</li>
          <li>Preferences</li>
          <li>Confirm</li>
        </ol>
      </header>
      <div class="wizard__body">
        <p>Step content goes here.</p>
      </div>
      <footer class="wizard__footer">
        <button type="button">Back</button>
        <button type="button">Next</button>
      </footer>
    </div>`))}};function ai(){customElements.get(tt.tagName)||customElements.define(tt.tagName,tt)}function ii(){at(),it(),st(),lt(),nt(),dt(),rt(),ct(),ot(),mt(),ut(),ht(),pt(),ft(),gt(),bt(),Nt(),vt(),_t(),yt(),Ht(),Et(),Ct(),Tt(),Dt(),Lt(),Mt(),kt(),St(),Pt(),wt(),At(),Bt(),Ft(),xt(),It(),Gt(),Rt(),zt(),Ot(),Ut(),Wt(),Kt(),Jt(),Yt(),jt(),qt(),Vt(),Zt(),Qt(),Xt(),$t(),ea(),ta(),aa(),ia(),sa(),la(),na(),da(),ra(),ca(),oa(),ma(),ua(),ha(),pa(),fa(),ga(),ba(),Na(),va(),_a(),ya(),Ha(),Ea(),Ca(),Ta(),Da(),La(),Ma(),ka(),Sa(),Pa(),wa(),Aa(),Ba(),Fa(),xa(),Ia(),Ga(),Ra(),za(),Oa(),Ua(),Wa(),Ka(),Ja(),Ya(),ja(),qa(),Va(),Za(),Qa(),Xa(),$a(),ei(),ti(),ai()}var si=["accordion","activity-list","app-footer","app-header","app-layout","app-sidebar","area-chart","article","autocomplete","avatar","badge","banner","bar-chart","box","brand","breadcrumbs","bulk-toolbar","button","button-group","callout","card","card-grid","chart","chart-card","chart-empty-state","chart-panel","checkbox","checkbox-field","cluster","command","confirm-dialog","container","content-layout","dashboard-grid","dialog","disclosure","dropdown","empty-state","error-state","explore-card","field","file-upload","flashbar","form-grid","form-panel","form-section","grid","help-panel","hud-panel","icon","input-date","input-email","input-number","input-password","input-range","input-search","input-text","input-time","kbd","label","loading-overlay","metric-card","metric-list","microcard","microcard-grid","navbar","navigation-menu","page-back-link","page-header","page-section","page-shell","page-template","pagination","panel-grid","popover","profile","progress","property-filter","radio-group","scroll-area","section","section-header","section-template","select","separator","sheet","sidebar-nav","site-footer","skeleton","skip-link","spinner","split-panel","stack","stat-card","status-badge","status-card","status-pill","switch","table","tabs","text-field","textarea","theme-toggle","tile-board","timeline","toast","toggle","tooltip","wizard"];return ii(),e.DemlAccordion=t,e.DemlActivityList=a,e.DemlAppFooter=i,e.DemlAppHeader=s,e.DemlAppLayout=l,e.DemlAppSidebar=n,e.DemlAreaChart=d,e.DemlArticle=r,e.DemlAutocomplete=c,e.DemlAvatar=o,e.DemlBadge=m,e.DemlBanner=u,e.DemlBarChart=h,e.DemlBox=p,e.DemlBrand=f,e.DemlBreadcrumbs=g,e.DemlBulkToolbar=b,e.DemlButton=N,e.DemlButtonGroup=v,e.DemlCallout=_,e.DemlCard=y,e.DemlCardGrid=H,e.DemlChart=E,e.DemlChartCard=C,e.DemlChartEmptyState=T,e.DemlChartPanel=D,e.DemlCheckbox=L,e.DemlCheckboxField=M,e.DemlCluster=k,e.DemlCommand=S,e.DemlConfirmDialog=P,e.DemlContainer=w,e.DemlContentLayout=A,e.DemlDashboardGrid=B,e.DemlDialog=F,e.DemlDisclosure=x,e.DemlDropdown=I,e.DemlEmptyState=G,e.DemlErrorState=R,e.DemlExploreCard=z,e.DemlField=O,e.DemlFileUpload=U,e.DemlFlashbar=W,e.DemlFormGrid=K,e.DemlFormPanel=J,e.DemlFormSection=Y,e.DemlGrid=j,e.DemlHelpPanel=q,e.DemlHudPanel=V,e.DemlIcon=Z,e.DemlInputDate=Q,e.DemlInputEmail=X,e.DemlInputNumber=$,e.DemlInputPassword=ee,e.DemlInputRange=te,e.DemlInputSearch=ae,e.DemlInputText=ie,e.DemlInputTime=se,e.DemlKbd=le,e.DemlLabel=ne,e.DemlLoadingOverlay=de,e.DemlMetricCard=re,e.DemlMetricList=ce,e.DemlMicrocard=oe,e.DemlMicrocardGrid=me,e.DemlNavbar=ue,e.DemlNavigationMenu=he,e.DemlPageBackLink=pe,e.DemlPageHeader=fe,e.DemlPageSection=ge,e.DemlPageShell=be,e.DemlPageTemplate=Ne,e.DemlPagination=ve,e.DemlPanelGrid=_e,e.DemlPopover=ye,e.DemlProfile=He,e.DemlProgress=Ee,e.DemlPropertyFilter=Ce,e.DemlRadioGroup=Te,e.DemlScrollArea=De,e.DemlSection=Le,e.DemlSectionHeader=Me,e.DemlSectionTemplate=ke,e.DemlSelect=Se,e.DemlSeparator=Pe,e.DemlSheet=we,e.DemlSidebarNav=Ae,e.DemlSiteFooter=Be,e.DemlSkeleton=Fe,e.DemlSkipLink=xe,e.DemlSpinner=Ie,e.DemlSplitPanel=Ge,e.DemlStack=Re,e.DemlStatCard=ze,e.DemlStatusBadge=Oe,e.DemlStatusCard=Ue,e.DemlStatusPill=We,e.DemlSwitch=Ke,e.DemlTable=Je,e.DemlTabs=Ye,e.DemlTextField=je,e.DemlTextarea=qe,e.DemlThemeToggle=Ve,e.DemlTileBoard=Ze,e.DemlTimeline=Qe,e.DemlToast=Xe,e.DemlToggle=$e,e.DemlTooltip=et,e.DemlWizard=tt,e.componentNames=si,e.defineAccordion=at,e.defineActivityList=it,e.defineAll=ii,e.defineAppFooter=st,e.defineAppHeader=lt,e.defineAppLayout=nt,e.defineAppSidebar=dt,e.defineAreaChart=rt,e.defineArticle=ct,e.defineAutocomplete=ot,e.defineAvatar=mt,e.defineBadge=ut,e.defineBanner=ht,e.defineBarChart=pt,e.defineBox=ft,e.defineBrand=gt,e.defineBreadcrumbs=bt,e.defineBulkToolbar=Nt,e.defineButton=vt,e.defineButtonGroup=_t,e.defineCallout=yt,e.defineCard=Ht,e.defineCardGrid=Et,e.defineChart=Ct,e.defineChartCard=Tt,e.defineChartEmptyState=Dt,e.defineChartPanel=Lt,e.defineCheckbox=Mt,e.defineCheckboxField=kt,e.defineCluster=St,e.defineCommand=Pt,e.defineConfirmDialog=wt,e.defineContainer=At,e.defineContentLayout=Bt,e.defineDashboardGrid=Ft,e.defineDialog=xt,e.defineDisclosure=It,e.defineDropdown=Gt,e.defineEmptyState=Rt,e.defineErrorState=zt,e.defineExploreCard=Ot,e.defineField=Ut,e.defineFileUpload=Wt,e.defineFlashbar=Kt,e.defineFormGrid=Jt,e.defineFormPanel=Yt,e.defineFormSection=jt,e.defineGrid=qt,e.defineHelpPanel=Vt,e.defineHudPanel=Zt,e.defineIcon=Qt,e.defineInputDate=Xt,e.defineInputEmail=$t,e.defineInputNumber=ea,e.defineInputPassword=ta,e.defineInputRange=aa,e.defineInputSearch=ia,e.defineInputText=sa,e.defineInputTime=la,e.defineKbd=na,e.defineLabel=da,e.defineLoadingOverlay=ra,e.defineMetricCard=ca,e.defineMetricList=oa,e.defineMicrocard=ma,e.defineMicrocardGrid=ua,e.defineNavbar=ha,e.defineNavigationMenu=pa,e.definePageBackLink=fa,e.definePageHeader=ga,e.definePageSection=ba,e.definePageShell=Na,e.definePageTemplate=va,e.definePagination=_a,e.definePanelGrid=ya,e.definePopover=Ha,e.defineProfile=Ea,e.defineProgress=Ca,e.definePropertyFilter=Ta,e.defineRadioGroup=Da,e.defineScrollArea=La,e.defineSection=Ma,e.defineSectionHeader=ka,e.defineSectionTemplate=Sa,e.defineSelect=Pa,e.defineSeparator=wa,e.defineSheet=Aa,e.defineSidebarNav=Ba,e.defineSiteFooter=Fa,e.defineSkeleton=xa,e.defineSkipLink=Ia,e.defineSpinner=Ga,e.defineSplitPanel=Ra,e.defineStack=za,e.defineStatCard=Oa,e.defineStatusBadge=Ua,e.defineStatusCard=Wa,e.defineStatusPill=Ka,e.defineSwitch=Ja,e.defineTable=Ya,e.defineTabs=ja,e.defineTextField=qa,e.defineTextarea=Va,e.defineThemeToggle=Za,e.defineTileBoard=Qa,e.defineTimeline=Xa,e.defineToast=$a,e.defineToggle=ei,e.defineTooltip=ti,e.defineWizard=ai,e})({});

//# sourceMappingURL=deml-ui.iife.js.map