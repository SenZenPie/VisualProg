import { useState } from 'react';

interface CreateDocumentModalProps {
    onClose: () => void;
    onCreate: (name: string, rows: number, cols: number) => void;
}

const CreateDocumentModal = ({ onClose, onCreate }: CreateDocumentModalProps) => {
    const [name, setName] = useState('Новая таблица');
    const [rows, setRows] = useState<string>('100');
    const [cols, setCols] = useState<string>('26');

    const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            setRows('');
            return;
        }
        let num = parseInt(val, 10);
        if (isNaN(num)) num = 1;
        if (num < 1) num = 1;
        if (num > 1000) num = 1000;
        setRows(num.toString());
    };

    const handleColsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            setCols('');
            return;
        }
        let num = parseInt(val, 10);
        if (isNaN(num)) num = 1;
        if (num < 1) num = 1;
        if (num > 26) num = 26;
        setCols(num.toString());
    };

    const getRowsValue = (): number => {
        if (rows === '') return 1;
        return parseInt(rows, 10);
    };

    const getColsValue = (): number => {
        if (cols === '') return 1;
        return parseInt(cols, 10);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onCreate(name.trim(), getRowsValue(), getColsValue());
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
                            type="text"
                            value={rows}
                            onChange={handleRowsChange}
                            placeholder="1-1000"
                        />
                    </div>
                    <div className="form-group">
                        <label>Столбцы (1-26)</label>
                        <input
                            type="text"
                            value={cols}
                            onChange={handleColsChange}
                            placeholder="1-26"
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