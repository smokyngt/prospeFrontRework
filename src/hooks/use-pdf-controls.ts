import { useCallback } from 'react';

import { pdfViewer as pdfConfig } from '@/config/constants';
import { usePdfStore } from '@/stores/pdf';
export function usePdfControls(fileId: string) {
  const tabs = usePdfStore((s) => s.tabs);
  const activeTabId = usePdfStore((s) => s.activeTabId);
  const setPage = usePdfStore((s) => s.setPage);
  const setZoom = usePdfStore((s) => s.setZoom);
  const setRotation = usePdfStore((s) => s.setRotation);
  const setTotalPages = usePdfStore((s) => s.setTotalPages);
  const tab = tabs.find((t) => t.fileId === fileId);
  const pageNumber = tab?.pageNumber ?? 1;
  const zoom = tab?.zoom ?? pdfConfig.defaultZoom;
  const rotation = tab?.rotation ?? 0;
  const numPages = tab?.totalPages ?? 0;
  const goToPage = useCallback(
    (page: number) => {
      if (activeTabId && page >= 1 && page <= (tab?.totalPages ?? 0)) {
        setPage(activeTabId, page);
      }
    },
    [activeTabId, setPage, tab?.totalPages],
  );
  const goToPreviousPage = useCallback(() => {
    const current = tab?.pageNumber ?? 1;
    if (current > 1) {
      goToPage(current - 1);
    }
  }, [tab?.pageNumber, goToPage]);
  const goToNextPage = useCallback(() => {
    const current = tab?.pageNumber ?? 1;
    const total = tab?.totalPages ?? 0;
    if (current < total) {
      goToPage(current + 1);
    }
  }, [tab?.pageNumber, tab?.totalPages, goToPage]);
  const handlers = {
    zoomIn: useCallback(() => {
      const current = tab?.zoom ?? pdfConfig.defaultZoom;
      const newZoom = Math.min(current + pdfConfig.zoomStep, pdfConfig.maxZoom);
      if (activeTabId) {
        setZoom(activeTabId, newZoom);
      }
    }, [tab?.zoom, activeTabId, setZoom]),
    zoomOut: useCallback(() => {
      const current = tab?.zoom ?? pdfConfig.defaultZoom;
      const newZoom = Math.max(current - pdfConfig.zoomStep, pdfConfig.minZoom);
      if (activeTabId) {
        setZoom(activeTabId, newZoom);
      }
    }, [tab?.zoom, activeTabId, setZoom]),
    zoomChange: useCallback(
      (value: number) => {
        if (activeTabId) {
          setZoom(activeTabId, value);
        }
      },
      [activeTabId, setZoom],
    ),
    rotate: useCallback(() => {
      const current = tab?.rotation ?? 0;
      const newRotation = (current + 90) % 360;
      if (activeTabId) {
        setRotation(activeTabId, newRotation);
      }
    }, [tab?.rotation, activeTabId, setRotation]),
    documentLoad: useCallback(
      (pages: number) => {
        if (activeTabId) {
          setTotalPages(activeTabId, pages);
        }
      },
      [activeTabId, setTotalPages],
    ),
  };
  return {
    pageNumber,
    numPages,
    zoom,
    rotation,
    activeTabId,
    tab,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    onZoomIn: handlers.zoomIn,
    onZoomOut: handlers.zoomOut,
    onZoomChange: handlers.zoomChange,
    canZoomIn: zoom < pdfConfig.maxZoom,
    canZoomOut: zoom > pdfConfig.minZoom,
    onRotate: handlers.rotate,
    onDocumentLoad: handlers.documentLoad,
  };
}
