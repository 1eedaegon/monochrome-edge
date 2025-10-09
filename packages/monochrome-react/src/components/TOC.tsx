import React, { useState } from 'react';

export interface TOCItem {
  id: string;
  label: string;
  href: string;
  level?: number;
}

export interface TOCProps {
  items: TOCItem[];
  activeId?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  title?: string;
  onItemClick?: (item: TOCItem) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const TOC: React.FC<TOCProps> = ({
  items,
  activeId,
  collapsible = false,
  defaultCollapsed = false,
  title = 'Table of Contents',
  onItemClick,
  className = '',
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);

  const handleItemClick = (e: React.MouseEvent, item: TOCItem) => {
    e.preventDefault();
    onItemClick?.(item);
    // Scroll to element
    const element = document.querySelector(item.href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (collapsible) {
    return (
      <div className={`toc-collapsible ${isOpen ? 'is-open' : ''} ${className}`} style={style}>
        <div className="toc-collapsible-header" onClick={() => setIsOpen(!isOpen)}>
          <h4 className="toc-collapsible-title">{title}</h4>
          <span className="toc-collapsible-icon">▼</span>
        </div>
        <div className="toc-collapsible-content">
          <ul className="toc-list">
            {items.map((item) => (
              <li key={item.id} className="toc-list-item">
                <a
                  href={item.href}
                  className={`toc-list-link ${activeId === item.id ? 'is-active' : ''}`}
                  onClick={(e) => handleItemClick(e, item)}
                  style={item.level ? { paddingLeft: `${item.level * 0.75}rem` } : {}}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className={`toc-card ${className}`} style={style}>
      <h4 className="toc-card-title">{title}</h4>
      <ul className="toc-card-list">
        {items.map((item) => (
          <li key={item.id} className="toc-card-item">
            <a
              href={item.href}
              className={`toc-card-link ${activeId === item.id ? 'is-active' : ''}`}
              onClick={(e) => handleItemClick(e, item)}
              style={item.level ? { paddingLeft: `${item.level * 0.75}rem` } : {}}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

TOC.displayName = 'TOC';
