import { useState as useLocalState, useEffect, useRef } from 'react';
import {
  measureMenuPanelIntrinsicDimensions,
  resolveClampedMenuPanelGeometry,
  type MenuPanelIntrinsicMetrics,
  type MenuPanelWidthAdaptiveMode,
} from '../../../navigation/menuPanelAdaptive';
import { useMenuLayoutStore, DEFAULT_PANEL_SIZING } from '../../../tokens/menuLayoutStore';
import { useMainMenuStyleStore } from '../../../tokens/mainMenuStyleStore';
import type { Layer1MenuContextMode } from '../../../recipes/Layer1MainMenuRecipe';
import {
  type ActiveMenuRoute,
  type MenuVisibilityTier,
  ROUTE_TO_PANEL_ID,
} from './menuLayerRouteConfig';

export interface UseMenuLayerAdaptiveMetricsParams {
  currentRoute: ActiveMenuRoute;
  displayedRoute: ActiveMenuRoute;
  visibilityTier: MenuVisibilityTier;
  layer1ContextMode: Layer1MenuContextMode;
  touchMode: boolean;
  stageSize: { width: number; height: number };
  containerPreset: 'full' | '1080p-compact' | 'small-squeeze';
  widthMode: MenuPanelWidthAdaptiveMode;
  manualMinWidths: Record<string, number>;
}

export function useMenuLayerAdaptiveMetrics({
  currentRoute,
  displayedRoute,
  visibilityTier,
  layer1ContextMode,
  touchMode,
  stageSize,
  containerPreset,
  widthMode,
  manualMinWidths,
}: UseMenuLayerAdaptiveMetricsParams) {
  const {
    panels,
    dividerMarginY,
    menuItemGap,
    menuItemPaddingY,
    menuContainerPadding,
    panelContentPaddingY,
    panelHeaderPaddingX,
    panelHeaderPaddingY,
    panelHeaderTitleFontSize,
    panelHeaderBackBtnWidth,
    panelHeaderBackBtnHeight,
    panelHeaderBackBtnSize,
    panelOuterRadius,
    panelHeaderGap,
    panelBodyPaddingX,
    panelBodyPaddingY,
    panelFooterPaddingX,
    panelFooterPaddingY,
    panelFooterFontSize,
    simulateLayer3Error,
  } = useMenuLayoutStore();
  const mainMenuStyle = useMainMenuStyleStore();

  const getRouteMetricKey = (route: ActiveMenuRoute) => {
    if (route === 'main-menu') return `main-menu:${layer1ContextMode}`;
    if (route === 'settings') return `settings:${visibilityTier}`;
    if (route === 'garage') return 'garage';
    if (route === 'room-host-control') return `room-host-control:${layer1ContextMode}`;
    return route;
  };

  const contentWrapperRef = useRef<HTMLDivElement | null>(null);
  const isProbingRef = useRef<boolean>(false);
  const lastWidthProbeSigRef = useRef<string>('');
  const [metricsByRouteKey, setMetricsByRouteKey] = useLocalState<
    Record<string, MenuPanelIntrinsicMetrics>
  >({});

  useEffect(() => {
    const wrapper = contentWrapperRef.current;
    if (!wrapper || currentRoute === 'layer-0' || displayedRoute === 'layer-0') return;
    const panelEl = wrapper.querySelector<HTMLElement>('[data-panel="container"]');
    if (!panelEl) return;

    const metricKey = getRouteMetricKey(displayedRoute);
    const panelId = ROUTE_TO_PANEL_ID[displayedRoute] ?? 'layer1-main';
    const cfg =
      panels?.[panelId] ??
      DEFAULT_PANEL_SIZING[panelId] ??
      DEFAULT_PANEL_SIZING['layer1-main'];

    const measure = () => {
      if (isProbingRef.current) return;
      isProbingRef.current = true;
      try {
        const contentEl = panelEl.querySelector<HTMLElement>(
          '[data-panel-section="content"]'
        );
        const childCount =
          contentEl?.firstElementChild?.children.length ??
          contentEl?.children.length ??
          0;
        const widthSig = `${metricKey}:${childCount}:${simulateLayer3Error}:${touchMode}:${panelHeaderTitleFontSize}:${panelBodyPaddingX}`;
        const shouldProbeWidth = lastWidthProbeSigRef.current !== widthSig;

        const measured = measureMenuPanelIntrinsicDimensions(panelEl, {
          fallbackMinWidth: Math.min(cfg.width, 360),
          tier: visibilityTier,
          measureWidth: shouldProbeWidth,
        });

        if (shouldProbeWidth && contentEl && contentEl.clientWidth > 0) {
          lastWidthProbeSigRef.current = widthSig;
        }

        if (measured.intrinsicHeight > 40) {
          setMetricsByRouteKey((prev) => {
            const existing = prev[metricKey];
            const nextAutoMinW = shouldProbeWidth
              ? measured.autoMinWidth
              : existing?.autoMinWidth ?? measured.autoMinWidth;
            const nextContentMinW = shouldProbeWidth
              ? measured.contentMinWidth
              : existing?.contentMinWidth ?? measured.contentMinWidth;

            if (
              existing &&
              Math.abs(existing.intrinsicHeight - measured.intrinsicHeight) <= 1 &&
              existing.autoMinWidth === nextAutoMinW
            ) {
              return prev;
            }
            return {
              ...prev,
              [metricKey]: {
                intrinsicHeight: measured.intrinsicHeight,
                autoMinWidth: nextAutoMinW,
                contentMinWidth: nextContentMinW,
                chromeMinWidth: measured.chromeMinWidth,
                scrollbarReservePx: measured.scrollbarReservePx,
              },
            };
          });
        }
      } finally {
        isProbingRef.current = false;
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(panelEl);
    Array.from(panelEl.children).forEach((child) => {
      ro.observe(child);
      if (
        (child as HTMLElement).getAttribute('data-panel-section') === 'content'
      ) {
        Array.from(child.children).forEach((grandChild) => ro.observe(grandChild));
      }
    });

    return () => ro.disconnect();
  }, [
    displayedRoute,
    currentRoute,
    visibilityTier,
    layer1ContextMode,
    touchMode,
    mainMenuStyle,
    panels,
    dividerMarginY,
    menuItemGap,
    menuItemPaddingY,
    menuContainerPadding,
    panelContentPaddingY,
    panelHeaderPaddingX,
    panelHeaderPaddingY,
    panelHeaderTitleFontSize,
    panelHeaderBackBtnWidth,
    panelHeaderBackBtnHeight,
    panelHeaderBackBtnSize,
    panelHeaderGap,
    panelBodyPaddingX,
    panelBodyPaddingY,
    panelFooterPaddingX,
    panelFooterPaddingY,
    panelFooterFontSize,
    simulateLayer3Error,
    stageSize.width,
    stageSize.height,
  ]);

  const resolveRouteGeometry = (route: ActiveMenuRoute) => {
    if (route === 'layer-0') {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        desiredWidth: 0,
        desiredHeight: 0,
        effectiveMinWidth: 0,
        autoMinWidth: 0,
        intrinsicHeight: 0,
        scrollbarReservePx: 16,
        isWidthSqueezed: false,
        isHeightSqueezed: false,
        modeLabel: '0px',
      };
    }
    const metricKey = getRouteMetricKey(route);
    const panelId = ROUTE_TO_PANEL_ID[route] ?? 'layer1-main';
    const cfg =
      panels?.[panelId] ??
      DEFAULT_PANEL_SIZING[panelId] ??
      DEFAULT_PANEL_SIZING['layer1-main'];
    const measured = metricsByRouteKey[metricKey];
    const fallbackIntrinsic =
      route === 'main-menu'
        ? 377
        : route === 'play'
        ? 298
        : route === 'garage'
        ? 417
        : route === 'settings'
        ? 457
        : cfg.targetHeight;
    const naturalH = measured?.intrinsicHeight ?? fallbackIntrinsic;
    const autoMinW = measured?.autoMinWidth ?? Math.min(cfg.width, 400);
    const manualMinW =
      typeof manualMinWidths[metricKey] === 'number'
        ? Math.round(manualMinWidths[metricKey])
        : undefined;

    const effectiveBoundsH =
      containerPreset === '1080p-compact'
        ? 520
        : containerPreset === 'small-squeeze'
        ? 380
        : Math.max(stageSize.height, 620, Math.min(980, naturalH + 48));
    const effectiveBoundsW =
      containerPreset === '1080p-compact'
        ? Math.min(stageSize.width, 760)
        : containerPreset === 'small-squeeze'
        ? Math.min(stageSize.width, 520)
        : stageSize.width;

    return resolveClampedMenuPanelGeometry({
      sizing: cfg,
      intrinsicHeight: naturalH,
      autoMinWidth: autoMinW,
      manualMinWidth: manualMinW,
      widthMode,
      stageBounds: {
        width: Math.max(300, effectiveBoundsW),
        height: Math.max(240, effectiveBoundsH),
      },
      margin: 16,
    });
  };

  return {
    contentWrapperRef,
    panelOuterRadius,
    getRouteMetricKey,
    resolveRouteGeometry,
  };
}
