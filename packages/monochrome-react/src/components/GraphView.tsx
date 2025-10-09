import React, { useEffect, useRef, useState } from 'react';

export interface DocumentMetadata {
  id: string;
  title: string;
  tags: string[];
  links?: Array<{ target: string; type: string }>;
}

export interface GraphViewProps {
  documents: DocumentMetadata[];
  width?: number;
  height?: number;
  iterations?: number;
  repulsionStrength?: number;
  attractionStrength?: number;
  nodeRadius?: number;
  showLabels?: boolean;
  onNodeClick?: (node: { id: string; title: string; tags: string[] }) => void;
  onNodeHover?: (node: { id: string; title: string; tags: string[] } | null) => void;
  onLayoutProgress?: (iteration: number, alpha: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const GraphView: React.FC<GraphViewProps> = ({
  documents,
  width = 800,
  height = 600,
  iterations = 300,
  repulsionStrength = 800,
  attractionStrength = 0.01,
  nodeRadius = 8,
  showLabels = true,
  onNodeClick,
  onNodeHover,
  onLayoutProgress,
  className = '',
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Import and initialize graph view
    import('../../../src/graph-view').then(({ GraphView: CoreGraphView }) => {
      const graphView = new CoreGraphView({
        container: containerRef.current!,
        documents,
        width,
        height,
        iterations,
        repulsionStrength,
        attractionStrength,
        nodeRadius,
        showLabels,
        onNodeClick,
        onNodeHover,
        onLayoutProgress
      });

      graphView.runLayout();

      return () => {
        graphView.destroy();
      };
    });
  }, [documents, width, height, iterations, repulsionStrength, attractionStrength, nodeRadius, showLabels]);

  return (
    <div
      ref={containerRef}
      className={`graph-view-container ${className}`}
      style={{
        width: width || '100%',
        height: height || 600,
        position: 'relative',
        ...style
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="graph-view-canvas"
      />
    </div>
  );
};

GraphView.displayName = 'GraphView';
