var DemlUi=(function(e){Object.defineProperty(e,Symbol.toStringTag,{value:"Module"});var t=class extends HTMLElement{static{this.tagName="deml-app-layout"}static{this.componentName="app-layout"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="app-layout">
      <aside class="app-layout__nav" aria-label="App navigation">Nav</aside>
      <div class="app-layout__main">
        <header class="app-layout__header">Header</header>
        <main class="app-layout__content">Main content</main>
      </div>
      <aside class="app-layout__tools" aria-label="Tools">Tools</aside>
    </div>`))}};function Ce(){customElements.get(t.tagName)||customElements.define(t.tagName,t)}var a=class extends HTMLElement{static{this.tagName="deml-area-chart"}static{this.componentName="area-chart"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="chart-board" data-chart-board data-chart-ymax="auto">
      <article class="chart-card" data-accent="primary" aria-labelledby="area-a">
        <header class="chart-card-header">
          <h3 class="chart-card-heading" id="area-a">Streams</h3>
          <p class="chart-card-meta">Shared Y · 0–max</p>
        </header>
        <div class="chart-card-body">
          <div class="area-chart-frame" data-variant="spark" role="img" aria-label="Streams">
            <div
              class="area-chart-mount"
              data-chart="area"
              data-series="[120,156,142,188,210,196,230]"
              data-categories='["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'
            ></div>
          </div>
        </div>
      </article>

      <article class="chart-card" data-accent="primary" aria-labelledby="area-b">
        <header class="chart-card-header">
          <h3 class="chart-card-heading" id="area-b">Saves</h3>
          <p class="chart-card-meta">Same scale</p>
        </header>
        <div class="chart-card-body">
          <div class="area-chart-frame" data-variant="spark" role="img" aria-label="Saves">
            <div
              class="area-chart-mount"
              data-chart="area"
              data-series="[48,62,55,70,84,78,96]"
              data-categories='["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'
            ></div>
          </div>
        </div>
      </article>

      <article class="chart-card" data-accent="primary" aria-labelledby="area-c">
        <header class="chart-card-header">
          <h3 class="chart-card-heading" id="area-c">Shares</h3>
          <p class="chart-card-meta">Same scale</p>
        </header>
        <div class="chart-card-body">
          <div class="area-chart-frame" data-variant="spark" role="img" aria-label="Shares">
            <div
              class="area-chart-mount"
              data-chart="area"
              data-series="[18,22,20,28,34,30,42]"
              data-categories='["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'
            ></div>
          </div>
        </div>
      </article>
    </div>`))}};function Te(){customElements.get(a.tagName)||customElements.define(a.tagName,a)}var s=class extends HTMLElement{static{this.tagName="deml-article"}static{this.componentName="article"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<article class="article">
      <div class="article-body">
        <h2>Section title</h2>
        <p>Body copy for long-form reading — paragraphs, lists, and code.</p>
        <ul>
          <li>First point</li>
          <li>Second point</li>
        </ul>
        <pre><code>npm run build</code></pre>
      </div>
    </article>`))}};function Le(){customElements.get(s.tagName)||customElements.define(s.tagName,s)}var i=class extends HTMLElement{static{this.tagName="deml-badge"}static{this.componentName="badge"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<span class="badge">Badge</span>
    <span class="badge" data-tone="neutral">Neutral</span>
    <span class="badge" data-tone="info">Info</span>
    <span class="badge" data-tone="success">Success</span>
    <span class="badge" data-tone="warning">Warning</span>
    <span class="badge" data-tone="danger">Danger</span>`))}};function ke(){customElements.get(i.tagName)||customElements.define(i.tagName,i)}var n=class extends HTMLElement{static{this.tagName="deml-banner"}static{this.componentName="banner"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="banner banner--hero" data-variant="hero">
      <p class="preheader">DEML</p>
      <h1 class="banner-heading">Status your customers can trust.</h1>
      <p class="lede">Publish public status pages, share clear uptime, and manage your account in one place.</p>
      <div class="banner-actions">
        <div class="button-group">
          <a class="button button--primary" href="#">Explore</a>
          <a class="button button--secondary" href="#">Log in</a>
        </div>
      </div>
    </div>`))}};function De(){customElements.get(n.tagName)||customElements.define(n.tagName,n)}var l=class extends HTMLElement{static{this.tagName="deml-bar-chart"}static{this.componentName="bar-chart"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="chart-board" data-chart-board data-chart-ymax="auto">
      <article class="chart-card" data-accent="primary" aria-labelledby="bar-a">
        <header class="chart-card-header">
          <h3 class="chart-card-heading" id="bar-a">Genre</h3>
          <p class="chart-card-meta">Shared Y · 0–max</p>
        </header>
        <div class="chart-card-body">
          <div class="bar-chart-frame area-chart-frame" data-variant="spark" role="img" aria-label="Genre share">
            <div
              class="area-chart-mount"
              data-chart="bar"
              data-series="[82,64,48,36]"
              data-categories='["Synth","Jazz","Folk","Ambient"]'
            ></div>
          </div>
        </div>
      </article>

      <article class="chart-card" data-accent="primary" aria-labelledby="bar-b">
        <header class="chart-card-header">
          <h3 class="chart-card-heading" id="bar-b">Region</h3>
          <p class="chart-card-meta">Same scale</p>
        </header>
        <div class="chart-card-body">
          <div class="bar-chart-frame area-chart-frame" data-variant="spark" role="img" aria-label="Region share">
            <div
              class="area-chart-mount"
              data-chart="bar"
              data-series="[70,52,40,28]"
              data-categories='["NA","EU","APAC","LATAM"]'
            ></div>
          </div>
        </div>
      </article>

      <article class="chart-card" data-accent="primary" aria-labelledby="bar-c">
        <header class="chart-card-header">
          <h3 class="chart-card-heading" id="bar-c">Device</h3>
          <p class="chart-card-meta">Same scale</p>
        </header>
        <div class="chart-card-body">
          <div class="bar-chart-frame area-chart-frame" data-variant="spark" role="img" aria-label="Device share">
            <div
              class="area-chart-mount"
              data-chart="bar"
              data-series="[90,44,30,18]"
              data-categories='["Mobile","Desktop","TV","Other"]'
            ></div>
          </div>
        </div>
      </article>
    </div>`))}};function Me(){customElements.get(l.tagName)||customElements.define(l.tagName,l)}var d=class extends HTMLElement{static{this.tagName="deml-box"}static{this.componentName="box"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="box">
      <p>Lightweight content grouping box.</p>
    </div>`))}};function Se(){customElements.get(d.tagName)||customElements.define(d.tagName,d)}var r=class extends HTMLElement{static{this.tagName="deml-brand"}static{this.componentName="brand"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<a class="brand" href="/" aria-label="Product home">
      <span class="brand__mark" aria-hidden="true"></span>
      <span class="brand__wordmark">Product</span>
    </a>`))}};function we(){customElements.get(r.tagName)||customElements.define(r.tagName,r)}var c=class extends HTMLElement{static{this.tagName="deml-button"}static{this.componentName="button"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<button type="button" class="button button--primary">Primary</button>
    <button type="button" class="button button--secondary">Secondary</button>
    <button type="button" class="button button--accent">Accent</button>
    <button type="button" class="button button--primary button--pill">Pill</button>
    <button type="button" class="button button--primary" disabled>Disabled</button>
    <button type="button" class="button button--primary is-busy" aria-busy="true">
      <span class="button__label">Saving</span>
      <span class="button__spinner" aria-hidden="true"></span>
    </button>`))}};function Pe(){customElements.get(c.tagName)||customElements.define(c.tagName,c)}var o=class extends HTMLElement{static{this.tagName="deml-button-group"}static{this.componentName="button-group"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="button-group" role="group" aria-label="Alignment">
      <button type="button">Left</button>
      <button type="button">Center</button>
      <button type="button">Right</button>
    </div>`))}};function xe(){customElements.get(o.tagName)||customElements.define(o.tagName,o)}var m=class extends HTMLElement{static{this.tagName="deml-callout"}static{this.componentName="callout"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<aside class="callout" role="status" data-tone="info">
      <div class="callout__body">
        <p class="callout__heading">Callout heading</p>
        <p class="callout__text">Highlighted message for the user.</p>
      </div>
      <button type="button" class="callout__close" aria-label="Dismiss">×</button>
    </aside>`))}};function Be(){customElements.get(m.tagName)||customElements.define(m.tagName,m)}var h=class extends HTMLElement{static{this.tagName="deml-card"}static{this.componentName="card"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<article class="card" data-visual="olive">
      <div class="card-copy">
        <p class="card-meta">Feature</p>
        <h3 class="card-heading">Card title</h3>
        <p class="card-subtext">Optional supporting text for the elevated cream module.</p>
        <div class="card-actions">
          <div class="button-group" data-layout="row" role="group">
            <button type="button" class="button button--primary button--pill">Action</button>
          </div>
        </div>
      </div>
      <div class="card-media has-visual" aria-hidden="true"></div>
    </article>`))}};function Fe(){customElements.get(h.tagName)||customElements.define(h.tagName,h)}var u=class extends HTMLElement{static{this.tagName="deml-card-grid"}static{this.componentName="card-grid"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<div class="card-grid"><article class="card"><h3 class="card-heading">Card</h3></article></div>'))}};function Ae(){customElements.get(u.tagName)||customElements.define(u.tagName,u)}var p=class extends HTMLElement{static{this.tagName="deml-chart"}static{this.componentName="chart"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="chart-board" data-chart-board data-chart-ymax="auto">
      <article class="chart-card" data-accent="primary" aria-labelledby="line-a">
        <header class="chart-card-header">
          <h3 class="chart-card-heading" id="line-a">Latency</h3>
          <p class="chart-card-meta">p95 · shared Y</p>
        </header>
        <div class="chart-card-body">
          <div class="area-chart-frame" data-variant="spark" role="img" aria-label="Latency line">
            <div
              class="area-chart-mount"
              data-chart="line"
              data-series="[42,38,45,40,52,48,44]"
              data-categories='["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'
            ></div>
          </div>
        </div>
      </article>

      <article class="chart-card" data-accent="primary" aria-labelledby="line-b">
        <header class="chart-card-header">
          <h3 class="chart-card-heading" id="line-b">Errors</h3>
          <p class="chart-card-meta">Same scale</p>
        </header>
        <div class="chart-card-body">
          <div class="area-chart-frame" data-variant="spark" role="img" aria-label="Errors line">
            <div
              class="area-chart-mount"
              data-chart="line"
              data-series="[12,9,14,11,18,15,10]"
              data-categories='["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'
            ></div>
          </div>
        </div>
      </article>

      <article class="chart-card" data-accent="primary" aria-labelledby="line-c">
        <header class="chart-card-header">
          <h3 class="chart-card-heading" id="line-c">Saturation</h3>
          <p class="chart-card-meta">Same scale</p>
        </header>
        <div class="chart-card-body">
          <div class="area-chart-frame" data-variant="spark" role="img" aria-label="Saturation line">
            <div
              class="area-chart-mount"
              data-chart="line"
              data-series="[28,30,26,33,31,29,27]"
              data-categories='["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'
            ></div>
          </div>
        </div>
      </article>
    </div>`))}};function Ie(){customElements.get(p.tagName)||customElements.define(p.tagName,p)}var f=class extends HTMLElement{static{this.tagName="deml-chart-card"}static{this.componentName="chart-card"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="chart-board" data-chart-board data-chart-ymax="auto">
      <article class="chart-card" data-accent="primary" aria-labelledby="cc-a">
        <header class="chart-card-header">
          <div class="chart-card-header__row">
            <h3 class="chart-card-heading" id="cc-a">Listen time</h3>
            <p class="chart-card-value">230<span class="chart-card-unit">m</span></p>
          </div>
          <p class="chart-card-meta">
            <span class="chart-card-trend" data-trend="up">+12%</span>
            Last 7 days
          </p>
        </header>
        <div class="chart-card-body">
          <div class="area-chart-frame" data-variant="spark" role="img" aria-label="Listen time">
            <div
              class="area-chart-mount"
              data-chart="area"
              data-series="[120,156,142,188,210,196,230]"
              data-categories='["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'
            ></div>
          </div>
        </div>
      </article>

      <article class="chart-card" data-accent="primary" aria-labelledby="cc-b">
        <header class="chart-card-header">
          <div class="chart-card-header__row">
            <h3 class="chart-card-heading" id="cc-b">Playlist adds</h3>
            <p class="chart-card-value">74</p>
          </div>
          <p class="chart-card-meta">
            <span class="chart-card-trend" data-trend="up">+8%</span>
            Same Y scale
          </p>
        </header>
        <div class="chart-card-body">
          <div class="area-chart-frame" data-variant="spark" role="img" aria-label="Playlist adds">
            <div
              class="area-chart-mount"
              data-chart="area"
              data-series="[32,40,38,55,62,58,74]"
              data-categories='["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'
            ></div>
          </div>
        </div>
      </article>

      <article class="chart-card" data-accent="primary" aria-labelledby="cc-c">
        <header class="chart-card-header">
          <div class="chart-card-header__row">
            <h3 class="chart-card-heading" id="cc-c">Follows</h3>
            <p class="chart-card-value">34</p>
          </div>
          <p class="chart-card-meta">
            <span class="chart-card-trend" data-trend="down">−3%</span>
            Same Y scale
          </p>
        </header>
        <div class="chart-card-body">
          <div class="area-chart-frame" data-variant="spark" role="img" aria-label="Follows">
            <div
              class="area-chart-mount"
              data-chart="area"
              data-series="[14,18,16,22,28,26,34]"
              data-categories='["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'
            ></div>
          </div>
        </div>
      </article>
    </div>`))}};function Ge(){customElements.get(f.tagName)||customElements.define(f.tagName,f)}var g=class extends HTMLElement{static{this.tagName="deml-chart-empty-state"}static{this.componentName="chart-empty-state"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="chart-board chart-board--empty">
      <div class="chart-empty-state" data-layout="fill" role="status">
        <span class="chart-empty-state__badge" aria-hidden="true"></span>
        <p class="chart-empty-state__title">No chart data</p>
        <p class="chart-empty-state__description">Signals appear once telemetry lands.</p>
      </div>

      <div class="chart-empty-state" data-layout="inline" role="status">
        <span class="chart-empty-state__badge" aria-hidden="true"></span>
        <p class="chart-empty-state__title">Awaiting signal</p>
        <p class="chart-empty-state__description">Connect a stream to populate this tile.</p>
      </div>

      <div class="chart-empty-state" data-layout="loading" role="status" aria-busy="true">
        <span class="chart-empty-state__skeleton" aria-hidden="true"></span>
        <p class="chart-empty-state__title">Loading series</p>
        <p class="chart-empty-state__description">Fetching the latest board domain.</p>
      </div>
    </div>`))}};function Re(){customElements.get(g.tagName)||customElements.define(g.tagName,g)}var b=class extends HTMLElement{static{this.tagName="deml-chart-panel"}static{this.componentName="chart-panel"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="chart-board chart-board--panel" data-chart-board data-chart-ymax="auto">
      <section class="chart-panel" data-accent="primary" aria-labelledby="panel-a">
        <header class="chart-panel__header">
          <div class="chart-panel__header-row">
            <h3 class="chart-panel__title" id="panel-a">System latency</h3>
            <p class="chart-panel__value">52<span class="chart-panel__unit">ms</span></p>
          </div>
          <p class="chart-panel__meta">
            <span class="chart-card-trend" data-trend="up">+4%</span>
            Last 24h · shared Y
          </p>
        </header>
        <div class="chart-panel__body">
          <div class="area-chart-frame" data-variant="spark" role="img" aria-label="Latency">
            <div
              class="area-chart-mount"
              data-chart="area"
              data-series="[36,40,38,44,52,48,42]"
              data-categories='["00","04","08","12","16","20","24"]'
            ></div>
          </div>
        </div>
      </section>

      <section class="chart-panel" data-accent="primary" aria-labelledby="panel-b">
        <header class="chart-panel__header">
          <div class="chart-panel__header-row">
            <h3 class="chart-panel__title" id="panel-b">Throughput</h3>
            <p class="chart-panel__value">1.2<span class="chart-panel__unit">k</span></p>
          </div>
          <p class="chart-panel__meta">
            <span class="chart-card-trend" data-trend="up">+9%</span>
            Same scale
          </p>
        </header>
        <div class="chart-panel__body">
          <div class="area-chart-frame" data-variant="spark" role="img" aria-label="Throughput">
            <div
              class="area-chart-mount"
              data-chart="area"
              data-series="[22,28,26,34,40,38,32]"
              data-categories='["00","04","08","12","16","20","24"]'
            ></div>
          </div>
        </div>
      </section>
    </div>`))}};function We(){customElements.get(b.tagName)||customElements.define(b.tagName,b)}var v=class extends HTMLElement{static{this.tagName="deml-checkbox"}static{this.componentName="checkbox"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label class="checkbox">
      <input type="checkbox" name="checkbox-demo" />
      <span class="checkbox__label">Checkbox option</span>
    </label>`))}};function ze(){customElements.get(v.tagName)||customElements.define(v.tagName,v)}var y=class extends HTMLElement{static{this.tagName="deml-checkbox-field"}static{this.componentName="checkbox-field"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<label class="checkbox-field"><input type="checkbox" /><span>Remember me</span></label>'))}};function Oe(){customElements.get(y.tagName)||customElements.define(y.tagName,y)}var N=class extends HTMLElement{static{this.tagName="deml-cluster"}static{this.componentName="cluster"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="cluster">
      <button type="button">Primary</button>
      <button type="button">Secondary</button>
      <span class="badge">Tag</span>
    </div>`))}};function Ue(){customElements.get(N.tagName)||customElements.define(N.tagName,N)}var _=class extends HTMLElement{static{this.tagName="deml-confirm-dialog"}static{this.componentName="confirm-dialog"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<button type="button" class="button" data-deml-open-confirm>Delete item</button>
    <dialog class="confirm-dialog">
      <form method="dialog">
        <h3 class="confirm-dialog__title">Confirm action</h3>
        <p class="confirm-dialog__body">This cannot be undone.</p>
        <div class="confirm-dialog__actions">
          <button type="submit" class="button" value="cancel">Cancel</button>
          <button type="submit" class="button" data-variant="primary" value="confirm">Confirm</button>
        </div>
      </form>
    </dialog>`))}};function Ye(){customElements.get(_.tagName)||customElements.define(_.tagName,_)}var H=class extends HTMLElement{static{this.tagName="deml-container"}static{this.componentName="container"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="container">
      <header class="container__header">
        <h3 class="container__title">Container</h3>
        <p class="container__description">Content anatomy wrapper.</p>
      </header>
      <div class="container__body">
        <p>Body content.</p>
      </div>
    </div>`))}};function qe(){customElements.get(H.tagName)||customElements.define(H.tagName,H)}var E=class extends HTMLElement{static{this.tagName="deml-content-layout"}static{this.componentName="content-layout"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="content-layout">
      <nav class="content-layout__breadcrumbs" aria-label="Breadcrumb">Home / Page</nav>
      <header class="content-layout__header">
        <h1>Content layout</h1>
      </header>
      <div class="content-layout__body">Body region</div>
    </div>`))}};function Ke(){customElements.get(E.tagName)||customElements.define(E.tagName,E)}var C=class extends HTMLElement{static{this.tagName="deml-dashboard-grid"}static{this.componentName="dashboard-grid"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="dashboard-grid">
      <div class="dashboard-grid__cell" data-size="sm">Tile SM</div>
      <div class="dashboard-grid__cell" data-size="md">Tile MD</div>
      <div class="dashboard-grid__cell" data-size="sm">Tile SM</div>
    </div>`))}};function Ve(){customElements.get(C.tagName)||customElements.define(C.tagName,C)}var T=class extends HTMLElement{static{this.tagName="deml-dialog"}static{this.componentName="dialog"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<button type="button" class="button" data-deml-open-dialog>Open dialog</button>
    <dialog class="dialog" id="demo-dialog">
      <form method="dialog">
        <h3>Dialog</h3>
        <p>Native modal dialog for focused tasks.</p>
        <div class="cluster">
          <button type="submit" class="button" value="cancel">Close</button>
          <button type="submit" class="button" data-variant="primary" value="confirm">Confirm</button>
        </div>
      </form>
    </dialog>`))}};function je(){customElements.get(T.tagName)||customElements.define(T.tagName,T)}var L=class extends HTMLElement{static{this.tagName="deml-dropdown"}static{this.componentName="dropdown"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="dropdown">
      <button type="button" class="dropdown__trigger" aria-haspopup="menu" aria-expanded="false" aria-controls="dropdown-menu">Actions</button>
      <ul id="dropdown-menu" class="dropdown__menu" role="menu" hidden>
        <li role="none"><button type="button" role="menuitem">Edit</button></li>
        <li role="none"><button type="button" role="menuitem">Duplicate</button></li>
        <li role="none"><button type="button" role="menuitem">Delete</button></li>
      </ul>
    </div>`))}};function Je(){customElements.get(L.tagName)||customElements.define(L.tagName,L)}var k=class extends HTMLElement{static{this.tagName="deml-empty-state"}static{this.componentName="empty-state"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="empty-state" role="status">
      <p class="empty-state__eyebrow">Empty</p>
      <p class="empty-state__title">No items yet</p>
      <p class="empty-state__description">Create your first item to get started.</p>
      <div class="empty-state__actions">
        <button type="button">Create item</button>
      </div>
    </div>`))}};function Qe(){customElements.get(k.tagName)||customElements.define(k.tagName,k)}var D=class extends HTMLElement{static{this.tagName="deml-error-state"}static{this.componentName="error-state"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="error-state" role="alert">
      <p class="error-state__title">Something went wrong</p>
      <p class="error-state__description">We could not load this resource. Try again.</p>
      <div class="error-state__actions">
        <button type="button">Retry</button>
      </div>
    </div>`))}};function Xe(){customElements.get(D.tagName)||customElements.define(D.tagName,D)}var M=class extends HTMLElement{static{this.tagName="deml-explore-card"}static{this.componentName="explore-card"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<article class="explore-card" data-status="operational">
      <header class="explore-card__header">
        <div class="explore-card__meta">
          <span class="status-pill" data-status="up">Operational</span>
          <span class="explore-card__tag">Public Status Page</span>
        </div>
        <h3 class="explore-card__title">Platform Status</h3>
        <p class="explore-card__lede">Live service health for teams publishing status with DEML.</p>
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
    </article>`))}};function Ze(){customElements.get(M.tagName)||customElements.define(M.tagName,M)}var S=class extends HTMLElement{static{this.tagName="deml-field"}static{this.componentName="field"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="field" role="group" aria-labelledby="field-label">
      <label class="field__label-wrap" for="field-input">
        <span class="field__label" id="field-label">Field label <span class="field__required" aria-hidden="true">*</span></span>
        <input id="field-input" class="field__control" type="text" name="field" required aria-describedby="field-desc" />
      </label>
      <p class="field__description" id="field-desc">Helper text for the control.</p>
    </div>`))}};function $e(){customElements.get(S.tagName)||customElements.define(S.tagName,S)}var w=class extends HTMLElement{static{this.tagName="deml-form-grid"}static{this.componentName="form-grid"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="form-grid">
      <label>First name <input type="text" name="first" /></label>
      <label>Last name <input type="text" name="last" /></label>
      <label>Email <input type="email" name="email" /></label>
      <label>Company <input type="text" name="company" /></label>
    </div>`))}};function et(){customElements.get(w.tagName)||customElements.define(w.tagName,w)}var P=class extends HTMLElement{static{this.tagName="deml-form-panel"}static{this.componentName="form-panel"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<form class="form-panel"><label class="field"><span class="field__label">Email</span><input class="input-text" type="email" /></label><button class="button button--primary" type="submit">Submit</button></form>'))}};function tt(){customElements.get(P.tagName)||customElements.define(P.tagName,P)}var x=class extends HTMLElement{static{this.tagName="deml-form-section"}static{this.componentName="form-section"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<section class="form-section">
      <header class="form-section__header">
        <h3 class="form-section__title">Account</h3>
        <p class="form-section__description">Basic profile settings.</p>
      </header>
      <div class="form-section__body">
        <label>Name <input type="text" name="name" /></label>
        <label>Email <input type="email" name="email" /></label>
      </div>
    </section>`))}};function at(){customElements.get(x.tagName)||customElements.define(x.tagName,x)}var B=class extends HTMLElement{static{this.tagName="deml-grid"}static{this.componentName="grid"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="grid">
      <div class="grid__item">A</div>
      <div class="grid__item">B</div>
      <div class="grid__item">C</div>
      <div class="grid__item">D</div>
    </div>`))}};function st(){customElements.get(B.tagName)||customElements.define(B.tagName,B)}var F=class extends HTMLElement{static{this.tagName="deml-icon"}static{this.componentName="icon"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<svg class="icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
      <path d="M12 8v4l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <span class="icon-label">Icon placeholder</span>`))}};function it(){customElements.get(F.tagName)||customElements.define(F.tagName,F)}var A=class extends HTMLElement{static{this.tagName="deml-input-date"}static{this.componentName="input-date"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="input-date-field">Date</label>
    <input id="input-date-field" name="date" type="date">`))}};function nt(){customElements.get(A.tagName)||customElements.define(A.tagName,A)}var I=class extends HTMLElement{static{this.tagName="deml-input-email"}static{this.componentName="input-email"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="input-email-field">Email</label>
    <input id="input-email-field" name="email" type="email" placeholder="you@example.com" autocomplete="email">`))}};function lt(){customElements.get(I.tagName)||customElements.define(I.tagName,I)}var G=class extends HTMLElement{static{this.tagName="deml-input-number"}static{this.componentName="input-number"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="input-number-field">Number</label>
    <input id="input-number-field" name="number" type="number" min="0" max="100" step="1" value="10">`))}};function dt(){customElements.get(G.tagName)||customElements.define(G.tagName,G)}var R=class extends HTMLElement{static{this.tagName="deml-input-password"}static{this.componentName="input-password"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="input-password-field">Password</label>
    <input id="input-password-field" name="password" type="password" placeholder="Password" autocomplete="new-password">`))}};function rt(){customElements.get(R.tagName)||customElements.define(R.tagName,R)}var W=class extends HTMLElement{static{this.tagName="deml-input-range"}static{this.componentName="input-range"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="input-range-field">Range</label>
    <input id="input-range-field" name="range" type="range" min="0" max="100" value="40">`))}};function ct(){customElements.get(W.tagName)||customElements.define(W.tagName,W)}var z=class extends HTMLElement{static{this.tagName="deml-input-search"}static{this.componentName="input-search"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="input-search-field">Search</label>
    <input id="input-search-field" name="search" type="search" placeholder="Search…">`))}};function ot(){customElements.get(z.tagName)||customElements.define(z.tagName,z)}var O=class extends HTMLElement{static{this.tagName="deml-input-text"}static{this.componentName="input-text"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="input-text-field">Name</label>
    <input id="input-text-field" name="name" type="text" placeholder="Name" autocomplete="name" required>`))}};function mt(){customElements.get(O.tagName)||customElements.define(O.tagName,O)}var U=class extends HTMLElement{static{this.tagName="deml-input-time"}static{this.componentName="input-time"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="input-time-field">Time</label>
    <input id="input-time-field" name="time" type="time">`))}};function ht(){customElements.get(U.tagName)||customElements.define(U.tagName,U)}var Y=class extends HTMLElement{static{this.tagName="deml-label"}static{this.componentName="label"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label class="label" for="label-demo-input">Label</label>
    <input id="label-demo-input" type="text" name="label-demo" />`))}};function ut(){customElements.get(Y.tagName)||customElements.define(Y.tagName,Y)}var q=class extends HTMLElement{static{this.tagName="deml-navbar"}static{this.componentName="navbar"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<header class="site-navbar">
      <div class="site-navbar-branding">
        <a class="site-navbar-icon" href="#" aria-label="DEML home">DEML</a>
      </div>
      <button type="button" class="site-navbar-menu-toggle" aria-label="Open menu" aria-expanded="false">
        Menu
      </button>
      <div class="site-navbar-panel">
        <div class="site-navbar-panel__inner">
          <nav class="main-navigation" aria-label="Primary">
            <ul>
              <li><a href="#">Explore</a></li>
              <li><a href="#">Docs</a></li>
            </ul>
          </nav>
          <div class="site-navbar-actions">
            <div class="button-group" data-layout="row" role="group" aria-label="Account actions">
              <a class="button button--primary button--pill" href="#">Log in</a>
            </div>
          </div>
        </div>
      </div>
    </header>`))}};function pt(){customElements.get(q.tagName)||customElements.define(q.tagName,q)}var K=class extends HTMLElement{static{this.tagName="deml-page-back-link"}static{this.componentName="page-back-link"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<a class="page-back-link" href="#">← Back to list</a>'))}};function ft(){customElements.get(K.tagName)||customElements.define(K.tagName,K)}var V=class extends HTMLElement{static{this.tagName="deml-page-header"}static{this.componentName="page-header"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<header class="page-header">
      <div class="page-header__text">
        <h1 class="page-header__title">Page title</h1>
        <p class="page-header__subtitle">Short page description.</p>
      </div>
      <div class="page-header__actions">
        <button type="button">Secondary</button>
        <button type="button">Primary</button>
      </div>
    </header>`))}};function gt(){customElements.get(V.tagName)||customElements.define(V.tagName,V)}var j=class extends HTMLElement{static{this.tagName="deml-page-section"}static{this.componentName="page-section"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<section class="page-section"><div class="page-section__body">Section body</div></section>'))}};function bt(){customElements.get(j.tagName)||customElements.define(j.tagName,j)}var J=class extends HTMLElement{static{this.tagName="deml-page-shell"}static{this.componentName="page-shell"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="page-shell">
      <div class="page-shell__inner">
        <p>Constrained page canvas content.</p>
      </div>
    </div>`))}};function vt(){customElements.get(J.tagName)||customElements.define(J.tagName,J)}var Q=class extends HTMLElement{static{this.tagName="deml-page-template"}static{this.componentName="page-template"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="page-template">
      <header class="page-template__header">
        <h1>Page template</h1>
        <div class="page-template__actions"><button type="button">Action</button></div>
      </header>
      <div class="page-template__content">
        <p>Route content region.</p>
      </div>
      <footer class="page-template__footer">Footer slot</footer>
    </div>`))}};function yt(){customElements.get(Q.tagName)||customElements.define(Q.tagName,Q)}var X=class extends HTMLElement{static{this.tagName="deml-pagination"}static{this.componentName="pagination"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<nav class="pagination" aria-label="Pagination">
      <button type="button" class="pagination__prev" aria-label="Previous page">Previous</button>
      <ul class="pagination__pages">
        <li><button type="button" aria-current="page">1</button></li>
        <li><button type="button">2</button></li>
        <li><button type="button">3</button></li>
      </ul>
      <button type="button" class="pagination__next" aria-label="Next page">Next</button>
    </nav>`))}};function Nt(){customElements.get(X.tagName)||customElements.define(X.tagName,X)}var Z=class extends HTMLElement{static{this.tagName="deml-panel-grid"}static{this.componentName="panel-grid"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="panel-grid">
      <article class="panel-grid__item">Panel A</article>
      <article class="panel-grid__item">Panel B</article>
    </div>`))}};function _t(){customElements.get(Z.tagName)||customElements.define(Z.tagName,Z)}var $=class extends HTMLElement{static{this.tagName="deml-progress"}static{this.componentName="progress"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="progress-field">Progress</label>
    <progress id="progress-field" value="70" max="100">70%</progress>`))}};function Ht(){customElements.get($.tagName)||customElements.define($.tagName,$)}var ee=class extends HTMLElement{static{this.tagName="deml-radio-group"}static{this.componentName="radio-group"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<fieldset class="radio-group">
      <legend class="radio-group__legend">Plan</legend>
      <label class="radio-group__option"><input type="radio" name="plan" value="free" /> Free</label>
      <label class="radio-group__option"><input type="radio" name="plan" value="pro" checked /> Pro</label>
      <label class="radio-group__option"><input type="radio" name="plan" value="team" /> Team</label>
    </fieldset>`))}};function Et(){customElements.get(ee.tagName)||customElements.define(ee.tagName,ee)}var te=class extends HTMLElement{static{this.tagName="deml-scroll-area"}static{this.componentName="scroll-area"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="scroll-area" tabindex="0">
      <p>Scrollable region with constrained height.</p>
      <p>Additional content for overflow.</p>
      <p>More content.</p>
      <p>Even more content.</p>
    </div>`))}};function Ct(){customElements.get(te.tagName)||customElements.define(te.tagName,te)}var ae=class extends HTMLElement{static{this.tagName="deml-section"}static{this.componentName="section"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<section class="section">
      <header class="section__header">
        <h3 class="section__title">Section title</h3>
        <p class="section__description">Section supporting text.</p>
      </header>
      <div class="section__body">
        <p>Section body.</p>
      </div>
    </section>`))}};function Tt(){customElements.get(ae.tagName)||customElements.define(ae.tagName,ae)}var se=class extends HTMLElement{static{this.tagName="deml-section-header"}static{this.componentName="section-header"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<header class="section-header"><p class="type-eyebrow">Eyebrow</p><h2 class="type-display">Section</h2><p class="type-intro">Supporting copy.</p></header>'))}};function Lt(){customElements.get(se.tagName)||customElements.define(se.tagName,se)}var ie=class extends HTMLElement{static{this.tagName="deml-section-template"}static{this.componentName="section-template"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<section class="section-template">
      <header class="section-template__header">
        <div>
          <h3 class="section-template__title">Section template</h3>
          <p class="section-template__description">Reusable section anatomy.</p>
        </div>
        <div class="section-template__actions"><button type="button">Action</button></div>
      </header>
      <hr class="section-template__divider" />
      <div class="section-template__body">Body content.</div>
    </section>`))}};function kt(){customElements.get(ie.tagName)||customElements.define(ie.tagName,ie)}var ne=class extends HTMLElement{static{this.tagName="deml-select"}static{this.componentName="select"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="select-field">Country</label>
    <select id="select-field" name="country">
      <optgroup label="Americas">
        <option value="us">United States</option>
        <option value="ca">Canada</option>
      </optgroup>
      <optgroup label="Europe">
        <option value="uk">United Kingdom</option>
        <option value="de">Germany</option>
      </optgroup>
    </select>`))}};function Dt(){customElements.get(ne.tagName)||customElements.define(ne.tagName,ne)}var le=class extends HTMLElement{static{this.tagName="deml-separator"}static{this.componentName="separator"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<p>Above</p>
    <hr class="separator" />
    <p>Below</p>
    <div class="separator separator--vertical" role="separator" aria-orientation="vertical"></div>`))}};function Mt(){customElements.get(le.tagName)||customElements.define(le.tagName,le)}var de=class extends HTMLElement{static{this.tagName="deml-sheet"}static{this.componentName="sheet"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="sheet-overlay" role="presentation">
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div class="sheet__handle" aria-hidden="true"></div>
        <header class="sheet__header">
          <h3 class="sheet__title" id="sheet-title">Confirm action</h3>
        </header>
        <div class="sheet__body">
          <p>Bottom sheet on phone; centered panel from 800px.</p>
        </div>
        <footer class="sheet__footer">
          <button type="button" class="button button--secondary button--pill">Cancel</button>
          <button type="button" class="button button--primary button--pill">Confirm</button>
        </footer>
      </div>
    </div>`))}};function St(){customElements.get(de.tagName)||customElements.define(de.tagName,de)}var re=class extends HTMLElement{static{this.tagName="deml-site-footer"}static{this.componentName="site-footer"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<footer class="site-footer">
      <div class="site-footer__inner">
        <nav class="site-footer__directory" aria-label="Footer">
          <div class="site-footer__group">
            <p class="site-footer__heading">Resources</p>
            <ul class="site-footer__list">
              <li><a href="/book">Book</a></li>
              <li><a href="/whitepaper">Whitepaper</a></li>
              <li><a href="/documentation">Docs</a></li>
              <li><a href="/blog">Blog</a></li>
            </ul>
          </div>
          <div class="site-footer__group">
            <p class="site-footer__heading">Legal</p>
            <ul class="site-footer__list">
              <li><a href="/compliance">Compliance</a></li>
              <li><a href="/privacy/">Privacy</a></li>
              <li><a href="/terms/">Terms</a></li>
              <li><a href="/status/platform-status">Status</a></li>
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
    </footer>`))}};function wt(){customElements.get(re.tagName)||customElements.define(re.tagName,re)}var ce=class extends HTMLElement{static{this.tagName="deml-skeleton"}static{this.componentName="skeleton"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="skeleton" aria-hidden="true">
      <div class="skeleton__line skeleton__line--short"></div>
      <div class="skeleton__line skeleton__line--long"></div>
      <div class="skeleton__line skeleton__line--medium"></div>
    </div>`))}};function Pt(){customElements.get(ce.tagName)||customElements.define(ce.tagName,ce)}var oe=class extends HTMLElement{static{this.tagName="deml-skip-link"}static{this.componentName="skip-link"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<a class="skip-link" href="#main">Skip to content</a>
    <p id="main">Focus the skip link (Tab) to reveal it — first focusable control on real pages.</p>`))}};function xt(){customElements.get(oe.tagName)||customElements.define(oe.tagName,oe)}var me=class extends HTMLElement{static{this.tagName="deml-spinner"}static{this.componentName="spinner"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<span class="spinner" role="status" aria-label="Loading">
      <span class="spinner__visual" aria-hidden="true"></span>
    </span>`))}};function Bt(){customElements.get(me.tagName)||customElements.define(me.tagName,me)}var he=class extends HTMLElement{static{this.tagName="deml-stack"}static{this.componentName="stack"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="stack">
      <div>Stack item one</div>
      <div>Stack item two</div>
      <div>Stack item three</div>
    </div>`))}};function Ft(){customElements.get(he.tagName)||customElements.define(he.tagName,he)}var ue=class extends HTMLElement{static{this.tagName="deml-stat-card"}static{this.componentName="stat-card"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<article class="stat-card"><p class="stat-card__label">Sessions</p><p class="stat-card__value">1.2k</p><p class="stat-card__delta">+4%</p></article>'))}};function At(){customElements.get(ue.tagName)||customElements.define(ue.tagName,ue)}var pe=class extends HTMLElement{static{this.tagName="deml-status-badge"}static{this.componentName="status-badge"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<span class="status-badge" data-tone="success">
      <span class="status-badge__dot" aria-hidden="true"></span>
      Operational
    </span>
    <span class="status-badge" data-tone="danger">
      <span class="status-badge__dot" aria-hidden="true"></span>
      Degraded
    </span>`))}};function It(){customElements.get(pe.tagName)||customElements.define(pe.tagName,pe)}var fe=class extends HTMLElement{static{this.tagName="deml-status-pill"}static{this.componentName="status-pill"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<span class="status-pill" data-status="up">Up</span>
    <span class="status-pill" data-status="down">Down</span>
    <span class="status-pill" data-status="maintenance">Maintenance</span>`))}};function Gt(){customElements.get(fe.tagName)||customElements.define(fe.tagName,fe)}var ge=class extends HTMLElement{static{this.tagName="deml-switch"}static{this.componentName="switch"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label class="switch">
      <span class="switch__track">
        <input type="checkbox" role="switch" name="switch-demo" aria-checked="false" />
        <span class="switch__thumb" aria-hidden="true"></span>
      </span>
      <span class="switch__content">
        <span class="switch__label">Enable notifications</span>
        <span class="switch__description">Receive product updates by email.</span>
      </span>
    </label>`))}};function Rt(){customElements.get(ge.tagName)||customElements.define(ge.tagName,ge)}var be=class extends HTMLElement{static{this.tagName="deml-table"}static{this.componentName="table"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<table>
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
    </table>`))}};function Wt(){customElements.get(be.tagName)||customElements.define(be.tagName,be)}var ve=class extends HTMLElement{static{this.tagName="deml-text-field"}static{this.componentName="text-field"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML='<label class="text-field"><span class="text-field__label">Name</span><input class="text-field__control" type="text" /></label>'))}};function zt(){customElements.get(ve.tagName)||customElements.define(ve.tagName,ve)}var ye=class extends HTMLElement{static{this.tagName="deml-textarea"}static{this.componentName="textarea"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<label for="textarea-field">Message</label>
    <textarea id="textarea-field" name="message" rows="4" cols="40" placeholder="Message"></textarea>`))}};function Ot(){customElements.get(ye.tagName)||customElements.define(ye.tagName,ye)}var Ne=class extends HTMLElement{static{this.tagName="deml-theme-toggle"}static{this.componentName="theme-toggle"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<button type="button" class="theme-toggle" aria-pressed="false" aria-label="Toggle dark mode">
      Theme
    </button>`))}};function Ut(){customElements.get(Ne.tagName)||customElements.define(Ne.tagName,Ne)}var _e=class extends HTMLElement{static{this.tagName="deml-tile-board"}static{this.componentName="tile-board"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="tile-board">
      <div class="dashboard-grid">
        <article class="tile-board__cell" data-size="sm">Stat</article>
        <article class="tile-board__cell" data-size="md">Chart</article>
        <article class="tile-board__cell" data-size="sm">KPI</article>
      </div>
    </div>`))}};function Yt(){customElements.get(_e.tagName)||customElements.define(_e.tagName,_e)}var He=class extends HTMLElement{static{this.tagName="deml-toc"}static{this.componentName="toc"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<nav class="toc" aria-label="Contents">
      <h2 class="toc__heading">Contents</h2>
      <div class="toc__group">
        <h3 class="toc__group-title">Part I</h3>
        <ol class="toc__list">
          <li>
            <a class="toc__item" href="#">
              <span class="toc__num">1</span>
              <span class="toc__label">Getting started</span>
            </a>
          </li>
          <li>
            <a class="toc__item" href="#">
              <span class="toc__num">2</span>
              <span class="toc__label">Keep the codebase clean</span>
            </a>
          </li>
        </ol>
      </div>
    </nav>`))}};function qt(){customElements.get(He.tagName)||customElements.define(He.tagName,He)}var Ee=class extends HTMLElement{static{this.tagName="deml-toggle"}static{this.componentName="toggle"}connectedCallback(){this.dataset.demlHydrated!=="true"&&(this.dataset.demlHydrated="true",this.hasChildNodes()||(this.innerHTML=`<div class="toggle-group" role="group" aria-label="View">
      <button type="button" class="toggle" aria-pressed="true">List</button>
      <button type="button" class="toggle" aria-pressed="false">Grid</button>
    </div>`))}};function Kt(){customElements.get(Ee.tagName)||customElements.define(Ee.tagName,Ee)}function Vt(){Ce(),Te(),Le(),ke(),De(),Me(),Se(),we(),Pe(),xe(),Be(),Fe(),Ae(),Ie(),Ge(),Re(),We(),ze(),Oe(),Ue(),Ye(),qe(),Ke(),Ve(),je(),Je(),Qe(),Xe(),Ze(),$e(),et(),tt(),at(),st(),it(),nt(),lt(),dt(),rt(),ct(),ot(),mt(),ht(),ut(),pt(),ft(),gt(),bt(),vt(),yt(),Nt(),_t(),Ht(),Et(),Ct(),Tt(),Lt(),kt(),Dt(),Mt(),St(),wt(),Pt(),xt(),Bt(),Ft(),At(),It(),Gt(),Rt(),Wt(),zt(),Ot(),Ut(),Yt(),qt(),Kt()}var jt=["app-layout","area-chart","article","badge","banner","bar-chart","box","brand","button","button-group","callout","card","card-grid","chart","chart-card","chart-empty-state","chart-panel","checkbox","checkbox-field","cluster","confirm-dialog","container","content-layout","dashboard-grid","dialog","dropdown","empty-state","error-state","explore-card","field","form-grid","form-panel","form-section","grid","icon","input-date","input-email","input-number","input-password","input-range","input-search","input-text","input-time","label","navbar","page-back-link","page-header","page-section","page-shell","page-template","pagination","panel-grid","progress","radio-group","scroll-area","section","section-header","section-template","select","separator","sheet","site-footer","skeleton","skip-link","spinner","stack","stat-card","status-badge","status-pill","switch","table","text-field","textarea","theme-toggle","tile-board","toc","toggle"];return Vt(),e.DemlAppLayout=t,e.DemlAreaChart=a,e.DemlArticle=s,e.DemlBadge=i,e.DemlBanner=n,e.DemlBarChart=l,e.DemlBox=d,e.DemlBrand=r,e.DemlButton=c,e.DemlButtonGroup=o,e.DemlCallout=m,e.DemlCard=h,e.DemlCardGrid=u,e.DemlChart=p,e.DemlChartCard=f,e.DemlChartEmptyState=g,e.DemlChartPanel=b,e.DemlCheckbox=v,e.DemlCheckboxField=y,e.DemlCluster=N,e.DemlConfirmDialog=_,e.DemlContainer=H,e.DemlContentLayout=E,e.DemlDashboardGrid=C,e.DemlDialog=T,e.DemlDropdown=L,e.DemlEmptyState=k,e.DemlErrorState=D,e.DemlExploreCard=M,e.DemlField=S,e.DemlFormGrid=w,e.DemlFormPanel=P,e.DemlFormSection=x,e.DemlGrid=B,e.DemlIcon=F,e.DemlInputDate=A,e.DemlInputEmail=I,e.DemlInputNumber=G,e.DemlInputPassword=R,e.DemlInputRange=W,e.DemlInputSearch=z,e.DemlInputText=O,e.DemlInputTime=U,e.DemlLabel=Y,e.DemlNavbar=q,e.DemlPageBackLink=K,e.DemlPageHeader=V,e.DemlPageSection=j,e.DemlPageShell=J,e.DemlPageTemplate=Q,e.DemlPagination=X,e.DemlPanelGrid=Z,e.DemlProgress=$,e.DemlRadioGroup=ee,e.DemlScrollArea=te,e.DemlSection=ae,e.DemlSectionHeader=se,e.DemlSectionTemplate=ie,e.DemlSelect=ne,e.DemlSeparator=le,e.DemlSheet=de,e.DemlSiteFooter=re,e.DemlSkeleton=ce,e.DemlSkipLink=oe,e.DemlSpinner=me,e.DemlStack=he,e.DemlStatCard=ue,e.DemlStatusBadge=pe,e.DemlStatusPill=fe,e.DemlSwitch=ge,e.DemlTable=be,e.DemlTextField=ve,e.DemlTextarea=ye,e.DemlThemeToggle=Ne,e.DemlTileBoard=_e,e.DemlToc=He,e.DemlToggle=Ee,e.componentNames=jt,e.defineAll=Vt,e.defineAppLayout=Ce,e.defineAreaChart=Te,e.defineArticle=Le,e.defineBadge=ke,e.defineBanner=De,e.defineBarChart=Me,e.defineBox=Se,e.defineBrand=we,e.defineButton=Pe,e.defineButtonGroup=xe,e.defineCallout=Be,e.defineCard=Fe,e.defineCardGrid=Ae,e.defineChart=Ie,e.defineChartCard=Ge,e.defineChartEmptyState=Re,e.defineChartPanel=We,e.defineCheckbox=ze,e.defineCheckboxField=Oe,e.defineCluster=Ue,e.defineConfirmDialog=Ye,e.defineContainer=qe,e.defineContentLayout=Ke,e.defineDashboardGrid=Ve,e.defineDialog=je,e.defineDropdown=Je,e.defineEmptyState=Qe,e.defineErrorState=Xe,e.defineExploreCard=Ze,e.defineField=$e,e.defineFormGrid=et,e.defineFormPanel=tt,e.defineFormSection=at,e.defineGrid=st,e.defineIcon=it,e.defineInputDate=nt,e.defineInputEmail=lt,e.defineInputNumber=dt,e.defineInputPassword=rt,e.defineInputRange=ct,e.defineInputSearch=ot,e.defineInputText=mt,e.defineInputTime=ht,e.defineLabel=ut,e.defineNavbar=pt,e.definePageBackLink=ft,e.definePageHeader=gt,e.definePageSection=bt,e.definePageShell=vt,e.definePageTemplate=yt,e.definePagination=Nt,e.definePanelGrid=_t,e.defineProgress=Ht,e.defineRadioGroup=Et,e.defineScrollArea=Ct,e.defineSection=Tt,e.defineSectionHeader=Lt,e.defineSectionTemplate=kt,e.defineSelect=Dt,e.defineSeparator=Mt,e.defineSheet=St,e.defineSiteFooter=wt,e.defineSkeleton=Pt,e.defineSkipLink=xt,e.defineSpinner=Bt,e.defineStack=Ft,e.defineStatCard=At,e.defineStatusBadge=It,e.defineStatusPill=Gt,e.defineSwitch=Rt,e.defineTable=Wt,e.defineTextField=zt,e.defineTextarea=Ot,e.defineThemeToggle=Ut,e.defineTileBoard=Yt,e.defineToc=qt,e.defineToggle=Kt,e})({});

//# sourceMappingURL=deml-ui.iife.js.map