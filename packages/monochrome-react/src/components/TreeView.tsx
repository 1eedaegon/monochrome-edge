import React, { useState } from 'react';

export interface TreeNode {
  id: string;
  label: string;
  icon?: string;
  children?: TreeNode[];
  metadata?: Record<string, any>;
}

export interface TreeViewProps {
  data: TreeNode[];
  defaultExpanded?: boolean;
  onNodeClick?: (node: TreeNode) => void;
  onNodeExpand?: (node: TreeNode, expanded: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface TreeNodeItemProps {
  node: TreeNode;
  level: number;
  defaultExpanded: boolean;
  onNodeClick?: (node: TreeNode) => void;
  onNodeExpand?: (node: TreeNode, expanded: boolean) => void;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  level,
  defaultExpanded,
  onNodeClick,
  onNodeExpand
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onNodeExpand?.(node, newExpanded);
  };

  const handleClick = () => {
    onNodeClick?.(node);
  };

  return (
    <div className="tree-node">
      <div
        className={`tree-node-content ${isExpanded ? 'is-expanded' : ''}`}
        style={{ paddingLeft: `${level * 1.5}rem` }}
        onClick={handleClick}
      >
        {hasChildren && (
          <button
            className="tree-node-toggle"
            onClick={handleToggle}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              style={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            >
              <path d="M4 2L8 6L4 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        {node.icon && (
          <span className="tree-node-icon">{node.icon}</span>
        )}
        <span className="tree-node-label">{node.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <div className="tree-node-children">
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              defaultExpanded={defaultExpanded}
              onNodeClick={onNodeClick}
              onNodeExpand={onNodeExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeView: React.FC<TreeViewProps> = ({
  data,
  defaultExpanded = false,
  onNodeClick,
  onNodeExpand,
  className = '',
  style = {}
}) => {
  return (
    <div className={`tree-view ${className}`} style={style}>
      {data.map((node) => (
        <TreeNodeItem
          key={node.id}
          node={node}
          level={0}
          defaultExpanded={defaultExpanded}
          onNodeClick={onNodeClick}
          onNodeExpand={onNodeExpand}
        />
      ))}
    </div>
  );
};

TreeView.displayName = 'TreeView';
