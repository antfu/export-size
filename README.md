# export-size

Analysis bundle cost for each export of a package

```bash
npx export-size [package-name]
```

For example

```bash
npx export-size @vueuse/core
```

```ts
@vueuse/core

┌───────────────────────────┬─────────┐
│ export                    │    size │
│                           │         │
│ useWebWorkerFn            │ 1.05 KB │
│ useTransition             │   967 B │
│ useParallax               │   965 B │
│ asyncComputed             │   904 B │
│ useShare                  │   799 B │
│ useIdle                   │   610 B │
│ useSessionStorage         │   586 B │
│ useLocalStorage           │   582 B │
│ useStorage                │   572 B │
│ useStoragePlain           │   572 B │
│ useDeviceMotion           │   539 B │
│ useMouseInElement         │   537 B │
│ useElementVisibility      │   474 B │
│ useEventSource            │   465 B │
│ useOnline                 │   451 B │
│ useNetwork                │   443 B │
│ useDevicePixelRatio       │   438 B │
│ useRefHistory             │   423 B │
│ onStartTyping             │   420 B │
│ useMouse                  │   401 B │
│ useGeolocation            │   397 B │
│ useBrowserLocation        │   386 B │
│ useBattery                │   385 B │
│ useAsyncState             │   356 B │
│ usePermission             │   343 B │
│ useWindowSize             │   327 B │
│ useClipboard              │   325 B │
│ useWindowScroll           │   320 B │
│ useWebSocket              │   319 B │
│ useThrottle               │   317 B │
│ useDeviceOrientation      │   308 B │
│ usePreferredColorScheme   │   303 B │
│ usePageLeave              │   285 B │
│ useTimeoutFn              │   280 B │
│ useCssVar                 │   275 B │
│ useDocumentVisibility     │   274 B │
│ useInterval               │   269 B │
│ usePreferredLanguages     │   267 B │
│ useDebounce               │   265 B │
│ useWebWorker              │   261 B │
│ useDeviceLight            │   256 B │
│ usePreferredDark          │   255 B │
│ useThrottleFn             │   249 B │
│ useIntersectionObserver   │   235 B │
│ useRaf                    │   231 B │
│ useTimeout                │   230 B │
│ useTitle                  │   227 B │
│ useMediaQuery             │   225 B │
│ useRafFn                  │   220 B │
│ useEventListener          │   213 B │
│ useFullscreen             │   204 B │
│ useIntervalFn             │   200 B │
│ useNow                    │   195 B │
│ useResizeObserver         │   190 B │
│ useDebounceFn             │   188 B │
│ useMutationObserver       │   184 B │
│ useCounter                │   179 B │
│ createGlobalState         │   177 B │
│ explicitComputed          │   139 B │
│ tryOnMounted              │   138 B │
│ isWindow                  │   137 B │
│ assert                    │   130 B │
│ isObject                  │   116 B │
│ tryOnUnmounted            │   105 B │
│ clamp                     │    88 B │
│ isBoolean                 │    82 B │
│ isNumber                  │    81 B │
│ isString                  │    81 B │
│ DEVICE_PIXEL_RATIO_SCALES │    77 B │
│ isFunction                │    77 B │
│ isClient                  │    76 B │
│ isDef                     │    74 B │
│ now                       │    73 B │
│ timestamp                 │    73 B │
│ noop                      │    56 B │
└───────────────────────────┴─────────┘
```
