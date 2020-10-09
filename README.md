# export-size

Analysis bundle cost for each export of an ESM package, powered by ESBuild

### Install

```bash
npx export-size [package-name]
```

### Usage

Calculate npm package

```bash
npx export-size @vueuse/core
```

Calculate local package

```bash
npx export-size .
```

```ts
@vueuse/core v4.0.0-beta.20
sha 8ef798bf7d22f9cca7681c3bb717af59e6b1685d

┌───────────────────────────┬──────────┐
│ export                    │ min+gzip │
│                           │          │
│ useWebWorkerFn            │   1.1 KB │
│ useTransition             │   1007 B │
│ useParallax               │    987 B │
│ asyncComputed             │    924 B │
│ useShare                  │    817 B │
│ useIdle                   │    651 B │
│ useSessionStorage         │    604 B │
│ useLocalStorage           │    600 B │
│ useStoragePlain           │    597 B │
│ useStorage                │    586 B │
│ useDeviceMotion           │    559 B │
│ useMouseInElement         │    542 B │
│ useElementVisibility      │    503 B │
│ useDevicePixelRatio       │    489 B │
│ onStartTyping             │    471 B │
│ useEventSource            │    471 B │
│ useOnline                 │    467 B │
│ useNetwork                │    455 B │
│ useRefHistory             │    451 B │
│ useGeolocation            │    408 B │
│ useBrowserLocation        │    405 B │
│ useMouse                  │    403 B │
│ useBattery                │    395 B │
│ useAsyncState             │    367 B │
│ usePermission             │    365 B │
│ useWindowSize             │    347 B │
│ useWindowScroll           │    344 B │
│ useClipboard              │    337 B │
│ usePreferredColorScheme   │    333 B │
│ useWebSocket              │    329 B │
│ useDeviceOrientation      │    324 B │
│ useThrottle               │    318 B │
│ usePageLeave              │    300 B │
│ useDocumentVisibility     │    291 B │
│ usePreferredDark          │    285 B │
│ useCssVar                 │    284 B │
│ usePreferredLanguages     │    282 B │
│ useTimeoutFn              │    282 B │
│ useWebWorker              │    277 B │
│ useDeviceLight            │    273 B │
│ useInterval               │    273 B │
│ useDebounce               │    262 B │
│ useThrottleFn             │    258 B │
│ useMediaQuery             │    247 B │
│ useRaf                    │    244 B │
│ useTitle                  │    243 B │
│ useIntersectionObserver   │    239 B │
│ useTimeout                │    227 B │
│ useRafFn                  │    224 B │
│ useEventListener          │    222 B │
│ useNow                    │    207 B │
│ useDebounceFn             │    204 B │
│ useFullscreen             │    201 B │
│ useIntervalFn             │    199 B │
│ createGlobalState         │    197 B │
│ useResizeObserver         │    195 B │
│ useMutationObserver       │    190 B │
│ useCounter                │    183 B │
│ explicitComputed          │    146 B │
│ isWindow                  │    144 B │
│ tryOnMounted              │    143 B │
│ assert                    │    137 B │
│ isObject                  │    122 B │
│ DEVICE_PIXEL_RATIO_SCALES │    109 B │
│ tryOnUnmounted            │    107 B │
│ clamp                     │     98 B │
│ isBoolean                 │     92 B │
│ isNumber                  │     91 B │
│ isString                  │     91 B │
│ timestamp                 │     87 B │
│ isFunction                │     86 B │
│ isDef                     │     84 B │
│ isClient                  │     83 B │
│ now                       │     79 B │
│ noop                      │     65 B │
└───────────────────────────┴──────────┘
```

## TODO

- [x] Support local packages
- [ ] Support JSON output
- [x] ESBuild
- [ ] Support custom output path

## Sponsors

This project is part of my <a href='https://github.com/antfu-sponsors'>Sponsor Program</a>

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

MIT
