import React, { useState, ReactNode } from 'react';

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
  children?: NavItem[];
}

export interface NavigationHeaderProps {
  logo?: ReactNode;
  items: NavItem[];
  actions?: ReactNode;
  onItemClick?: (item: NavItem) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  logo,
  items,
  actions,
  onItemClick,
  className = '',
  style = {}
}) => {
  const handleItemClick = (item: NavItem) => {
    item.onClick?.();
    onItemClick?.(item);
  };

  return (
    <header className={`nav-header ${className}`} style={style}>
      {logo && <div className="nav-header-logo">{logo}</div>}
      <nav className="nav-header-menu">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.href || '#'}
            className="nav-header-item"
            onClick={(e) => {
              if (item.onClick || onItemClick) {
                e.preventDefault();
                handleItemClick(item);
              }
            }}
          >
            {item.icon && <span className="nav-header-item-icon">{item.icon}</span>}
            <span className="nav-header-item-label">{item.label}</span>
          </a>
        ))}
      </nav>
      {actions && <div className="nav-header-actions">{actions}</div>}
    </header>
  );
};

NavigationHeader.displayName = 'NavigationHeader';

export interface NavigationSidebarProps {
  items: NavItem[];
  activeId?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onItemClick?: (item: NavItem) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  items,
  activeId,
  collapsible = false,
  defaultCollapsed = false,
  onItemClick,
  className = '',
  style = {}
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleItemClick = (item: NavItem) => {
    if (item.children) {
      const newExpanded = new Set(expandedItems);
      if (newExpanded.has(item.id)) {
        newExpanded.delete(item.id);
      } else {
        newExpanded.add(item.id);
      }
      setExpandedItems(newExpanded);
    }

    item.onClick?.();
    onItemClick?.(item);
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isActive = activeId === item.id;
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="nav-sidebar-item-wrapper">
        <a
          href={item.href || '#'}
          className={`nav-sidebar-item ${isActive ? 'is-active' : ''} ${hasChildren ? 'has-children' : ''}`}
          style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
          onClick={(e) => {
            if (item.onClick || onItemClick || hasChildren) {
              e.preventDefault();
              handleItemClick(item);
            }
          }}
        >
          {item.icon && <span className="nav-sidebar-item-icon">{item.icon}</span>}
          <span className="nav-sidebar-item-label">{item.label}</span>
          {hasChildren && (
            <svg
              className="nav-sidebar-item-arrow"
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
              <path d="M4 2L8 6L4 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </a>
        {hasChildren && isExpanded && (
          <div className="nav-sidebar-children">
            {item.children!.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`nav-sidebar ${collapsed ? 'is-collapsed' : ''} ${className}`}
      style={style}
    >
      <nav className="nav-sidebar-menu">
        {items.map((item) => renderNavItem(item))}
      </nav>
      {collapsible && (
        <button
          className="nav-sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            style={{
              transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}
          >
            <path d="M10 12L6 8L10 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </aside>
  );
};

NavigationSidebar.displayName = 'NavigationSidebar';
