import './Toolbar.css';

const Toolbar = () => {
    return (
        <div className="toolbar">
            <div className="toolbar-group">
                <button title="Жирный">B</button>
                <button title="Курсив">I</button>
                <button title="Подчёркивание">U</button>
            </div>
            <div className="toolbar-divider"></div>
            <div className="toolbar-group">
                <button title="Выровнять влево">L</button>
                <button title="Выровнять по центру">C</button>
                <button title="Выровнять вправо">R</button>
            </div>
            <div className="toolbar-divider"></div>
            <div className="toolbar-group">
                <input type="color" title="Цвет текста" />
                <input type="color" title="Цвет фона" />
            </div>
            <div className="toolbar-divider"></div>
            <div className="toolbar-group">
                <button title="Число">123</button>
                <button title="Процент">%</button>
                <button title="Валюта">$</button>
                <button title="Дата"></button>
            </div>
        </div>
    );
};

export default Toolbar;