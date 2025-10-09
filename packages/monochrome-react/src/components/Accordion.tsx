import React, { useState, ReactNode } from 'react';

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  defaultExpandedIds?: string[];
  allowMultiple?: boolean;
  onChange?: (expandedIds: string[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultExpandedIds = [],
  allowMultiple = false,
  onChange,
  className = '',
  style = {}
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpandedIds);

  const handleToggle = (itemId: string, disabled?: boolean) => {
    if (disabled) return;

    let newExpandedIds: string[];

    if (allowMultiple) {
      if (expandedIds.includes(itemId)) {
        newExpandedIds = expandedIds.filter(id => id !== itemId);
      } else {
        newExpandedIds = [...expandedIds, itemId];
      }
    } else {
      newExpandedIds = expandedIds.includes(itemId) ? [] : [itemId];
    }

    setExpandedIds(newExpandedIds);
    onChange?.(newExpandedIds);
  };

  return (
    <div className={`accordion ${className}`} style={style}>
      {items.map((item) => {
        const isExpanded = expandedIds.includes(item.id);

        return (
          <div
            key={item.id}
            className={`accordion-item ${isExpanded ? 'is-expanded' : ''} ${item.disabled ? 'is-disabled' : ''}`}
          >
            <button
              className="accordion-header"
              onClick={() => handleToggle(item.id, item.disabled)}
              disabled={item.disabled}
              aria-expanded={isExpanded}
              aria-controls={`accordion-content-${item.id}`}
            >
              <span className="accordion-title">{item.title}</span>
              <svg
                className="accordion-icon"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                style={{
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
              >
                <path d="M4 6L8 10L12 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div
              id={`accordion-content-${item.id}`}
              className="accordion-content"
              style={{
                maxHeight: isExpanded ? '1000px' : '0',
                transition: 'max-height 0.3s ease'
              }}
            >
              <div className="accordion-body">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

Accordion.displayName = 'Accordion';
