import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SearchToolbar as CoreSearchToolbar, SearchToolbarOptions } from '../../../ui/molecules/search-toolbar';

export interface SearchToolbarProps extends SearchToolbarOptions {
  className?: string;
  onResultsChange?: (count: number) => void;
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({
  className,
  onResultsChange,
  ...options
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<CoreSearchToolbar | null>(null);
  const [resultsCount, setResultsCount] = useState<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create core toolbar instance
    toolbarRef.current = new CoreSearchToolbar(containerRef.current, options);

    return () => {
      toolbarRef.current?.destroy();
    };
  }, []);

  // Update results count
  useEffect(() => {
    if (toolbarRef.current && resultsCount !== undefined) {
      toolbarRef.current.setResultsCount(resultsCount);
    }
  }, [resultsCount]);

  // Notify parent of results changes
  useEffect(() => {
    if (onResultsChange && resultsCount !== undefined) {
      onResultsChange(resultsCount);
    }
  }, [resultsCount, onResultsChange]);

  const setResults = useCallback((count: number) => {
    setResultsCount(count);
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      data-search-toolbar
    />
  );
};

SearchToolbar.displayName = 'SearchToolbar';
