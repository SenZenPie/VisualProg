import { useState } from 'react';

interface CreateDocumentModalProps {
    onClose: () => void;
    onCreate: (name: string, rows: number, cols: number) => void;
}

const CreateDocumentModal = ({ onClose, onCreate }: CreateDocumentModalProps) => {
    const [name, setName] = useState('Новая таблица');
    const [rows, setRows] = useState(100);
    const [cols, setCols] = useState(26);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onCreate(name.trim(), rows, cols);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Создать новый документ</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Название</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label>Строки (1-1000)</label>
                        <input
                            type="number"
                            value={rows}
                            onChange={(e) => setRows(Number(e.target.value))}
                            min={1}
                            max={1000}
                        />
                    </div>
                    <div className="form-group">
                        <label>Столбцы (1-26)</label>
                        <input
                            type="number"
                            value={cols}
                            onChange={(e) => setCols(Number(e.target.value))}
                            min={1}
                            max={26}
                        />
                    </div>
                    <div className="modal-buttons">
                        <button type="button" onClick={onClose}>Отмена</button>
                        <button type="submit">Создать</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateDocumentModal;