import { useState } from 'react';

interface RenameModalProps {
    currentName: string;
    onClose: () => void;
    onRename: (newName: string) => void;
}

const RenameModal = ({ currentName, onClose, onRename }: RenameModalProps) => {
    const [name, setName] = useState(currentName);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onRename(name.trim());
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Переименовать документ</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Новое название</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="modal-buttons">
                        <button type="button" onClick={onClose}>Отмена</button>
                        <button type="submit">Сохранить</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RenameModal;