var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\core\config.ts
var parseConfig, promoteSerializedKey, normalizeProviderKeys, normalizeConfig, getConfig, getPageConfig;
var init_config = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\core\\config.ts"() {
    parseConfig = (id, fallback) => {
      const element = document.getElementById(id);
      if (!element) return fallback;
      try {
        return JSON.parse(element.content?.textContent || element.textContent || "{}");
      } catch (error) {
        console.error(`Invalid Solitude configuration in #${id}:`, error);
        return fallback;
      }
    };
    promoteSerializedKey = (record, canonical, serialized) => {
      if (!record) return;
      const values = record;
      if (!(serialized in values)) return;
      if (!(canonical in values)) values[canonical] = values[serialized];
      delete values[serialized];
    };
    normalizeProviderKeys = (record) => {
      promoteSerializedKey(record, "appId", "appid");
      promoteSerializedKey(record, "apiKey", "apikey");
      promoteSerializedKey(record, "appKey", "appkey");
      promoteSerializedKey(record, "indexName", "indexname");
      promoteSerializedKey(record, "serverURL", "serverurl");
      promoteSerializedKey(record, "serverURLs", "serverurls");
      promoteSerializedKey(record, "envId", "envid");
      promoteSerializedKey(record, "accessToken", "accesstoken");
    };
    normalizeConfig = (config) => {
      promoteSerializedKey(config.comment, "commentBarrage", "commentbarrage");
      promoteSerializedKey(config.console, "recentComment", "recentcomment");
      promoteSerializedKey(config.right_menu, "ctrlOriginalMenu", "ctrloriginalmenu");
      normalizeProviderKeys(config.valine);
      normalizeProviderKeys(config.twikoo);
      normalizeProviderKeys(config.waline);
      normalizeProviderKeys(config.algolia);
      normalizeProviderKeys(config.search?.algolia);
      normalizeProviderKeys(config.search?.docsearch);
      return config;
    };
    getConfig = () => normalizeConfig(
      parseConfig(
        "site-config",
        {}
      )
    );
    getPageConfig = () => parseConfig("config-diff", {});
  }
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\core\lifecycle.ts
var EVENT_PREFIX, _pageController, _disposers, Lifecycle, lifecycle;
var init_lifecycle = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\core\\lifecycle.ts"() {
    EVENT_PREFIX = "solitude:";
    Lifecycle = class {
      constructor() {
        __privateAdd(this, _pageController, new AbortController());
        __privateAdd(this, _disposers, /* @__PURE__ */ new Set());
      }
      get signal() {
        return __privateGet(this, _pageController).signal;
      }
      add(disposer) {
        if (typeof disposer !== "function") return () => {
        };
        __privateGet(this, _disposers).add(disposer);
        return () => __privateGet(this, _disposers).delete(disposer);
      }
      listen(target, type, handler, options = {}) {
        if (!target?.addEventListener) return () => {
        };
        const normalized = typeof options === "boolean" ? { capture: options } : { ...options };
        normalized.signal ?? (normalized.signal = this.signal);
        target.addEventListener(type, handler, normalized);
        return () => target.removeEventListener(type, handler, normalized);
      }
      disposePage() {
        __privateGet(this, _pageController).abort();
        __privateGet(this, _disposers).forEach((dispose) => {
          try {
            dispose();
          } catch (error) {
            console.error("Failed to dispose a Solitude page resource:", error);
          }
        });
        __privateGet(this, _disposers).clear();
        __privateSet(this, _pageController, new AbortController());
      }
      emit(type, detail) {
        document.dispatchEvent(
          new CustomEvent(`${EVENT_PREFIX}${type}`, { detail })
        );
      }
      on(type, handler) {
        const eventName = `${EVENT_PREFIX}${type}`;
        document.addEventListener(eventName, handler);
        return () => document.removeEventListener(eventName, handler);
      }
    };
    _pageController = new WeakMap();
    _disposers = new WeakMap();
    lifecycle = new Lifecycle();
  }
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\core\resources.ts
var scriptRequests, styleRequests, loadElement, loadScript, loadStyle;
var init_resources = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\core\\resources.ts"() {
    scriptRequests = /* @__PURE__ */ new Map();
    styleRequests = /* @__PURE__ */ new Map();
    loadElement = (cache, selector, create, url) => {
      const absoluteUrl = new URL(url, document.baseURI).href;
      if (cache.has(absoluteUrl)) return cache.get(absoluteUrl);
      const existing = [...document.querySelectorAll(selector)].find(
        (element) => element.href === absoluteUrl || element.src === absoluteUrl
      );
      if (existing) {
        const resolved = Promise.resolve(existing);
        cache.set(absoluteUrl, resolved);
        return resolved;
      }
      const request = new Promise((resolve, reject) => {
        const element = existing || create(absoluteUrl);
        const complete = () => {
          element.dataset.loaded = "true";
          resolve(element);
        };
        const fail = () => {
          cache.delete(absoluteUrl);
          reject(new Error(`Unable to load ${absoluteUrl}`));
        };
        element.addEventListener("load", complete, { once: true });
        element.addEventListener("error", fail, { once: true });
        if (!existing) document.head.appendChild(element);
      });
      cache.set(absoluteUrl, request);
      return request;
    };
    loadScript = (url, options = {}) => loadElement(
      scriptRequests,
      "script",
      (src) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = options.async ?? true;
        Object.entries(options.attributes || {}).forEach(
          ([key, value]) => script.setAttribute(key, value)
        );
        return script;
      },
      url
    );
    loadStyle = (url, options = {}) => loadElement(
      styleRequests,
      "link",
      (href) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        if (options.id) link.id = options.id;
        return link;
      },
      url
    );
  }
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\core\storage.ts
var saveToLocal;
var init_storage = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\core\\storage.ts"() {
    saveToLocal = {
      set(key, value, ttlDays) {
        if (ttlDays === 0) return;
        const expiry = Date.now() + ttlDays * 864e5;
        localStorage.setItem(key, JSON.stringify({ value, expiry }));
      },
      get(key) {
        const source = localStorage.getItem(key);
        if (!source) return void 0;
        try {
          const item = JSON.parse(source);
          if (!item.expiry || Date.now() > item.expiry) {
            localStorage.removeItem(key);
            return void 0;
          }
          return item.value;
        } catch {
          localStorage.removeItem(key);
          return void 0;
        }
      }
    };
  }
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\core\api.ts
var api;
var init_api = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\core\\api.ts"() {
    init_config();
    init_lifecycle();
    init_resources();
    init_storage();
    document.documentElement.dataset.solitudeRuntime = "booting";
    api = window.Solitude || {};
    Object.defineProperties(api, {
      config: { configurable: true, get: getConfig },
      page: { configurable: true, get: getPageConfig }
    });
    Object.assign(api, {
      saveToLocal,
      loadScript(url, options) {
        if (/barrage(?:\.min)?\.js(?:\?|$)/.test(url)) api.installLegacyAdapter?.();
        return loadScript(url, options);
      },
      loadStyle,
      on: lifecycle.on.bind(lifecycle),
      listen: lifecycle.listen.bind(lifecycle),
      onPageCleanup: lifecycle.add.bind(lifecycle),
      addGlobalFn(key, fn, name = false, parent = window) {
        const globalFn = parent.globalFn || {};
        const keyObject = globalFn[key] || {};
        if (name && keyObject[name]) return;
        const id = name || Object.keys(keyObject).length;
        keyObject[id] = fn;
        globalFn[key] = keyObject;
        parent.globalFn = globalFn;
      },
      addEventListenerPjax(element, event, handler, options = false) {
        if (!element?.addEventListener) return;
        element.addEventListener(event, handler, options);
        api.addGlobalFn("pjax", () => element.removeEventListener(event, handler, options));
      },
      diffDateFormat(elements) {
        elements?.forEach((item) => {
          const date = new Date(item.getAttribute("datetime") || item.textContent || "");
          if (!Number.isNaN(date.valueOf())) item.textContent = `${date.getMonth() + 1}/${date.getDate()}`;
        });
      },
      installLegacyAdapter() {
        const aliases = { utils: api, sco: api, GLOBAL_CONFIG: api.config };
        Object.entries(aliases).forEach(([name, value]) => {
          if (!(name in window)) Object.defineProperty(window, name, { configurable: true, value });
        });
      },
      disposePage: lifecycle.disposePage.bind(lifecycle),
      navigate(url) {
        if (!url) return;
        const instance = api.pjax;
        if (instance?.loadUrl) instance.loadUrl(url);
        else window.location.assign(url);
      }
    });
    api.getCSS = (url, id = false) => api.loadStyle(url, id ? { id } : {});
    api.getScript = (url, attributes = {}) => api.loadScript(url, { attributes });
    window.Solitude = api;
    document.documentElement.dataset.solitudeRuntime = "ready";
  }
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\search\local.ts
var local_exports = {};
var init_local = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\search\\local.ts"() {
    init_api();
    (() => {
      class LocalSearch {
        constructor() {
          this.store = [];
          this.currentQuery = "";
          this.currentPage = 0;
          this.resultsPerPage = 10;
          this.currentResults = [];
          this.lastSearchTime = null;
          this.isLoading = false;
          this.searchTimeout = null;
          this.boundElements = /* @__PURE__ */ new WeakSet();
          this.keyboardBound = false;
          this.pjaxBound = false;
          this.fixSafariHeight = this.fixSafariHeight.bind(this);
          this.handleKeydown = this.handleKeydown.bind(this);
          this.handlePjaxComplete = this.handlePjaxComplete.bind(this);
          this.handleSearchInputDebounced = this.debounce((event) => {
            this.handleSearchInput(event.target.value.trim());
          }, 300);
          this.elements = this.cacheElements();
          this.init();
        }
        cacheElements() {
          return {
            searchMask: document.getElementById("search-mask"),
            searchDialog: document.querySelector("#local-search .search-dialog"),
            searchInput: document.getElementById("search-input"),
            searchSuggestions: document.getElementById("search-suggestions"),
            searchResults: document.getElementById("search-results"),
            searchPagination: document.getElementById("search-pagination"),
            searchTips: document.getElementById("search-tips"),
            searchButton: document.querySelector("#search-button > .search"),
            closeButton: document.querySelector("#local-search .search-close-button"),
            menuSearch: document.getElementById("menu-search")
          };
        }
        async init() {
          this.bindEvents();
          this.bindKeyboardShortcuts();
          this.bindPjaxEvents();
          this.syncSearchState();
          api.openSearch = () => this.openSearch();
          try {
            await this.loadSearchData();
            const query = this.elements.searchInput?.value.trim();
            if (query) this.handleSearchInput(query);
          } catch (error) {
            console.error("Search initialization failed:", error);
          }
        }
        async loadSearchData() {
          if (!api.config?.localsearch?.path) {
            throw new Error("Search data path not configured");
          }
          this.isLoading = true;
          try {
            const response = await fetch(api.config.localsearch.path);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.text();
            this.parseSearchData(data);
          } catch (error) {
            throw new Error(`Failed to load search data: ${error.message}`);
          } finally {
            this.isLoading = false;
          }
        }
        parseSearchData(xmlData) {
          try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlData, "text/xml");
            const entries = xmlDoc.getElementsByTagName("entry");
            this.store = Array.from(entries).map((entry) => {
              const getTextContent = (tagName) => {
                const element = entry.getElementsByTagName(tagName)[0];
                return element ? element.textContent.trim() : "";
              };
              return {
                title: getTextContent("title"),
                link: getTextContent("url"),
                content: getTextContent("content")
              };
            }).filter((item) => item.title && item.link);
          } catch (error) {
            throw new Error(`Failed to parse search data: ${error.message}`);
          }
        }
        bindOnce(element, eventName, handler) {
          if (!element || this.boundElements.has(element)) return;
          element.addEventListener(eventName, handler);
          this.boundElements.add(element);
        }
        bindEvents() {
          this.bindOnce(this.elements.searchInput, "input", this.handleSearchInputDebounced);
          this.bindOnce(this.elements.searchButton, "click", () => this.openSearch());
          this.bindOnce(this.elements.closeButton, "click", () => this.closeSearch());
          this.bindOnce(this.elements.searchMask, "click", () => this.closeSearch());
          document.querySelectorAll("#local-search .tag-list").forEach((button) => {
            this.bindOnce(button, "click", () => {
              const query = button.dataset.query?.trim();
              if (!query || !this.elements.searchInput) return;
              this.elements.searchInput.value = query;
              this.handleSearchInput(query);
              this.elements.searchInput.focus();
            });
          });
          if (api.config.right_menu && this.elements.menuSearch) {
            this.bindOnce(this.elements.menuSearch, "click", () => {
              api.hideRightMenu?.();
              this.openSearch();
              if (api.selectedText && this.elements.searchInput) {
                this.elements.searchInput.value = api.selectedText;
                this.handleSearchInput(api.selectedText.trim());
              }
            });
          }
        }
        bindKeyboardShortcuts() {
          if (this.keyboardBound) return;
          document.addEventListener("keydown", this.handleKeydown);
          this.keyboardBound = true;
        }
        bindPjaxEvents() {
          if (this.pjaxBound) return;
          window.addEventListener("pjax:complete", this.handlePjaxComplete);
          this.pjaxBound = true;
        }
        handleKeydown(event) {
          if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            this.openSearch();
            return;
          }
          if (event.code === "Escape" && this.isSearchOpen()) {
            this.closeSearch();
          }
        }
        handlePjaxComplete() {
          this.elements = this.cacheElements();
          this.bindEvents();
          this.syncSearchState();
        }
        openSearch() {
          if (!this.elements.searchMask || !this.elements.searchDialog) return;
          api.animateIn(this.elements.searchMask, "to_show 0.5s");
          this.elements.searchDialog.style.display = "flex";
          document.documentElement.classList.add("search-open");
          this.syncSearchState();
          this.fixSafariHeight();
          window.addEventListener("resize", this.fixSafariHeight);
          setTimeout(() => this.elements.searchInput?.focus(), 100);
        }
        closeSearch() {
          if (!this.elements.searchMask || !this.elements.searchDialog) return;
          api.animateOut(this.elements.searchDialog, "search_close .5s");
          api.animateOut(this.elements.searchMask, "to_hide 0.5s");
          document.documentElement.classList.remove("search-open");
          window.removeEventListener("resize", this.fixSafariHeight);
        }
        isSearchOpen() {
          return this.elements.searchDialog?.style.display === "flex";
        }
        fixSafariHeight() {
          if (!this.elements.searchDialog) return;
          if (window.innerWidth < 768) {
            this.elements.searchDialog.style.setProperty("--search-height", `${window.innerHeight}px`);
          } else {
            this.elements.searchDialog.style.removeProperty("--search-height");
          }
        }
        syncSearchState() {
          const query = this.elements.searchInput?.value.trim() || "";
          this.setQueryState(Boolean(query));
        }
        setQueryState(hasQuery) {
          if (this.elements.searchSuggestions) {
            this.elements.searchSuggestions.hidden = hasQuery;
          }
          if (this.elements.searchResults) {
            this.elements.searchResults.hidden = !hasQuery;
          }
        }
        handleSearchInput(query) {
          this.currentQuery = query;
          this.currentPage = 0;
          if (!query) {
            this.clearSearchResults();
            return;
          }
          this.setQueryState(true);
          if (this.isLoading) {
            this.showStatusMessage(api.config.lang?.search?.loading || "Searching...", "search-result-loading");
            return;
          }
          try {
            const startTime = performance.now();
            this.currentResults = this.performSearch(query);
            this.lastSearchTime = (performance.now() - startTime).toFixed(2);
            this.renderResults(this.currentResults, this.currentPage, this.lastSearchTime);
            this.renderPagination(this.currentResults.length);
          } catch (error) {
            console.error("Search error:", error);
            this.showErrorMessage("Search failed, please try again");
          }
        }
        performSearch(query) {
          if (!query || !this.store.length) return [];
          const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
          if (!keywords.length) return [];
          return this.store.filter((item) => {
            const titleLower = item.title.toLowerCase();
            const contentLower = item.content.toLowerCase();
            return keywords.every(
              (keyword) => titleLower.includes(keyword) || contentLower.includes(keyword)
            );
          }).sort(
            (a, b) => this.calculateRelevanceScore(b, keywords) - this.calculateRelevanceScore(a, keywords)
          );
        }
        calculateRelevanceScore(item, keywords) {
          const titleLower = item.title.toLowerCase();
          const contentLower = item.content.toLowerCase();
          return keywords.reduce((score, keyword) => {
            if (titleLower === keyword) return score + 10;
            if (titleLower.includes(keyword)) return score + 5;
            if (contentLower.includes(keyword)) return score + 1;
            return score;
          }, 0);
        }
        renderResults(results, page, searchTime = this.lastSearchTime) {
          if (!this.elements.searchResults || !this.elements.searchTips) return;
          this.elements.searchResults.innerHTML = "";
          this.elements.searchTips.innerHTML = "";
          this.setQueryState(true);
          const start2 = page * this.resultsPerPage;
          const end = start2 + this.resultsPerPage;
          if (!results.length) {
            this.showEmptyMessage();
            return;
          }
          const fragment = document.createDocumentFragment();
          results.slice(start2, end).forEach((result) => {
            fragment.appendChild(this.createResultElement(result));
          });
          this.elements.searchResults.appendChild(fragment);
          this.showResultCount(results.length, searchTime);
        }
        createResultElement(result) {
          const resultItem = document.createElement("li");
          resultItem.className = "search-result-item";
          const link = document.createElement("a");
          link.className = "search-result-title";
          link.href = result.link;
          link.innerHTML = this.highlightKeywords(result.title, this.currentQuery);
          link.addEventListener("click", () => this.closeSearch());
          resultItem.appendChild(link);
          return resultItem;
        }
        highlightKeywords(text, query) {
          if (!query) return text;
          return query.split(/\s+/).filter(Boolean).reduce((highlightedText, keyword) => {
            const regex = new RegExp(`(${this.escapeRegExp(keyword)})`, "gi");
            return highlightedText.replace(regex, "<em>$1</em>");
          }, text);
        }
        escapeRegExp(string) {
          return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }
        renderPagination(totalResults) {
          if (!this.elements.searchPagination) return;
          const totalPages = Math.ceil(totalResults / this.resultsPerPage);
          this.elements.searchPagination.innerHTML = "";
          if (totalPages <= 1) return;
          const paginationList = document.createElement("ul");
          paginationList.className = "pagination-list";
          for (let page = 0; page < totalPages; page++) {
            paginationList.appendChild(this.createPaginationItem(page));
          }
          this.elements.searchPagination.appendChild(paginationList);
        }
        createPaginationItem(page) {
          const item = document.createElement("li");
          item.className = "pagination-item";
          const button = document.createElement("button");
          button.type = "button";
          button.className = "pagination-button";
          button.textContent = page + 1;
          button.setAttribute("aria-label", `${page + 1}`);
          if (page === this.currentPage) {
            button.classList.add("select");
            button.setAttribute("aria-current", "page");
          } else {
            button.addEventListener("click", () => this.goToPage(page));
          }
          item.appendChild(button);
          return item;
        }
        goToPage(page) {
          this.currentPage = page;
          this.renderResults(this.currentResults, page, this.lastSearchTime);
          this.renderPagination(this.currentResults.length);
          if (this.elements.searchResults) this.elements.searchResults.scrollTop = 0;
        }
        showEmptyMessage() {
          const empty = document.createElement("span");
          empty.className = "search-result-empty";
          empty.textContent = api.config.lang?.search?.empty?.replace(/\$\{query}/g, this.currentQuery) || `\u6CA1\u6709\u627E\u5230\u4E0E "${this.currentQuery}" \u76F8\u5173\u7684\u5185\u5BB9`;
          this.elements.searchResults.appendChild(empty);
        }
        showResultCount(count, time) {
          const countElement = document.createElement("span");
          countElement.className = "search-result-count";
          const template = api.config.lang?.search?.hit || "Found ${hits} results in ${time} ms";
          countElement.innerHTML = template.replace(/\$\{hits}/g, count).replace(/\$\{query}/g, count).replace(/\$\{time}/g, time || "0.00");
          this.elements.searchTips.appendChild(countElement);
        }
        showStatusMessage(message, className) {
          if (!this.elements.searchResults) return;
          this.elements.searchResults.innerHTML = "";
          this.elements.searchTips.innerHTML = "";
          this.elements.searchPagination.innerHTML = "";
          this.setQueryState(true);
          const status = document.createElement("span");
          status.className = className;
          status.textContent = message;
          this.elements.searchResults.appendChild(status);
        }
        showErrorMessage(message) {
          this.showStatusMessage(message, "search-result-error");
        }
        clearSearchResults() {
          if (this.elements.searchResults) this.elements.searchResults.innerHTML = "";
          if (this.elements.searchPagination) this.elements.searchPagination.innerHTML = "";
          if (this.elements.searchTips) this.elements.searchTips.innerHTML = "";
          this.currentResults = [];
          this.currentPage = 0;
          this.lastSearchTime = null;
          this.setQueryState(false);
        }
        debounce(func, wait) {
          return (...args) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => func.apply(this, args), wait);
          };
        }
      }
      const initializeLocalSearch = () => {
        if (!api.localSearch) api.localSearch = new LocalSearch();
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeLocalSearch, { once: true });
      } else {
        initializeLocalSearch();
      }
    })();
  }
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\search\algolia.ts
var algolia_exports = {};
var AlgoliaSearch, initializeAlgoliaSearch;
var init_algolia = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\search\\algolia.ts"() {
    init_api();
    AlgoliaSearch = class {
      constructor() {
        /**
         * 修复Safari高度问题
         */
        __publicField(this, "fixSafariHeight", () => {
          if (window.innerWidth < 768 && this.elements.searchDialog) {
            this.elements.searchDialog.style.setProperty("--search-height", `${window.innerHeight}px`);
          }
        });
        this.searchInstance = null;
        this.isInitialized = false;
        this.elements = this.cacheElements();
        this.config = api.config.algolia;
        this.init();
      }
      /**
       * 缓存常用的DOM元素
       */
      cacheElements() {
        return {
          searchMask: document.getElementById("search-mask"),
          searchDialog: document.querySelector("#algolia-search .search-dialog"),
          searchButton: document.querySelector("#search-button > .search"),
          closeButton: document.querySelector("#algolia-search .search-close-button"),
          menuSearch: document.getElementById("menu-search"),
          hitsContainer: document.getElementById("algolia-hits"),
          inputContainer: "#algolia-search-input",
          paginationContainer: "#algolia-pagination",
          statsContainer: "#algolia-tips > #algolia-stats"
        };
      }
      /**
       * 初始化搜索功能
       */
      init() {
        try {
          if (!this.validateConfig()) {
            console.error("Algolia configuration is invalid!");
            return;
          }
          this.setupSearchInstance();
          this.bindEvents();
          this.bindKeyboardShortcuts();
          this.isInitialized = true;
        } catch (error) {
          console.error("Algolia search initialization failed:", error);
        }
      }
      /**
       * 验证 Algolia 配置
       */
      validateConfig() {
        return this.config && this.config.appId && this.config.apiKey && this.config.indexName;
      }
      /**
       * 设置搜索实例
       */
      setupSearchInstance() {
        this.searchInstance = instantsearch({
          indexName: this.config.indexName,
          searchClient: algoliasearch.algoliasearch(this.config.appId, this.config.apiKey),
          searchFunction: (helper) => this.handleSearch(helper)
        });
        this.addWidgets();
        this.searchInstance.start();
      }
      /**
       * 处理搜索逻辑
       */
      handleSearch(helper) {
        if (helper.state.query) {
          this.showLoading();
          helper.search();
        } else {
          this.clearResults();
        }
      }
      /**
       * 显示加载状态
       */
      showLoading() {
        if (this.elements.hitsContainer) {
          const loadingHtml = `<div class="loading">${api.config.lang?.search?.loading || "Searching..."}</div>`;
          this.elements.hitsContainer.innerHTML = loadingHtml;
        }
      }
      /**
       * 清空搜索结果
       */
      clearResults() {
        if (this.elements.hitsContainer) {
          this.elements.hitsContainer.innerHTML = "";
        }
      }
      /**
       * 添加搜索组件
       */
      addWidgets() {
        const widgets = [
          this.createConfigureWidget(),
          this.createSearchBoxWidget(),
          this.createStatsWidget(),
          this.createHitsWidget(),
          this.createPaginationWidget()
        ];
        this.searchInstance.addWidgets(widgets);
      }
      /**
       * 创建配置组件
       */
      createConfigureWidget() {
        return instantsearch.widgets.configure({
          hitsPerPage: this.config.hits?.per_page || 5
        });
      }
      /**
       * 创建搜索框组件
       */
      createSearchBoxWidget() {
        return instantsearch.widgets.searchBox({
          container: this.elements.inputContainer,
          showReset: false,
          showSubmit: false,
          placeholder: api.config.lang?.search?.placeholder || "Search by keywords",
          showLoadingIndicator: false,
          searchAsYouType: true
        });
      }
      /**
       * 创建统计组件
       */
      createStatsWidget() {
        return instantsearch.widgets.stats({
          container: this.elements.statsContainer,
          templates: {
            text: (data) => this.formatStatsText(data)
          }
        });
      }
      /**
       * 格式化统计文本
       */
      formatStatsText(data) {
        const statsText = api.config.lang?.search?.hit?.replace(/\$\{hits}/, data.nbHits)?.replace(/\$\{time}/, data.processingTimeMS) || `Found ${data.nbHits} results, took ${data.processingTimeMS} ms`;
        return `<hr>${statsText}`;
      }
      /**
       * 创建结果组件
       */
      createHitsWidget() {
        return instantsearch.widgets.hits({
          container: "#algolia-hits",
          templates: {
            item: (data) => this.renderHitItem(data),
            empty: (data) => this.renderEmptyState(data)
          },
          cssClasses: {
            item: "algolia-hit-item"
          }
        });
      }
      /**
       * 渲染搜索结果项
       */
      renderHitItem(data) {
        try {
          const link = data.permalink || api.config.root + data.path;
          const result = data._highlightResult;
          this.hideLoadingIndicator();
          this.delayedFocus();
          return `
                <a href="${this.escapeHtml(link)}" class="algolia-hit-item-link">
                    <span class="algolia-hits-item-title">${result.title?.value || "\u65E0\u6807\u9898"}</span>
                </a>`;
        } catch (error) {
          console.error("Failed to render search result item:", error);
          return '<div class="algolia-hit-error">Failed to render</div>';
        }
      }
      /**
       * 渲染空状态
       */
      renderEmptyState(data) {
        this.hideLoadingIndicator();
        this.delayedFocus();
        const emptyText = api.config.lang?.search?.empty?.replace(/\$\{query}/, data.query) || `No results found for "${data.query}"`;
        return `<div id="algolia-hits-empty">${emptyText}</div>`;
      }
      /**
       * 隐藏加载指示器
       */
      hideLoadingIndicator() {
        const loadingElement = document.querySelector("#algolia-hits .loading");
        if (loadingElement) {
          loadingElement.style.display = "none";
        }
      }
      /**
       * 延迟聚焦搜索框
       */
      delayedFocus() {
        setTimeout(() => {
          const searchInput = document.querySelector("#algolia-search .ais-SearchBox-input");
          searchInput?.focus();
        }, 200);
      }
      /**
       * 转义HTML
       */
      escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
      }
      /**
       * 创建分页组件
       */
      createPaginationWidget() {
        return instantsearch.widgets.pagination({
          container: this.elements.paginationContainer,
          totalPages: this.config.hits?.per_page ?? 5,
          scrollTo: false,
          showFirstLast: false,
          templates: {
            first: '<i class="solitude fas fa-angles-left"></i>',
            last: '<i class="solitude fas fa-angles-right"></i>',
            previous: '<i class="solitude fas fa-angle-left"></i>',
            next: '<i class="solitude fas fa-angle-right"></i>'
          },
          cssClasses: {
            root: "pagination",
            item: "pagination-item",
            link: "page-number",
            active: "current",
            disabled: "disabled-item"
          }
        });
      }
      /**
       * 绑定事件监听器
       */
      bindEvents() {
        this.bindSearchEvents();
        this.bindRightMenuSearch();
        this.bindPjaxEvents();
      }
      /**
       * 绑定搜索相关事件
       */
      bindSearchEvents() {
        if (this.elements.searchButton) {
          api.addEventListenerPjax(this.elements.searchButton, "click", () => this.openSearch());
        }
        if (this.elements.closeButton) {
          this.elements.closeButton.addEventListener("click", () => this.closeSearch());
        }
        if (this.elements.searchMask) {
          this.elements.searchMask.addEventListener("click", () => this.closeSearch());
        }
      }
      /**
       * 绑定右键菜单搜索
       */
      bindRightMenuSearch() {
        if (api.config.right_menu && this.elements.menuSearch) {
          this.elements.menuSearch.addEventListener("click", () => {
            api.hideRightMenu?.();
            this.openSearch();
            if (api.selectedText) {
              const searchInput = document.querySelector(".ais-SearchBox-input");
              if (searchInput) {
                searchInput.value = api.selectedText;
                const event = new Event("input", { bubbles: true });
                searchInput.dispatchEvent(event);
              }
            }
          });
        }
      }
      /**
       * 绑定 PJAX 事件
       */
      bindPjaxEvents() {
        window.addEventListener("pjax:complete", () => {
          if (!api.isHidden(this.elements.searchMask)) {
            this.closeSearch();
          }
          this.elements = this.cacheElements();
          this.bindSearchEvents();
        });
        if (api.pjax && this.searchInstance) {
          this.searchInstance.on("render", () => {
            const hitsElement = document.getElementById("algolia-hits");
            if (hitsElement) {
              api.pjax.refresh(hitsElement);
            }
          });
        }
      }
      /**
       * 绑定键盘快捷键
       */
      bindKeyboardShortcuts() {
        document.addEventListener("keydown", (event) => {
          if (event.ctrlKey && event.key === "k") {
            event.preventDefault();
            this.openSearch();
            return;
          }
          if (event.code === "Escape" && this.isSearchOpen()) {
            this.closeSearch();
          }
        });
      }
      /**
       * 打开搜索框
       */
      openSearch() {
        if (!this.elements.searchMask || !this.elements.searchDialog) return;
        api.animateIn(this.elements.searchMask, "to_show 0.5s");
        this.elements.searchDialog.style.display = "flex";
        setTimeout(() => {
          const searchInput = document.querySelector("#algolia-search .ais-SearchBox-input");
          searchInput?.focus();
        }, 100);
        this.fixSafariHeight();
        window.addEventListener("resize", this.fixSafariHeight);
        api.openSearch = () => this.openSearch();
      }
      /**
       * 关闭搜索框
       */
      closeSearch() {
        if (!this.elements.searchMask || !this.elements.searchDialog) return;
        api.animateOut(this.elements.searchDialog, "search_close .5s");
        api.animateOut(this.elements.searchMask, "to_hide 0.5s");
        window.removeEventListener("resize", this.fixSafariHeight);
      }
      /**
       * 检查搜索框是否打开
       */
      isSearchOpen() {
        return this.elements.searchDialog?.style.display === "flex";
      }
      /**
       * 销毁搜索实例
       */
      destroy() {
        if (this.searchInstance) {
          this.searchInstance.dispose();
          this.searchInstance = null;
        }
        this.isInitialized = false;
      }
    };
    initializeAlgoliaSearch = () => {
      var _a;
      (_a = api).algoliaSearch || (_a.algoliaSearch = new AlgoliaSearch());
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeAlgoliaSearch, { once: true });
    } else {
      initializeAlgoliaSearch();
    }
  }
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\search\docsearch.ts
var docsearch_exports = {};
var initializeDocSearch;
var init_docsearch = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\search\\docsearch.ts"() {
    init_api();
    initializeDocSearch = async () => {
      const container = document.getElementById("docsearch");
      const options = api.config.search?.docsearch || api.config.docsearch || {};
      if (!container || container.dataset.initialized === "true") return;
      container.dataset.initialized = "true";
      try {
        if (api.config.cdn?.docsearch_css) {
          await api.loadStyle(api.config.cdn.docsearch_css, { id: "docsearch-css" });
        }
        await api.loadScript(api.config.cdn?.docsearch_js);
        const docsearch = window.docsearch;
        if (typeof docsearch !== "function" || !options.appId || !options.apiKey || !options.indexName) {
          throw new Error("DocSearch configuration is incomplete");
        }
        docsearch({
          container: "#docsearch",
          placeholder: options.placeholder || api.config.lang?.search?.placeholder,
          ...options,
          ...options.option || {}
        });
        const trigger = document.querySelector("#search-button > .search");
        api.listen(trigger, "click", () => {
          document.querySelector(".DocSearch-Button")?.click();
        });
      } catch (error) {
        container.hidden = false;
        container.classList.add("docsearch-unavailable");
        container.textContent = "DocSearch \u6682\u4E0D\u53EF\u7528\uFF0C\u8BF7\u68C0\u67E5 appId\u3001apiKey \u4E0E indexName\u3002";
        console.warn(error);
      }
    };
    initializeDocSearch();
    document.addEventListener("solitude:afterNavigate", initializeDocSearch);
  }
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\friend_links.ts
var friend_links_exports = {};
var init_friend_links = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\friend_links.ts"() {
    init_api();
    (() => {
      const config = api.config.friend_links;
      let request = null;
      const createElement = (tag, className, text) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== void 0 && text !== null) {
          element.textContent = String(text);
        }
        return element;
      };
      const resolveSiteUrl = (value) => {
        if (!value) return "";
        const url = String(value);
        if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url)) return url;
        const root = api.config.root || "/";
        if (url.startsWith("/")) {
          return root === "/" ? url : `${root.replace(/\/$/, "")}${url}`;
        }
        return `${root}${url}`;
      };
      const createImage = (src, alt, className) => {
        const image = createElement("img", className);
        image.alt = alt || "";
        image.loading = "lazy";
        const resolvedSrc = resolveSiteUrl(src);
        if (api.config.lazyload.enable) {
          image.src = config.placeholder || config.default_avatar;
          image.dataset.lazySrc = resolvedSrc;
        } else {
          image.src = resolvedSrc;
        }
        image.addEventListener(
          "error",
          () => {
            image.removeAttribute("data-lazy-src");
            image.src = config.default_avatar;
          },
          { once: true }
        );
        return image;
      };
      const shuffle = (items) => {
        const shuffled = [...items];
        for (let index = shuffled.length - 1; index > 0; index -= 1) {
          const randomIndex = Math.floor(Math.random() * (index + 1));
          [shuffled[index], shuffled[randomIndex]] = [
            shuffled[randomIndex],
            shuffled[index]
          ];
        }
        return shuffled;
      };
      const createTag = (item) => {
        if (!item.tag) return null;
        const tag = createElement("span", "site-card-tag", item.tag);
        if (item.color === "vip" || item.color === "speed") {
          tag.classList.add(item.color);
          tag.append(createElement("i", "light"));
        } else if (item.color) {
          tag.style.backgroundColor = item.color;
        }
        return tag;
      };
      const createItemLink = (item, group, { disconnected = false, normal = false, defaultOrder = 0 } = {}) => {
        const wrapper = createElement(
          "div",
          `flink-list-item${normal ? " flink-lazy-pending" : ""}`
        );
        if (normal && item.tag) {
          String(item.tag).split(/\s+/).filter(Boolean).forEach((className) => wrapper.classList.add(className));
        }
        if (normal) wrapper.dataset.defaultOrder = String(defaultOrder);
        const tag = disconnected ? null : createTag(item);
        if (tag && !normal) wrapper.append(tag);
        const anchor = createElement("a", "cf-friends-link");
        anchor.href = disconnected ? "javascript:void(0);" : resolveSiteUrl(item.link);
        anchor.title = item.name || "";
        if (!disconnected) {
          anchor.target = "_blank";
          anchor.rel = "noopener noreferrer nofollow";
        }
        const avatar = disconnected ? config.default_avatar : `${item.avatar || ""}${group.suffix || ""}`;
        anchor.append(
          createImage(avatar, item.name, "flink-avatar cf-friends-avatar"),
          createElement("div", "img-alt is-center", item.name)
        );
        const info = createElement("div", "flink-item-info");
        info.append(createElement("span", "flink-item-name cf-friends-name", item.name));
        const description = createElement("span", "flink-item-desc", item.descr);
        description.title = item.descr || "";
        info.append(description);
        anchor.append(info);
        wrapper.append(anchor);
        return wrapper;
      };
      const createItemGroup = (group, { disconnected = false, normal = false, id = "", initialSort = "default" } = {}) => {
        const list = createElement(
          "div",
          disconnected ? "flink-list cf-friends-lost-contact mini" : normal ? "flink-list normal-five-row-horizontal js-normal-sortable" : "flink-list"
        );
        if (id) list.id = id;
        if (normal) list.dataset.initialSort = initialSort;
        const fragment = document.createDocumentFragment();
        const entries = group.link_list.map((item, defaultOrder) => ({
          item,
          defaultOrder
        }));
        const orderedEntries = initialSort === "random" ? shuffle(entries) : entries;
        orderedEntries.forEach(
          ({ item, defaultOrder }) => fragment.append(
            createItemLink(item, group, { disconnected, normal, defaultOrder })
          )
        );
        list.append(fragment);
        return list;
      };
      const createGroupHeading = (group, count) => {
        const heading = createElement(
          "h2",
          "",
          `${group.class_name || ""} (${count})`
        );
        if (!group.title_link || !group.title_link_text) return heading;
        const titleBar = createElement("div", "power_title_bar");
        const linkWrapper = createElement("div", "title-h2-a-right");
        const link = createElement("a", "", group.title_link_text);
        link.href = resolveSiteUrl(group.title_link);
        linkWrapper.append(link);
        titleBar.append(heading, linkWrapper);
        return titleBar;
      };
      const createNormalHeading = (group, count, listId, sortMode) => {
        const row = createElement("div", "flink-normal-title-row");
        const content = createElement("div", "flink-normal-title-content");
        content.append(
          createElement("h2", "", `${group.class_name || ""} (${count})`),
          createElement("div", "flink-desc", group.descr || "")
        );
        const controls = createElement("div", "flink-normal-scroll-controls");
        controls.dataset.target = listId;
        const sort = createElement("button", "flink-normal-sort-btn");
        sort.type = "button";
        sort.dataset.target = listId;
        sort.dataset.sortMode = sortMode;
        sort.setAttribute("aria-label", config.sort_label);
        sort.append(
          createElement(
            "span",
            "",
            sortMode === "default" ? config.default_sort : config.random_sort
          )
        );
        controls.append(sort);
        [
          ["left", config.scroll_left, "solitude fas fa-chevron-left"],
          ["right", config.scroll_right, "solitude fas fa-chevron-right"]
        ].forEach(([direction, label, iconClass]) => {
          const button = createElement("button", "flink-normal-scroll-btn");
          button.type = "button";
          button.dataset.direction = direction;
          button.setAttribute("aria-label", label);
          button.title = label;
          button.append(createElement("i", iconClass));
          controls.append(button);
        });
        row.append(content, controls);
        return row;
      };
      const bindNormalControls = (target) => {
        target.querySelectorAll(".flink-normal-sort-btn").forEach((button) => {
          if (button.dataset.bound === "true") return;
          button.dataset.bound = "true";
          button.addEventListener("click", () => {
            const list = document.getElementById(button.dataset.target);
            if (!list) return;
            const items = Array.from(list.children);
            const nextMode = button.dataset.sortMode === "default" ? "random" : "default";
            const orderedItems = nextMode === "random" ? shuffle(items) : items.sort(
              (left, right) => Number(left.dataset.defaultOrder) - Number(right.dataset.defaultOrder)
            );
            list.append(...orderedItems);
            list.scrollTo({ left: 0, behavior: "smooth" });
            button.dataset.sortMode = nextMode;
            button.querySelector("span").textContent = nextMode === "default" ? config.default_sort : config.random_sort;
          });
        });
        target.querySelectorAll(".flink-normal-scroll-controls").forEach((controls) => {
          if (controls.dataset.bound === "true") return;
          controls.dataset.bound = "true";
          controls.querySelectorAll(".flink-normal-scroll-btn").forEach((button) => {
            button.addEventListener("click", () => {
              const list = document.getElementById(controls.dataset.target);
              if (!list) return;
              const direction = button.dataset.direction === "left" ? -1 : 1;
              list.scrollBy({
                left: direction * Math.max(280, list.clientWidth * 0.8),
                behavior: "smooth"
              });
            });
          });
        });
      };
      const createCard = (item, group) => {
        const card = createElement("div", "site-card");
        const tag = createTag(item);
        if (tag) card.append(tag);
        const imageLink = createElement("a", "img");
        imageLink.href = resolveSiteUrl(item.link);
        imageLink.title = item.name || "";
        imageLink.target = "_blank";
        imageLink.rel = "noopener noreferrer nofollow";
        imageLink.append(
          createImage(`${item.topimg || ""}${group.topimg_suffix || ""}`, item.name, "flink-avatar")
        );
        const infoLink = createElement("a", "info cf-friends-link");
        infoLink.href = resolveSiteUrl(item.link);
        infoLink.title = item.name || "";
        infoLink.target = "_blank";
        infoLink.rel = "noopener noreferrer nofollow";
        const avatar = createElement("div", "site-card-avatar");
        avatar.append(
          createImage(
            `${item.avatar || ""}${group.suffix || ""}`,
            item.name,
            "flink-avatar cf-friends-avatar"
          ),
          createElement("div", "img-alt is-center", item.name)
        );
        const text = createElement("div", "site-card-text");
        text.append(createElement("span", "title cf-friends-name", item.name));
        const description = createElement("span", "desc", item.descr);
        description.title = item.descr || "";
        text.append(description);
        infoLink.append(avatar, text);
        card.append(imageLink, infoLink);
        return card;
      };
      const createCardGroup = (group) => {
        const list = createElement("div", "site-card-group");
        const fragment = document.createDocumentFragment();
        group.link_list.forEach((item) => fragment.append(createCard(item, group)));
        list.append(fragment);
        return list;
      };
      const load = () => {
        if (!request) {
          request = fetch(config.path, { credentials: "same-origin" }).then((response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
          }).then((data) => {
            if (!data || !Array.isArray(data.links)) {
              throw new TypeError("Invalid friend links data");
            }
            return data;
          }).catch((error) => {
            request = null;
            throw error;
          });
        }
        return request;
      };
      const createError = (retry, compact = false) => {
        const status = createElement(
          "div",
          `friend-links-status is-error${compact ? " is-compact" : ""}`
        );
        status.setAttribute("role", "alert");
        status.append(createElement("span", "", config.error));
        const button = createElement("button");
        button.type = "button";
        button.append(
          createElement("i", "solitude fas fa-arrows-rotate"),
          createElement("span", "", config.retry)
        );
        button.addEventListener("click", retry, { once: true });
        status.append(button);
        return status;
      };
      const refreshLazyload = () => {
        if (!api.config.lazyload.enable) return;
        if (window.lazyLoadInstance) window.lazyLoadInstance.update();
      };
      const renderList = async (target) => {
        try {
          const data = await load();
          if (!target.isConnected || target.dataset.friendLinksLoaded === "true") return;
          const fragment = document.createDocumentFragment();
          let normalIndex = 0;
          data.links.forEach((group) => {
            const links = Array.isArray(group.link_list) ? group.link_list : [];
            const normalizedGroup = { ...group, link_list: links };
            if (group.type === "card") {
              fragment.append(
                createGroupHeading(group, links.length),
                createElement("div", "flink-desc", group.descr || ""),
                createCardGroup(normalizedGroup)
              );
            } else if (group.type === "item") {
              const listId = `normal-flink-list-${normalIndex}`;
              const initialSort = group.sort === "default" || normalIndex === 0 ? "default" : "random";
              fragment.append(
                createNormalHeading(group, links.length, listId, initialSort),
                createItemGroup(normalizedGroup, {
                  normal: true,
                  id: listId,
                  initialSort
                })
              );
              normalIndex += 1;
            } else if (group.type === "discn") {
              fragment.append(
                createGroupHeading(group, links.length),
                createElement("div", "flink-desc", group.descr || ""),
                createItemGroup(normalizedGroup, { disconnected: true })
              );
            }
          });
          target.replaceChildren(fragment);
          target.dataset.friendLinksLoaded = "true";
          bindNormalControls(target);
          refreshLazyload();
        } catch (error) {
          if (!target.isConnected) return;
          console.error("Unable to load friend links:", error);
          target.replaceChildren(createError(() => renderList(target)));
        }
      };
      const renderBanner = async (target) => {
        try {
          const data = await load();
          if (!target.isConnected || target.dataset.friendLinksLoaded === "true") return;
          const links = data.links.filter((group) => group.type !== "discn").flatMap((group) => Array.isArray(group.link_list) ? group.link_list : []).slice(0, 30);
          const wrapper = createElement("div", "tags-group-wrapper");
          const pairs = [];
          links.forEach((link, index) => {
            if (index % 2 === 0) pairs.push([link]);
            else pairs[pairs.length - 1].push(link);
          });
          const fragment = document.createDocumentFragment();
          [0, 1].forEach(() => {
            pairs.forEach((pair) => {
              const pairElement = createElement("div", "tags-group-icon-pair");
              pair.forEach((item) => {
                const anchor = createElement("a", "tags-group-icon");
                anchor.href = resolveSiteUrl(item.link);
                anchor.title = item.name || "";
                anchor.append(
                  createImage(
                    `${item.avatar || ""}${data.banner_suffix || ""}`,
                    item.name
                  ),
                  createElement("span", "tags-group-title", item.name)
                );
                pairElement.append(anchor);
              });
              fragment.append(pairElement);
            });
          });
          wrapper.append(fragment);
          target.replaceChildren(wrapper);
          target.dataset.friendLinksLoaded = "true";
          refreshLazyload();
        } catch (error) {
          if (!target.isConnected) return;
          console.error("Unable to load friend links banner:", error);
          target.replaceChildren(createError(() => renderBanner(target)));
        }
      };
      const renderFooter = async () => {
        const target = document.getElementById("friend-links-in-footer");
        if (!target) return;
        try {
          const data = await load();
          if (!target.isConnected) return;
          const links = data.links.flatMap(
            (group) => (Array.isArray(group.link_list) ? group.link_list : []).map((item) => ({
              name: item.name,
              link: item.link
            }))
          );
          const fragment = document.createDocumentFragment();
          const available = [...links];
          const count = Math.min(3, available.length);
          for (let index = 0; index < count; index += 1) {
            const selectedIndex = api.randomNum(available.length);
            const selected = available.splice(selectedIndex, 1)[0];
            const anchor = createElement("a", "footer-item", selected.name);
            anchor.href = resolveSiteUrl(selected.link);
            anchor.target = "_blank";
            anchor.rel = "noopener noreferrer nofollow";
            fragment.append(anchor);
          }
          const more = createElement("a", "footer-item", config.more);
          more.href = config.more_url;
          fragment.append(more);
          target.replaceChildren(fragment);
        } catch (error) {
          if (!target.isConnected) return;
          console.error("Unable to load random friend links:", error);
          target.replaceChildren(createError(renderFooter, true));
        }
      };
      const init = () => {
        const list = document.querySelector("[data-friend-links-list]");
        const banner = document.querySelector("[data-friend-links-banner]");
        if (list) renderList(list);
        if (banner) renderBanner(banner);
      };
      api.travelling = async () => {
        try {
          const data = await load();
          const links = data.links.flatMap(
            (group) => (Array.isArray(group.link_list) ? group.link_list : []).map((item) => ({
              name: item.name,
              link: item.link
            }))
          );
          if (!links.length) throw new Error("No friend links available");
          const link = links[api.randomNum(links.length)];
          Snackbar.show({
            text: config.random.replace(/\$\{name}/, link.name),
            duration: 8e3,
            pos: "top-center",
            actionText: config.to,
            onActionClick: (element) => {
              element.style.opacity = 0;
              window.open(resolveSiteUrl(link.link), "_blank");
            }
          });
        } catch (error) {
          console.error("Unable to select a random friend link:", error);
          Snackbar.show({ text: config.error, duration: 3e3, pos: "top-center" });
        }
      };
      api.randomLinksList = renderFooter;
      api.friendLinks = { init, load };
    })();
  }
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\keyboard.ts
var keyboard_exports = {};
var STORAGE_KEY, BUILTIN_ACTIONS, handlers, isApplePlatform, panel, shortcuts, active, listenersBound, warn, getSiteRoot, resolveShortcutUrl, normalizeShortcuts, syncRenderedRows, setPanelVisible, syncConsoleButton, readStoredState, writeStoredState, isEditableTarget, matchesShortcut, navigateShortcut, executeShortcut, handleKeydown, handleKeyup, handleWindowBlur, bindListeners, unbindListeners, setActive, updateThemeShortcutLabel, registerShortcutAction;
var init_keyboard = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\keyboard.ts"() {
    init_api();
    STORAGE_KEY = "keyboard";
    BUILTIN_ACTIONS = /* @__PURE__ */ new Set([
      "toggleKeyboard",
      "showConsole",
      "musicToggle",
      "toggleTheme",
      "openSearch",
      "randomPost"
    ]);
    handlers = /* @__PURE__ */ new Map();
    isApplePlatform = /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
    panel = document.getElementById("keyboard-tips");
    shortcuts = [];
    active = false;
    listenersBound = false;
    warn = (message, value) => {
      console.warn(`[Solitude keyboard] ${message}`, value ?? "");
    };
    getSiteRoot = () => {
      try {
        return new URL(String(api.config.root || "/"), window.location.origin);
      } catch {
        return new URL("/", window.location.origin);
      }
    };
    resolveShortcutUrl = (value) => {
      const source = String(value || "").trim();
      if (!source) return null;
      try {
        const url = new URL(source, getSiteRoot());
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          warn("Unsupported shortcut URL protocol; entry ignored:", source);
          return null;
        }
        return url;
      } catch {
        warn("Invalid shortcut URL; entry ignored:", source);
        return null;
      }
    };
    normalizeShortcuts = (list) => {
      if (!Array.isArray(list)) return [];
      const seen = /* @__PURE__ */ new Set();
      const normalized = [];
      list.forEach((rawItem, index) => {
        if (!rawItem || typeof rawItem !== "object") {
          warn(`Entry ${index + 1} is not an object and was ignored.`);
          return;
        }
        const item = rawItem;
        const modifier = String(item.modifier || "").trim().toLowerCase();
        const key = String(item.key || "").trim().toUpperCase();
        const action = String(item.action || "").trim();
        const hasUrl = String(item.url || "").trim() !== "";
        const hasAction = action !== "";
        const name = String(item.name || "").trim();
        if (modifier !== "shift" && modifier !== "mod" || !key) {
          warn(`Entry ${index + 1} has an invalid modifier or key and was ignored.`, item);
          return;
        }
        if (hasAction === hasUrl) {
          warn(`Entry ${index + 1} must define exactly one of action or url.`, item);
          return;
        }
        if (hasAction && !BUILTIN_ACTIONS.has(action) && !name) {
          warn(`Custom action "${action}" needs a display name and was ignored.`);
          return;
        }
        if (hasUrl && !name) {
          warn(`URL entry ${index + 1} needs a display name and was ignored.`);
          return;
        }
        const combination = `${modifier}:${key}`;
        if (seen.has(combination)) {
          warn(`Duplicate shortcut ${combination} was ignored; the first entry wins.`);
          return;
        }
        const url = hasUrl ? resolveShortcutUrl(item.url) : null;
        if (hasUrl && !url) return;
        seen.add(combination);
        normalized.push({
          ...item,
          index,
          modifier,
          key,
          action: hasAction ? action : void 0,
          url: url || void 0
        });
      });
      return normalized;
    };
    syncRenderedRows = () => {
      const validIndexes = new Set(shortcuts.map((shortcut) => shortcut.index));
      panel?.querySelectorAll("[data-shortcut-index]").forEach((row) => {
        const index = Number(row.dataset.shortcutIndex);
        if (!validIndexes.has(index)) row.remove();
      });
    };
    setPanelVisible = (visible) => {
      panel?.classList.toggle("show", visible && active);
      panel?.setAttribute("aria-hidden", String(!(visible && active)));
    };
    syncConsoleButton = () => {
      const item = document.getElementById("consoleKeyboard");
      const button = item?.querySelector("button");
      item?.classList.toggle("on", active);
      button?.setAttribute("aria-pressed", String(active));
    };
    readStoredState = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === null ? true : stored === "true";
      } catch {
        return true;
      }
    };
    writeStoredState = (enabled) => {
      try {
        localStorage.setItem(STORAGE_KEY, String(enabled));
      } catch {
      }
    };
    isEditableTarget = (target) => {
      if (!(target instanceof Element)) return false;
      return Boolean(
        target.closest(
          "input, textarea, select, [contenteditable]:not([contenteditable='false'])"
        )
      );
    };
    matchesShortcut = (event, shortcut) => {
      if (event.altKey || event.shiftKey !== (shortcut.modifier === "shift")) {
        return false;
      }
      if (shortcut.modifier === "shift") {
        if (event.ctrlKey || event.metaKey) return false;
      } else if (isApplePlatform) {
        if (!event.metaKey || event.ctrlKey) return false;
      } else if (!event.ctrlKey || event.metaKey) {
        return false;
      }
      return event.key.toUpperCase() === shortcut.key;
    };
    navigateShortcut = (url) => {
      if (url.origin !== window.location.origin) {
        window.open(url.href, "_blank", "noopener,noreferrer");
        return;
      }
      api.navigate(`${url.pathname}${url.search}${url.hash}`);
    };
    executeShortcut = (shortcut) => {
      if (shortcut.url) {
        navigateShortcut(shortcut.url);
        return;
      }
      const handler = shortcut.action ? handlers.get(shortcut.action) : void 0;
      if (!handler) {
        warn(`No handler is registered for action "${shortcut.action}".`);
        return;
      }
      try {
        Promise.resolve(handler(shortcut)).catch((error) => {
          warn(`Action "${shortcut.action}" failed:`, error);
        });
      } catch (error) {
        warn(`Action "${shortcut.action}" failed:`, error);
      }
    };
    handleKeydown = (event) => {
      if (!active || event.repeat || isEditableTarget(event.target)) return;
      if (event.key === "Shift" && event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
        setPanelVisible(true);
        return;
      }
      const shortcut = shortcuts.find((item) => matchesShortcut(event, item));
      if (!shortcut) return;
      event.preventDefault();
      executeShortcut(shortcut);
    };
    handleKeyup = (event) => {
      if (event.key === "Shift") setPanelVisible(false);
    };
    handleWindowBlur = () => setPanelVisible(false);
    bindListeners = () => {
      if (listenersBound) return;
      window.addEventListener("keydown", handleKeydown);
      window.addEventListener("keyup", handleKeyup);
      window.addEventListener("blur", handleWindowBlur);
      listenersBound = true;
    };
    unbindListeners = () => {
      if (!listenersBound) return;
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("keyup", handleKeyup);
      window.removeEventListener("blur", handleWindowBlur);
      listenersBound = false;
    };
    setActive = (enabled, persist = true) => {
      active = Boolean(enabled);
      if (active) bindListeners();
      else unbindListeners();
      setPanelVisible(false);
      syncConsoleButton();
      if (persist) writeStoredState(active);
    };
    updateThemeShortcutLabel = () => {
      panel?.querySelectorAll(
        '[data-shortcut-action="toggleTheme"][data-shortcut-custom-label="false"]'
      ).forEach((row) => {
        const content = row.querySelector(".content");
        if (!content) return;
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        content.textContent = isDark ? row.dataset.themeLightLabel || content.textContent : row.dataset.themeDarkLabel || content.textContent;
      });
    };
    registerShortcutAction = (name, handler) => {
      const actionName = String(name || "").trim();
      if (!actionName || typeof handler !== "function") {
        warn("registerShortcutAction requires a name and a function.");
        return () => {
        };
      }
      handlers.set(actionName, handler);
      return () => {
        if (handlers.get(actionName) === handler) handlers.delete(actionName);
      };
    };
    if (document.documentElement.dataset.solitudeKeyboard !== "true") {
      document.documentElement.dataset.solitudeKeyboard = "true";
      shortcuts = normalizeShortcuts(api.config.keyboard?.list);
      syncRenderedRows();
      api.registerShortcutAction = registerShortcutAction;
      api.switchKeyboard = () => setActive(!active);
      registerShortcutAction("toggleKeyboard", () => api.switchKeyboard());
      registerShortcutAction("showConsole", () => api.showConsole?.());
      registerShortcutAction("musicToggle", () => api.musicToggle?.());
      registerShortcutAction("toggleTheme", () => api.toggleTheme?.());
      registerShortcutAction("openSearch", () => {
        if (typeof api.openSearch === "function") {
          api.openSearch();
          return;
        }
        const trigger = document.querySelector(
          "#search-button > .search, .DocSearch-Button"
        );
        trigger?.click();
      });
      registerShortcutAction("randomPost", () => api.randomPost?.());
      document.addEventListener("solitude:themeChange", updateThemeShortcutLabel);
      updateThemeShortcutLabel();
      setActive(readStoredState(), false);
    }
  }
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\right_menu.ts
var right_menu_exports = {};
function stopMaskScroll() {
  const hideMenu = rm.hideRightMenu.bind(rm);
  api.addEventListenerPjax(rm.menu, "mousewheel", hideMenu, { passive: true });
  api.addEventListenerPjax(rm.mask, "mousewheel", hideMenu, { passive: true });
  api.addEventListenerPjax(rm.mask, "click", hideMenu, { passive: true });
}
var selectTextNow, firstShowRightMenu, selectText, commentsEnabled, rm;
var init_right_menu = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\right_menu.ts"() {
    init_api();
    selectTextNow = "";
    firstShowRightMenu = true;
    selectText = () => {
      selectTextNow = document.selection ? document.selection.createRange().text : window.getSelection().toString() || "";
      api.selectedText = selectTextNow;
    };
    commentsEnabled = () => Boolean(api.config.comment?.use && api.page.comment);
    document.addEventListener("mouseup", selectText);
    document.addEventListener("dblclick", selectText);
    rm = {
      mask: document.getElementById("rightmenu-mask"),
      menu: document.getElementById("rightMenu"),
      width: 0,
      height: 0,
      domhref: "",
      domsrc: "",
      globalEvent: null,
      menuItems: {
        other: document.getElementsByClassName("rightMenuOther"),
        plugin: document.getElementsByClassName("rightMenuPlugin"),
        back: document.getElementById("menu-backward"),
        forward: document.getElementById("menu-forward"),
        refresh: document.getElementById("menu-refresh"),
        top: document.getElementById("menu-top"),
        copy: document.getElementById("menu-copytext"),
        paste: document.getElementById("menu-pastetext"),
        comment: document.getElementById("menu-commenttext"),
        new: document.getElementById("menu-newwindow"),
        copyLink: document.getElementById("menu-copylink"),
        copyImg: document.getElementById("menu-copyimg"),
        downloadImg: document.getElementById("menu-downloadimg"),
        search: document.getElementById("menu-search"),
        barrage: document.getElementById("menu-commentBarrage"),
        mode: document.getElementById("menu-darkmode"),
        translate: document.getElementById("menu-translate"),
        music: [
          document.getElementById("menu-music-toggle"),
          document.getElementById("menu-music-back"),
          document.getElementById("menu-music-forward"),
          document.getElementById("menu-music-copyMusicName")
        ]
      },
      showRightMenu(e, x = 0, y = 0) {
        if (!this.menu || !this.mask) return;
        this.menu.style.top = `${y}px`;
        this.menu.style.left = `${x}px`;
        this.menu.style.display = e ? "block" : "none";
        this.mask.style.display = e ? "flex" : "none";
        if (e) stopMaskScroll();
      },
      hideRightMenu() {
        this.showRightMenu(false);
      },
      reLoadSize() {
        if (!this.menu) return;
        this.menu.style.display = "block";
        this.width = this.menu.offsetWidth;
        this.height = this.menu.offsetHeight;
        this.menu.style.display = "none";
      },
      copyText(e) {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(e);
          api.snackbarShow(api.config.lang.copy.success, false, 2e3);
        }
        this.hideRightMenu();
      },
      async pasteText() {
        const target = this.globalEvent?.target;
        if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return false;
        try {
          const value = await navigator.clipboard.readText();
          target.setRangeText(value, target.selectionStart || 0, target.selectionEnd || 0, "end");
          target.dispatchEvent(new Event("input", { bubbles: true }));
          return true;
        } catch {
          return false;
        }
      },
      async downloadImage(imageUrl = this.domsrc, filename = "photo") {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } catch (error) {
          api.snackbarShow(api.config.right_menu.img_error, false, 2e3);
        }
      },
      copyImage(imgUrl = this.domsrc) {
        window.open(imgUrl);
      },
      setLabel(element, label) {
        if (!element || !label) return;
        element.textContent = label;
        element.setAttribute("title", label);
        element.setAttribute("heotip", label);
        const menuItem = element.closest(".rightMenu-item");
        if (menuItem) {
          menuItem.setAttribute("title", label);
          menuItem.setAttribute("heotip", label);
        }
      },
      mode(darkmode) {
        const label = darkmode ? api.config.right_menu.mode.light : api.config.right_menu.mode.dark;
        this.setLabel(document.querySelector(".menu-darkmode-text"), label);
        this.hideRightMenu();
      },
      barrage(enable) {
        const label = enable ? api.config.right_menu.barrage.open : api.config.right_menu.barrage.close;
        this.setLabel(document.querySelector(".menu-commentBarrage-text"), label);
        this.hideRightMenu();
      }
    };
    api.rightMenu = rm;
    api.hideRightMenu = rm.hideRightMenu.bind(rm);
    rm.mode(document.documentElement.dataset.theme === "dark");
    document.addEventListener("contextmenu", (ele) => {
      if (!api.config.right_menu || !rm.menu || !rm.mask) return;
      if (document.body.clientWidth <= 768) return;
      if (api.config.right_menu.ctrlOriginalMenu) {
        if (firstShowRightMenu) {
          firstShowRightMenu = false;
          api.snackbarShow(api.config.right_menu.ctrlOriginalMenu, false, 2e3);
        }
        if (ele.ctrlKey) return true;
      }
      let x = ele.clientX + 10;
      let y = ele.clientY;
      Array.from(rm.menuItems.other).forEach((item) => item.style.display = "flex");
      rm.globalEvent = ele;
      const link = ele.target.href;
      const src = ele.target.currentSrc;
      const tagName = ele.target.tagName.toLowerCase();
      const cls = ele.target.className.toLowerCase();
      const display = !!(selectTextNow && window.getSelection()) || !!link || !!src || (tagName === "input" || tagName === "textarea") || cls.match(/aplayer/);
      rm.menuItems.copy.style.display = selectTextNow && window.getSelection() ? "flex" : "none";
      rm.menuItems.comment && (rm.menuItems.comment.style.display = commentsEnabled() && selectTextNow && window.getSelection() ? "flex" : "none");
      rm.menuItems.search && (rm.menuItems.search.style.display = selectTextNow && window.getSelection() ? "flex" : "none");
      rm.menuItems.new.style.display = link ? "flex" : "none";
      rm.menuItems.copyLink.style.display = link ? "flex" : "none";
      rm.domhref = link || "";
      rm.menuItems.copyImg.style.display = src ? "flex" : "none";
      rm.menuItems.downloadImg.style.display = src ? "flex" : "none";
      rm.domsrc = src || "";
      rm.menuItems.paste.style.display = tagName === "input" || tagName === "textarea" ? "flex" : "none";
      if (api.config.right_menu.music) {
        if (cls.match(/aplayer/)) {
          rm.menuItems.music.forEach((item) => item.style.display = "flex");
        } else {
          rm.menuItems.music.forEach((item) => item.style.display = "none");
        }
      }
      Array.from(display ? rm.menuItems.other : rm.menuItems.plugin).forEach((item) => item.style.display = "none");
      Array.from(display ? rm.menuItems.plugin : rm.menuItems.other).forEach((item) => item.style.display = "block");
      rm.reLoadSize();
      x = x + rm.width > window.innerWidth ? x - (rm.width + 10) : x;
      y = y + rm.height > window.innerHeight ? y - (y + rm.height - window.innerHeight) : y;
      rm.showRightMenu(true, x, y);
      ele.preventDefault();
    });
    (function() {
      const addEventListener = (element, event, handler) => element?.addEventListener(event, handler);
      addEventListener(rm.menuItems.back, "click", () => window.history.back() || rm.hideRightMenu());
      addEventListener(rm.menuItems.forward, "click", () => window.history.forward() || rm.hideRightMenu());
      addEventListener(rm.menuItems.refresh, "click", () => window.location.reload());
      addEventListener(rm.menuItems.top, "click", () => api.toTop() || rm.hideRightMenu());
      if (api.config.right_menu.music) {
        addEventListener(rm.menuItems.music[0], "click", () => {
          api.musicToggle();
          rm.hideRightMenu();
        });
        addEventListener(rm.menuItems.music[1], "click", () => {
          document.querySelector("meting-js").aplayer.skipBack();
          rm.hideRightMenu();
        });
        addEventListener(rm.menuItems.music[2], "click", () => {
          document.querySelector("meting-js").aplayer.skipForward();
          rm.hideRightMenu();
        });
        addEventListener(rm.menuItems.music[3], "click", () => {
          const title = Array.from(document.querySelectorAll(".aplayer-title")).map((e) => e.innerText)[0];
          rm.copyText(title);
        });
      }
      addEventListener(rm.menuItems.copy, "click", () => {
        if (api.config.copyright && selectTextNow.length > api.config.right_menu.limit) {
          selectTextNow += `

${api.config.right_menu.author}
${api.config.right_menu.link}${window.location.href}
${api.config.right_menu.source}
${api.config.right_menu.info}`;
        }
        rm.copyText(selectTextNow);
      });
      if (api.saveToLocal.get("commentBarrageSwitch") !== null) {
        rm.menuItems.barrage && rm.barrage(!api.saveToLocal.get("commentBarrageSwitch"));
      }
      addEventListener(rm.menuItems.paste, "click", () => rm.pasteText() && rm.hideRightMenu());
      addEventListener(rm.menuItems.comment, "click", () => rm.hideRightMenu() || api.toTalk(selectTextNow));
      addEventListener(rm.menuItems.new, "click", () => window.open(rm.domhref) && rm.hideRightMenu());
      addEventListener(rm.menuItems.downloadImg, "click", () => rm.downloadImage() && rm.hideRightMenu());
      addEventListener(rm.menuItems.copyImg, "click", () => rm.copyImage() && rm.hideRightMenu());
      addEventListener(rm.menuItems.copyLink, "click", () => rm.copyText(rm.domhref) && rm.hideRightMenu());
    })();
  }
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\tw_cn.ts
var tw_cn_exports = {};
var initializeTranslation;
var init_tw_cn = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\tw_cn.ts"() {
    init_api();
    initializeTranslation = () => {
      const {
        defaultEncoding,
        translateDelay,
        toSimplified,
        toTraditional,
        switchedToSimplified,
        switchedToTraditional
      } = api.config.translate;
      const targetEncodingCookie = "translate-chn-cht";
      let currentEncoding = defaultEncoding;
      let targetEncoding = Number(api.saveToLocal.get(targetEncodingCookie)) || defaultEncoding;
      function setLang() {
        document.documentElement.lang = targetEncoding === 1 ? "zh-TW" : "zh-CN";
      }
      function translateText(txt) {
        if (!txt) return "";
        return currentEncoding === targetEncoding ? txt : currentEncoding === 1 ? Simplized(txt) : Traditionalized(txt);
      }
      function translateBody(fobj) {
        const objs = fobj?.childNodes || document.body.childNodes;
        objs.forEach((obj) => {
          if (["BR", "HR"].includes(obj.tagName)) return;
          if (obj.title) obj.title = translateText(obj.title);
          if (obj.alt) obj.alt = translateText(obj.alt);
          if (obj.placeholder) obj.placeholder = translateText(obj.placeholder);
          if (obj.getAttribute?.("heotip")) {
            obj.setAttribute("heotip", translateText(obj.getAttribute("heotip")));
          }
          if (obj.tagName === "INPUT" && obj.value && !["text", "hidden"].includes(obj.type)) {
            obj.value = translateText(obj.value);
          }
          if (obj.nodeType === 3) {
            obj.data = translateText(obj.data);
          } else {
            translateBody(obj);
          }
        });
      }
      function updateButtonLabel(button, label) {
        const textNode = button.lastElementChild || button.lastChild;
        if (textNode) textNode.textContent = label;
        button.setAttribute("title", label);
        button.setAttribute("heotip", label);
      }
      function translatePage(button, simplified = toSimplified, traditional = toTraditional) {
        currentEncoding = targetEncoding;
        targetEncoding = targetEncoding === 1 ? 2 : 1;
        updateButtonLabel(button, targetEncoding === 1 ? simplified : traditional);
        api.snackbarShow(targetEncoding === 1 ? switchedToTraditional : switchedToSimplified);
        api.saveToLocal.set(targetEncodingCookie, targetEncoding, 2);
        setLang();
        translateBody();
        api.hideRightMenu?.();
      }
      function JTPYStr() {
        return "\u4E07\u4E0E\u4E11\u4E13\u4E1A\u4E1B\u4E1C\u4E1D\u4E22\u4E24\u4E25\u4E27\u4E2A\u4E2C\u4E30\u4E34\u4E3A\u4E3D\u4E3E\u4E48\u4E49\u4E4C\u4E50\u4E54\u4E60\u4E61\u4E66\u4E70\u4E71\u4E89\u4E8E\u4E8F\u4E91\u4E98\u4E9A\u4EA7\u4EA9\u4EB2\u4EB5\u4EB8\u4EBF\u4EC5\u4ECE\u4ED1\u4ED3\u4EEA\u4EEC\u4EF7\u4F17\u4F18\u4F19\u4F1A\u4F1B\u4F1E\u4F1F\u4F20\u4F24\u4F25\u4F26\u4F27\u4F2A\u4F2B\u4F53\u4F59\u4F63\u4F65\u4FA0\u4FA3\u4FA5\u4FA6\u4FA7\u4FA8\u4FA9\u4FAA\u4FAC\u4FE3\u4FE6\u4FE8\u4FE9\u4FEA\u4FED\u503A\u503E\u506C\u507B\u507E\u507F\u50A5\u50A7\u50A8\u50A9\u513F\u5151\u5156\u515A\u5170\u5173\u5174\u5179\u517B\u517D\u5181\u5185\u5188\u518C\u5199\u519B\u519C\u51A2\u51AF\u51B2\u51B3\u51B5\u51BB\u51C0\u51C4\u51C9\u51CC\u51CF\u51D1\u51DB\u51E0\u51E4\u51EB\u51ED\u51EF\u51FB\u51FC\u51FF\u520D\u5212\u5218\u5219\u521A\u521B\u5220\u522B\u522C\u522D\u523D\u523F\u5240\u5242\u5250\u5251\u5265\u5267\u529D\u529E\u52A1\u52A2\u52A8\u52B1\u52B2\u52B3\u52BF\u52CB\u52D0\u52DA\u5300\u5326\u532E\u533A\u533B\u534E\u534F\u5355\u5356\u5362\u5364\u5367\u536B\u5374\u537A\u5382\u5385\u5386\u5389\u538B\u538C\u538D\u5395\u53A2\u53A3\u53A6\u53A8\u53A9\u53AE\u53BF\u53C2\u53C6\u53C7\u53CC\u53D1\u53D8\u53D9\u53E0\u53F6\u53F7\u53F9\u53FD\u5401\u540E\u5413\u5415\u5417\u5423\u5428\u542C\u542F\u5434\u5452\u5453\u5455\u5456\u5457\u5458\u5459\u545B\u545C\u548F\u5494\u5499\u549B\u549D\u54A4\u54B4\u54B8\u54CC\u54CD\u54D1\u54D2\u54D3\u54D4\u54D5\u54D7\u54D9\u54DC\u54DD\u54DF\u551B\u551D\u5520\u5521\u5522\u5523\u5524\u553F\u5567\u556C\u556D\u556E\u5570\u5574\u5578\u55B7\u55BD\u55BE\u55EB\u5475\u55F3\u5618\u5624\u5631\u565C\u567C\u56A3\u56AF\u56E2\u56ED\u56F1\u56F4\u56F5\u56FD\u56FE\u5706\u5723\u5739\u573A\u5742\u574F\u5757\u575A\u575B\u575C\u575D\u575E\u575F\u5760\u5784\u5785\u5786\u5792\u57A6\u57A7\u57A9\u57AB\u57AD\u57AF\u57B1\u57B2\u57B4\u57D8\u57D9\u57DA\u57DD\u57EF\u5811\u5815\u5846\u5899\u58EE\u58F0\u58F3\u58F6\u58F8\u5904\u5907\u590D\u591F\u5934\u5938\u5939\u593A\u5941\u5942\u594B\u5956\u5965\u5986\u5987\u5988\u59A9\u59AA\u59AB\u59D7\u59DC\u5A04\u5A05\u5A06\u5A07\u5A08\u5A31\u5A32\u5A34\u5A73\u5A74\u5A75\u5A76\u5AAA\u5AD2\u5AD4\u5AF1\u5B37\u5B59\u5B66\u5B6A\u5B81\u5B9D\u5B9E\u5BA0\u5BA1\u5BAA\u5BAB\u5BBD\u5BBE\u5BDD\u5BF9\u5BFB\u5BFC\u5BFF\u5C06\u5C14\u5C18\u5C27\u5C34\u5C38\u5C3D\u5C42\u5C43\u5C49\u5C4A\u5C5E\u5C61\u5C66\u5C7F\u5C81\u5C82\u5C96\u5C97\u5C98\u5C99\u5C9A\u5C9B\u5CAD\u5CB3\u5CBD\u5CBF\u5CC3\u5CC4\u5CE1\u5CE3\u5CE4\u5CE5\u5CE6\u5D02\u5D03\u5D04\u5D2D\u5D58\u5D5A\u5D5B\u5D5D\u5D74\u5DC5\u5DE9\u5DEF\u5E01\u5E05\u5E08\u5E0F\u5E10\u5E18\u5E1C\u5E26\u5E27\u5E2E\u5E31\u5E3B\u5E3C\u5E42\u5E5E\u5E72\u5E76\u5E7F\u5E84\u5E86\u5E90\u5E91\u5E93\u5E94\u5E99\u5E9E\u5E9F\u5EBC\u5EEA\u5F00\u5F02\u5F03\u5F20\u5F25\u5F2A\u5F2F\u5F39\u5F3A\u5F52\u5F53\u5F55\u5F5F\u5F66\u5F7B\u5F84\u5F95\u5FA1\u5FC6\u5FCF\u5FE7\u5FFE\u6000\u6001\u6002\u6003\u6004\u6005\u6006\u601C\u603B\u603C\u603F\u604B\u6073\u6076\u6078\u6079\u607A\u607B\u607C\u607D\u60A6\u60AB\u60AC\u60AD\u60AF\u60CA\u60E7\u60E8\u60E9\u60EB\u60EC\u60ED\u60EE\u60EF\u610D\u6120\u6124\u6126\u613F\u6151\u616D\u61B7\u61D1\u61D2\u61D4\u6206\u620B\u620F\u6217\u6218\u622C\u6237\u624E\u6251\u6266\u6267\u6269\u626A\u626B\u626C\u6270\u629A\u629B\u629F\u62A0\u62A1\u62A2\u62A4\u62A5\u62C5\u62DF\u62E2\u62E3\u62E5\u62E6\u62E7\u62E8\u62E9\u6302\u631A\u631B\u631C\u631D\u631E\u631F\u6320\u6321\u6322\u6323\u6324\u6325\u6326\u635E\u635F\u6361\u6362\u6363\u636E\u637B\u63B3\u63B4\u63B7\u63B8\u63BA\u63BC\u63F8\u63FD\u63FF\u6400\u6401\u6402\u6405\u643A\u6444\u6445\u6446\u6447\u6448\u644A\u6484\u6491\u64B5\u64B7\u64B8\u64BA\u64DE\u6512\u654C\u655B\u6570\u658B\u6593\u6597\u65A9\u65AD\u65E0\u65E7\u65F6\u65F7\u65F8\u6619\u663C\u663D\u663E\u664B\u6652\u6653\u6654\u6655\u6656\u6682\u66A7\u672D\u672F\u6734\u673A\u6740\u6742\u6743\u6761\u6765\u6768\u6769\u6770\u6781\u6784\u679E\u67A2\u67A3\u67A5\u67A7\u67A8\u67AA\u67AB\u67AD\u67DC\u67E0\u67FD\u6800\u6805\u6807\u6808\u6809\u680A\u680B\u680C\u680E\u680F\u6811\u6816\u6837\u683E\u684A\u6860\u6861\u6862\u6863\u6864\u6865\u6866\u6867\u6868\u6869\u68A6\u68BC\u68BE\u68C0\u68C2\u6901\u691F\u6920\u6924\u692D\u697C\u6984\u6987\u6988\u6989\u69DA\u69DB\u69DF\u69E0\u6A2A\u6A2F\u6A31\u6A65\u6A71\u6A79\u6A7C\u6A90\u6AA9\u6B22\u6B24\u6B27\u6B7C\u6B81\u6B87\u6B8B\u6B92\u6B93\u6B9A\u6BA1\u6BB4\u6BC1\u6BC2\u6BD5\u6BD9\u6BE1\u6BF5\u6C07\u6C14\u6C22\u6C29\u6C32\u6C47\u6C49\u6C61\u6C64\u6C79\u6C93\u6C9F\u6CA1\u6CA3\u6CA4\u6CA5\u6CA6\u6CA7\u6CA8\u6CA9\u6CAA\u6CB5\u6CDE\u6CEA\u6CF6\u6CF7\u6CF8\u6CFA\u6CFB\u6CFC\u6CFD\u6CFE\u6D01\u6D12\u6D3C\u6D43\u6D45\u6D46\u6D47\u6D48\u6D49\u6D4A\u6D4B\u6D4D\u6D4E\u6D4F\u6D50\u6D51\u6D52\u6D53\u6D54\u6D55\u6D82\u6D8C\u6D9B\u6D9D\u6D9E\u6D9F\u6DA0\u6DA1\u6DA2\u6DA3\u6DA4\u6DA6\u6DA7\u6DA8\u6DA9\u6DC0\u6E0A\u6E0C\u6E0D\u6E0E\u6E10\u6E11\u6E14\u6E16\u6E17\u6E29\u6E38\u6E7E\u6E7F\u6E83\u6E85\u6E86\u6E87\u6ED7\u6EDA\u6EDE\u6EDF\u6EE0\u6EE1\u6EE2\u6EE4\u6EE5\u6EE6\u6EE8\u6EE9\u6EEA\u6F24\u6F46\u6F47\u6F4B\u6F4D\u6F5C\u6F74\u6F9C\u6FD1\u6FD2\u704F\u706D\u706F\u7075\u707E\u707F\u7080\u7089\u7096\u709C\u709D\u70B9\u70BC\u70BD\u70C1\u70C2\u70C3\u70DB\u70DF\u70E6\u70E7\u70E8\u70E9\u70EB\u70EC\u70ED\u7115\u7116\u7118\u7145\u7173\u7198\u7231\u7237\u724D\u7266\u7275\u727A\u728A\u729F\u72B6\u72B7\u72B8\u72B9\u72C8\u72CD\u72DD\u72DE\u72EC\u72ED\u72EE\u72EF\u72F0\u72F1\u72F2\u7303\u730E\u7315\u7321\u732A\u732B\u732C\u732E\u736D\u7391\u7399\u739A\u739B\u73AE\u73AF\u73B0\u73B1\u73BA\u73C9\u73CF\u73D0\u73D1\u73F0\u73F2\u740E\u740F\u7410\u743C\u7476\u7477\u7487\u748E\u74D2\u74EE\u74EF\u7535\u753B\u7545\u7572\u7574\u7596\u7597\u759F\u75A0\u75A1\u75AC\u75AE\u75AF\u75B1\u75B4\u75C8\u75C9\u75D2\u75D6\u75E8\u75EA\u75EB\u75F4\u7605\u7606\u7617\u7618\u762A\u762B\u763E\u763F\u765E\u7663\u766B\u766F\u7691\u76B1\u76B2\u76CF\u76D0\u76D1\u76D6\u76D7\u76D8\u770D\u7726\u772C\u7740\u7741\u7750\u7751\u7792\u77A9\u77EB\u77F6\u77FE\u77FF\u7800\u7801\u7816\u7817\u781A\u781C\u783A\u783B\u783E\u7840\u7841\u7845\u7855\u7856\u7857\u7859\u785A\u786E\u7877\u788D\u789B\u789C\u78B1\u78B9\u78D9\u793C\u794E\u7962\u796F\u7977\u7978\u7980\u7984\u7985\u79BB\u79C3\u79C6\u79CD\u79EF\u79F0\u79FD\u79FE\u7A06\u7A0E\u7A23\u7A33\u7A51\u7A77\u7A83\u7A8D\u7A91\u7A9C\u7A9D\u7AA5\u7AA6\u7AAD\u7AD6\u7ADE\u7B03\u7B0B\u7B14\u7B15\u7B3A\u7B3C\u7B3E\u7B51\u7B5A\u7B5B\u7B5C\u7B5D\u7B79\u7B7E\u7B80\u7B93\u7BA6\u7BA7\u7BA8\u7BA9\u7BAA\u7BAB\u7BD1\u7BD3\u7BEE\u7BF1\u7C16\u7C41\u7C74\u7C7B\u7C7C\u7C9C\u7C9D\u7CA4\u7CAA\u7CAE\u7CC1\u7CC7\u7D27\u7D77\u7E9F\u7EA0\u7EA1\u7EA2\u7EA3\u7EA4\u7EA5\u7EA6\u7EA7\u7EA8\u7EA9\u7EAA\u7EAB\u7EAC\u7EAD\u7EAE\u7EAF\u7EB0\u7EB1\u7EB2\u7EB3\u7EB4\u7EB5\u7EB6\u7EB7\u7EB8\u7EB9\u7EBA\u7EBB\u7EBC\u7EBD\u7EBE\u7EBF\u7EC0\u7EC1\u7EC2\u7EC3\u7EC4\u7EC5\u7EC6\u7EC7\u7EC8\u7EC9\u7ECA\u7ECB\u7ECC\u7ECD\u7ECE\u7ECF\u7ED0\u7ED1\u7ED2\u7ED3\u7ED4\u7ED5\u7ED6\u7ED7\u7ED8\u7ED9\u7EDA\u7EDB\u7EDC\u7EDD\u7EDE\u7EDF\u7EE0\u7EE1\u7EE2\u7EE3\u7EE4\u7EE5\u7EE6\u7EE7\u7EE8\u7EE9\u7EEA\u7EEB\u7EEC\u7EED\u7EEE\u7EEF\u7EF0\u7EF1\u7EF2\u7EF3\u7EF4\u7EF5\u7EF6\u7EF7\u7EF8\u7EF9\u7EFA\u7EFB\u7EFC\u7EFD\u7EFE\u7EFF\u7F00\u7F01\u7F02\u7F03\u7F04\u7F05\u7F06\u7F07\u7F08\u7F09\u7F0A\u7F0B\u7F0C\u7F0D\u7F0E\u7F0F\u7F10\u7F11\u7F12\u7F13\u7F14\u7F15\u7F16\u7F17\u7F18\u7F19\u7F1A\u7F1B\u7F1C\u7F1D\u7F1E\u7F1F\u7F20\u7F21\u7F22\u7F23\u7F24\u7F25\u7F26\u7F27\u7F28\u7F29\u7F2A\u7F2B\u7F2C\u7F2D\u7F2E\u7F2F\u7F30\u7F31\u7F32\u7F33\u7F34\u7F35\u7F42\u7F51\u7F57\u7F5A\u7F62\u7F74\u7F81\u7F9F\u7FA1\u7FD8\u7FD9\u7FDA\u8022\u8027\u8038\u803B\u8042\u804B\u804C\u804D\u8054\u8069\u806A\u8083\u80A0\u80A4\u80B7\u80BE\u80BF\u80C0\u80C1\u80C6\u80DC\u80E7\u80E8\u80EA\u80EB\u80F6\u8109\u810D\u810F\u8110\u8111\u8113\u8114\u811A\u8131\u8136\u8138\u814A\u814C\u8158\u816D\u817B\u817C\u817D\u817E\u8191\u81DC\u8206\u8223\u8230\u8231\u823B\u8270\u8273\u8279\u827A\u8282\u8288\u8297\u829C\u82A6\u82C1\u82C7\u82C8\u82CB\u82CC\u82CD\u82CE\u82CF\u82D8\u82F9\u830E\u830F\u8311\u8314\u8315\u8327\u8346\u8350\u8359\u835A\u835B\u835C\u835E\u835F\u8360\u8361\u8363\u8364\u8365\u8366\u8367\u8368\u8369\u836A\u836B\u836C\u836D\u836E\u836F\u8385\u839C\u83B1\u83B2\u83B3\u83B4\u83B6\u83B7\u83B8\u83B9\u83BA\u83BC\u841A\u841D\u8424\u8425\u8426\u8427\u8428\u8471\u8487\u8489\u848B\u848C\u84DD\u84DF\u84E0\u84E3\u84E5\u84E6\u8537\u8539\u853A\u853C\u8572\u8574\u85AE\u85C1\u85D3\u864F\u8651\u865A\u866B\u866C\u866E\u867D\u867E\u867F\u8680\u8681\u8682\u8695\u869D\u86AC\u86CA\u86CE\u86CF\u86EE\u86F0\u86F1\u86F2\u86F3\u86F4\u8715\u8717\u8721\u8747\u8748\u8749\u874E\u877C\u877E\u8780\u87A8\u87CF\u8845\u8854\u8865\u886C\u886E\u8884\u8885\u8886\u889C\u88AD\u88AF\u88C5\u88C6\u88C8\u88E2\u88E3\u88E4\u88E5\u891B\u8934\u8941\u8955\u89C1\u89C2\u89C3\u89C4\u89C5\u89C6\u89C7\u89C8\u89C9\u89CA\u89CB\u89CC\u89CD\u89CE\u89CF\u89D0\u89D1\u89DE\u89E6\u89EF\u8A5F\u8A89\u8A8A\u8BA0\u8BA1\u8BA2\u8BA3\u8BA4\u8BA5\u8BA6\u8BA7\u8BA8\u8BA9\u8BAA\u8BAB\u8BAD\u8BAE\u8BAF\u8BB0\u8BB1\u8BB2\u8BB3\u8BB4\u8BB5\u8BB6\u8BB7\u8BB8\u8BB9\u8BBA\u8BBB\u8BBC\u8BBD\u8BBE\u8BBF\u8BC0\u8BC1\u8BC2\u8BC3\u8BC4\u8BC5\u8BC6\u8BC7\u8BC8\u8BC9\u8BCA\u8BCB\u8BCC\u8BCD\u8BCE\u8BCF\u8BD0\u8BD1\u8BD2\u8BD3\u8BD4\u8BD5\u8BD6\u8BD7\u8BD8\u8BD9\u8BDA\u8BDB\u8BDC\u8BDD\u8BDE\u8BDF\u8BE0\u8BE1\u8BE2\u8BE3\u8BE4\u8BE5\u8BE6\u8BE7\u8BE8\u8BE9\u8BEA\u8BEB\u8BEC\u8BED\u8BEE\u8BEF\u8BF0\u8BF1\u8BF2\u8BF3\u8BF4\u8BF5\u8BF6\u8BF7\u8BF8\u8BF9\u8BFA\u8BFB\u8BFC\u8BFD\u8BFE\u8BFF\u8C00\u8C01\u8C02\u8C03\u8C04\u8C05\u8C06\u8C07\u8C08\u8C0A\u8C0B\u8C0C\u8C0D\u8C0E\u8C0F\u8C10\u8C11\u8C12\u8C13\u8C14\u8C15\u8C16\u8C17\u8C18\u8C19\u8C1A\u8C1B\u8C1C\u8C1D\u8C1E\u8C1F\u8C20\u8C21\u8C22\u8C23\u8C24\u8C25\u8C26\u8C27\u8C28\u8C29\u8C2A\u8C2B\u8C2C\u8C2D\u8C2E\u8C2F\u8C30\u8C31\u8C32\u8C33\u8C34\u8C35\u8C36\u8C37\u8C6E\u8D1D\u8D1E\u8D1F\u8D20\u8D21\u8D22\u8D23\u8D24\u8D25\u8D26\u8D27\u8D28\u8D29\u8D2A\u8D2B\u8D2C\u8D2D\u8D2E\u8D2F\u8D30\u8D31\u8D32\u8D33\u8D34\u8D35\u8D36\u8D37\u8D38\u8D39\u8D3A\u8D3B\u8D3C\u8D3D\u8D3E\u8D3F\u8D40\u8D41\u8D42\u8D43\u8D44\u8D45\u8D46\u8D47\u8D48\u8D49\u8D4A\u8D4B\u8D4C\u8D4D\u8D4E\u8D4F\u8D50\u8D51\u8D52\u8D53\u8D54\u8D55\u8D56\u8D57\u8D58\u8D59\u8D5A\u8D5B\u8D5C\u8D5D\u8D5E\u8D5F\u8D60\u8D61\u8D62\u8D63\u8D6A\u8D75\u8D76\u8D8B\u8DB1\u8DB8\u8DC3\u8DC4\u8DD6\u8DDE\u8DF5\u8DF6\u8DF7\u8DF8\u8DF9\u8DFB\u8E0A\u8E0C\u8E2A\u8E2C\u8E2F\u8E51\u8E52\u8E70\u8E7F\u8E8F\u8E9C\u8EAF\u8F66\u8F67\u8F68\u8F69\u8F6A\u8F6B\u8F6C\u8F6D\u8F6E\u8F6F\u8F70\u8F71\u8F72\u8F73\u8F74\u8F75\u8F76\u8F77\u8F78\u8F79\u8F7A\u8F7B\u8F7C\u8F7D\u8F7E\u8F7F\u8F80\u8F81\u8F82\u8F83\u8F84\u8F85\u8F86\u8F87\u8F88\u8F89\u8F8A\u8F8B\u8F8C\u8F8D\u8F8E\u8F8F\u8F90\u8F91\u8F92\u8F93\u8F94\u8F95\u8F96\u8F97\u8F98\u8F99\u8F9A\u8F9E\u8FA9\u8FAB\u8FB9\u8FBD\u8FBE\u8FC1\u8FC7\u8FC8\u8FD0\u8FD8\u8FD9\u8FDB\u8FDC\u8FDD\u8FDE\u8FDF\u8FE9\u8FF3\u8FF9\u9002\u9009\u900A\u9012\u9026\u903B\u9057\u9065\u9093\u909D\u90AC\u90AE\u90B9\u90BA\u90BB\u90C1\u90C4\u90CF\u90D0\u90D1\u90D3\u90E6\u90E7\u90F8\u915D\u9166\u9171\u917D\u917E\u917F\u91CA\u91CC\u9245\u9274\u92AE\u933E\u9486\u9487\u9488\u9489\u948A\u948B\u948C\u948D\u948E\u948F\u9490\u9491\u9492\u9493\u9494\u9495\u9496\u9497\u9498\u9499\u949A\u949B\u949D\u949E\u949F\u94A0\u94A1\u94A2\u94A3\u94A4\u94A5\u94A6\u94A7\u94A8\u94A9\u94AA\u94AB\u94AC\u94AD\u94AE\u94AF\u94B0\u94B1\u94B2\u94B3\u94B4\u94B5\u94B6\u94B7\u94B8\u94B9\u94BA\u94BB\u94BC\u94BD\u94BE\u94BF\u94C0\u94C1\u94C2\u94C3\u94C4\u94C5\u94C6\u94C8\u94C9\u94CA\u94CB\u94CD\u94CE\u94CF\u94D0\u94D1\u94D2\u94D5\u94D7\u94D8\u94D9\u94DA\u94DB\u94DC\u94DD\u94DE\u94DF\u94E0\u94E1\u94E2\u94E3\u94E4\u94E5\u94E6\u94E7\u94E8\u94EA\u94EB\u94EC\u94ED\u94EE\u94EF\u94F0\u94F1\u94F2\u94F3\u94F4\u94F5\u94F6\u94F7\u94F8\u94F9\u94FA\u94FB\u94FC\u94FD\u94FE\u94FF\u9500\u9501\u9502\u9503\u9504\u9505\u9506\u9507\u9508\u9509\u950A\u950B\u950C\u950D\u950E\u950F\u9510\u9511\u9512\u9513\u9514\u9515\u9516\u9517\u9519\u951A\u951C\u951E\u951F\u9520\u9521\u9522\u9523\u9524\u9525\u9526\u9528\u9529\u952B\u952C\u952D\u952E\u952F\u9530\u9531\u9532\u9533\u9534\u9535\u9536\u9537\u9538\u9539\u953A\u953B\u953C\u953D\u953E\u953F\u9540\u9541\u9542\u9543\u9546\u9547\u9548\u9549\u954A\u954C\u954D\u954E\u954F\u9550\u9551\u9552\u9555\u9556\u9557\u9559\u955A\u955B\u955C\u955D\u955E\u955F\u9560\u9561\u9562\u9563\u9564\u9565\u9566\u9567\u9568\u9569\u956A\u956B\u956C\u956D\u956E\u956F\u9570\u9571\u9572\u9573\u9574\u9576\u957F\u95E8\u95E9\u95EA\u95EB\u95EC\u95ED\u95EE\u95EF\u95F0\u95F1\u95F2\u95F3\u95F4\u95F5\u95F6\u95F7\u95F8\u95F9\u95FA\u95FB\u95FC\u95FD\u95FE\u95FF\u9600\u9601\u9602\u9603\u9604\u9605\u9606\u9607\u9608\u9609\u960A\u960B\u960C\u960D\u960E\u960F\u9610\u9611\u9612\u9613\u9614\u9615\u9616\u9617\u9618\u9619\u961A\u961B\u961F\u9633\u9634\u9635\u9636\u9645\u9646\u9647\u9648\u9649\u9655\u9667\u9668\u9669\u968F\u9690\u96B6\u96BD\u96BE\u96CF\u96E0\u96F3\u96FE\u9701\u9709\u972D\u9753\u9759\u9765\u9791\u9792\u97AF\u97B4\u97E6\u97E7\u97E8\u97E9\u97EA\u97EB\u97EC\u97F5\u9875\u9876\u9877\u9878\u9879\u987A\u987B\u987C\u987D\u987E\u987F\u9880\u9881\u9882\u9883\u9884\u9885\u9886\u9887\u9888\u9889\u988A\u988B\u988C\u988D\u988E\u988F\u9890\u9891\u9892\u9893\u9894\u9895\u9896\u9897\u9898\u9899\u989A\u989B\u989C\u989D\u989E\u989F\u98A0\u98A1\u98A2\u98A3\u98A4\u98A5\u98A6\u98A7\u98CE\u98CF\u98D0\u98D1\u98D2\u98D3\u98D4\u98D5\u98D6\u98D7\u98D8\u98D9\u98DA\u98DE\u98E8\u990D\u9964\u9965\u9966\u9967\u9968\u9969\u996A\u996B\u996C\u996D\u996E\u996F\u9970\u9971\u9972\u9973\u9974\u9975\u9976\u9977\u9978\u9979\u997A\u997B\u997C\u997D\u997E\u997F\u9980\u9981\u9982\u9983\u9984\u9985\u9986\u9987\u9988\u9989\u998A\u998B\u998C\u998D\u998E\u998F\u9990\u9991\u9992\u9993\u9994\u9995\u9A6C\u9A6D\u9A6E\u9A6F\u9A70\u9A71\u9A72\u9A73\u9A74\u9A75\u9A76\u9A77\u9A78\u9A79\u9A7A\u9A7B\u9A7C\u9A7D\u9A7E\u9A7F\u9A80\u9A81\u9A82\u9A83\u9A84\u9A85\u9A86\u9A87\u9A88\u9A89\u9A8A\u9A8B\u9A8C\u9A8D\u9A8E\u9A8F\u9A90\u9A91\u9A92\u9A93\u9A94\u9A95\u9A96\u9A97\u9A98\u9A99\u9A9A\u9A9B\u9A9C\u9A9D\u9A9E\u9A9F\u9AA0\u9AA1\u9AA2\u9AA3\u9AA4\u9AA5\u9AA6\u9AA7\u9AC5\u9ACB\u9ACC\u9B13\u9B47\u9B49\u9C7C\u9C7D\u9C7E\u9C7F\u9C80\u9C81\u9C82\u9C84\u9C85\u9C86\u9C87\u9C88\u9C89\u9C8A\u9C8B\u9C8C\u9C8D\u9C8E\u9C8F\u9C90\u9C91\u9C92\u9C93\u9C94\u9C95\u9C96\u9C97\u9C98\u9C99\u9C9A\u9C9B\u9C9C\u9C9D\u9C9E\u9C9F\u9CA0\u9CA1\u9CA2\u9CA3\u9CA4\u9CA5\u9CA6\u9CA7\u9CA8\u9CA9\u9CAA\u9CAB\u9CAC\u9CAD\u9CAE\u9CAF\u9CB0\u9CB1\u9CB2\u9CB3\u9CB4\u9CB5\u9CB6\u9CB7\u9CB8\u9CB9\u9CBA\u9CBB\u9CBC\u9CBD\u9CBE\u9CBF\u9CC0\u9CC1\u9CC2\u9CC3\u9CC4\u9CC5\u9CC6\u9CC7\u9CC8\u9CC9\u9CCA\u9CCB\u9CCC\u9CCD\u9CCE\u9CCF\u9CD0\u9CD1\u9CD2\u9CD3\u9CD4\u9CD5\u9CD6\u9CD7\u9CD8\u9CD9\u9CDB\u9CDC\u9CDD\u9CDE\u9CDF\u9CE0\u9CE1\u9CE2\u9CE3\u9E1F\u9E20\u9E21\u9E22\u9E23\u9E24\u9E25\u9E26\u9E27\u9E28\u9E29\u9E2A\u9E2B\u9E2C\u9E2D\u9E2E\u9E2F\u9E30\u9E31\u9E32\u9E33\u9E34\u9E35\u9E36\u9E37\u9E38\u9E39\u9E3A\u9E3B\u9E3C\u9E3D\u9E3E\u9E3F\u9E40\u9E41\u9E42\u9E43\u9E44\u9E45\u9E46\u9E47\u9E48\u9E49\u9E4A\u9E4B\u9E4C\u9E4D\u9E4E\u9E4F\u9E50\u9E51\u9E52\u9E53\u9E54\u9E55\u9E56\u9E57\u9E58\u9E5A\u9E5B\u9E5C\u9E5D\u9E5E\u9E5F\u9E60\u9E61\u9E62\u9E63\u9E64\u9E65\u9E66\u9E67\u9E68\u9E69\u9E6A\u9E6B\u9E6C\u9E6D\u9E6F\u9E70\u9E71\u9E72\u9E73\u9E74\u9E7E\u9EA6\u9EB8\u9EC4\u9EC9\u9EE1\u9EE9\u9EEA\u9EFE\u9F99\u5386\u5FD7\u5236\u4E00\u53F0\u768B\u51C6\u590D\u731B\u949F\u6CE8\u8303\u7B7E";
      }
      function FTPYStr() {
        return "\u842C\u8207\u919C\u5C08\u696D\u53E2\u6771\u7D72\u4E1F\u5169\u56B4\u55AA\u500B\u723F\u8C50\u81E8\u70BA\u9E97\u8209\u9EBC\u7FA9\u70CF\u6A02\u55AC\u7FD2\u9109\u66F8\u8CB7\u4E82\u722D\u65BC\u8667\u96F2\u4E99\u4E9E\u7522\u755D\u89AA\u893B\u56B2\u5104\u50C5\u5F9E\u4F96\u5009\u5100\u5011\u50F9\u773E\u512A\u5925\u6703\u50B4\u5098\u5049\u50B3\u50B7\u5000\u502B\u5096\u507D\u4F47\u9AD4\u9918\u50AD\u50C9\u4FE0\u4FB6\u50E5\u5075\u5074\u50D1\u5108\u5115\u5102\u4FC1\u5114\u513C\u5006\u5137\u5109\u50B5\u50BE\u50AF\u50C2\u50E8\u511F\u513B\u5110\u5132\u513A\u5152\u514C\u5157\u9EE8\u862D\u95DC\u8208\u8332\u990A\u7378\u56C5\u5167\u5CA1\u518A\u5BEB\u8ECD\u8FB2\u585A\u99AE\u885D\u6C7A\u6CC1\u51CD\u6DE8\u6DD2\u6DBC\u6DE9\u6E1B\u6E4A\u51DC\u5E7E\u9CF3\u9CE7\u6191\u51F1\u64CA\u6C39\u947F\u82BB\u5283\u5289\u5247\u525B\u5275\u522A\u5225\u5257\u5244\u528A\u528C\u5274\u5291\u526E\u528D\u525D\u5287\u52F8\u8FA6\u52D9\u52F1\u52D5\u52F5\u52C1\u52DE\u52E2\u52F3\u731B\u52E9\u52FB\u532D\u5331\u5340\u91AB\u83EF\u5354\u55AE\u8CE3\u76E7\u9E75\u81E5\u885B\u537B\u5DF9\u5EE0\u5EF3\u66C6\u53B2\u58D3\u53AD\u5399\u5EC1\u5EC2\u53B4\u5EC8\u5EDA\u5EC4\u5EDD\u7E23\u53C3\u9749\u9746\u96D9\u767C\u8B8A\u6558\u758A\u8449\u865F\u6B4E\u5630\u7C72\u5F8C\u5687\u5442\u55CE\u551A\u5678\u807D\u555F\u5433\u5638\u56C8\u5614\u56A6\u5504\u54E1\u54BC\u55C6\u55DA\u8A60\u54E2\u56A8\u5680\u565D\u5412\u5645\u9E79\u5471\u97FF\u555E\u5660\u5635\u55F6\u5666\u5629\u5672\u568C\u5665\u55B2\u561C\u55CA\u562E\u5562\u55E9\u5515\u559A\u547C\u5616\u55C7\u56C0\u9F67\u56C9\u563D\u562F\u5674\u560D\u56B3\u56C1\u55EC\u566F\u5653\u56B6\u56D1\u5695\u5288\u56C2\u8B14\u5718\u5712\u56EA\u570D\u5707\u570B\u5716\u5713\u8056\u58D9\u5834\u962A\u58DE\u584A\u5805\u58C7\u58E2\u58E9\u5862\u58B3\u589C\u58DF\u58DF\u58DA\u58D8\u58BE\u5770\u580A\u588A\u57E1\u58B6\u58CB\u584F\u5816\u5852\u5864\u581D\u588A\u57B5\u5879\u58AE\u58EA\u7246\u58EF\u8072\u6BBC\u58FA\u58FC\u8655\u5099\u8907\u5920\u982D\u8A87\u593E\u596A\u5969\u5950\u596E\u734E\u5967\u599D\u5A66\u5ABD\u5AF5\u5AD7\u5AAF\u59CD\u8591\u5A41\u5A6D\u5B08\u5B0C\u5B4C\u5A1B\u5AA7\u5AFB\u5AFF\u5B30\u5B0B\u5B38\u5ABC\u5B21\u5B2A\u5B19\u5B24\u5B6B\u5B78\u5B7F\u5BE7\u5BF6\u5BE6\u5BF5\u5BE9\u61B2\u5BAE\u5BEC\u8CD3\u5BE2\u5C0D\u5C0B\u5C0E\u58FD\u5C07\u723E\u5875\u582F\u5C37\u5C4D\u76E1\u5C64\u5C6D\u5C5C\u5C46\u5C6C\u5C62\u5C68\u5DBC\u6B72\u8C48\u5D87\u5D17\u5CF4\u5DB4\u5D50\u5CF6\u5DBA\u5DBD\u5D20\u5DCB\u5DA8\u5DA7\u5CFD\u5DA2\u5DA0\u5D22\u5DD2\u5D97\u5D0D\u5DAE\u5D84\u5DB8\u5D94\u5D33\u5D81\u810A\u5DD4\u978F\u5DF0\u5E63\u5E25\u5E2B\u5E43\u5E33\u7C3E\u5E5F\u5E36\u5E40\u5E6B\u5E6C\u5E58\u5E57\u51AA\u8946\u5E79\u4E26\u5EE3\u838A\u6176\u5EEC\u5EE1\u5EAB\u61C9\u5EDF\u9F90\u5EE2\u5ECE\u5EE9\u958B\u7570\u68C4\u5F35\u5F4C\u5F33\u5F4E\u5F48\u5F37\u6B78\u7576\u9304\u5F60\u5F65\u5FB9\u5F91\u5FA0\u79A6\u61B6\u61FA\u6182\u613E\u61F7\u614B\u616B\u61AE\u616A\u60B5\u6134\u6190\u7E3D\u61DF\u61CC\u6200\u61C7\u60E1\u615F\u61E8\u6137\u60FB\u60F1\u60F2\u6085\u6128\u61F8\u6173\u61AB\u9A5A\u61FC\u6158\u61F2\u618A\u611C\u615A\u619A\u6163\u6E63\u614D\u61A4\u6192\u9858\u61FE\u6196\u6035\u61E3\u61F6\u61CD\u6207\u6214\u6232\u6227\u6230\u6229\u6236\u7D2E\u64B2\u6261\u57F7\u64F4\u636B\u6383\u63DA\u64FE\u64AB\u62CB\u6476\u6473\u6384\u6436\u8B77\u5831\u64D4\u64EC\u650F\u63C0\u64C1\u6514\u64F0\u64A5\u64C7\u639B\u646F\u6523\u6397\u64BE\u64BB\u633E\u6493\u64CB\u649F\u6399\u64E0\u63EE\u648F\u6488\u640D\u64BF\u63DB\u6417\u64DA\u649A\u64C4\u6451\u64F2\u64A3\u647B\u645C\u6463\u652C\u64B3\u6519\u64F1\u645F\u652A\u651C\u651D\u6504\u64FA\u6416\u64EF\u6524\u6516\u6490\u6506\u64F7\u64FC\u651B\u64FB\u6522\u6575\u6582\u6578\u9F4B\u6595\u9B25\u65AC\u65B7\u7121\u820A\u6642\u66E0\u6698\u66C7\u665D\u66E8\u986F\u6649\u66EC\u66C9\u66C4\u6688\u6689\u66AB\u66D6\u5284\u8853\u6A38\u6A5F\u6BBA\u96DC\u6B0A\u689D\u4F86\u694A\u69AA\u5091\u6975\u69CB\u6A05\u6A1E\u68D7\u6AEA\u6898\u68D6\u69CD\u6953\u689F\u6AC3\u6AB8\u6A89\u6894\u67F5\u6A19\u68E7\u6ADB\u6AF3\u68DF\u6AE8\u6ADF\u6B04\u6A39\u68F2\u6A23\u6B12\u68EC\u690F\u6A48\u6968\u6A94\u69BF\u6A4B\u6A3A\u6A9C\u69F3\u6A01\u5922\u6AAE\u68F6\u6AA2\u6B1E\u69E8\u6ADD\u69E7\u6B0F\u6A62\u6A13\u6B16\u6AEC\u6ADA\u6AF8\u6A9F\u6ABB\u6AB3\u6AE7\u6A6B\u6AA3\u6AFB\u6AEB\u6AE5\u6AD3\u6ADE\u7C37\u6A81\u6B61\u6B5F\u6B50\u6BB2\u6B7F\u6BA4\u6B98\u6B9E\u6BAE\u6BAB\u6BAF\u6BC6\u6BC0\u8F42\u7562\u6583\u6C08\u6BFF\u6C0C\u6C23\u6C2B\u6C2C\u6C33\u5F59\u6F22\u6C59\u6E6F\u6D36\u905D\u6E9D\u6C92\u7043\u6F1A\u701D\u6DEA\u6EC4\u6E22\u6E88\u6EEC\u6FD4\u6FD8\u6DDA\u6FA9\u7027\u7018\u6FFC\u7009\u6F51\u6FA4\u6D87\u6F54\u7051\u7AAA\u6D79\u6DFA\u6F3F\u6F86\u6E5E\u6EAE\u6FC1\u6E2C\u6FAE\u6FDF\u700F\u6EFB\u6E3E\u6EF8\u6FC3\u6F6F\u6FDC\u5857\u6E67\u6FE4\u6F87\u6DF6\u6F23\u6F7F\u6E26\u6EB3\u6E19\u6ECC\u6F64\u6F97\u6F32\u6F80\u6FB1\u6DF5\u6DE5\u6F2C\u7006\u6F38\u6FA0\u6F01\u700B\u6EF2\u6EAB\u904A\u7063\u6FD5\u6F70\u6FFA\u6F35\u6F0A\u6F77\u6EFE\u6EEF\u7069\u7044\u6EFF\u7005\u6FFE\u6FEB\u7064\u6FF1\u7058\u6FA6\u6FEB\u7020\u701F\u7032\u6FF0\u6F5B\u7026\u703E\u7028\u7015\u705D\u6EC5\u71C8\u9748\u707D\u71E6\u716C\u7210\u71C9\u7152\u7197\u9EDE\u7149\u71BE\u720D\u721B\u70F4\u71ED\u7159\u7169\u71D2\u71C1\u71F4\u71D9\u71FC\u71B1\u7165\u71DC\u71FE\u7146\u7CCA\u6E9C\u611B\u723A\u7258\u729B\u727D\u72A7\u72A2\u5F37\u72C0\u7377\u7341\u7336\u72FD\u9E85\u736E\u7370\u7368\u72F9\u7345\u736A\u7319\u7344\u733B\u736B\u7375\u737C\u7380\u8C6C\u8C93\u875F\u737B\u737A\u74A3\u74B5\u7452\u746A\u744B\u74B0\u73FE\u7472\u74BD\u7449\u73A8\u743A\u74CF\u74AB\u743F\u74A1\u7489\u7463\u74CA\u7464\u74A6\u74BF\u74D4\u74DA\u7515\u750C\u96FB\u756B\u66A2\u4F58\u7587\u7664\u7642\u7627\u7658\u760D\u9B01\u7621\u760B\u76B0\u5C59\u7670\u75D9\u7662\u7602\u7646\u7613\u7647\u7661\u7649\u762E\u761E\u763A\u765F\u7671\u766E\u766D\u7669\u766C\u7672\u81D2\u769A\u76BA\u76B8\u76DE\u9E7D\u76E3\u84CB\u76DC\u76E4\u7798\u7725\u77D3\u8457\u775C\u775E\u77BC\u779E\u77DA\u77EF\u78EF\u792C\u7926\u78AD\u78BC\u78DA\u7868\u786F\u78B8\u792A\u7931\u792B\u790E\u785C\u77FD\u78A9\u7864\u78FD\u78D1\u7904\u78BA\u9E7C\u7919\u78E7\u78E3\u583F\u955F\u6EFE\u79AE\u7995\u79B0\u798E\u79B1\u798D\u7A1F\u797F\u79AA\u96E2\u79BF\u7A08\u7A2E\u7A4D\u7A31\u7A62\u7A60\u7A6D\u7A05\u7A4C\u7A69\u7A61\u7AAE\u7ACA\u7AC5\u7AAF\u7AC4\u7AA9\u7ABA\u7AC7\u7AB6\u8C4E\u7AF6\u7BE4\u7B4D\u7B46\u7B67\u7B8B\u7C60\u7C69\u7BC9\u7BF3\u7BE9\u7C39\u7B8F\u7C4C\u7C3D\u7C21\u7C59\u7C00\u7BCB\u7C5C\u7C6E\u7C1E\u7C2B\u7C23\u7C0D\u7C43\u7C6C\u7C6A\u7C5F\u7CF4\u985E\u79C8\u7CF6\u7CF2\u7CB5\u7CDE\u7CE7\u7CDD\u9931\u7DCA\u7E36\u7CF8\u7CFE\u7D06\u7D05\u7D02\u7E96\u7D07\u7D04\u7D1A\u7D08\u7E8A\u7D00\u7D09\u7DEF\u7D1C\u7D18\u7D14\u7D15\u7D17\u7DB1\u7D0D\u7D1D\u7E31\u7DB8\u7D1B\u7D19\u7D0B\u7D21\u7D35\u7D16\u7D10\u7D13\u7DDA\u7D3A\u7D4F\u7D31\u7DF4\u7D44\u7D33\u7D30\u7E54\u7D42\u7E10\u7D46\u7D3C\u7D40\u7D39\u7E79\u7D93\u7D3F\u7D81\u7D68\u7D50\u7D5D\u7E5E\u7D70\u7D4E\u7E6A\u7D66\u7D62\u7D73\u7D61\u7D55\u7D5E\u7D71\u7D86\u7D83\u7D79\u7E61\u7D8C\u7D8F\u7D5B\u7E7C\u7D88\u7E3E\u7DD2\u7DBE\u7DD3\u7E8C\u7DBA\u7DCB\u7DBD\u7DD4\u7DC4\u7E69\u7DAD\u7DBF\u7DAC\u7E43\u7DA2\u7DAF\u7DB9\u7DA3\u7D9C\u7DBB\u7DB0\u7DA0\u7DB4\u7DC7\u7DD9\u7DD7\u7DD8\u7DEC\u7E9C\u7DF9\u7DF2\u7DDD\u7E15\u7E62\u7DE6\u7D9E\u7DDE\u7DF6\u7DDA\u7DF1\u7E0B\u7DE9\u7DE0\u7E37\u7DE8\u7DE1\u7DE3\u7E09\u7E1B\u7E1F\u7E1D\u7E2B\u7E17\u7E1E\u7E8F\u7E2D\u7E0A\u7E11\u7E7D\u7E39\u7E35\u7E32\u7E93\u7E2E\u7E46\u7E45\u7E88\u7E5A\u7E55\u7E52\u97C1\u7E7E\u7E70\u7E6F\u7E73\u7E98\u7F4C\u7DB2\u7F85\u7F70\u7F77\u7F86\u7F88\u7FA5\u7FA8\u7FF9\u7FFD\u7FEC\u802E\u802C\u8073\u6065\u8076\u807E\u8077\u8079\u806F\u8075\u8070\u8085\u8178\u819A\u8181\u814E\u816B\u8139\u8105\u81BD\u52DD\u6727\u8156\u81DA\u811B\u81A0\u8108\u81BE\u9AD2\u81CD\u8166\u81BF\u81E0\u8173\u812B\u8161\u81C9\u81D8\u9183\u8195\u9F76\u81A9\u9766\u8183\u9A30\u81CF\u81E2\u8F3F\u8264\u8266\u8259\u826B\u8271\u8C54\u8278\u85DD\u7BC0\u7F8B\u858C\u856A\u8606\u84EF\u8466\u85F6\u83A7\u8407\u84BC\u82E7\u8607\u6ABE\u860B\u8396\u8622\u8526\u584B\u7162\u7E6D\u834A\u85A6\u8598\u83A2\u8558\u84FD\u854E\u8588\u85BA\u8569\u69AE\u8477\u6ECE\u7296\u7192\u8541\u85CE\u84C0\u852D\u8552\u8452\u8464\u85E5\u849E\u84E7\u840A\u84EE\u8494\u8435\u859F\u7372\u8555\u7469\u9DAF\u84F4\u8600\u863F\u87A2\u71DF\u7E08\u856D\u85A9\u8525\u8546\u8562\u8523\u851E\u85CD\u858A\u863A\u8577\u93A3\u9A40\u8594\u861E\u85FA\u85F9\u8604\u860A\u85EA\u69C1\u861A\u865C\u616E\u865B\u87F2\u866F\u87E3\u96D6\u8766\u8806\u8755\u87FB\u879E\u8836\u8814\u8706\u8831\u8823\u87F6\u883B\u87C4\u86FA\u87EF\u8784\u8810\u86FB\u8778\u881F\u8805\u87C8\u87EC\u880D\u87BB\u8811\u87BF\u87CE\u8828\u91C1\u929C\u88DC\u896F\u889E\u8956\u5ACB\u8918\u896A\u8972\u894F\u88DD\u8960\u890C\u8933\u895D\u8932\u8947\u8938\u8964\u7E48\u8974\u898B\u89C0\u898E\u898F\u8993\u8996\u8998\u89BD\u89BA\u89AC\u89A1\u89BF\u89A5\u89A6\u89AF\u89B2\u89B7\u89F4\u89F8\u89F6\u8B8B\u8B7D\u8B04\u8A01\u8A08\u8A02\u8A03\u8A8D\u8B4F\u8A10\u8A0C\u8A0E\u8B93\u8A15\u8A16\u8A13\u8B70\u8A0A\u8A18\u8A12\u8B1B\u8AF1\u8B33\u8A4E\u8A1D\u8A25\u8A31\u8A1B\u8AD6\u8A29\u8A1F\u8AF7\u8A2D\u8A2A\u8A23\u8B49\u8A41\u8A36\u8A55\u8A5B\u8B58\u8A57\u8A50\u8A34\u8A3A\u8A46\u8B05\u8A5E\u8A58\u8A54\u8A56\u8B6F\u8A52\u8A86\u8A84\u8A66\u8A7F\u8A69\u8A70\u8A7C\u8AA0\u8A85\u8A75\u8A71\u8A95\u8A6C\u8A6E\u8A6D\u8A62\u8A63\u8ACD\u8A72\u8A73\u8A6B\u8AE2\u8A61\u8B78\u8AA1\u8AA3\u8A9E\u8A9A\u8AA4\u8AA5\u8A98\u8AA8\u8A91\u8AAA\u8AA6\u8A92\u8ACB\u8AF8\u8ACF\u8AFE\u8B80\u8AD1\u8AB9\u8AB2\u8AC9\u8ADB\u8AB0\u8AD7\u8ABF\u8AC2\u8AD2\u8AC4\u8AB6\u8AC7\u8ABC\u8B00\u8AF6\u8ADC\u8B0A\u8AEB\u8AE7\u8B14\u8B01\u8B02\u8AE4\u8AED\u8AFC\u8B92\u8AEE\u8AF3\u8AFA\u8AE6\u8B0E\u8ADE\u8ADD\u8B28\u8B9C\u8B16\u8B1D\u8B20\u8B17\u8AE1\u8B19\u8B10\u8B39\u8B3E\u8B2B\u8B7E\u8B2C\u8B5A\u8B56\u8B59\u8B95\u8B5C\u8B4E\u8B9E\u8B74\u8B6B\u8B96\u7A40\u8C76\u8C9D\u8C9E\u8CA0\u8C9F\u8CA2\u8CA1\u8CAC\u8CE2\u6557\u8CEC\u8CA8\u8CEA\u8CA9\u8CAA\u8CA7\u8CB6\u8CFC\u8CAF\u8CAB\u8CB3\u8CE4\u8CC1\u8CB0\u8CBC\u8CB4\u8CBA\u8CB8\u8CBF\u8CBB\u8CC0\u8CBD\u8CCA\u8D04\u8CC8\u8CC4\u8CB2\u8CC3\u8CC2\u8D13\u8CC7\u8CC5\u8D10\u8CD5\u8CD1\u8CDA\u8CD2\u8CE6\u8CED\u9F4E\u8D16\u8CDE\u8CDC\u8D14\u8CD9\u8CE1\u8CE0\u8CE7\u8CF4\u8CF5\u8D05\u8CFB\u8CFA\u8CFD\u8CFE\u8D17\u8B9A\u8D07\u8D08\u8D0D\u8D0F\u8D1B\u8D6C\u8D99\u8D95\u8DA8\u8DB2\u8E89\u8E8D\u8E4C\u8E60\u8E92\u8E10\u8E82\u8E7A\u8E55\u8E9A\u8E8B\u8E34\u8E8A\u8E64\u8E93\u8E91\u8EA1\u8E63\u8E95\u8EA5\u8EAA\u8EA6\u8EC0\u8ECA\u8ECB\u8ECC\u8ED2\u8ED1\u8ED4\u8F49\u8EDB\u8F2A\u8EDF\u8F5F\u8EF2\u8EFB\u8F64\u8EF8\u8EF9\u8EFC\u8EE4\u8EEB\u8F62\u8EFA\u8F15\u8EFE\u8F09\u8F0A\u8F4E\u8F08\u8F07\u8F05\u8F03\u8F12\u8F14\u8F1B\u8F26\u8F29\u8F1D\u8F25\u8F1E\u8F2C\u8F1F\u8F1C\u8F33\u8F3B\u8F2F\u8F40\u8F38\u8F61\u8F45\u8F44\u8F3E\u8F46\u8F4D\u8F54\u8FAD\u8FAF\u8FAE\u908A\u907C\u9054\u9077\u904E\u9081\u904B\u9084\u9019\u9032\u9060\u9055\u9023\u9072\u9087\u9015\u8DE1\u9069\u9078\u905C\u905E\u9090\u908F\u907A\u9059\u9127\u913A\u9114\u90F5\u9112\u9134\u9130\u9B31\u90E4\u90DF\u9136\u912D\u9106\u9148\u9116\u9132\u919E\u91B1\u91AC\u91C5\u91C3\u91C0\u91CB\u88CF\u949C\u9452\u947E\u93E8\u91D3\u91D4\u91DD\u91D8\u91D7\u91D9\u91D5\u91F7\u91FA\u91E7\u91E4\u9212\u91E9\u91E3\u9346\u91F9\u935A\u91F5\u9203\u9223\u9208\u9226\u920D\u9214\u937E\u9209\u92C7\u92FC\u9211\u9210\u9470\u6B3D\u921E\u93A2\u9264\u9227\u9201\u9225\u9204\u9215\u9200\u923A\u9322\u9266\u9257\u9237\u7F3D\u9233\u9255\u923D\u9238\u925E\u947D\u926C\u926D\u9240\u923F\u923E\u9435\u9251\u9234\u9460\u925B\u925A\u9230\u9249\u9248\u924D\u9239\u9438\u9276\u92AC\u92A0\u927A\u92AA\u92CF\u92E3\u9403\u928D\u943A\u9285\u92C1\u92B1\u92A6\u93A7\u9358\u9296\u9291\u92CC\u92A9\u929B\u93F5\u9293\u927F\u929A\u927B\u9298\u931A\u92AB\u9278\u92A5\u93DF\u9283\u940B\u92A8\u9280\u92A3\u9444\u9412\u92EA\u92D9\u9338\u92F1\u93C8\u93D7\u92B7\u9396\u92F0\u92E5\u92E4\u934B\u92EF\u92E8\u93FD\u92BC\u92DD\u92D2\u92C5\u92F6\u9426\u9427\u92B3\u92BB\u92C3\u92DF\u92E6\u9312\u9306\u937A\u932F\u9328\u9321\u9301\u9315\u9329\u932B\u932E\u947C\u9318\u9310\u9326\u9341\u9308\u9307\u931F\u9320\u9375\u92F8\u9333\u9319\u9365\u9348\u9347\u93D8\u9376\u9354\u9364\u936C\u937E\u935B\u93AA\u9360\u9370\u9384\u934D\u9382\u93E4\u93A1\u93CC\u93AE\u939B\u9398\u9477\u942B\u93B3\u93BF\u93A6\u93AC\u938A\u93B0\u9394\u93E2\u93DC\u93CD\u93F0\u93DE\u93E1\u93D1\u93C3\u93C7\u93D0\u9414\u9481\u9410\u93F7\u9465\u9413\u946D\u9420\u9479\u93F9\u9419\u944A\u9433\u9436\u9432\u942E\u943F\u9454\u9463\u945E\u9472\u9577\u9580\u9582\u9583\u9586\u9588\u9589\u554F\u95D6\u958F\u95C8\u9591\u958E\u9593\u9594\u958C\u60B6\u9598\u9B27\u95A8\u805E\u95E5\u95A9\u95AD\u95D3\u95A5\u95A3\u95A1\u95AB\u9B2E\u95B1\u95AC\u95CD\u95BE\u95B9\u95B6\u9B29\u95BF\u95BD\u95BB\u95BC\u95E1\u95CC\u95C3\u95E0\u95CA\u95CB\u95D4\u95D0\u95D2\u95D5\u95DE\u95E4\u968A\u967D\u9670\u9663\u968E\u969B\u9678\u96B4\u9673\u9658\u965D\u9689\u9695\u96AA\u96A8\u96B1\u96B8\u96CB\u96E3\u96DB\u8B8E\u9742\u9727\u973D\u9EF4\u9744\u975A\u975C\u9768\u97C3\u97BD\u97C9\u97DD\u97CB\u97CC\u97CD\u97D3\u97D9\u97DE\u97DC\u97FB\u9801\u9802\u9803\u9807\u9805\u9806\u9808\u980A\u9811\u9867\u9813\u980E\u9812\u980C\u980F\u9810\u9871\u9818\u9817\u9838\u9821\u9830\u9832\u981C\u6F41\u71B2\u9826\u9824\u983B\u982E\u9839\u9837\u9834\u7A4E\u9846\u984C\u9852\u984E\u9853\u984F\u984D\u9873\u9862\u985B\u9859\u9865\u7E87\u986B\u986C\u9870\u9874\u98A8\u98BA\u98AD\u98AE\u98AF\u98B6\u98B8\u98BC\u98BB\u98C0\u98C4\u98C6\u98C6\u98DB\u9957\u995C\u98E3\u9951\u98E5\u9933\u98E9\u993C\u98EA\u98EB\u98ED\u98EF\u98F2\u991E\u98FE\u98FD\u98FC\u98FF\u98F4\u990C\u9952\u9909\u9904\u990E\u9903\u990F\u9905\u9911\u9916\u9913\u9918\u9912\u9915\u991C\u991B\u9921\u9928\u9937\u994B\u9936\u993F\u995E\u9941\u9943\u993A\u993E\u9948\u9949\u9945\u994A\u994C\u9962\u99AC\u99AD\u99B1\u99B4\u99B3\u9A45\u99B9\u99C1\u9A62\u99D4\u99DB\u99DF\u99D9\u99D2\u9A36\u99D0\u99DD\u99D1\u99D5\u9A5B\u99D8\u9A4D\u7F75\u99F0\u9A55\u9A4A\u99F1\u99ED\u99E2\u9A6B\u9A6A\u9A01\u9A57\u9A02\u99F8\u99FF\u9A0F\u9A0E\u9A0D\u9A05\u9A0C\u9A4C\u9A42\u9A19\u9A2D\u9A24\u9A37\u9A16\u9A41\u9A2E\u9A2B\u9A38\u9A43\u9A3E\u9A44\u9A4F\u9A5F\u9A65\u9A66\u9A64\u9ACF\u9AD6\u9AD5\u9B22\u9B58\u9B4E\u9B5A\u9B5B\u9B62\u9B77\u9B68\u9B6F\u9B74\u9B7A\u9B81\u9B83\u9BF0\u9C78\u9B8B\u9B93\u9B92\u9B8A\u9B91\u9C5F\u9B8D\u9B90\u9BAD\u9B9A\u9BB3\u9BAA\u9B9E\u9BA6\u9C02\u9B9C\u9C60\u9C6D\u9BAB\u9BAE\u9BBA\u9BD7\u9C58\u9BC1\u9C7A\u9C31\u9C39\u9BC9\u9C23\u9C37\u9BC0\u9BCA\u9BC7\u9BB6\u9BFD\u9BD2\u9BD6\u9BEA\u9BD5\u9BEB\u9BE1\u9BE4\u9BE7\u9BDD\u9BE2\u9BF0\u9BDB\u9BE8\u9BF5\u9BF4\u9BD4\u9C5D\u9C08\u9C0F\u9C68\u9BF7\u9C2E\u9C03\u9C13\u9C77\u9C0D\u9C12\u9C09\u9C01\u9C42\u9BFF\u9C20\u9F07\u9C2D\u9C28\u9C25\u9C29\u9C1F\u9C1C\u9C33\u9C3E\u9C48\u9C49\u9C3B\u9C35\u9C45\u9C3C\u9C56\u9C54\u9C57\u9C52\u9C6F\u9C64\u9C67\u9C63\u9CE5\u9CE9\u96DE\u9CF6\u9CF4\u9CF2\u9DD7\u9D09\u9DAC\u9D07\u9D06\u9D23\u9D87\u9E15\u9D28\u9D1E\u9D26\u9D12\u9D1F\u9D1D\u9D1B\u9D2C\u9D15\u9DE5\u9DD9\u9D2F\u9D30\u9D42\u9D34\u9D43\u9D3F\u9E1E\u9D3B\u9D50\u9D53\u9E1D\u9D51\u9D60\u9D5D\u9D52\u9DF3\u9D5C\u9D61\u9D72\u9D93\u9D6A\u9DA4\u9D6F\u9D6C\u9D6E\u9D89\u9D8A\u9D77\u9DEB\u9D98\u9DA1\u9D9A\u9DBB\u9DBF\u9DA5\u9DA9\u9DCA\u9DC2\u9DB2\u9DB9\u9DBA\u9DC1\u9DBC\u9DB4\u9DD6\u9E1A\u9DD3\u9DDA\u9DEF\u9DE6\u9DF2\u9DF8\u9DFA\u9E07\u9DF9\u9E0C\u9E0F\u9E1B\u9E18\u9E7A\u9EA5\u9EA9\u9EC3\u9ECC\u9EF6\u9EF7\u9EF2\u9EFD\u9F8D\u6B77\u8A8C\u88FD\u58F9\u81FA\u81EF\u6E96\u5FA9\u52D0\u9418\u8A3B\u7BC4\u7C64";
      }
      function Traditionalized(cc) {
        const ss = JTPYStr();
        const tt = FTPYStr();
        return Array.from(cc).map((char) => {
          const index = ss.indexOf(char);
          return index !== -1 ? tt.charAt(index) : char;
        }).join("");
      }
      function Simplized(cc) {
        const ss = JTPYStr();
        const tt = FTPYStr();
        return Array.from(cc).map((char) => {
          const index = tt.indexOf(char);
          return index !== -1 ? ss.charAt(index) : char;
        }).join("");
      }
      function translateInitialization() {
        const btn_1 = document.getElementById("menu-translate");
        if (btn_1) {
          updateButtonLabel(btn_1, targetEncoding === 1 ? toSimplified : toTraditional);
          if (currentEncoding !== targetEncoding) {
            setLang();
            setTimeout(translateBody, translateDelay);
          }
          btn_1.addEventListener("click", () => translatePage(btn_1), false);
        }
        const btn_2 = document.querySelector(".rs_hide .translate");
        if (btn_2) {
          btn_2.lastChild.textContent = targetEncoding === 1 ? "\u7B80" : "\u7E41";
          if (currentEncoding !== targetEncoding) {
            setLang();
            setTimeout(translateBody, translateDelay);
          }
          btn_2.addEventListener("click", () => translatePage(btn_2, "\u7B80", "\u7E41"), false);
        }
      }
      translateInitialization();
      document.addEventListener("pjax:complete", translateInitialization);
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeTranslation, { once: true });
    } else {
      initializeTranslation();
    }
  }
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\music.ts
var music_exports = {};
__export(music_exports, {
  initializeMusicPlayer: () => initializeMusicPlayer
});
function initializeMusicPlayer() {
  const existingMusic = api.musicPlayer;
  if (existingMusic) existingMusic.destroy();
  api.musicPlayer = new MusicPlayer();
}
var MEDIA_SESSION_ACTIONS, MusicPlayer;
var init_music = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\music.ts"() {
    init_api();
    MEDIA_SESSION_ACTIONS = ["play", "pause", "previoustrack", "nexttrack", "seekto"];
    MusicPlayer = class {
      constructor() {
        this.loadingTimer = null;
        this.manualScrollTimer = null;
        this.lyricAnimationFrame = null;
        this.currentLyricIndex = -1;
        this.lastMediaPosition = -1;
        this.isManualScrolling = false;
        this.isPrepared = false;
        this.wasMobile = this.isMobile();
        this.boundKeydown = this.handleKeydown.bind(this);
        this.boundResize = this.handleResize.bind(this);
        this.boundPlay = this.handlePlay.bind(this);
        this.boundPause = this.handlePause.bind(this);
        this.boundLoadedData = this.handleLoadedData.bind(this);
        this.boundTimeUpdate = this.handleTimeUpdate.bind(this);
        this.boundLyricClick = this.handleLyricClick.bind(this);
        this.boundManualScroll = this.handleManualLyricScroll.bind(this);
        this.init();
      }
      init() {
        this.setViewportHeight();
        document.addEventListener("keydown", this.boundKeydown);
        window.addEventListener("resize", this.boundResize, { passive: true });
        this.waitForAPlayer();
      }
      setViewportHeight() {
        document.documentElement.style.setProperty("--vh", `${window.innerHeight}px`);
      }
      isMobile() {
        return window.matchMedia("(max-width: 798px)").matches;
      }
      handleResize() {
        this.setViewportHeight();
        const isMobile = this.isMobile();
        if (isMobile && !this.wasMobile) this.aplayer?.list?.hide?.();
        this.wasMobile = isMobile;
      }
      waitForAPlayer() {
        const loadingElement = document.querySelector(".Music-loading");
        const backgroundElement = document.getElementById("Music-bg");
        clearInterval(this.loadingTimer);
        this.loadingTimer = window.setInterval(() => {
          const meting = document.querySelector("#Music-page meting-js");
          const aplayer = meting?.aplayer;
          const root = document.querySelector("#Music-page .aplayer");
          const body = root?.querySelector(".aplayer-body");
          const cover = root?.querySelector(".aplayer-pic");
          const list = root?.querySelector(".aplayer-list");
          if (!aplayer || !root || !body || !cover || !list) return;
          clearInterval(this.loadingTimer);
          this.loadingTimer = null;
          if (loadingElement) loadingElement.style.display = "none";
          if (backgroundElement) backgroundElement.style.display = "block";
          this.prepareAPlayer({ aplayer, root, body, cover, list });
        }, 100);
      }
      prepareAPlayer({ aplayer, root, body, cover, list }) {
        if (this.isPrepared) return;
        this.isPrepared = true;
        this.aplayer = aplayer;
        this.playerRoot = root;
        this.audio = aplayer.audio;
        this.lyricViewport = root.querySelector(".aplayer-lrc");
        let leftColumn = root.querySelector(":scope > .aplayer-left");
        if (!leftColumn) {
          leftColumn = document.createElement("div");
          leftColumn.className = "aplayer-left";
          root.insertBefore(leftColumn, body);
        }
        leftColumn.append(cover, list);
        root.classList.add("music-layout-ready");
        if (this.isMobile()) aplayer.list?.hide?.();
        this.addPlayerEventListeners();
        this.enhanceControls();
        this.updateBackgroundImage();
        this.updatePlaybackState();
        this.updateMediaSessionMetadata();
        window.requestAnimationFrame(() => this.centerCurrentLyric(false));
      }
      addPlayerEventListeners() {
        if (!this.audio) return;
        this.audio.addEventListener("play", this.boundPlay);
        this.audio.addEventListener("pause", this.boundPause);
        this.audio.addEventListener("loadeddata", this.boundLoadedData);
        this.audio.addEventListener("timeupdate", this.boundTimeUpdate);
        if (this.lyricViewport) {
          this.lyricViewport.addEventListener("click", this.boundLyricClick);
          this.lyricViewport.addEventListener("wheel", this.boundManualScroll, { passive: true });
          this.lyricViewport.addEventListener("touchstart", this.boundManualScroll, { passive: true });
          this.lyricViewport.addEventListener("touchmove", this.boundManualScroll, { passive: true });
        }
      }
      enhanceControls() {
        const labels = [
          [".aplayer-icon-back", "\u4E0A\u4E00\u66F2"],
          [".aplayer-play", "\u64AD\u653E"],
          [".aplayer-icon-play", "\u64AD\u653E"],
          [".aplayer-icon-forward", "\u4E0B\u4E00\u66F2"],
          [".aplayer-icon-volume-down", "\u9759\u97F3\u6216\u6062\u590D\u97F3\u91CF"],
          [".aplayer-icon-order", "\u5207\u6362\u64AD\u653E\u987A\u5E8F"],
          [".aplayer-icon-loop", "\u5207\u6362\u5FAA\u73AF\u6A21\u5F0F"],
          [".aplayer-icon-menu", "\u5C55\u5F00\u6216\u6536\u8D77\u6B4C\u5355"],
          [".aplayer-icon-lrc", "\u663E\u793A\u6216\u9690\u85CF\u6B4C\u8BCD"]
        ];
        labels.forEach(([selector, label]) => {
          this.playerRoot.querySelectorAll(selector).forEach((control) => {
            control.setAttribute("aria-label", label);
            control.setAttribute("title", label);
            if (!control.matches("button, a, input")) {
              control.setAttribute("role", "button");
              control.tabIndex = 0;
            }
          });
        });
        this.playerRoot.querySelectorAll(".aplayer-list li").forEach((item, index) => {
          item.setAttribute("role", "button");
          item.tabIndex = 0;
          const title = item.querySelector(".aplayer-list-title")?.textContent?.trim();
          item.setAttribute("aria-label", title ? `\u64AD\u653E ${title}` : `\u64AD\u653E\u7B2C ${index + 1} \u9996\u6B4C\u66F2`);
        });
      }
      extractCoverUrl(backgroundImage) {
        const match = /url\((['"]?)(.*?)\1\)/.exec(backgroundImage || "");
        return match?.[2] || "";
      }
      getCurrentCoverUrl() {
        const cover = this.playerRoot?.querySelector(".aplayer-pic");
        if (!cover) return "";
        return this.extractCoverUrl(cover.style.backgroundImage || getComputedStyle(cover).backgroundImage);
      }
      updateBackgroundImage() {
        const backgroundElement = document.getElementById("Music-bg");
        const coverUrl = this.getCurrentCoverUrl();
        if (!backgroundElement || !coverUrl) return;
        const image = new Image();
        image.src = coverUrl;
        image.onload = () => {
          backgroundElement.style.backgroundImage = `url("${coverUrl.replaceAll('"', '\\"')}")`;
          backgroundElement.classList.add("show");
        };
      }
      handlePlay() {
        this.updatePlaybackState();
        requestAnimationFrame(() => this.updatePlaybackState());
      }
      handlePause() {
        this.updatePlaybackState();
        requestAnimationFrame(() => this.updatePlaybackState());
      }
      updatePlaybackState() {
        const isPlaying = Boolean(this.audio && !this.audio.paused);
        this.playerRoot?.classList.toggle("is-playing", isPlaying);
        document.getElementById("Music-page")?.classList.toggle("is-playing", isPlaying);
        const label = isPlaying ? "\u6682\u505C" : "\u64AD\u653E";
        this.playerRoot?.querySelectorAll(".aplayer-play, .aplayer-icon-play").forEach((control) => {
          control.setAttribute("aria-label", label);
          control.setAttribute("title", label);
        });
        if ("mediaSession" in navigator) {
          try {
            navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
          } catch (_) {
          }
        }
      }
      handleLoadedData() {
        this.currentLyricIndex = -1;
        this.lastMediaPosition = -1;
        this.updateBackgroundImage();
        this.enhanceControls();
        this.updateMediaSessionMetadata();
        this.centerCurrentLyric(false);
      }
      getCurrentLyricLine() {
        return this.playerRoot?.querySelector(".aplayer-lrc-contents .aplayer-lrc-current") || null;
      }
      handleTimeUpdate() {
        const currentLine = this.getCurrentLyricLine();
        const lyricContents = currentLine?.parentElement;
        if (currentLine && lyricContents) {
          const index = Array.from(lyricContents.children).indexOf(currentLine);
          if (index !== this.currentLyricIndex) {
            this.currentLyricIndex = index;
            if (!this.isManualScrolling) this.scrollLyricTo(currentLine, true);
          }
        }
        this.updateMediaSessionPosition();
      }
      centerCurrentLyric(smooth = true) {
        const currentLine = this.getCurrentLyricLine();
        if (currentLine) this.scrollLyricTo(currentLine, smooth);
      }
      scrollLyricTo(line, smooth = true) {
        if (!this.lyricViewport || !line) return;
        cancelAnimationFrame(this.lyricAnimationFrame);
        const maxScroll = Math.max(0, this.lyricViewport.scrollHeight - this.lyricViewport.clientHeight);
        const target = Math.min(
          maxScroll,
          Math.max(0, line.offsetTop - this.lyricViewport.clientHeight * 0.3 + line.offsetHeight / 2)
        );
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!smooth || reduceMotion) {
          this.lyricViewport.scrollTop = target;
          return;
        }
        const start2 = this.lyricViewport.scrollTop;
        const distance = target - start2;
        if (Math.abs(distance) < 1) return;
        const duration = 600;
        const startedAt = performance.now();
        const animate = (now) => {
          const progress = Math.min(1, (now - startedAt) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          this.lyricViewport.scrollTop = start2 + distance * eased;
          if (progress < 1) this.lyricAnimationFrame = requestAnimationFrame(animate);
        };
        this.lyricAnimationFrame = requestAnimationFrame(animate);
      }
      handleManualLyricScroll() {
        this.isManualScrolling = true;
        cancelAnimationFrame(this.lyricAnimationFrame);
        clearTimeout(this.manualScrollTimer);
        this.manualScrollTimer = window.setTimeout(() => {
          this.isManualScrolling = false;
          this.centerCurrentLyric(true);
        }, 4e3);
      }
      handleLyricClick(event) {
        const line = event.target.closest?.(".aplayer-lrc-contents p");
        const lyricContents = line?.parentElement;
        if (!line || !lyricContents || !this.aplayer) return;
        const index = Array.from(lyricContents.children).indexOf(line);
        const lyricTime = Number(this.aplayer.lrc?.current?.[index]?.[0]);
        if (!Number.isFinite(lyricTime)) return;
        event.preventDefault();
        event.stopPropagation();
        this.aplayer.seek(lyricTime);
        if (this.audio?.paused) this.aplayer.play();
        this.isManualScrolling = false;
        clearTimeout(this.manualScrollTimer);
        this.scrollLyricTo(line, true);
      }
      updateMediaSessionMetadata() {
        if (!("mediaSession" in navigator) || !("MediaMetadata" in window) || !this.aplayer) return;
        const song = this.aplayer.list?.audios?.[this.aplayer.list.index];
        if (!song) return;
        const cover = song.cover || song.pic || this.getCurrentCoverUrl();
        const metadata = {
          title: song.name || song.title || "\u97F3\u4E50\u9986",
          artist: song.artist || "\u672A\u77E5\u6B4C\u624B",
          album: song.album || "\u97F3\u4E50\u9986"
        };
        if (cover) metadata.artwork = [{ src: cover }];
        try {
          navigator.mediaSession.metadata = new MediaMetadata(metadata);
          navigator.mediaSession.setActionHandler("play", () => this.aplayer?.play());
          navigator.mediaSession.setActionHandler("pause", () => this.aplayer?.pause());
          navigator.mediaSession.setActionHandler("previoustrack", () => this.aplayer?.skipBack());
          navigator.mediaSession.setActionHandler("nexttrack", () => this.aplayer?.skipForward());
          navigator.mediaSession.setActionHandler("seekto", (details) => {
            if (Number.isFinite(details.seekTime)) this.aplayer?.seek(details.seekTime);
          });
        } catch (_) {
        }
      }
      updateMediaSessionPosition() {
        if (!("mediaSession" in navigator) || !navigator.mediaSession.setPositionState || !this.audio) return;
        const position = Math.floor(this.audio.currentTime);
        const duration = this.audio.duration;
        if (position === this.lastMediaPosition || !Number.isFinite(duration) || duration <= 0) return;
        this.lastMediaPosition = position;
        try {
          navigator.mediaSession.setPositionState({
            duration,
            playbackRate: this.audio.playbackRate || 1,
            position: Math.min(duration, Math.max(0, this.audio.currentTime))
          });
        } catch (_) {
        }
      }
      handleKeydown(event) {
        if (event.target?.matches?.("input, textarea, select, [contenteditable='true']")) return;
        const keyboardItem = event.target?.closest?.("#Music-page .aplayer-list li");
        if (keyboardItem && (event.code === "Enter" || event.code === "Space")) {
          event.preventDefault();
          keyboardItem.click();
          return;
        }
        const control = event.target?.closest?.("#Music-page .aplayer-icon, #Music-page .aplayer-button");
        if (control) {
          if (!control.matches("button, a, input") && (event.code === "Enter" || event.code === "Space")) {
            event.preventDefault();
            control.click();
          }
          return;
        }
        if (!this.aplayer) return;
        const actions2 = {
          Space: () => this.aplayer.toggle(),
          ArrowRight: () => this.aplayer.skipForward(),
          ArrowLeft: () => this.aplayer.skipBack(),
          ArrowUp: () => this.setVolume((this.audio?.volume || 0) + 0.1),
          ArrowDown: () => this.setVolume((this.audio?.volume || 0) - 0.1)
        };
        if (actions2[event.code]) {
          event.preventDefault();
          actions2[event.code]();
        }
      }
      setVolume(volume) {
        const nextVolume = Math.min(1, Math.max(0, volume));
        this.aplayer?.volume(nextVolume);
      }
      clearMediaSession() {
        if (!("mediaSession" in navigator)) return;
        MEDIA_SESSION_ACTIONS.forEach((action) => {
          try {
            navigator.mediaSession.setActionHandler(action, null);
          } catch (_) {
          }
        });
        try {
          navigator.mediaSession.metadata = null;
          navigator.mediaSession.playbackState = "none";
        } catch (_) {
        }
      }
      destroy() {
        clearInterval(this.loadingTimer);
        clearTimeout(this.manualScrollTimer);
        cancelAnimationFrame(this.lyricAnimationFrame);
        document.removeEventListener("keydown", this.boundKeydown);
        window.removeEventListener("resize", this.boundResize);
        if (this.audio) {
          this.audio.removeEventListener("play", this.boundPlay);
          this.audio.removeEventListener("pause", this.boundPause);
          this.audio.removeEventListener("loadeddata", this.boundLoadedData);
          this.audio.removeEventListener("timeupdate", this.boundTimeUpdate);
        }
        if (this.lyricViewport) {
          this.lyricViewport.removeEventListener("click", this.boundLyricClick);
          this.lyricViewport.removeEventListener("wheel", this.boundManualScroll);
          this.lyricViewport.removeEventListener("touchstart", this.boundManualScroll);
          this.lyricViewport.removeEventListener("touchmove", this.boundManualScroll);
        }
        this.playerRoot?.classList.remove("is-playing");
        document.getElementById("Music-page")?.classList.remove("is-playing");
        this.clearMediaSession();
      }
    };
  }
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\covercolor\shared.ts
var STORAGE_KEY2, readStore, writeStore, getCachedColor, cacheColor, getCoverSource, rgbToHex, normalizeHex, applyMusicColor, applyThemeColor, applyDefaultColor, resolveColor;
var init_shared = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\covercolor\\shared.ts"() {
    init_api();
    STORAGE_KEY2 = "Solitude";
    readStore = () => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY2)) || {};
      } catch (error) {
        return {};
      }
    };
    writeStore = (value) => {
      try {
        localStorage.setItem(STORAGE_KEY2, JSON.stringify(value));
      } catch (error) {
      }
    };
    getCachedColor = (source) => {
      const item = readStore().postcolor?.[source];
      if (!item || item.expiration && item.expiration <= Date.now()) return null;
      return item.value;
    };
    cacheColor = (source, color) => {
      const store = readStore();
      store.postcolor || (store.postcolor = {});
      store.postcolor[source] = {
        value: color,
        expiration: Date.now() + (Number(api.config.covercolor.time) || 432e5)
      };
      writeStore(store);
    };
    getCoverSource = (music = false) => {
      if (!music) {
        return api.page.color || document.getElementById("post-cover")?.src || "";
      }
      const background = document.querySelector("#nav-music .aplayer-pic")?.style.backgroundImage || "";
      return /url\(["']?([^"')]+)["']?\)/.exec(background)?.[1] || "";
    };
    rgbToHex = ([r, g, b], factor = 1) => `#${[r, g, b].map((value) => Math.max(0, Math.min(255, Math.floor(value * factor))).toString(16).padStart(2, "0")).join("")}`;
    normalizeHex = (value) => {
      if (!value) return null;
      const hex = value.startsWith("#") ? value : `#${value}`;
      return /^#[0-9a-f]{6}$/i.test(hex) ? hex : null;
    };
    applyMusicColor = (value) => {
      const color = normalizeHex(value);
      if (color) document.getElementById("nav-music")?.style.setProperty("--efu-music", color);
    };
    applyThemeColor = (value) => {
      const color = normalizeHex(value);
      if (!color) return applyDefaultColor();
      const [r, g, b] = color.match(/[0-9a-f]{2}/gi).map((part) => parseInt(part, 16));
      const brightness = Math.round((r * 299 + g * 587 + b * 114) / 1e3);
      const adjusted = brightness < 125 ? rgbToHex([Math.min(r + 50, 255), Math.min(g + 50, 255), Math.min(b + 50, 255)]) : color;
      const root = document.documentElement;
      root.style.setProperty("--efu-main", adjusted);
      root.style.setProperty("--efu-main-op", `${adjusted}23`);
      root.style.setProperty("--efu-main-op-deep", `${adjusted}dd`);
      root.style.setProperty("--efu-main-none", `${adjusted}00`);
      api.initThemeColor?.();
    };
    applyDefaultColor = () => {
      const root = document.documentElement;
      root.style.setProperty("--efu-main", "var(--efu-theme)");
      root.style.setProperty("--efu-main-op", "var(--efu-theme-op)");
      root.style.setProperty("--efu-main-op-deep", "var(--efu-theme-op-deep)");
      root.style.setProperty("--efu-main-none", "var(--efu-theme-none)");
      api.initThemeColor?.();
    };
    resolveColor = async (source, fetchColor, music = false) => {
      if (!source) return applyDefaultColor();
      const cached = getCachedColor(source);
      if (cached) return music ? applyMusicColor(cached) : applyThemeColor(cached);
      try {
        const color = await fetchColor(source);
        if (!color) throw new Error("Color provider returned no color");
        cacheColor(source, color);
        if (source !== getCoverSource(music)) return;
        return music ? applyMusicColor(color) : applyThemeColor(color);
      } catch (error) {
        console.error("Unable to resolve cover color:", error);
        if (!music) applyDefaultColor();
      }
    };
  }
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\covercolor\local.ts
var local_exports2 = {};
__export(local_exports2, {
  coverColor: () => coverColor
});
var extractLocalColor, coverColor;
var init_local2 = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\covercolor\\local.ts"() {
    init_shared();
    extractLocalColor = (source) => new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.addEventListener("load", () => {
        try {
          const color = window.ColorThief?.getColorSync(image);
          if (!color) throw new Error("Color Thief is unavailable");
          resolve(rgbToHex(color.array(), 0.8));
        } catch (error) {
          reject(error);
        }
      }, { once: true });
      image.addEventListener("error", () => reject(new Error(`Unable to load ${source}`)), { once: true });
      image.src = source;
    });
    coverColor = (music = false) => {
      const configured = !music && Solitude.page.color;
      if (configured && /^#[0-9a-f]{6}$/i.test(configured)) return applyThemeColor(configured);
      return resolveColor(getCoverSource(music), extractLocalColor, music);
    };
  }
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\covercolor\api.ts
var api_exports = {};
__export(api_exports, {
  coverColor: () => coverColor2
});
var fetchApiColor, coverColor2;
var init_api2 = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\covercolor\\api.ts"() {
    init_shared();
    fetchApiColor = async (source) => {
      const response = await fetch(`${Solitude.config.covercolor.api}${encodeURIComponent(source)}`);
      if (!response.ok) throw new Error(`Cover color API returned ${response.status}`);
      return (await response.json()).RGB;
    };
    coverColor2 = (music = false) => {
      const configured = !music && Solitude.page.color;
      if (configured) return applyThemeColor(configured);
      return resolveColor(getCoverSource(music), fetchApiColor, music);
    };
  }
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\covercolor\ave.ts
var ave_exports = {};
__export(ave_exports, {
  coverColor: () => coverColor3
});
var fetchAveColor, coverColor3;
var init_ave = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\covercolor\\ave.ts"() {
    init_shared();
    fetchAveColor = async (source) => {
      const response = await fetch(`${source}?imageAve`);
      if (!response.ok) throw new Error(`Image average color returned ${response.status}`);
      const { RGB } = await response.json();
      return RGB ? `#${RGB.replace(/^0x/, "")}` : null;
    };
    coverColor3 = (music = false) => {
      const configured = !music && Solitude.page.color;
      if (configured) return applyThemeColor(configured);
      return resolveColor(getCoverSource(music), fetchAveColor, music);
    };
  }
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\code-highlight.ts
var code_highlight_exports = {};
__export(code_highlight_exports, {
  initializeCodeBlocks: () => initializeCodeBlocks
});
var DEFAULT_SHIKI_URL, DEFAULT_THEMES, sourceCode, shikiModulePromise, activeShikiUrl, normalizeNumber, getConfiguration, loadShiki, fallbackCopy, showCopyResult, bindControls, setCollapsibleState, renderHighlightedCode, initializeCodeBlocks;
var init_code_highlight = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\code-highlight.ts"() {
    init_api();
    DEFAULT_SHIKI_URL = "https://esm.sh/shiki@4.4.3";
    DEFAULT_THEMES = { light: "github-light", dark: "github-dark" };
    sourceCode = /* @__PURE__ */ new WeakMap();
    shikiModulePromise = null;
    activeShikiUrl = "";
    normalizeNumber = (value) => {
      const number = Number(value);
      return Number.isFinite(number) ? Math.max(0, number) : null;
    };
    getConfiguration = () => {
      const highlight = api.config.highlight || {};
      const maxHeight = normalizeNumber(highlight.max_height) ?? 360;
      return {
        enable: highlight.enable !== false,
        lineNumbers: highlight.line_numbers !== false,
        maxHeight,
        themes: {
          light: highlight.themes?.light || DEFAULT_THEMES.light,
          dark: highlight.themes?.dark || DEFAULT_THEMES.dark
        },
        shikiUrl: api.config.cdn?.shiki || DEFAULT_SHIKI_URL
      };
    };
    loadShiki = (url) => {
      if (!shikiModulePromise || activeShikiUrl !== url) {
        activeShikiUrl = url;
        shikiModulePromise = import(
          /* @vite-ignore */
          url
        );
        shikiModulePromise.catch(() => {
          shikiModulePromise = null;
          activeShikiUrl = "";
        });
      }
      return shikiModulePromise;
    };
    fallbackCopy = (text) => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      return copied;
    };
    showCopyResult = (button, success) => {
      button.dataset.copyState = success ? "success" : "error";
      api.snackbarShow(
        api.config.lang.copy[success ? "success" : "error"],
        false,
        2e3
      );
      window.setTimeout(() => delete button.dataset.copyState, 2e3);
    };
    bindControls = (block, signal) => {
      if (block.dataset.codeControlsReady === "true") return;
      block.dataset.codeControlsReady = "true";
      const code = block.querySelector(".code-block__fallback code");
      sourceCode.set(block, code?.textContent || "");
      const copyButton = block.querySelector("[data-code-copy]");
      copyButton?.addEventListener("click", async () => {
        const text = sourceCode.get(block) || "";
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            showCopyResult(copyButton, true);
          } else {
            showCopyResult(copyButton, fallbackCopy(text));
          }
        } catch {
          showCopyResult(copyButton, fallbackCopy(text));
        }
      }, { signal });
      const expandButton = block.querySelector("[data-code-expand]");
      expandButton?.addEventListener("click", () => {
        block.classList.add("is-expanded");
        expandButton.hidden = true;
      }, { signal });
    };
    setCollapsibleState = (block, maxHeight, signal) => {
      block.style.setProperty("--code-block-max-height", `${maxHeight}px`);
      if (!maxHeight) return;
      requestAnimationFrame(() => {
        if (signal.aborted || !block.isConnected) return;
        const viewport = block.querySelector(".code-block__viewport");
        const expandButton = block.querySelector("[data-code-expand]");
        const isCollapsible = Boolean(viewport && viewport.scrollHeight > maxHeight);
        block.classList.toggle("is-collapsible", isCollapsible);
        if (expandButton) expandButton.hidden = !isCollapsible;
      });
    };
    renderHighlightedCode = async (shiki, code, language, themes) => {
      const attempts = [
        { lang: language, themes },
        { lang: language, themes: DEFAULT_THEMES },
        { lang: "text", themes: DEFAULT_THEMES }
      ];
      const uniqueAttempts = attempts.filter(
        (attempt, index) => attempts.findIndex(
          (candidate) => candidate.lang === attempt.lang && candidate.themes.light === attempt.themes.light && candidate.themes.dark === attempt.themes.dark
        ) === index
      );
      for (const attempt of uniqueAttempts) {
        try {
          return await shiki.codeToHtml(code, {
            ...attempt,
            defaultColor: false
          });
        } catch {
        }
      }
      return null;
    };
    initializeCodeBlocks = async (signal) => {
      const blocks = [...document.querySelectorAll("[data-code-block]")].filter((block) => block.dataset.codeBlockReady !== "true");
      if (!blocks.length) return;
      const configuration = getConfiguration();
      blocks.forEach((block) => {
        bindControls(block, signal);
        block.dataset.codeLightTheme = configuration.themes.light;
        block.dataset.codeDarkTheme = configuration.themes.dark;
        block.classList.toggle("code-block--line-numbers", configuration.lineNumbers);
        setCollapsibleState(block, configuration.maxHeight, signal);
      });
      if (!configuration.enable || signal.aborted) return;
      let shiki;
      try {
        shiki = await loadShiki(configuration.shikiUrl);
      } catch {
        return;
      }
      if (signal.aborted) return;
      await Promise.all(blocks.map(async (block) => {
        const code = sourceCode.get(block) || "";
        const language = block.dataset.language || "text";
        const html = await renderHighlightedCode(
          shiki,
          code,
          language,
          configuration.themes
        );
        if (!html || signal.aborted || !block.isConnected) return;
        const template = document.createElement("template");
        template.innerHTML = html;
        const highlighted = template.content.querySelector("pre.shiki");
        const viewport = block.querySelector(".code-block__viewport");
        if (!highlighted || !viewport || signal.aborted || !block.isConnected) return;
        const lightBackground = highlighted.style.backgroundColor;
        const darkBackground = highlighted.style.getPropertyValue("--shiki-dark-bg");
        if (lightBackground) {
          block.style.setProperty("--code-block-light-theme-bg", lightBackground);
        }
        if (darkBackground) {
          block.style.setProperty("--code-block-dark-theme-bg", darkBackground);
        }
        highlighted.tabIndex = 0;
        viewport.replaceChildren(highlighted);
        block.dataset.codeBlockReady = "true";
        setCollapsibleState(block, configuration.maxHeight, signal);
      }));
    };
  }
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\archive-page.ts
var archive_page_exports = {};
__export(archive_page_exports, {
  archivePageController: () => archivePageController,
  initArchivePage: () => initArchivePage
});
var SAFE_ARCHIVE_PROTOCOLS, resolveArchivePostUrl, archivePageController, initArchivePage;
var init_archive_page = __esm({
  "ns-hugo-imp:D:\\\u684C\u9762\\hugoBlog\\blog\\themes\\Solitude\\assets\\ts\\archive-page.ts"() {
    SAFE_ARCHIVE_PROTOCOLS = /* @__PURE__ */ new Set(["http:", "https:"]);
    resolveArchivePostUrl = (value) => {
      if (typeof value !== "string" || !value.trim()) return null;
      try {
        const url = new URL(value, document.baseURI);
        return SAFE_ARCHIVE_PROTOCOLS.has(url.protocol) ? url.href : null;
      } catch {
        return null;
      }
    };
    archivePageController = /* @__PURE__ */ (() => {
      const createElement = (tag, className, text) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== void 0) element.textContent = text;
        return element;
      };
      const controller = {
        init() {
          const shell = document.getElementById("archives-page");
          const dataElement = document.getElementById("archive-page-data");
          if (!shell || !dataElement || shell.dataset.archiveInitialized === "true") return;
          const list = shell.querySelector("#archives-page-list");
          const yearList = shell.querySelector("#archives-year-filter-list");
          const pagination = shell.querySelector("#pagination .pagination");
          const paginationSection = shell.querySelector(".archive-page-section-pagination");
          if (!list || !yearList || !pagination || !paginationSection) return;
          this.labels = {
            error: shell.dataset.labelError || "Unable to load posts.",
            empty: shell.dataset.labelEmpty || "No posts for this year.",
            uncategorized: shell.dataset.labelUncategorized || "Uncategorized",
            previous: shell.dataset.labelPrevious || "Previous page",
            next: shell.dataset.labelNext || "Next page"
          };
          let posts;
          try {
            posts = JSON.parse(dataElement.content?.textContent || dataElement.textContent || "[]");
          } catch (error) {
            this.renderState(shell, this.labels.error);
            console.error("Failed to parse archive data:", error);
            return;
          }
          shell.dataset.archiveInitialized = "true";
          this.shell = shell;
          this.list = list;
          this.yearList = yearList;
          this.pagination = pagination;
          this.paginationSection = paginationSection;
          this.posts = Array.isArray(posts) ? posts : [];
          this.perPage = Math.max(Number(shell.dataset.perPage) || 10, 1);
          this.years = [...new Set(this.posts.map((post) => String(post.year)))].sort((a, b) => Number(b) - Number(a));
          this.activeYear = this.years.includes(shell.dataset.initialYear) ? shell.dataset.initialYear : "all";
          this.currentPage = Math.max(Number(shell.dataset.initialPage) || 1, 1);
          this.abortController = new AbortController();
          this.renderYears();
          this.bindEvents();
          this.render();
        },
        bindEvents() {
          this.shell.addEventListener("click", (event) => {
            const yearButton = event.target.closest(".archive-year-button");
            if (yearButton) {
              this.activeYear = yearButton.dataset.year;
              this.currentPage = 1;
              this.render();
              return;
            }
            const pageButton = event.target.closest("[data-archive-page]");
            if (!pageButton || pageButton.disabled) return;
            this.currentPage = Number(pageButton.dataset.archivePage);
            this.render();
            const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            this.shell.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
          }, { signal: this.abortController.signal });
        },
        renderYears() {
          this.yearList.replaceChildren();
          this.years.forEach((year) => {
            const button = createElement("button", "archive-year-button", year);
            button.type = "button";
            button.dataset.year = year;
            button.setAttribute("aria-pressed", "false");
            this.yearList.appendChild(button);
          });
        },
        render() {
          const filteredPosts = this.activeYear === "all" ? this.posts : this.posts.filter((post) => String(post.year) === this.activeYear);
          const totalPages = Math.max(Math.ceil(filteredPosts.length / this.perPage), 1);
          this.currentPage = Math.min(this.currentPage, totalPages);
          this.shell.querySelectorAll(".archive-year-button").forEach((button) => {
            const active2 = button.dataset.year === this.activeYear;
            button.classList.toggle("is-active", active2);
            button.setAttribute("aria-pressed", String(active2));
          });
          this.list.replaceChildren();
          if (!filteredPosts.length) {
            this.renderState(this.shell, this.labels.empty);
          } else {
            const start2 = (this.currentPage - 1) * this.perPage;
            filteredPosts.slice(start2, start2 + this.perPage).forEach((post) => {
              this.list.appendChild(this.createPostItem(post));
            });
          }
          this.renderPagination(totalPages);
        },
        createPostItem(post) {
          const postUrl = resolveArchivePostUrl(post.url);
          const item = createElement(postUrl ? "a" : "div", "archive-page-item");
          if (postUrl) item.href = postUrl;
          else item.setAttribute("aria-disabled", "true");
          item.title = post.title;
          const thumb = createElement("div", "archive-page-thumb");
          const image = createElement("img");
          image.src = post.cover;
          image.alt = post.title;
          image.loading = "lazy";
          image.addEventListener("error", () => thumb.classList.add("is-fallback"), { once: true });
          const fallback = createElement(
            "span",
            "archive-page-thumb-fallback",
            (post.title || "\u6587").trim().charAt(0) || "\u6587"
          );
          thumb.append(image, fallback);
          const main = createElement("div", "archive-page-item-main");
          const title = createElement("div", "archive-page-item-title", post.title);
          const meta = createElement("div", "archive-page-item-meta");
          meta.append(
            createElement("span", "archive-page-item-category", post.primaryCategory || this.labels.uncategorized),
            createElement("span", "archive-page-item-divider", "/"),
            createElement("span", "archive-page-item-date", post.dateLabel)
          );
          main.append(title, meta);
          const arrow = createElement("div", "archive-page-item-arrow");
          const arrowIcon = createElement("i", "solitude fas fa-chevron-right");
          arrow.setAttribute("aria-hidden", "true");
          arrow.appendChild(arrowIcon);
          item.append(thumb, main, arrow);
          return item;
        },
        renderPagination(totalPages) {
          this.pagination.replaceChildren();
          this.paginationSection.hidden = totalPages <= 1;
          if (totalPages <= 1) return;
          this.pagination.appendChild(
            this.createPageButton(
              this.currentPage - 1,
              this.labels.previous,
              "archive-page-extend prev",
              this.currentPage === 1,
              "fa-chevron-left"
            )
          );
          this.getPageRange(totalPages).forEach((page) => {
            if (page === "space") {
              this.pagination.appendChild(createElement("span", "archive-page-space", "..."));
              return;
            }
            const button = this.createPageButton(page, String(page), "archive-page-number", false);
            if (page === this.currentPage) {
              button.classList.add("is-current");
              button.setAttribute("aria-current", "page");
            }
            this.pagination.appendChild(button);
          });
          this.pagination.appendChild(
            this.createPageButton(
              this.currentPage + 1,
              this.labels.next,
              "archive-page-extend next",
              this.currentPage === totalPages,
              "fa-chevron-right"
            )
          );
        },
        createPageButton(page, label, className, disabled, iconName) {
          const button = createElement("button", className);
          button.type = "button";
          button.disabled = disabled;
          button.dataset.archivePage = String(page);
          button.setAttribute("aria-label", label);
          if (iconName === "fa-chevron-left") button.appendChild(createElement("i", `solitude fas ${iconName}`));
          button.appendChild(createElement("span", "", label));
          if (iconName === "fa-chevron-right") button.appendChild(createElement("i", `solitude fas ${iconName}`));
          return button;
        },
        getPageRange(totalPages) {
          if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
          if (this.currentPage <= 4) return [1, 2, 3, 4, 5, "space", totalPages];
          if (this.currentPage >= totalPages - 3)
            return [1, "space", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
          return [1, "space", this.currentPage - 1, this.currentPage, this.currentPage + 1, "space", totalPages];
        },
        renderState(shell, message) {
          const list = shell.querySelector("#archives-page-list");
          if (!list) return;
          list.replaceChildren(createElement("div", "archive-page-state", message));
        },
        destroy() {
          this.abortController?.abort();
          this.abortController = null;
          this.shell = null;
          this.list = null;
          this.yearList = null;
          this.pagination = null;
          this.paginationSection = null;
          this.posts = [];
          this.labels = null;
        }
      };
      return controller;
    })();
    initArchivePage = () => archivePageController.init();
  }
});

// <stdin>
init_api();

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\utils.ts
(() => {
  const utilsFn = {
    throttle: (func, wait, { leading = true, trailing = true } = {}) => {
      let timeout, previous = 0;
      const later = (context, args) => {
        timeout = previous = leading === false ? 0 : Date.now();
        func.apply(context, args);
      };
      return function() {
        const now = Date.now();
        if (!previous && leading === false) previous = now;
        const remaining = wait - (now - previous);
        if (remaining <= 0 || remaining > wait) {
          if (timeout) clearTimeout(timeout);
          later(this, arguments);
        } else if (!timeout && trailing !== false) {
          timeout = setTimeout(() => later(this, arguments), remaining);
        }
      };
    },
    fadeIn: (ele, time) => {
      ele.style.display = "block";
      ele.style.animation = `to_show ${time}s`;
    },
    fadeOut: (ele, time) => {
      const resetStyles = () => {
        ele.style.display = "none";
        ele.style.animation = "";
        ele.removeEventListener("animationend", resetStyles);
      };
      ele.addEventListener("animationend", resetStyles);
      ele.style.animation = `to_hide ${time}s`;
    },
    snackbarShow: (text, showAction = false, duration = 5e3) => {
      Snackbar.show({ text, showAction, duration, pos: "top-center" });
    },
    copy: async (text) => {
      const message = await navigator.clipboard.writeText(text).then(() => Solitude.config.lang.copy.success).catch(() => Solitude.config.lang.copy.error);
      Solitude.snackbarShow(message, false, 2e3);
    },
    getEleTop: (ele) => {
      let actualTop = ele.offsetTop;
      while (ele.offsetParent) {
        ele = ele.offsetParent;
        actualTop += ele.offsetTop;
      }
      return actualTop;
    },
    siblings: (ele, selector) => {
      return [...ele.parentNode.children].filter(
        (child) => child !== ele && (!selector || child.matches(selector))
      );
    },
    randomNum: (length) => Math.floor(Math.random() * length),
    timeDiff: (timeObj, today) => Math.floor((today.getTime() - timeObj.getTime()) / (1e3 * 3600 * 24)),
    scrollToDest: (pos, time = 500) => {
      const currentPos = window.pageYOffset;
      const isNavFixed = document.getElementById("page-header").classList.contains("nav-fixed");
      pos = currentPos > pos || isNavFixed ? pos - 70 : pos;
      if ("scrollBehavior" in document.documentElement.style) {
        window.scrollTo({ top: pos, behavior: "smooth" });
        return;
      }
      const distance = pos - currentPos;
      const step = (currentTime) => {
        const progress = currentTime - (start || currentTime);
        if (progress < time) {
          window.scrollTo(0, currentPos + distance * progress / time);
          window.requestAnimationFrame(step);
        } else {
          window.scrollTo(0, pos);
        }
      };
      window.requestAnimationFrame(step);
    },
    isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ),
    isHidden: (e) => e.offsetHeight === 0 && e.offsetWidth === 0,
    animateIn: (ele, text) => {
      Object.assign(ele.style, { display: "block", animation: text });
    },
    animateOut: (ele, text) => {
      const resetAnimation = () => {
        ele.style.display = "";
        ele.style.animation = "";
        ele.removeEventListener("animationend", resetAnimation);
      };
      ele.addEventListener("animationend", resetAnimation);
      ele.style.animation = text;
    },
    wrap: (selector, eleType, options) => {
      const createEle = document.createElement(eleType);
      Object.entries(options).forEach(
        ([key, value]) => createEle.setAttribute(key, value)
      );
      selector.parentNode.insertBefore(createEle, selector);
      createEle.appendChild(selector);
    },
    lazyloadImg: () => {
      window.lazyLoadInstance = new LazyLoad({
        elements_selector: "img",
        threshold: 0,
        data_src: "lazy-src",
        callback_error: (img) => img.src = Solitude.config.lazyload.error
      });
    },
    lightbox: function(selector) {
      const lightboxType = Solitude.config.lightbox;
      const options = {
        class: "fancybox",
        "data-fancybox": "gallery",
        "data-no-pjax": ""
      };
      if (lightboxType === "mediumZoom") {
        mediumZoom && mediumZoom(selector, { background: "var(--efu-card-bg)" });
      } else if (lightboxType === "fancybox") {
        selector.forEach((i) => {
          if (i.parentNode.tagName !== "A") {
            options.href = options["data-thumb"] = i.dataset.lazySrc || i.src;
            options["data-caption"] = i.title || i.alt || "";
            Solitude.wrap(i, "a", options);
          }
        });
        if (!window.fancyboxRun) {
          Fancybox.bind("[data-fancybox]", {
            Hash: false,
            Carousel: {
              transition: "slide",
              Thumbs: { showOnStart: false },
              Zoomable: { Panzoom: { maxScale: 4 } },
              Toolbar: {
                display: {
                  left: ["counter"],
                  middle: [],
                  right: ["thumbs", "close"]
                }
              },
              breakpoints: {
                "(min-width: 768px)": {
                  Toolbar: {
                    display: {
                      left: ["counter"],
                      middle: [
                        "zoomIn",
                        "zoomOut",
                        "toggle1to1",
                        "rotateCCW",
                        "rotateCW",
                        "flipX",
                        "flipY"
                      ],
                      right: ["autoplay", "thumbs", "close"]
                    }
                  }
                }
              }
            }
          });
          window.fancyboxRun = true;
        }
      }
    },
    diffDate: (d, more = false) => {
      const dateNow = /* @__PURE__ */ new Date();
      const datePost = new Date(d);
      const dateDiff = dateNow - datePost;
      const minute = 6e4;
      const hour = 36e5;
      const day = 864e5;
      const month = 2592e6;
      const { time } = Solitude.config.lang;
      const dayCount = Math.floor(dateDiff / day);
      if (!more) return dayCount;
      const minuteCount = Math.floor(dateDiff / minute);
      const hourCount = Math.floor(dateDiff / hour);
      const monthCount = Math.floor(dateDiff / month);
      if (monthCount > 12) return datePost.toISOString().slice(0, 10);
      if (monthCount >= 1) return `${monthCount} ${time.month}`;
      if (dayCount >= 1) return `${dayCount} ${time.day}`;
      if (hourCount >= 1) return `${hourCount} ${time.hour}`;
      if (minuteCount >= 1) return `${minuteCount} ${time.min}`;
      return time.just;
    },
    loadComment: (dom, callback) => {
      const observerItem = "IntersectionObserver" in window ? new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            callback();
            observerItem.disconnect();
          }
        },
        { threshold: [0] }
      ) : null;
      observerItem ? observerItem.observe(dom) : callback();
    },
    escapeHtml: (unsafe) => unsafe.replace(
      /[&<"']/g,
      (m) => ({
        "&": "&amp;",
        "<": "&lt;",
        '"': "&quot;",
        "'": "&#039;"
      })[m]
    ),
    owoBig: (owoSelector) => {
      const execute = () => {
        if (typeof window.Solitude.owoBig === "function" && window.Solitude.owoBig !== utilsFn.owoBig) {
          window.Solitude.owoBig(owoSelector);
        }
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", execute);
      } else {
        setTimeout(execute, 100);
      }
    }
  };
  Object.assign(window.Solitude, utilsFn);
})();

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\main.ts
init_api();

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\core\actions.ts
var initActionDelegation = (api2) => {
  if (document.documentElement.dataset.solitudeActions === "true") return;
  document.documentElement.dataset.solitudeActions = "true";
  const dispatch = (event) => {
    if (!(event.target instanceof Element)) return;
    const element = event.target.closest("[data-solitude-action]");
    if (!element) return;
    const action = api2[element.dataset.solitudeAction];
    if (typeof action !== "function") return;
    if (element.dataset.solitudePrevent === "true") event.preventDefault();
    if (element.dataset.solitudeStop === "true") event.stopPropagation();
    let argument;
    if (element.dataset.solitudeTarget) argument = element.dataset.solitudeTarget;
    else if (element.dataset.solitudeUrl) argument = element.dataset.solitudeUrl;
    else if (element.dataset.solitudeValue) argument = element.dataset.solitudeValue;
    else if (element.dataset.solitudeEvent === "true") argument = event;
    action.call(api2, argument, event, element);
  };
  document.addEventListener("click", dispatch);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (!(event.target instanceof Element)) return;
    const element = event.target.closest("[data-solitude-action]");
    if (!element || /^(A|BUTTON|INPUT)$/.test(element.tagName)) return;
    event.preventDefault();
    element.click();
  });
  document.addEventListener("error", (event) => {
    const element = event.target;
    if (!(element instanceof Element)) return;
    if (element.matches("[data-solitude-hide-ads]")) {
      document.querySelectorAll(".google-ads-warp").forEach((item) => {
        item.style.display = "none";
      });
    }
    const fallback = element.dataset.solitudeFallback;
    if (fallback && element.getAttribute("src") !== fallback) {
      element.removeAttribute("data-solitude-fallback");
      element.setAttribute("src", fallback);
    }
  }, true);
};

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\main.ts
init_lifecycle();

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\core\preloader.ts
var initPreloader = (api2) => {
  if (document.documentElement.dataset.solitudePreloader === "true") return;
  document.documentElement.dataset.solitudePreloader = "true";
  let loaded = false;
  let fallbackTimer;
  const loadingBox = () => document.getElementById("loading-box");
  const sync = () => {
    const body = document.getElementById("body");
    if (body) body.classList.toggle("pace-done", loaded);
  };
  const end = () => {
    if (loaded) return;
    loadingBox()?.classList.add("loaded");
    loaded = true;
    clearTimeout(fallbackTimer);
    sync();
  };
  const start2 = () => {
    loadingBox()?.classList.remove("loaded");
    loaded = false;
    clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(end, 5e3);
    sync();
  };
  api2.endLoading = end;
  window.addEventListener("load", end, { once: true });
  window.addEventListener("pjax:send", start2);
  document.addEventListener("pjax:complete", end);
  fallbackTimer = setTimeout(end, 5e3);
  if (document.readyState === "complete") end();
};

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\main.ts
var coverColor4 = () => {
};
var initializeMusicPlayer2 = () => {
};
var loadFeatureModules = async () => {
  const features = api.config.feature_modules || {};
  const requests = [];
  if (features.search === "local") requests.push(Promise.resolve().then(() => (init_local(), local_exports)));
  if (features.search === "algolia") requests.push(Promise.resolve().then(() => (init_algolia(), algolia_exports)));
  if (features.search === "docsearch") requests.push(Promise.resolve().then(() => (init_docsearch(), docsearch_exports)));
  if (features.friend_links) requests.push(Promise.resolve().then(() => (init_friend_links(), friend_links_exports)));
  if (features.keyboard) requests.push(Promise.resolve().then(() => (init_keyboard(), keyboard_exports)));
  if (features.right_menu) requests.push(Promise.resolve().then(() => (init_right_menu(), right_menu_exports)));
  if (features.translate) requests.push(Promise.resolve().then(() => (init_tw_cn(), tw_cn_exports)));
  if (features.music) {
    requests.push(Promise.resolve().then(() => (init_music(), music_exports)).then((module) => {
      initializeMusicPlayer2 = module.initializeMusicPlayer;
    }));
  }
  if (features.covercolor) {
    const coverColorLoaders = {
      local: () => Promise.resolve().then(() => (init_local2(), local_exports2)),
      api: () => Promise.resolve().then(() => (init_api2(), api_exports)),
      ave: () => Promise.resolve().then(() => (init_ave(), ave_exports))
    };
    const loader = coverColorLoaders[features.covercolor];
    if (loader) requests.push(loader().then((module) => {
      coverColor4 = module.coverColor;
      api.coverColor = coverColor4;
    }));
  }
  await Promise.all(requests);
};
var sidebarFn = () => {
  const $toggleMenu = document.getElementById("toggle-menu");
  const $mobileSidebarMenus = document.getElementById("sidebar-menus");
  const $menuMask = document.getElementById("menu-mask");
  const $body = document.body;
  const toggleMobileSidebar = (isOpen) => {
    $body.style.overflow = isOpen ? "hidden" : "";
    api[isOpen ? "fadeIn" : "fadeOut"]($menuMask, 0.5);
    $mobileSidebarMenus.classList.toggle("open", isOpen);
  };
  const closeMobileSidebar = () => {
    if ($mobileSidebarMenus.classList.contains("open")) {
      toggleMobileSidebar(false);
    }
  };
  if (!$toggleMenu || !$mobileSidebarMenus || !$menuMask) return;
  lifecycle.listen($toggleMenu, "click", () => toggleMobileSidebar(true));
  lifecycle.listen($menuMask, "click", closeMobileSidebar);
  let resizeFrame;
  lifecycle.listen(window, "resize", () => {
    if (resizeFrame) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = null;
      if (api.isHidden($toggleMenu) && $mobileSidebarMenus.classList.contains("open")) {
        closeMobileSidebar();
      }
    });
  });
  lifecycle.add(() => cancelAnimationFrame(resizeFrame));
};
var initAsideTagCloudOverflow = () => {
  const tagClouds = [
    ...document.querySelectorAll(
      "#aside-content .card-tag-cloud"
    )
  ];
  if (!tagClouds.length) return;
  const frames = /* @__PURE__ */ new Set();
  const updateOverflowState = (tagCloud) => {
    tagCloud.classList.toggle(
      "is-overflowing",
      !tagCloud.classList.contains("all-tags") && tagCloud.scrollHeight > tagCloud.clientHeight
    );
  };
  const scheduleUpdate = (tagCloud) => {
    const frame = requestAnimationFrame(() => {
      frames.delete(frame);
      updateOverflowState(tagCloud);
    });
    frames.add(frame);
  };
  const resizeObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => scheduleUpdate(entry.target));
  });
  tagClouds.forEach((tagCloud) => {
    resizeObserver.observe(tagCloud);
    scheduleUpdate(tagCloud);
  });
  lifecycle.add(() => {
    resizeObserver.disconnect();
    frames.forEach(cancelAnimationFrame);
  });
};
var scrollFn = () => {
  const $rightside = document.getElementById("rightside");
  const $header = document.getElementById("page-header");
  let initTop = window.scrollY || document.documentElement.scrollTop;
  const updateHeaderAndRightside = (isDown, currentTop) => {
    const isAtTop = currentTop <= 0;
    $header.classList.toggle("nav-at-top", isAtTop);
    if (!isAtTop) {
      $header.classList.toggle("nav-visible", !isDown);
      $header.classList.add("nav-fixed");
      if ($rightside) {
        $rightside.style.opacity = "1";
        $rightside.style.transform = "translateX(-58px)";
      }
    } else {
      $header.classList.remove("nav-fixed", "nav-visible");
      if ($rightside) {
        $rightside.style.opacity = "";
        $rightside.style.transform = "";
      }
    }
  };
  const handleScroll = () => {
    initThemeColor();
    const currentTop = window.scrollY || document.documentElement.scrollTop;
    const isDown = currentTop > initTop;
    initTop = currentTop;
    updateHeaderAndRightside(isDown, currentTop);
  };
  let ticking = false;
  const onScroll = () => {
    const currentTop = window.scrollY || document.documentElement.scrollTop;
    if (currentTop <= 0) {
      initTop = 0;
      updateHeaderAndRightside(false, 0);
      return;
    }
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  };
  lifecycle.listen(window, "scroll", onScroll, { passive: true });
  updateHeaderAndRightside(false, initTop);
};
var percent = () => {
  const docEl = document.documentElement;
  const body = document.body;
  const scrollPos = window.pageYOffset || docEl.scrollTop;
  const totalScrollableHeight = Math.max(
    body.scrollHeight,
    docEl.scrollHeight,
    body.offsetHeight,
    docEl.offsetHeight,
    body.clientHeight,
    docEl.clientHeight
  ) - docEl.clientHeight;
  const scrolledPercent = totalScrollableHeight > 0 ? Math.round(scrollPos / totalScrollableHeight * 100) : 0;
  const navToTop = document.querySelector("#nav-totop");
  const percentDisplay = document.querySelector("#nav-totop #percent");
  const endTarget = document.getElementById("post-comment") || document.getElementById("footer");
  const isNearEnd = endTarget ? window.scrollY + docEl.clientHeight >= endTarget.offsetTop : false;
  navToTop?.classList.toggle("long", isNearEnd || scrolledPercent > 90);
  if (percentDisplay) percentDisplay.textContent = isNearEnd || scrolledPercent > 90 ? api.config.lang.backtop : scrolledPercent;
  document.querySelectorAll(".needEndHide").forEach(
    (item) => item.classList.toggle("hide", totalScrollableHeight - scrollPos < 100)
  );
};
var showTodayCard = () => {
  const el = document.getElementById("todayCard");
  const topGroup = document.querySelector(".topGroup");
  lifecycle.listen(topGroup, "mouseleave", () => el?.classList.remove("hide"));
};
var initHomeCenter = () => {
  const container = document.getElementById("home_center");
  if (!container || container.dataset.initialized === "true") return;
  container.dataset.initialized = "true";
  const banners = [...container.querySelectorAll(".home-center-banner-item")];
  const items = [...container.querySelectorAll(".home-center-item")];
  const indicators = [
    ...container.querySelectorAll(".home-center-indicator")
  ];
  const banner = container.querySelector(".home-center-banner");
  const titleLink = container.querySelector(".home-center-title-link");
  const titleTag = container.querySelector(".home-center-title-tag span");
  const categoryBar = document.getElementById("category-bar");
  const profileCard = document.querySelector(
    "#aside-content .card-info"
  );
  let activeIndex = 0;
  let scrollFrame;
  const getCachedColor2 = (src) => {
    try {
      const cache = JSON.parse(localStorage.getItem("Solitude")) || {};
      const item = cache.postcolor?.[src];
      if (item && (!item.expiration || item.expiration > Date.now())) {
        return item.value;
      }
    } catch (error) {
      return null;
    }
    return null;
  };
  const cacheColor2 = (src, color) => {
    try {
      const cache = JSON.parse(localStorage.getItem("Solitude")) || {};
      cache.postcolor = cache.postcolor || {};
      cache.postcolor[src] = {
        value: color,
        expiration: Date.now() + 432e5
      };
      localStorage.setItem("Solitude", JSON.stringify(cache));
    } catch (error) {
    }
  };
  const rgbToThemeHex = ([r, g, b]) => `#${[r, g, b].map(
    (value) => Math.floor(value * 0.8).toString(16).padStart(2, "0")
  ).join("")}`;
  const getAverageColor = (image) => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const color = [0, 0, 0];
    let count = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index + 3] < 128) continue;
      color[0] += pixels[index];
      color[1] += pixels[index + 1];
      color[2] += pixels[index + 2];
      count++;
    }
    return count ? color.map((value) => Math.round(value / count)) : null;
  };
  const normalizeHomeCenterColor = (value) => {
    const match = value?.match(/^#([0-9a-f]{6})$/i);
    if (!match) return value;
    const number = parseInt(match[1], 16);
    const rgb = [number >> 16, number >> 8 & 255, number & 255];
    const brightness = Math.round(
      (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1e3
    );
    if (brightness >= 125) return value;
    return `#${rgb.map((channel) => Math.min(channel + 50, 255).toString(16).padStart(2, "0")).join("")}`;
  };
  const getReadableProfileTextColor = (value) => {
    const match = value?.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return "";
    const hex = match[1].length === 3 ? [...match[1]].map((channel) => channel.repeat(2)).join("") : match[1];
    const channels = [0, 2, 4].map(
      (offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255
    );
    const luminance = channels.map(
      (channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    ).reduce(
      (sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index],
      0
    );
    const whiteContrast = 1.05 / (luminance + 0.05);
    const blackContrast = (luminance + 0.05) / 0.05;
    return whiteContrast >= blackContrast ? "var(--efu-white)" : "var(--efu-black)";
  };
  const applyItemColor = (index, color) => {
    if (!color || !banners[index]) return;
    const colorOp = `color-mix(in srgb, ${color} 14%, transparent)`;
    const colorDeep = `color-mix(in srgb, ${color} 87%, transparent)`;
    banners[index].style.setProperty("--home-center-theme", color);
    banners[index].style.setProperty("--home-center-theme-op", colorOp);
    banners[index].style.setProperty("--home-center-theme-op-deep", colorDeep);
    items[index]?.style.setProperty("--item-theme", color);
    items[index]?.style.setProperty("--item-theme-op", colorOp);
    items[index]?.style.setProperty("--item-theme-op-deep", colorDeep);
    if (activeIndex === index) select(index);
  };
  const extractItemColor = (index, sourceImage) => {
    if (banners[index].dataset.color) return;
    const src = sourceImage.currentSrc || sourceImage.src;
    if (!src) return;
    const cachedColor = getCachedColor2(src);
    if (cachedColor) {
      applyItemColor(index, normalizeHomeCenterColor(cachedColor));
      return;
    }
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.onload = () => {
      if (!container.isConnected) return;
      try {
        const dominantColor = window.ColorThief?.getColorSync(image);
        const rgb = dominantColor ? dominantColor.array() : getAverageColor(image);
        if (!rgb) return;
        const color = rgbToThemeHex(rgb);
        cacheColor2(src, color);
        applyItemColor(index, normalizeHomeCenterColor(color));
      } catch (error) {
      }
    };
    image.onerror = () => {
    };
    image.src = src;
  };
  const navigate = (link, event) => {
    if (!link) return;
    if (event?.metaKey || event?.ctrlKey) {
      window.open(link, "_blank");
    } else if (api.pjax?.loadUrl) {
      api.navigate(link);
    } else {
      window.location.href = link;
    }
  };
  const select = (index) => {
    if (!banners[index]) return;
    activeIndex = index;
    banners.forEach((banner2, bannerIndex) => {
      const isActive = bannerIndex === index;
      banner2.classList.toggle("active", isActive);
      banner2.setAttribute("aria-hidden", String(!isActive));
      banner2.tabIndex = isActive ? 0 : -1;
    });
    items.forEach((item, itemIndex) => {
      const isActive = itemIndex === index;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-current", String(isActive));
    });
    indicators.forEach(
      (indicator, indicatorIndex) => indicator.classList.toggle("active", indicatorIndex === index)
    );
    const selected = banners[index];
    const selectedStyle = getComputedStyle(selected);
    const color = selectedStyle.getPropertyValue("--home-center-theme").trim();
    const colorOp = selectedStyle.getPropertyValue("--home-center-theme-op").trim();
    const colorDeep = selectedStyle.getPropertyValue("--home-center-theme-op-deep").trim();
    titleLink.textContent = selected.dataset.title;
    titleLink.href = selected.dataset.link;
    titleTag.textContent = selected.dataset.label;
    container.style.setProperty("--current-theme", color);
    container.style.setProperty("--current-theme-op", colorOp);
    container.style.setProperty("--current-theme-op-deep", colorDeep);
    [categoryBar, profileCard].forEach((target) => {
      target?.style.setProperty("--current-banner-theme", color);
      target?.style.setProperty("--current-banner-theme-op", colorOp);
      target?.style.setProperty("--current-banner-theme-op-deep", colorDeep);
    });
    const profileTextColor = getReadableProfileTextColor(color);
    if (profileTextColor) {
      profileCard?.style.setProperty(
        "--profile-card-text-color",
        profileTextColor
      );
    }
  };
  items.forEach((item, index) => {
    item.addEventListener("mouseenter", () => select(index));
    item.addEventListener("focusin", () => select(index));
  });
  banners.forEach((item, index) => {
    let pointerType = "";
    item.addEventListener(
      "pointerdown",
      (event) => pointerType = event.pointerType,
      true
    );
    item.addEventListener("click", (event) => {
      if (pointerType === "touch" && window.innerWidth <= 768) {
        event.preventDefault();
        select(index);
      } else {
        navigate(item.dataset.link, event);
      }
      pointerType = "";
    });
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        navigate(item.dataset.link, event);
      }
    });
  });
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", (event) => {
      event.preventDefault();
      select(index);
      banner.scrollTo({ left: banner.clientWidth * index, behavior: "smooth" });
    });
  });
  banner.addEventListener("scroll", () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      if (window.innerWidth > 768 || !banner.clientWidth) return;
      select(Math.round(banner.scrollLeft / banner.clientWidth));
    });
  });
  select(0);
  banners.forEach((item, index) => {
    const configuredColor = item.dataset.color?.trim();
    if (configuredColor) {
      applyItemColor(index, configuredColor);
      return;
    }
    const image = item.querySelector(".home-center-cover-img");
    if (!image) return;
    if (image.complete && image.naturalWidth) {
      extractItemColor(index, image);
    } else {
      image.addEventListener("load", () => extractItemColor(index, image), {
        once: true
      });
    }
  });
};
var initTooltip = () => {
  const tooltip = document.querySelector(".custom-tooltip") || document.body.appendChild(
    Object.assign(document.createElement("div"), {
      className: "custom-tooltip"
    })
  );
  tooltip.style.opacity = "0";
  tooltip.style.backdropFilter = "none";
  if (!window.matchMedia("(hover: hover)").matches) return;
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );
  document.querySelectorAll("[heotip]").forEach((element) => {
    if (element.dataset.tooltipInitialized === "true") return;
    element.dataset.tooltipInitialized = "true";
    element.addEventListener("mouseenter", () => {
      tooltip.textContent = element.getAttribute("heotip");
      tooltip.style.left = "0";
      tooltip.style.top = "0";
      tooltip.style.backdropFilter = "blur(10px)";
      tooltip.style.opacity = "1";
      const targetRect = element.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const gap = 10;
      const maxLeft = window.innerWidth - tooltipRect.width - rootFontSize;
      const centeredLeft = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
      const left = Math.max(rootFontSize, Math.min(centeredLeft, maxLeft));
      const preferredTop = targetRect.top >= tooltipRect.height + gap ? targetRect.top - tooltipRect.height - gap : targetRect.bottom + gap;
      const maxTop = window.innerHeight - tooltipRect.height - rootFontSize;
      const top = Math.max(rootFontSize, Math.min(preferredTop, maxTop));
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    });
    element.addEventListener("mouseleave", () => {
      tooltip.style.backdropFilter = "none";
      tooltip.style.opacity = "0";
    });
  });
};
var initObserver = () => {
  const commentElement = document.getElementById("post-comment");
  const paginationElement = document.getElementById("pagination");
  const commentBarrageElement = document.querySelector(".comment-barrage");
  if (commentElement && paginationElement) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        paginationElement.classList.toggle("show-window", entry.isIntersecting);
        if (api.config.comment?.commentBarrage && commentBarrageElement) {
          commentBarrageElement.style.bottom = entry.isIntersecting ? "-200px" : "";
        }
      });
    });
    observer.observe(commentElement);
    lifecycle.add(() => observer.disconnect());
  }
};
var addCopyright = () => {
  if (!api.config.copyright) return;
  const { limit, author, link, source, info } = api.config.copyright;
  document.body.addEventListener("copy", (e) => {
    e.preventDefault();
    const copyText = window.getSelection().toString();
    const text = copyText.length > limit ? `${copyText}

${author}
${link}${window.location.href}
${source}
${info}` : copyText;
    e.clipboardData.setData("text", text);
  });
};
var asideStatus = () => {
  const status = api.saveToLocal.get("aside-status");
  document.documentElement.classList.toggle("hide-aside", status === "hide");
};
function initThemeColor() {
  const currentTop = window.scrollY || document.documentElement.scrollTop;
  const themeColor = currentTop > 0 ? "--efu-card-bg" : api.page.is_post ? "--efu-main" : "--efu-background";
  applyThemeColor2(
    getComputedStyle(document.documentElement).getPropertyValue(themeColor)
  );
}
api.initThemeColor = initThemeColor;
function applyThemeColor2(color) {
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const appleMobileWebAppMeta = document.querySelector(
    'meta[name="apple-mobile-web-app-status-bar-style"]'
  );
  themeColorMeta?.setAttribute("content", color);
  appleMobileWebAppMeta?.setAttribute("content", color);
  if (window.matchMedia("(display-mode: standalone)").matches) {
    document.body.style.backgroundColor = color;
  }
}
var handleThemeChange = (mode) => {
  const themeChange = window.globalFn?.themeChange || {};
  Object.values(themeChange).forEach((fn) => fn(mode));
  lifecycle.emit("themeChange", { theme: mode });
};
var actions = {
  lastWittyWord: "",
  wasPageHidden: false,
  musicPlaying: false,
  consoleNavState: null,
  randomPost() {
    const posts = api.config.random_posts || [];
    if (!posts.length) return;
    api.navigate(posts[api.randomNum(posts.length)]);
  },
  noop() {
  },
  navigateTo(url) {
    api.navigate(url);
  },
  openExternal(url) {
    if (url) window.open(url, "_blank", "noopener");
  },
  toggleTargetClass(target, event, element) {
    const selector = target || element?.dataset.solitudeTarget;
    const className = element?.dataset.solitudeClass || "show";
    document.querySelector(selector)?.classList.toggle(className);
  },
  setTargetClass(target, event, element) {
    const selector = target || element?.dataset.solitudeTarget;
    const className = element?.dataset.solitudeClass || "show";
    const enabled = element?.dataset.solitudeEnabled !== "false";
    document.querySelectorAll(selector).forEach((item) => item.classList.toggle(className, enabled));
  },
  runConfiguredAction(command) {
    const source = String(command || "").trim().replace(/;$/, "");
    const call = source.match(/^(?:Solitude\.)?([A-Za-z_$][\w$]*)\(\)$/);
    if (call && typeof api[call[1]] === "function") {
      api[call[1]]();
    } else {
      const navigation = source.match(/^(?:pjax\.loadUrl|Solitude\.navigate)\((['"])(.*?)\1\)$/);
      if (navigation) api.navigate(navigation[2]);
    }
    api.hideRightMenu?.();
  },
  scrollTo(elementId) {
    const targetElement = document.getElementById(elementId);
    if (targetElement) {
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scroll({ top: targetPosition, behavior: "smooth" });
    }
  },
  syncMusicState(isPlaying) {
    const $music = document.getElementById("nav-music");
    const $console = document.getElementById("consoleMusic");
    this.musicPlaying = Boolean(isPlaying);
    if ($music) {
      const capsule = $music;
      if (capsule.collapseTimer) window.clearTimeout(capsule.collapseTimer);
      capsule.collapseTimer = 0;
      capsule.classList.toggle("playing", this.musicPlaying);
      if (this.musicPlaying) {
        capsule.classList.remove("collapsing");
        capsule.classList.add("stretch");
      } else if (capsule.classList.contains("stretch") || capsule.classList.contains("collapsing")) {
        capsule.classList.add("collapsing");
        capsule.classList.remove("stretch");
        capsule.collapseTimer = window.setTimeout(() => {
          capsule.classList.remove("collapsing");
          capsule.collapseTimer = 0;
        }, 360);
      } else {
        capsule.classList.remove("collapsing", "stretch");
      }
    }
    $console?.classList.toggle("on", this.musicPlaying);
    if (api.rightMenu?.menuItems?.music?.[0]) {
      const $rmText = document.querySelector("#menu-music-toggle span");
      const $rmIcon = document.querySelector("#menu-music-toggle i");
      if ($rmText) {
        const label = this.musicPlaying ? api.config.right_menu.music.stop : api.config.right_menu.music.start;
        api.rightMenu.setLabel($rmText, label);
      }
      if ($rmIcon) {
        $rmIcon.className = `solitude fas ${this.musicPlaying ? "fa-pause" : "fa-play"}`;
      }
    }
  },
  musicScrubberBind() {
    const $music = document.getElementById("nav-music");
    const $hitarea = $music?.querySelector(".music-capsule-hitarea");
    const $tooltip = $music?.querySelector(".music-progress-tooltip");
    const $status = $music?.querySelector(".music-progress-status");
    if (!$music || !$hitarea || !$tooltip || $music.dataset.scrubberBound === "true") return;
    $music.dataset.scrubberBound = "true";
    const dragThreshold = 8;
    const keyboardSeekStep = 5;
    let activePointerId = null;
    let startX = 0;
    let startY = 0;
    let previewTime = 0;
    let previewDuration = 0;
    let previewSource = "";
    let isScrubbing = false;
    let suppressClick = false;
    let feedbackTimer = 0;
    const getAPlayer = () => $music.querySelector("meting-js")?.aplayer || null;
    const getDuration = (aplayer) => {
      const duration = Number(aplayer?.audio?.duration);
      return Number.isFinite(duration) && duration > 0 ? duration : 0;
    };
    const formatTime = (seconds) => {
      const value = Math.max(0, Number(seconds) || 0);
      const minutes = Math.floor(value / 60);
      const remaining = Math.floor(value % 60);
      return `${minutes}:${String(remaining).padStart(2, "0")}`;
    };
    const setFeedback = (time, duration, announce = false) => {
      const ratio = duration > 0 ? Math.min(1, Math.max(0, time / duration)) : 0;
      const label = `${formatTime(time)} / ${formatTime(duration)}`;
      $music.style.setProperty("--capsule-scrub-position", `${ratio * 100}%`);
      $tooltip.textContent = label;
      if (announce && $status) $status.textContent = label;
      return ratio;
    };
    const updatePreview = (aplayer, clientX) => {
      const rect = $music.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      previewTime = ratio * previewDuration;
      aplayer.disableTimeupdate = true;
      aplayer.bar?.set?.("played", ratio, "width");
      aplayer.lrc?.update?.(previewTime);
      if (aplayer.template?.ptime) {
        aplayer.template.ptime.textContent = formatTime(previewTime);
      }
      setFeedback(previewTime, previewDuration);
    };
    const restoreActualProgress = (aplayer) => {
      const duration = getDuration(aplayer);
      const currentTime = Math.min(
        duration,
        Math.max(0, Number(aplayer?.audio?.currentTime) || 0)
      );
      const ratio = duration > 0 ? currentTime / duration : 0;
      aplayer.bar?.set?.("played", ratio, "width");
      aplayer.lrc?.update?.(currentTime);
      if (aplayer.template?.ptime) {
        aplayer.template.ptime.textContent = formatTime(currentTime);
      }
      setFeedback(currentTime, duration);
    };
    const resetPointerState = () => {
      if (activePointerId !== null && $hitarea.hasPointerCapture?.(activePointerId)) {
        $hitarea.releasePointerCapture(activePointerId);
      }
      activePointerId = null;
      isScrubbing = false;
      previewTime = 0;
      previewDuration = 0;
      previewSource = "";
      $music.classList.remove("scrubbing", "keyboard-scrubbing");
    };
    const cancelScrub = () => {
      window.clearTimeout(feedbackTimer);
      const aplayer = getAPlayer();
      if (isScrubbing && aplayer) {
        aplayer.disableTimeupdate = false;
        restoreActualProgress(aplayer);
      }
      resetPointerState();
    };
    const showKeyboardFeedback = (time, duration) => {
      window.clearTimeout(feedbackTimer);
      setFeedback(time, duration, true);
      $music.classList.add("scrubbing", "keyboard-scrubbing");
      feedbackTimer = window.setTimeout(() => {
        $music.classList.remove("scrubbing", "keyboard-scrubbing");
      }, 900);
    };
    $hitarea.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary || event.pointerType === "mouse" && event.button !== 0) return;
      const aplayer = getAPlayer();
      const duration = getDuration(aplayer);
      if (!duration) return;
      window.clearTimeout(feedbackTimer);
      $music.classList.remove("scrubbing", "keyboard-scrubbing");
      activePointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      previewDuration = duration;
      previewSource = String(aplayer.audio?.currentSrc || aplayer.audio?.src || "");
      isScrubbing = false;
    });
    document.addEventListener("pointermove", (event) => {
      if (event.pointerId !== activePointerId) return;
      const deltaX = Math.abs(event.clientX - startX);
      const deltaY = Math.abs(event.clientY - startY);
      if (!isScrubbing) {
        if (deltaY >= dragThreshold && deltaY > deltaX) {
          resetPointerState();
          return;
        }
        if (deltaX < dragThreshold || deltaX <= deltaY) return;
        isScrubbing = true;
        $music.classList.add("scrubbing");
        $hitarea.setPointerCapture?.(event.pointerId);
      }
      const aplayer = getAPlayer();
      const currentSource = String(
        aplayer?.audio?.currentSrc || aplayer?.audio?.src || ""
      );
      if (!aplayer || previewSource && currentSource !== previewSource) {
        return cancelScrub();
      }
      event.preventDefault();
      updatePreview(aplayer, event.clientX);
    });
    document.addEventListener("pointerup", (event) => {
      if (event.pointerId !== activePointerId) return;
      const aplayer = getAPlayer();
      const currentSource = String(
        aplayer?.audio?.currentSrc || aplayer?.audio?.src || ""
      );
      if (isScrubbing && aplayer && (!previewSource || currentSource === previewSource)) {
        updatePreview(aplayer, event.clientX);
        aplayer.seek(previewTime);
        aplayer.disableTimeupdate = false;
        suppressClick = true;
        window.setTimeout(() => {
          suppressClick = false;
        }, 0);
      } else if (isScrubbing && aplayer) {
        aplayer.disableTimeupdate = false;
        restoreActualProgress(aplayer);
      }
      resetPointerState();
    });
    document.addEventListener("pointercancel", cancelScrub);
    document.addEventListener("click", (event) => {
      if (!suppressClick || !event.target?.closest?.("#nav-music")) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    }, true);
    $hitarea.addEventListener("keydown", (event) => {
      const aplayer = getAPlayer();
      const duration = getDuration(aplayer);
      if (!duration) return;
      const currentTime = Math.min(
        duration,
        Math.max(0, Number(aplayer.audio?.currentTime) || 0)
      );
      const targets = {
        ArrowLeft: currentTime - keyboardSeekStep,
        ArrowRight: currentTime + keyboardSeekStep,
        Home: 0,
        End: duration
      };
      if (!(event.key in targets)) return;
      event.preventDefault();
      event.stopPropagation();
      const target = Math.min(duration, Math.max(0, targets[event.key]));
      aplayer.seek(target);
      showKeyboardFeedback(target, duration);
    });
    document.addEventListener("solitude:beforeNavigate", cancelScrub);
  },
  musicBind() {
    const $meting = document.querySelector("#nav-music meting-js");
    const aplayer = $meting?.aplayer;
    if (!aplayer) {
      this.isMusicBind = false;
      return null;
    }
    this.isMusicBind = true;
    if (!aplayer.solitudeCapsuleBound) {
      aplayer.on("play", () => this.syncMusicState(true));
      aplayer.on("pause", () => this.syncMusicState(false));
      aplayer.on("ended", () => this.syncMusicState(false));
      aplayer.on("loadeddata", () => {
        if (typeof coverColor4 === "function") coverColor4(true);
        this.syncMusicState(Boolean(aplayer.audio && !aplayer.audio.paused));
      });
      aplayer.solitudeCapsuleBound = true;
    }
    this.syncMusicState(Boolean(aplayer.audio && !aplayer.audio.paused));
    return aplayer;
  },
  handleMusicClick(event) {
    if (event.target?.closest?.(".music-control-btn")) return;
    if (!this.musicPlaying) this.musicToggle();
  },
  musicToggle(isMeting = true) {
    const aplayer = this.musicBind();
    if (!aplayer) return;
    const shouldPlay = Boolean(aplayer.audio?.paused);
    if (!isMeting) {
      this.syncMusicState(shouldPlay);
      return;
    }
    shouldPlay ? aplayer.play() : aplayer.pause();
  },
  musicSkipBack() {
    document.querySelector("#nav-music meting-js")?.aplayer?.skipBack();
  },
  musicSkipForward() {
    document.querySelector("#nav-music meting-js")?.aplayer?.skipForward();
  },
  switchCommentBarrage() {
    const commentBarrageElement = document.querySelector(".comment-barrage");
    const consoleCommentBarrage = document.querySelector(
      "#consoleCommentBarrage"
    );
    if (!commentBarrageElement) return;
    const isDisplayed = window.getComputedStyle(commentBarrageElement).display === "flex";
    commentBarrageElement.style.display = isDisplayed ? "none" : "flex";
    consoleCommentBarrage?.classList.toggle("on", !isDisplayed);
    api.saveToLocal.set("commentBarrageSwitch", !isDisplayed, 0.2);
    if (api.rightMenu?.menuItems.barrage) {
      api.rightMenu.barrage(isDisplayed);
    }
  },
  switchHideAside() {
    const htmlClassList = document.documentElement.classList;
    const consoleHideAside = document.querySelector("#consoleHideAside");
    const isHideAside = htmlClassList.contains("hide-aside");
    api.saveToLocal.set("aside-status", isHideAside ? "show" : "hide", 1);
    htmlClassList.toggle("hide-aside");
    consoleHideAside.classList.toggle("on", !isHideAside);
  },
  initConsoleState() {
    const consoleHideAside = document.querySelector("#consoleHideAside");
    if (!consoleHideAside) return;
    consoleHideAside.classList.toggle(
      "on",
      document.documentElement.classList.contains("hide-aside")
    );
  },
  changeWittyWord() {
    const greetings = api.config.aside.witty_words || [];
    if (greetings.length === 0) {
      document.getElementById("sayhi").textContent = "Solitude";
      this.lastWittyWord = null;
      return;
    }
    const greetingElement = document.getElementById("sayhi");
    let randomGreeting;
    if (greetings.length === 1) {
      randomGreeting = greetings[0];
    } else {
      do {
        randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      } while (randomGreeting === this.lastWittyWord);
    }
    greetingElement.textContent = randomGreeting;
    this.lastWittyWord = randomGreeting;
  },
  switchDarkMode() {
    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";
    const newMode = isDarkMode ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newMode);
    api.saveToLocal.set("theme", newMode, 0.02);
    api.snackbarShow(api.config.lang.theme[newMode], false, 2e3);
    if (api.rightMenu) {
      api.rightMenu.mode(!isDarkMode);
      api.rightMenu.hideRightMenu();
    }
    handleThemeChange(newMode);
  },
  hideTodayCard: () => document.getElementById("todayCard").classList.add("hide"),
  toTop: () => api.scrollToDest(0),
  showConsole() {
    const consoleElement = document.getElementById("console");
    if (!consoleElement || consoleElement.classList.contains("show")) return;
    const header = document.getElementById("page-header");
    if (header) {
      this.consoleNavState = {
        fixed: header.classList.contains("nav-fixed"),
        visible: header.classList.contains("nav-visible")
      };
      header.classList.add("nav-fixed");
      header.classList.remove("nav-visible");
      header.classList.add("console-open");
    }
    consoleElement.classList.add("show");
    document.querySelector("#nav-console .console_switchbutton")?.classList.add("console-open");
  },
  hideConsole() {
    const consoleElement = document.getElementById("console");
    if (!consoleElement?.classList.contains("show")) return;
    consoleElement.classList.remove("show");
    document.querySelector("#nav-console .console_switchbutton")?.classList.remove("console-open");
    const header = document.getElementById("page-header");
    if (header && this.consoleNavState) {
      header.classList.remove("console-open");
      header.classList.toggle("nav-fixed", this.consoleNavState.fixed);
      header.classList.toggle("nav-visible", this.consoleNavState.visible);
    }
    this.consoleNavState = null;
  },
  toggleConsole() {
    const consoleElement = document.getElementById("console");
    if (consoleElement?.classList.contains("show")) {
      this.hideConsole();
    } else {
      this.showConsole();
    }
  },
  onConsoleCardGroupClick(event) {
    if (event.target.closest?.(".console-card")) return;
    this.hideConsole();
  },
  onNavBlankClickCloseConsole(event) {
    if (!document.getElementById("console")?.classList.contains("show")) return;
    if (event.target.closest?.(
      "a, button, .back-home-button, .menus_item, #page-name"
    )) {
      return;
    }
    this.hideConsole();
  },
  refreshWaterFall() {
    const allElements = [...document.querySelectorAll(".waterfall")];
    const elements = allElements.filter(
      (element) => element.dataset.solitudeWaterfall !== "true"
    );
    if (!elements.length) return;
    elements.forEach((element) => {
      element.dataset.solitudeWaterfall = "true";
    });
    const timers = /* @__PURE__ */ new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          const timer = setTimeout(() => {
            timers.delete(timer);
            if (!entry.target.isConnected) return;
            waterfall(entry.target).then(() => {
              if (entry.target.isConnected) entry.target.classList.add("show");
            });
          }, 300);
          timers.add(timer);
        }
      });
    });
    elements.forEach((element) => observer.observe(element));
    lifecycle.add(() => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    });
  },
  addRuntime() {
    if (!api.config.runtime) return;
    const runtime = api.timeDiff(new Date(api.config.runtime), /* @__PURE__ */ new Date()) + api.config.lang.day;
    document.querySelectorAll(".runtimeshow, #runtimeshow").forEach((element) => element.textContent = runtime);
  },
  toTalk(txt) {
    const inputs = [
      "#wl-edit",
      ".el-textarea__inner",
      "#veditor",
      ".atk-textarea"
    ];
    inputs.forEach((selector) => {
      const el = document.querySelector(selector);
      if (el) {
        el.dispatchEvent(
          new Event("input", { bubble: true, cancelable: true })
        );
        el.value = "> " + txt.replace(/\n/g, "\n> ") + "\n\n";
        api.scrollToDest(
          api.getEleTop(document.getElementById("post-comment")),
          300
        );
        el.focus();
        el.setSelectionRange(-1, -1);
      }
    });
    api.snackbarShow(api.config.lang.totalk, false, 2e3);
  },
  initbbtalk() {
    const bberTalkElement = document.querySelector("#bber-talk");
    if (bberTalkElement) {
      new Swiper(".swiper-container", {
        direction: "vertical",
        loop: true,
        autoplay: {
          delay: 3e3,
          pauseOnMouseEnter: true
        }
      });
    }
  },
  addPhotoFigcaption() {
    document.querySelectorAll(
      ".article-container img:not(.gallery-item img, .inline-img)"
    ).forEach((image) => {
      const captionText = image.getAttribute("alt");
      const figure = image.closest("figure");
      const hasFigureCaption = figure?.querySelector("figcaption");
      const hasGeneratedCaption = image.getAttribute("data-solitude-caption-ready") === "true" || image.nextElementSibling?.matches(".img-alt");
      if (!captionText || hasFigureCaption || hasGeneratedCaption) return;
      image.setAttribute("data-solitude-caption-ready", "true");
      image.insertAdjacentHTML(
        "afterend",
        `<div class="img-alt is-center">${api.escapeHtml(
          captionText
        )}</div>`
      );
    });
  },
  scrollToComment: () => api.scrollToDest(
    api.getEleTop(document.getElementById("post-comment")),
    300
  ),
  setTimeState() {
    const el = document.getElementById("sayhi");
    if (el) {
      let getLocalData = function(keys) {
        for (let key of keys) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              return JSON.parse(data);
            } catch (error) {
              localStorage.removeItem(key);
            }
          }
        }
        return null;
      };
      const hours = (/* @__PURE__ */ new Date()).getHours();
      const lang = api.config.aside.state;
      const localData = getLocalData([
        "twikoo",
        "WALINE_USER_META",
        "WALINE_USER",
        "_v_Cache_Meta",
        "ArtalkUser"
      ]);
      const nick = localData ? localData.nick || localData.display_name : null;
      const prefix = this.wasPageHidden ? api.config.aside.witty_comment.back + nick : api.config.aside.witty_comment.prefix + nick;
      const greetings = [
        { start: 0, end: 5, text: nick ? prefix : lang.goodnight },
        { start: 6, end: 10, text: nick ? prefix : lang.morning },
        { start: 11, end: 14, text: nick ? prefix : lang.noon },
        { start: 15, end: 18, text: nick ? prefix : lang.afternoon },
        { start: 19, end: 24, text: nick ? prefix : lang.night }
      ];
      const greeting = greetings.find(
        (g) => hours >= g.start && hours <= g.end
      );
      el.innerText = greeting.text;
    }
  },
  tagPageActive() {
    const decodedPath = decodeURIComponent(window.location.pathname);
    const isTagPage = /\/tags\/.*?\//.test(decodedPath);
    if (isTagPage) {
      const tag = decodedPath.split("/").slice(-2, -1)[0];
      const tagElement = document.getElementById(tag);
      if (tagElement) {
        document.querySelectorAll("a.select").forEach((link) => {
          link.classList.remove("select");
        });
        tagElement.classList.add("select");
      }
    }
  },
  categoriesBarActive() {
    const categoryBar = document.querySelector("#category-bar");
    const currentPath = decodeURIComponent(window.location.pathname);
    const isHomePage = currentPath === api.config.root;
    if (categoryBar) {
      const categoryItems = categoryBar.querySelectorAll(".category-bar-item");
      categoryItems.forEach((item) => item.classList.remove("select"));
      const activeItemId = isHomePage ? "category-bar-home" : currentPath.split("/").slice(-2, -1)[0];
      const activeItem = document.getElementById(activeItemId);
      if (activeItem) {
        activeItem.classList.add("select");
      }
    }
  },
  scrollCategoryBarToRight() {
    const scrollBar = document.getElementById("category-bar-items");
    const nextElement = document.getElementById("category-bar-next");
    if (scrollBar) {
      const isScrollBarAtEnd = () => scrollBar.scrollLeft + scrollBar.clientWidth >= scrollBar.scrollWidth - 8;
      const scroll = () => {
        scrollBar.scroll({
          left: isScrollBarAtEnd() ? 0 : scrollBar.clientWidth,
          behavior: "smooth"
        });
      };
      if (scrollBar.dataset.solitudeScrollBound !== "true") {
        scrollBar.dataset.solitudeScrollBound = "true";
        lifecycle.listen(scrollBar, "scroll", () => {
          clearTimeout(this.timeoutId);
          this.timeoutId = setTimeout(() => {
            if (nextElement) {
              nextElement.style.transform = isScrollBarAtEnd() ? "rotate(180deg)" : "";
            }
          }, 150);
        }, { passive: true });
      }
      scroll();
    }
  },
  openAllTags() {
    document.querySelectorAll(".card-allinfo .card-tag-cloud").forEach((tagCloudElement) => tagCloudElement.classList.add("all-tags"));
    document.getElementById("more-tags-btn")?.remove();
  },
  listenToPageInputPress() {
    const toGroup = document.querySelector(".toPageGroup");
    const pageText = document.getElementById("toPageText");
    if (!pageText) return;
    const pageButton = document.getElementById("toPageButton");
    const pageNumbers = document.querySelectorAll(".page-number");
    const lastPageNumber = +(pageNumbers[pageNumbers.length - 1]?.textContent || 1);
    if (lastPageNumber === 1) {
      if (toGroup) toGroup.style.display = "none";
      return;
    }
    lifecycle.listen(pageText, "keydown", (event) => {
      if (event.key === "Enter") {
        api.toPage();
        api.navigate(pageButton.href);
      }
    });
    lifecycle.listen(pageText, "input", () => {
      pageText.value = pageText.value.replace(/[^0-9]/g, "");
      if (pageText.value === "0") pageText.value = "";
      pageButton.classList.toggle(
        "haveValue",
        pageText.value !== "" && pageText.value !== "0"
      );
      if (+pageText.value > lastPageNumber) {
        pageText.value = lastPageNumber;
      }
    });
  },
  addNavBackgroundInit() {
    const scrollTop = document.documentElement.scrollTop;
    if (scrollTop !== 0) {
      document.getElementById("page-header").classList.add("nav-fixed", "nav-visible");
    }
  },
  toPage() {
    const pageNumbers = document.querySelectorAll(".page-number");
    const maxPageNumber = parseInt(
      pageNumbers[pageNumbers.length - 1].innerHTML
    );
    const inputElement = document.getElementById("toPageText");
    const inputPageNumber = parseInt(inputElement.value);
    document.getElementById("toPageButton").href = !isNaN(inputPageNumber) && inputPageNumber <= maxPageNumber && inputPageNumber > 1 ? window.location.href.replace(/\/page\/\d+\/$/, "/") + "page/" + inputPageNumber + "/" : "/";
  },
  owoBig(owoSelector) {
    let owoBig = document.getElementById("owo-big");
    if (!owoBig) {
      owoBig = document.createElement("div");
      owoBig.id = "owo-big";
      document.body.appendChild(owoBig);
    }
    const showOwoBig = (event) => {
      const target = event.target;
      const owoItem = target.closest(owoSelector.item);
      if (owoItem && target.closest(owoSelector.body)) {
        const imgSrc = owoItem.querySelector("img")?.src;
        if (imgSrc) {
          owoBig.innerHTML = `<img src="${imgSrc}" style="max-width: 100%; height: auto;">`;
          owoBig.style.display = "block";
          positionOwoBig(owoItem);
        }
      }
    };
    const hideOwoBig = (event) => {
      if (event.target.closest(owoSelector.item) && event.target.closest(owoSelector.body)) {
        owoBig.style.display = "none";
      }
    };
    const positionOwoBig = (owoItem) => {
      const itemRect = owoItem.getBoundingClientRect();
      owoBig.style.left = `${itemRect.left - owoBig.offsetWidth / 4}px`;
      owoBig.style.top = `${itemRect.top}px`;
    };
    lifecycle.listen(document, "mouseover", showOwoBig);
    lifecycle.listen(document, "mouseout", hideOwoBig);
  },
  changeTimeFormat(selector) {
    selector.forEach((item) => {
      const timeVal = item.getAttribute("datetime");
      item.textContent = api.diffDate(timeVal, true);
      item.style.display = "inline";
    });
  },
  switchComments() {
    const switchBtn = document.getElementById("switch-btn");
    if (!switchBtn) return;
    let switchDone = false;
    const commentContainer = document.getElementById("post-comment");
    const handleSwitchBtn = () => {
      commentContainer.classList.toggle("move");
      if (!switchDone && typeof loadTwoComment === "function") {
        switchDone = true;
        loadTwoComment();
      }
    };
    api.addEventListenerPjax(switchBtn, "click", handleSwitchBtn);
  },
  homeTypeit() {
    if (typeof home_subtitle === "undefined") return;
    const ty = new TypeIt(".banners-title-small", {
      speed: 200,
      waitUntilVisible: true,
      loop: true,
      lifeLike: true
    });
    home_subtitle.forEach((item) => {
      ty.type(item).pause(500).delete(item);
    });
    ty.go();
    lifecycle.add(() => ty.destroy?.());
  }
};
Object.assign(api, actions);
api.toggleTheme = () => api.switchDarkMode();
var toc = class {
  static init() {
    const tocContainer = document.getElementById("card-toc");
    if (!tocContainer) return;
    const el = tocContainer.querySelectorAll("#TableOfContents a, .toc a");
    if (!el.length) {
      tocContainer.style.display = "none";
      return;
    }
    el.forEach((e) => {
      e.addEventListener("click", (event) => {
        event.preventDefault();
        api.scrollToDest(
          api.getEleTop(
            document.getElementById(
              decodeURI(
                (event.target.className === "toc-text" ? event.target.parentNode.hash : event.target.hash).replace("#", "")
              )
            )
          ),
          300
        );
      });
    });
    this.active(el);
  }
  static active(toc2) {
    const $article = document.querySelector(".article-container");
    const $tocContent = document.getElementById("toc-content");
    const list = $article.querySelectorAll("h1,h2,h3,h4,h5,h6");
    let detectItem = "";
    const autoScroll = (el) => {
      const activePosition = el.getBoundingClientRect().top;
      const sidebarScrollTop = $tocContent.scrollTop;
      if (activePosition > document.documentElement.clientHeight - 100) {
        $tocContent.scrollTop = sidebarScrollTop + 150;
      }
      if (activePosition < 100) {
        $tocContent.scrollTop = sidebarScrollTop - 150;
      }
    };
    const findHeadPosition = (top) => {
      if (top === 0) return false;
      let currentIndex = "";
      list.forEach((ele, index) => {
        if (top > api.getEleTop(ele) - 80) {
          currentIndex = index;
        }
      });
      if (detectItem === currentIndex) return;
      detectItem = currentIndex;
      document.querySelectorAll("#TableOfContents .active, .toc .active").forEach((i) => {
        i.classList.remove("active");
      });
      const activeitem = toc2[detectItem];
      if (activeitem) {
        let parent = toc2[detectItem].parentNode;
        activeitem.classList.add("active");
        autoScroll(activeitem);
        for (; parent && !parent.matches("#TableOfContents, .toc"); parent = parent.parentNode) {
          if (parent.matches("li")) parent.classList.add("active");
        }
      }
    };
    const tocScrollFn = api.throttle(() => {
      const currentTop = window.scrollY || document.documentElement.scrollTop;
      findHeadPosition(currentTop);
    }, 100);
    lifecycle.listen(window, "scroll", tocScrollFn, { passive: true });
  }
};
var tabs = class {
  static init() {
    this.clickFnOfTabs();
  }
  static clickFnOfTabs() {
    document.querySelectorAll(".article-container .tab > button").forEach((item) => {
      item.addEventListener("click", function() {
        const $tabItem = this.parentNode;
        if (!$tabItem.classList.contains("active")) {
          const $tabContent = $tabItem.parentNode.nextElementSibling;
          const $siblings = api.siblings($tabItem, ".active")[0];
          $siblings && $siblings.classList.remove("active");
          $tabItem.classList.add("active");
          const tabId = this.getAttribute("data-href").replace("#", "");
          [...$tabContent.children].forEach((item2) => {
            item2.classList.toggle("active", item2.id === tabId);
          });
        }
      });
    });
  }
  static expireAddListener() {
    const { expire } = api.config;
    if (!expire) return;
    const list = document.querySelectorAll(".post-meta-date time");
    const post_date = list.length ? list[list.length - 1] : document.querySelector(".datetime");
    if (!post_date) return;
    const ex = Math.ceil(
      ((/* @__PURE__ */ new Date()).getTime() - new Date(post_date.getAttribute("datetime")).getTime()) / 1e3 / 60 / 60 / 24
    );
    if (expire.time > ex) return;
    const ele = document.createElement("div");
    ele.className = "expire";
    ele.innerHTML = `<i class="solitude fas fa-circle-exclamation"></i>${expire.text_prev}${-(expire.time - ex)}${expire.text_next}`;
    const articleContainer = document.querySelector(".article-container");
    articleContainer.insertAdjacentElement(
      expire.position === "top" ? "afterbegin" : "beforeend",
      ele
    );
  }
};
var scrollFnToDo = () => {
  const { toc: toc2 } = api.page;
  if (toc2) {
    const $cardTocLayout = document.getElementById("card-toc");
    const $cardToc = $cardTocLayout.querySelector(".toc-content");
    const tocItemClickFn = (e) => {
      const target = e.target.closest(".toc-link");
      if (!target) return;
      e.preventDefault();
      api.scrollToDest(
        api.getEleTop(
          document.getElementById(
            decodeURI(target.getAttribute("href")).replace("#", "")
          )
        ),
        300
      );
      if (window.innerWidth < 900) {
        $cardTocLayout.classList.remove("open");
      }
    };
    api.addEventListenerPjax($cardToc, "click", tocItemClickFn);
  }
};
var forPostFn = () => {
  scrollFnToDo();
};
var initPostCoverTilt = () => {
  const cover = document.querySelector(".post-cover-aside");
  const canTilt = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (!cover || !canTilt || reduceMotion) return;
  const updateTilt = (event) => {
    const rect = cover.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 10;
    const rotateY = (x - 0.5) * 10;
    cover.style.setProperty("--post-cover-glow-x", `${(x * 100).toFixed(2)}%`);
    cover.style.setProperty("--post-cover-glow-y", `${(y * 100).toFixed(2)}%`);
    cover.style.setProperty("--post-cover-rotate-x", `${rotateX.toFixed(2)}deg`);
    cover.style.setProperty("--post-cover-rotate-y", `${rotateY.toFixed(2)}deg`);
    cover.style.setProperty("--post-cover-img-x", `${(-rotateY).toFixed(2)}px`);
    cover.style.setProperty("--post-cover-img-y", `${rotateX.toFixed(2)}px`);
  };
  const resetTilt = () => {
    cover.style.setProperty("--post-cover-rotate-x", "0deg");
    cover.style.setProperty("--post-cover-rotate-y", "0deg");
    cover.style.setProperty("--post-cover-img-x", "0px");
    cover.style.setProperty("--post-cover-img-y", "0px");
  };
  lifecycle.listen(cover, "pointerenter", updateTilt);
  lifecycle.listen(cover, "pointermove", updateTilt);
  lifecycle.listen(cover, "pointerleave", resetTilt);
  lifecycle.listen(cover, "pointercancel", resetTilt);
};
var getAboutValue = (source, path) => {
  if (!path) return source;
  return String(path).split(".").filter(Boolean).reduce((value, key) => value?.[key], source);
};
var initAboutPage = () => {
  const aboutPage = document.getElementById("about-page");
  if (!aboutPage) return;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const words = Array.from(aboutPage.querySelectorAll("[data-about-word]"));
  if (words.length > 1 && !reduceMotion) {
    let wordIndex = 0;
    const rotateWord = () => {
      const previous = words[wordIndex];
      wordIndex = (wordIndex + 1) % words.length;
      const next = words[wordIndex];
      words.forEach((word) => {
        word.removeAttribute("data-show");
        word.removeAttribute("data-up");
      });
      previous.setAttribute("data-up", "");
      next.setAttribute("data-show", "");
    };
    const wordTimer = window.setInterval(rotateWord, 2e3);
    lifecycle.add(() => window.clearInterval(wordTimer));
  }
  const canHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  if (canHover && !reduceMotion) {
    aboutPage.querySelectorAll(".author-content-item").forEach((card) => {
      let glow = card.querySelector(":scope > .about-pointer-glow");
      if (!glow) {
        glow = document.createElement("div");
        glow.className = "about-pointer-glow";
        glow.setAttribute("aria-hidden", "true");
        card.prepend(glow);
      }
      card.classList.add("about-glow-host");
      const updateGlowPosition = (event) => {
        const rect = card.getBoundingClientRect();
        glow.style.left = `${event.clientX - rect.left}px`;
        glow.style.top = `${event.clientY - rect.top}px`;
      };
      lifecycle.listen(card, "pointerenter", updateGlowPosition);
      lifecycle.listen(card, "pointermove", updateGlowPosition);
    });
  }
  aboutPage.querySelectorAll("[data-about-stats]").forEach(async (host) => {
    const configNode = host.querySelector("[data-about-stats-config]");
    if (!configNode?.textContent) return;
    let config;
    try {
      config = JSON.parse(configNode.textContent);
    } catch {
      return;
    }
    const url = config?.source?.url?.trim?.();
    if (!url) return;
    const requestController = new AbortController();
    const abortRequest = () => requestController.abort();
    lifecycle.signal.addEventListener("abort", abortRequest, { once: true });
    const timeout = window.setTimeout(abortRequest, 5e3);
    lifecycle.add(() => {
      window.clearTimeout(timeout);
      lifecycle.signal.removeEventListener("abort", abortRequest);
      requestController.abort();
    });
    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "omit",
        headers: { Accept: "application/json" },
        signal: requestController.signal
      });
      if (!response.ok) return;
      const payload = await response.json();
      const data = getAboutValue(payload, config.source.response_path);
      config.metrics?.forEach((metric) => {
        const rawValue = getAboutValue(data, metric.field);
        const value = typeof rawValue === "number" ? rawValue : Number(rawValue);
        if (!Number.isFinite(value)) return;
        const output = Array.from(host.querySelectorAll("[data-about-metric]")).find((node) => node.dataset.aboutMetric === metric.field);
        if (output) output.textContent = value.toLocaleString();
      });
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.debug("Solitude About statistics kept fallback values.");
      }
    } finally {
      window.clearTimeout(timeout);
      lifecycle.signal.removeEventListener("abort", abortRequest);
    }
  });
};
var initGalleryMasonry = () => {
  const galleries = [...document.querySelectorAll(".tag-gallery")];
  if (!galleries.length) return;
  const frames = /* @__PURE__ */ new Set();
  const observers = [];
  galleries.forEach((gallery) => {
    const items = [...gallery.children].filter(
      (item) => item.classList.contains("gallery-item")
    );
    if (!items.length) return;
    const layout = () => {
      if (!gallery.isConnected) return;
      const style = window.getComputedStyle(gallery);
      const rowHeight = Number.parseFloat(style.gridAutoRows) || 1;
      const rowGap = Number.parseFloat(style.rowGap) || 0;
      items.forEach((item) => {
        item.style.gridRowEnd = "auto";
      });
      gallery.classList.add("is-masonry-ready");
      items.forEach((item) => {
        const itemHeight = item.getBoundingClientRect().height;
        const span = Math.max(
          1,
          Math.ceil((itemHeight + rowGap) / (rowHeight + rowGap))
        );
        item.style.gridRowEnd = `span ${span}`;
      });
    };
    const scheduleLayout = () => {
      const frame = requestAnimationFrame(() => {
        frames.delete(frame);
        layout();
      });
      frames.add(frame);
    };
    const resizeObserver = new ResizeObserver(scheduleLayout);
    resizeObserver.observe(gallery);
    items.forEach((item) => resizeObserver.observe(item));
    observers.push(resizeObserver);
    gallery.querySelectorAll("img").forEach((image) => {
      if (!image.complete) {
        lifecycle.listen(image, "load", scheduleLayout, { once: true });
        lifecycle.listen(image, "error", scheduleLayout, { once: true });
      }
    });
    scheduleLayout();
  });
  lifecycle.add(() => {
    observers.forEach((observer) => observer.disconnect());
    frames.forEach(cancelAnimationFrame);
  });
};
api.refresh = async () => {
  lifecycle.disposePage();
  const { is_home, is_page, page, is_post } = api.page;
  const { runtime, lazyload, lightbox, randomlink, covercolor, expire } = api.config;
  const timeSelector = ".datetime, .webinfo-item time, .post-meta-date time";
  document.body.setAttribute("data-type", page);
  document.body.setAttribute("data-right-menu", String(Boolean(api.config.right_menu)));
  await loadFeatureModules();
  api.changeTimeFormat(document.querySelectorAll(timeSelector));
  runtime && api.addRuntime();
  [
    scrollFn,
    sidebarFn,
    initAsideTagCloudOverflow,
    initTooltip,
    () => api.addPhotoFigcaption(),
    () => api.setTimeState(),
    () => api.tagPageActive(),
    () => api.categoriesBarActive(),
    () => api.listenToPageInputPress(),
    () => api.musicScrubberBind(),
    () => api.musicBind(),
    () => api.addNavBackgroundInit(),
    initGalleryMasonry,
    () => api.refreshWaterFall()
  ].forEach((fn) => fn());
  lazyload.enable && api.lazyloadImg();
  lightbox && api.lightbox(
    document.querySelectorAll(
      ".article-container img:not(.flink-avatar,.gallery-group img, .no-lightbox)"
    )
  );
  randomlink && api.randomLinksList?.();
  api.config.friend_links.async && api.friendLinks?.init();
  if (is_post) {
    initPostCoverTilt();
  }
  api.switchComments();
  initObserver();
  if (is_home) {
    showTodayCard();
    initHomeCenter();
    api.homeTypeit();
  }
  typeof updatePostsBasedOnComments === "function" && updatePostsBasedOnComments();
  if (is_post || is_page) {
    if (document.querySelector("[data-code-block]")) {
      const { initializeCodeBlocks: initializeCodeBlocks2 } = await Promise.resolve().then(() => (init_code_highlight(), code_highlight_exports));
      void initializeCodeBlocks2(lifecycle.signal);
    }
    tabs.init();
  }
  if (is_post && expire) {
    tabs.expireAddListener();
  }
  if (covercolor.enable) coverColor4();
  if (api.page.toc) toc.init();
  if (page === "music") {
    initializeMusicPlayer2();
    lifecycle.add(() => api.musicPlayer?.destroy?.());
  }
  if (page === "archives") {
    const { archivePageController: archivePageController2, initArchivePage: initArchivePage2 } = await Promise.resolve().then(() => (init_archive_page(), archive_page_exports));
    initArchivePage2();
    lifecycle.add(() => archivePageController2.destroy());
  }
  initAboutPage();
  forPostFn();
};
var initializeApp = async () => {
  initActionDelegation(api);
  initPreloader(api);
  addCopyright();
  await api.refresh();
  asideStatus();
  window.onscroll = percent;
  api.initConsoleState();
  lifecycle.emit("ready", { config: api.config, page: api.page });
};
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
} else {
  initializeApp();
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    api.wasPageHidden = true;
  }
});
window.onkeydown = (e) => {
  const { code, ctrlKey, shiftKey } = e;
  if (code === "F12" || ctrlKey && shiftKey && (code === "KeyI" || code === "KeyC")) {
    api.snackbarShow(api.config.lang.f12, false, 3e3);
  }
  if (code === "Escape") {
    api.hideConsole();
  }
};
document.addEventListener("copy", () => {
  api.snackbarShow(api.config.lang.copy.success, false, 3e3);
});

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\comments.ts
init_api();
var routeChunkSize = 40;
var postCardPageSize = 1e3;
var postCardAvatarLimit = 5;
var aggregateCacheVersion = 3;
var aggregateRequest = null;
var countRequest = null;
var md5Request = null;
var postCardRequests = /* @__PURE__ */ new Map();
var providers = () => String(api.config.comment?.use || "").split(",").map((name) => name.trim().toLowerCase()).filter(Boolean);
var runtimeConfig = () => api.config.comment_runtime || {};
var valineConfig = () => {
  const config = api.config.valine || {};
  return config;
};
var commentBarrageEnabled = () => Boolean(api.config.comment?.commentBarrage);
var valineReady = () => {
  const config = valineConfig();
  return Boolean(config.appId && config.appKey && config.serverURLs);
};
var commentText = (key, fallback) => api.config.lang?.comments?.[key] || fallback;
var formatCommentText = (key, fallback, values) => Object.entries(values).reduce(
  (text, [name, value]) => text.split(`\${${name}}`).join(String(value)),
  commentText(key, fallback)
);
var routeEntries = () => Object.entries(runtimeConfig().routes || {});
var chunks = (items, size) => {
  const result = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
};
var stableSignature = (source) => {
  let hash = 5381;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash << 5) + hash ^ source.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
};
var requestValine = async (parameters) => {
  const config = valineConfig();
  const endpoint = new URL(
    `${String(config.serverURLs).replace(/\/$/, "")}/1.1/classes/Comment`
  );
  Object.entries(parameters).forEach(
    ([key, value]) => endpoint.searchParams.set(key, String(value))
  );
  const response = await fetch(endpoint, {
    headers: {
      "X-LC-Id": String(config.appId),
      "X-LC-Key": String(config.appKey),
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) throw new Error(`Valine request failed with ${response.status}`);
  return response.json();
};
var loadMd5 = () => {
  if (typeof window.md5 === "function") {
    return Promise.resolve(window.md5);
  }
  if (md5Request) return md5Request;
  const source = api.config.cdn?.blueimp_md5;
  md5Request = source ? api.loadScript(source).then(
    () => typeof window.md5 === "function" ? window.md5 : void 0
  ).catch(() => void 0) : Promise.resolve(void 0);
  return md5Request;
};
var avatarUrl = async (mail = "") => {
  const fallback = runtimeConfig().default_avatar || "/img/default_avatar.avif";
  if (!mail.trim()) return fallback;
  const md5 = await loadMd5();
  if (!md5) return fallback;
  const root = String(api.config.comment?.avatar || "https://weavatar.com").replace(/\/$/, "").replace(/\/avatar$/, "");
  return `${root}/avatar/${md5(mail.trim().toLowerCase())}`;
};
var summarize = (source = "") => {
  const image = `[${commentText("image", "Image")}]`;
  const link = `[${commentText("link", "Link")}]`;
  const code = `[${commentText("code", "Code")}]`;
  const emoji = `[${commentText("emoji", "Emoji")}]`;
  return String(source).replace(/```[\s\S]*?```/g, code).replace(/<pre[\s\S]*?<\/pre>/gi, code).replace(/!\[[^\]]*\]\([^)]*\)/g, image).replace(/<img\b[^>]*>/gi, image).replace(/\[[^\]]*\]\([^)]*\)/g, link).replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, link).replace(/:[a-z0-9_\u4e00-\u9fa5]+:/gi, emoji).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 150);
};
var normalizeRecords = async (records) => {
  const routes = runtimeConfig().routes || {};
  const normalized = await Promise.all(
    records.map(async (record) => {
      const url = String(record.url || "");
      if (!routes[url]) return null;
      const nick = String(record.nick || "").trim() || commentText("anonymous", "Anonymous");
      const normalizedMail = String(record.mail || "").trim().toLowerCase();
      return {
        id: String(record.objectId || `${url}-${record.createdAt || ""}`),
        nick,
        participantKey: normalizedMail ? `mail:${stableSignature(normalizedMail)}` : `nick:${nick.toLocaleLowerCase()}`,
        content: summarize(record.comment),
        url,
        title: routes[url],
        avatar: await avatarUrl(record.mail),
        date: String(record.updatedAt || record.createdAt || "")
      };
    })
  );
  return normalized.filter((item) => Boolean(item));
};
var aggregateLimit = () => Math.max(
  Number(api.config.comment?.newest_comment?.limit || 5),
  Number(api.config.recent_comments?.limit || 50),
  8
);
var cacheTtl = () => {
  const values = [
    api.config.comment?.newest_comment?.storage,
    api.config.console?.recentComment?.storage,
    api.config.recent_comments?.cache
  ].map(Number).filter((value) => Number.isFinite(value) && value > 0);
  return values.length ? Math.min(...values) : 0;
};
var routeCacheSignature = () => {
  const source = routeEntries().map(([path]) => path).sort().join("|");
  return stableSignature(source);
};
var aggregateCacheKey = () => `valine-hugo-comments:v${aggregateCacheVersion}:${location.host}:${routeCacheSignature()}`;
var countCacheKey = () => `valine-hugo-count:v${aggregateCacheVersion}:${location.host}:${routeCacheSignature()}`;
var postCardCacheKey = (signature) => `valine-hugo-post-card:v${aggregateCacheVersion}:${location.host}:${signature}`;
var fetchAggregateComments = () => {
  if (aggregateRequest) return aggregateRequest;
  const routes = routeEntries();
  const allowed = new Set(routes.map(([path]) => path));
  const cached = api.saveToLocal.get(aggregateCacheKey());
  if (cached) {
    aggregateRequest = Promise.resolve(cached.filter((item) => allowed.has(item.url)));
    return aggregateRequest;
  }
  aggregateRequest = (async () => {
    if (!routes.length) return [];
    const limit = aggregateLimit();
    const responses = await Promise.all(
      chunks(
        routes.map(([path]) => path),
        routeChunkSize
      ).map(
        (paths) => requestValine({
          where: JSON.stringify({ url: { $in: paths } }),
          order: "-createdAt",
          limit
        })
      )
    );
    const records = responses.flatMap((response) => response.results || []);
    const unique = [
      ...new Map(records.map((record) => [record.objectId, record])).values()
    ];
    const result = (await normalizeRecords(unique)).sort((left, right) => Date.parse(right.date) - Date.parse(left.date)).slice(0, limit);
    if (result.length) {
      api.saveToLocal.set(aggregateCacheKey(), result, cacheTtl());
    }
    return result;
  })().catch((error) => {
    aggregateRequest = null;
    throw error;
  });
  return aggregateRequest;
};
var fetchPostCardComments = (paths) => {
  const availableRoutes = runtimeConfig().routes || {};
  const allowedPaths = [...new Set(paths)].filter((path) => Boolean(availableRoutes[path])).sort();
  if (!allowedPaths.length) return Promise.resolve([]);
  const signature = stableSignature(allowedPaths.join("|"));
  const activeRequest = postCardRequests.get(signature);
  if (activeRequest) return activeRequest;
  const cached = api.saveToLocal.get(
    postCardCacheKey(signature)
  );
  if (cached) {
    const result = Promise.resolve(
      cached.filter((comment) => allowedPaths.includes(comment.url))
    );
    postCardRequests.set(signature, result);
    return result;
  }
  const request = (async () => {
    const records = [];
    for (const pathGroup of chunks(allowedPaths, routeChunkSize)) {
      let skip = 0;
      while (true) {
        const response = await requestValine({
          where: JSON.stringify({ url: { $in: pathGroup } }),
          keys: "objectId,nick,mail,url,createdAt,updatedAt",
          order: "-createdAt",
          limit: postCardPageSize,
          skip
        });
        const page = response.results || [];
        records.push(...page);
        if (page.length < postCardPageSize) break;
        skip += page.length;
      }
    }
    const unique = [
      ...new Map(
        records.map((record) => [
          record.objectId || `${record.url || ""}-${record.createdAt || ""}-${record.nick || ""}`,
          record
        ])
      ).values()
    ];
    const result = (await normalizeRecords(unique)).sort(
      (left, right) => Date.parse(right.date) - Date.parse(left.date)
    );
    api.saveToLocal.set(postCardCacheKey(signature), result, cacheTtl());
    return result;
  })();
  postCardRequests.set(signature, request);
  void request.catch(() => postCardRequests.delete(signature));
  return request;
};
var fetchAggregateCount = () => {
  if (countRequest) return countRequest;
  const cached = api.saveToLocal.get(countCacheKey());
  if (typeof cached === "number") {
    countRequest = Promise.resolve(cached);
    return countRequest;
  }
  const paths = routeEntries().map(([path]) => path);
  countRequest = (async () => {
    if (!paths.length) return 0;
    const responses = await Promise.all(
      chunks(paths, routeChunkSize).map(
        (group) => requestValine({
          where: JSON.stringify({ url: { $in: group } }),
          count: 1,
          limit: 0
        })
      )
    );
    const count = responses.reduce(
      (total, response) => total + Number(response.count || 0),
      0
    );
    if (count > 0) {
      api.saveToLocal.set(countCacheKey(), count, cacheTtl());
    }
    return count;
  })().catch((error) => {
    countRequest = null;
    throw error;
  });
  return countRequest;
};
var fetchPageComments = async (path) => {
  const response = await requestValine({
    where: JSON.stringify({ url: path }),
    order: "-createdAt",
    limit: 1e3
  });
  return normalizeRecords(response.results || []);
};
var setStatus = (container, message, state) => {
  const status = document.createElement("div");
  status.className = `comment-status is-${state}`;
  status.textContent = message;
  container.replaceChildren(status);
};
var createAvatar = (comment) => {
  const image = document.createElement("img");
  image.className = "nolazyload";
  image.src = comment.avatar;
  image.alt = comment.nick;
  image.loading = "lazy";
  image.addEventListener(
    "error",
    () => {
      image.src = runtimeConfig().default_avatar || "/img/default_avatar.avif";
    },
    { once: true }
  );
  return image;
};
var renderPostCardParticipants = async () => {
  const containers = [
    ...document.querySelectorAll(
      ".post-card-commenters[data-comment-path]"
    )
  ].filter((container) => !container.dataset.commentState);
  if (!containers.length) return;
  containers.forEach((container) => {
    container.dataset.commentState = "loading";
  });
  try {
    const comments = await fetchPostCardComments(
      containers.map((container) => container.dataset.commentPath || "")
    );
    const participantsByPath = /* @__PURE__ */ new Map();
    comments.forEach((comment) => {
      const participants = participantsByPath.get(comment.url) || /* @__PURE__ */ new Map();
      if (!participants.has(comment.participantKey)) {
        participants.set(comment.participantKey, comment);
      }
      participantsByPath.set(comment.url, participants);
    });
    containers.forEach((container) => {
      if (!container.isConnected) return;
      const pathParticipants = participantsByPath.get(container.dataset.commentPath || "")?.values();
      const participants = [...pathParticipants || []];
      if (!participants.length) {
        container.dataset.commentState = "empty";
        return;
      }
      const visible = participants.slice(0, postCardAvatarLimit);
      const remaining = participants.length - visible.length;
      const fragment = document.createDocumentFragment();
      visible.forEach((comment) => {
        const item = document.createElement("span");
        item.className = "post-card-commenter";
        item.title = comment.nick;
        item.setAttribute("aria-hidden", "true");
        const avatar = createAvatar(comment);
        avatar.alt = "";
        item.append(avatar);
        fragment.append(item);
      });
      const moreText = remaining ? formatCommentText(
        "moreParticipants",
        "${count} more participants",
        { count: remaining }
      ) : "";
      if (remaining) {
        const more = document.createElement("span");
        more.className = "post-card-commenter-more";
        more.textContent = `+${remaining}`;
        more.title = moreText;
        more.setAttribute("aria-hidden", "true");
        fragment.append(more);
      }
      const names = visible.map((comment) => comment.nick).join(", ");
      const participantText = formatCommentText(
        "participants",
        "Comment participants: ${names}",
        { names }
      );
      container.setAttribute("role", "group");
      container.setAttribute(
        "aria-label",
        moreText ? `${participantText}; ${moreText}` : participantText
      );
      container.replaceChildren(fragment);
      container.hidden = false;
      container.dataset.commentState = "ready";
      container.parentElement?.querySelector(".article-meta.tags")?.setAttribute("hidden", "");
    });
    window.lazyLoadInstance?.update?.();
  } catch {
    containers.forEach((container) => {
      if (container.isConnected) container.dataset.commentState = "error";
    });
  }
};
var refreshTimes = (container) => {
  api.changeTimeFormat?.(container.querySelectorAll("time"));
  window.lazyLoadInstance?.update?.();
  api.pjax?.refresh?.();
};
var renderAside = (container, comments) => {
  const limit = Number(api.config.comment?.newest_comment?.limit || 5);
  const items = comments.slice(0, limit);
  container.setAttribute("aria-busy", "false");
  if (!items.length) {
    setStatus(container, commentText("empty", "No comments yet"), "empty");
    return;
  }
  const fragment = document.createDocumentFragment();
  items.forEach((comment) => {
    const item = document.createElement("a");
    item.className = "aside-list-item";
    item.href = comment.url;
    item.title = comment.title;
    const thumbnail = document.createElement("div");
    thumbnail.className = "thumbnail";
    const avatar = createAvatar(comment);
    avatar.alt = "";
    thumbnail.append(avatar);
    const content = document.createElement("div");
    content.className = "content";
    const meta = document.createElement("div");
    meta.className = "comment-meta";
    const author = document.createElement("span");
    author.className = "comment-author";
    author.textContent = comment.nick;
    const time = document.createElement("time");
    time.className = "datetime";
    time.dateTime = comment.date;
    meta.append(author, time);
    const summary = document.createElement("div");
    summary.className = "comment";
    summary.textContent = comment.content || commentText("empty", "No comments yet");
    const source = document.createElement("div");
    source.className = "comment-source";
    const sourceIcon = document.createElement("i");
    sourceIcon.className = "solitude fas fa-file-lines";
    sourceIcon.setAttribute("aria-hidden", "true");
    const sourceTitle = document.createElement("span");
    sourceTitle.textContent = comment.title;
    source.append(sourceIcon, sourceTitle);
    content.append(meta, summary, source);
    item.append(thumbnail, content);
    fragment.append(item);
  });
  container.replaceChildren(fragment);
  refreshTimes(container);
};
var createCommentCard = (comment) => {
  const card = document.createElement("div");
  card.className = "comment-card";
  card.title = comment.title;
  card.dataset.solitudeAction = "navigateTo";
  card.dataset.solitudeUrl = comment.url;
  const info = document.createElement("div");
  info.className = "comment-info";
  info.append(createAvatar(comment));
  const user = document.createElement("span");
  user.className = "comment-user";
  user.textContent = comment.nick;
  const userMeta = document.createElement("div");
  userMeta.append(user);
  const time = document.createElement("time");
  time.className = "comment-time";
  time.dateTime = comment.date;
  info.append(userMeta, time);
  const content = document.createElement("div");
  content.className = "comment-content";
  content.textContent = comment.content || commentText("empty", "No comments yet");
  const title = document.createElement("div");
  title.className = "comment-title";
  const icon = document.createElement("i");
  icon.className = "solitude fas fa-comment";
  title.append(icon, document.createTextNode(` ${comment.title}`));
  card.append(info, content, title);
  return card;
};
var renderCards = (container, comments, limit) => {
  const items = comments.slice(0, limit);
  if (!items.length) {
    container.textContent = commentText("empty", "No comments yet");
    return;
  }
  container.replaceChildren(...items.map(createCommentCard));
  api.diffDateFormat?.(container.querySelectorAll("time.comment-time"));
  window.lazyLoadInstance?.update?.();
  api.pjax?.refresh?.();
};
var renderAggregateSurfaces = async () => {
  const aside = [...document.querySelectorAll(".card-recent-comment .aside-list")];
  const consoleList = document.querySelector(".console_recentcomments");
  const recentPage = document.querySelector("#page .console_recentcomments.recent-comments-list");
  if (!aside.length && !consoleList && !recentPage) return;
  try {
    const comments = await fetchAggregateComments();
    aside.forEach((container) => renderAside(container, comments));
    if (consoleList) renderCards(consoleList, comments, 6);
    if (recentPage) {
      renderCards(
        recentPage,
        comments,
        Number(api.config.recent_comments?.limit || 50)
      );
    }
  } catch {
    aside.forEach((container) => {
      container.setAttribute("aria-busy", "false");
      setStatus(
        container,
        commentText("error", "Unable to load comments"),
        "error"
      );
    });
    [consoleList, recentPage].filter((container) => Boolean(container)).forEach((container) => {
      container.textContent = commentText("error", "Unable to load comments");
    });
  }
};
var renderAggregateCount = async () => {
  const target = document.getElementById("valine_allcount");
  if (!target) return;
  try {
    target.textContent = String(await fetchAggregateCount());
  } catch {
    target.textContent = "\u2013";
    target.title = commentText("error", "Unable to load comments");
  }
};
var initializePageBarrage = async (comments) => {
  if (!commentBarrageEnabled() || !document.querySelector(".comment-barrage")) {
    return;
  }
  const script = runtimeConfig().barrage_script;
  if (!script) return;
  await api.loadScript(script);
  window.initializeCommentBarrage?.(
    comments.map((comment) => ({
      content: comment.content,
      nick: comment.nick,
      avatar: comment.avatar,
      id: comment.id,
      url: comment.url
    }))
  );
};
var escapeHtml = (source) => source.replace(/[&<>'"]/g, (character) => {
  const entities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  };
  return entities[character];
});
var initializeEnvelope = async (comments) => {
  const container = document.getElementById("barrage");
  if (!container) return;
  container.replaceChildren();
  if (!comments.length) return;
  const script = runtimeConfig().envelope_script;
  if (!script) return;
  await api.loadScript(script);
  const EasyDanmaku = window.EasyDanmaku;
  if (typeof EasyDanmaku !== "function") return;
  const instance = new EasyDanmaku({
    page: location.pathname,
    el: "#barrage",
    line: Number(container.dataset.line || 10),
    speed: Number(container.dataset.speed || 20),
    hover: container.dataset.hover === "true",
    loop: container.dataset.loop === "true"
  });
  instance.batchSend(
    comments.map((comment) => ({
      content: escapeHtml(`${comment.nick}: ${comment.content}`),
      avatar: comment.avatar,
      url: comment.url
    })),
    true
  );
  api.onPageCleanup?.(() => container.replaceChildren());
};
var initializeValineEffects = async () => {
  try {
    const comments = await fetchPageComments(location.pathname);
    await Promise.all([
      initializePageBarrage(comments),
      initializeEnvelope(comments)
    ]);
  } catch {
    const barrage = document.querySelector(".comment-barrage");
    if (barrage) barrage.replaceChildren();
    const envelope = document.getElementById("barrage");
    if (envelope) envelope.replaceChildren();
  }
};
var mountValine = async (mount) => {
  if (mount.dataset.initialized === "true") return;
  mount.dataset.initialized = "true";
  try {
    await api.loadScript(api.config.cdn.valine);
    const Valine = window.Valine;
    if (typeof Valine !== "function") throw new Error("Valine is unavailable");
    const config = valineConfig();
    const instance = new Valine({
      ...config.option || {},
      el: "#vcomment",
      appId: config.appId,
      appKey: config.appKey,
      serverURLs: config.serverURLs,
      avatar: config.avatar,
      visitor: Boolean(config.visitor),
      path: location.pathname
    });
    mount.classList.toggle("valine-theme-style", Boolean(config.style));
    api.lightbox?.(
      document.querySelectorAll("#vcomment .vcontent img:not(.vemoji)")
    );
    api.owoBig?.({ body: "#vcomment .vwrap", item: ".vemojis i" });
    api.onPageCleanup?.(() => instance?.destroy?.());
    await initializeValineEffects();
  } catch {
    mount.dataset.initialized = "false";
    setStatus(mount, commentText("error", "Unable to load comments"), "error");
  }
};
var initializeValine = () => {
  const mount = document.getElementById("vcomment");
  if (!mount) return;
  if (!api.config.comment?.lazyload || !("IntersectionObserver" in window)) {
    void mountValine(mount);
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      void mountValine(mount);
    },
    { rootMargin: "200px 0px" }
  );
  observer.observe(mount);
  api.onPageCleanup?.(() => observer.disconnect());
};
var initializeOtherProviders = async (enabled) => {
  const cdn = api.config.cdn || {};
  if (enabled.includes("twikoo") && document.getElementById("twikoo")) {
    await api.loadScript(cdn.twikoo);
    await window.twikoo?.init?.({
      el: "#twikoo",
      ...api.config.twikoo
    });
  }
  if (enabled.includes("waline") && document.getElementById("waline-wrap")) {
    if (cdn.waline_css) await api.loadStyle(cdn.waline_css);
    await api.loadScript(cdn.waline);
    window.Waline?.init?.({
      el: "#waline-wrap",
      ...api.config.waline
    });
  }
  if (enabled.includes("artalk") && document.getElementById("artalk-wrap")) {
    if (cdn.artalk_css) await api.loadStyle(cdn.artalk_css);
    await api.loadScript(cdn.artalk);
    window.Artalk?.init?.({
      el: "#artalk-wrap",
      ...api.config.artalk
    });
  }
};
var initializeComments = () => {
  const enabled = providers();
  if (!enabled.length) return;
  if (enabled.includes("valine")) {
    if (valineReady()) {
      void renderPostCardParticipants();
      void renderAggregateSurfaces();
      void renderAggregateCount();
      initializeValine();
    } else {
      document.querySelectorAll(
        "#vcomment, .recent-comments-list, .card-recent-comment .aside-list, .console_recentcomments"
      ).forEach((container) => {
        setStatus(
          container,
          commentText("error", "Unable to load comments"),
          "error"
        );
        if (container.matches(".card-recent-comment .aside-list")) {
          container.setAttribute("aria-busy", "false");
        }
      });
    }
  }
  void initializeOtherProviders(enabled);
};
document.addEventListener("solitude:ready", initializeComments);
document.addEventListener("solitude:afterNavigate", initializeComments);

// ns-hugo-imp:D:\桌面\hugoBlog\blog\themes\Solitude\assets\ts\core\pjax.ts
init_api();
var rerunPjaxScripts = () => {
  document.querySelectorAll("script[data-pjax]").forEach((item) => {
    const replacement = document.createElement("script");
    Array.from(item.attributes).forEach((attribute) => replacement.setAttribute(attribute.name, attribute.value));
    replacement.textContent = item.textContent || "";
    item.replaceWith(replacement);
  });
};
var closePersistentOverlays = () => {
  document.body.style.overflow = "";
  document.getElementById("sidebar-menus")?.classList.remove("open");
  const menuMask = document.getElementById("menu-mask");
  if (menuMask) menuMask.style.display = "none";
  document.getElementById("console")?.classList.remove("show");
  const searchMask = document.getElementById("search-mask");
  const searchDialog = document.querySelector("#local-search .search-dialog, #algolia-search .search-dialog");
  if (searchMask) searchMask.style.display = "none";
  if (searchDialog) searchDialog.style.display = "none";
  document.documentElement.classList.remove("search-open");
};
var initPjax = () => {
  const PjaxConstructor = window.Pjax;
  if (!PjaxConstructor || api.pjax) return;
  const instance = new PjaxConstructor({
    elements: 'a:not([target="_blank"]):not([data-no-pjax])',
    selectors: [
      "title",
      "#body-wrap",
      "#site-config",
      'meta[name="description"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[property="og:url"]',
      'meta[property="og:type"]',
      ".js-pjax",
      "#config-diff",
      ".rs_show",
      ".rs_hide"
    ],
    cacheBust: false,
    analytics: false,
    scrollRestoration: false
  });
  instance.onSwitch = function onSwitch() {
    this.state.numPendingSwitches--;
    if (this.state.numPendingSwitches === 0) {
      document.dispatchEvent(new Event("resize", { bubbles: true }));
      document.dispatchEvent(new Event("scroll", { bubbles: true }));
      this.afterAllSwitches();
    }
  };
  api.pjax = instance;
  rerunPjaxScripts();
  document.addEventListener("pjax:send", () => {
    closePersistentOverlays();
    document.dispatchEvent(new CustomEvent("solitude:beforeNavigate"));
    api.disposePage?.();
    Object.values(window.globalFn?.pjax || {}).forEach((dispose) => dispose?.());
    if (window.globalFn) window.globalFn.pjax = {};
  });
  document.addEventListener("pjax:complete", async () => {
    await api.refresh?.();
    rerunPjaxScripts();
    if (api.config.lazyload.enable) window.lazyLoadInstance?.update?.();
    document.dispatchEvent(new CustomEvent("solitude:afterNavigate", { detail: { page: api.page } }));
  });
  document.addEventListener("pjax:error", (event) => {
    if (event.request?.status === 404) api.navigate("/404.html");
  });
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initPjax, { once: true });
else initPjax();
//# sourceMappingURL=solitude.js.map
