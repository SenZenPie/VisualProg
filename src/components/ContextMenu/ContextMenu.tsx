import { useEffect, useRef } from 'react';
import './ContextMenu.css';

interface ContextMenuProps{
  x: number;
  y: number;
  onClose: () => void;
  onAddRowAbove: () => void;
  onAddRowBelow: () => void;
  onDeleteRow: () => void;
  onAddColumnLeft: () => void;
  onAddColumnRight: () => void;
  onDeleteColumn: () => void;
}

const ContextMenu = ({
  x,
  y,
  onClose,
  onAddRowAbove,
  onAddRowBelow,
  onDeleteRow,
  onAddColumnLeft,
  onAddColumnRight,
  onDeleteColumn
}: ContextMenuProps) =>{
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)){
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const style = {
    top: y,
    left: x,
    position: 'fixed' as const
  };

  return (
    <div ref={menuRef} className="context-menu" style={style}>
      <div className="context-menu-section">
        <div className="context-menu-title">Строка</div>
        <div className="context-menu-item" onClick={onAddRowAbove}>
          Добавить строку выше
        </div>
        <div className="context-menu-item" onClick={onAddRowBelow}>
          Добавить строку ниже
        </div>
        <div className="context-menu-item delete" onClick={onDeleteRow}>
          Удалить строку
        </div>
      </div>
      <div className="context-menu-divider"></div>
      <div className="context-menu-section">
        <div className="context-menu-title">Столбец</div>
        <div className="context-menu-item" onClick={onAddColumnLeft}>
          Добавить столбец слева
        </div>
        <div className="context-menu-item" onClick={onAddColumnRight}>
          Добавить столбец справа
        </div>
        <div className="context-menu-item delete" onClick={onDeleteColumn}>
          Удалить столбец
        </div>
      </div>
    </div>
  );
};

export default ContextMenu;