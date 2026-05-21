import './Toolbar.css';

interface ToolbarProps {
    onBold: () => void;
    onItalic: () => void;
    onUnderline: () => void;
    onAlignLeft: () => void;
    onAlignCenter: () => void;
    onAlignRight: () => void;
    onTextColor: (color: string) => void;
    onBgColor: (color: string) => void;
}

const Toolbar = ({
    onBold,
    onItalic,
    onUnderline,
    onAlignLeft,
    onAlignCenter,
    onAlignRight,
    onTextColor,
    onBgColor
}: ToolbarProps) => {
    return (
        <div className="toolbar">
            <div className="toolbar-group">
                <button onClick={onBold} title="Жирный (Ctrl+B)">B</button>
                <button onClick={onItalic} title="Курсив (Ctrl+I)">I</button>
                <button onClick={onUnderline} title="Подчёркивание (Ctrl+U)">U</button>
            </div>
            <div className="toolbar-divider"></div>
            <div className="toolbar-group">
                <button onClick={onAlignLeft} title="Выровнять влево">L</button>
                <button onClick={onAlignCenter} title="Выровнять по центру">C</button>
                <button onClick={onAlignRight} title="Выровнять вправо">R</button>
            </div>
            <div className="toolbar-divider"></div>
            <div className="toolbar-group">
                <input
                    type="color"
                    onChange={(e) => onTextColor(e.target.value)}
                    title="Цвет текста"
                />
                <input
                    type="color"
                    onChange={(e) => onBgColor(e.target.value)}
                    title="Цвет фона"
                />
            </div>
        </div>
    );
};

export default Toolbar;