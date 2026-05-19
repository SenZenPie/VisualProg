import { useState, useEffect } from 'react';
import { getDocumentsList, createDocument, deleteDocument, duplicateDocument, updateDocument } from '../services/storageService';
import type { DocumentSummary } from '../types/spreadsheet';
import CreateDocumentModal from './CreateDocumentModal';
import RenameModal from './RenameModal';

interface DashboardProps {
    onOpenDocument: (id: string) => void;
}

const Dashboard = ({ onOpenDocument }: DashboardProps) => {
    const [documents, setDocuments] = useState<DocumentSummary[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [selectedDocName, setSelectedDocName] = useState('');

    const loadDocuments = () => {
        setDocuments(getDocumentsList());
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    const handleCreate = (name: string, rows: number, cols: number) => {
        const newDoc = createDocument(name, rows, cols);
        loadDocuments();
        onOpenDocument(newDoc.id);
    };

    const handleRename = (newName: string) => {
        if (selectedDocId) {
            updateDocument(selectedDocId, { name: newName });
            loadDocuments();
            setShowRenameModal(false);
            setSelectedDocId(null);
        }
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Удалить документ "${name}"?`)) {
            deleteDocument(id);
            loadDocuments();
        }
    };

    const handleDuplicate = (id: string) => {
        duplicateDocument(id);
        loadDocuments();
    };

    const openRenameModal = (id: string, name: string) => {
        setSelectedDocId(id);
        setSelectedDocName(name);
        setShowRenameModal(true);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ru-RU');
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Мои документы</h1>
                <button className="create-btn" onClick={() => setShowCreateModal(true)}>
                    + Новый документ
                </button>
            </div>
            
            <div className="documents-grid">
                {documents.map(doc => (
                    <div key={doc.id} className="document-card" onDoubleClick={() => onOpenDocument(doc.id)}>
                        <div className="document-preview">
                            <table>
                                <tbody>
                                    {doc.preview.slice(0, 3).map((row, i) => (
                                        <tr key={i}>
                                            {row.slice(0, 3).map((cell, j) => (
                                                <td key={j}>{cell || ''}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="document-info">
                            <div className="document-name">{doc.name}</div>
                            <div className="document-date">{formatDate(doc.updatedAt)}</div>
                        </div>
                        <div className="document-actions">
                            <button onClick={() => onOpenDocument(doc.id)}>Открыть</button>
                            <button onClick={() => openRenameModal(doc.id, doc.name)}>Переименовать</button>
                            <button onClick={() => handleDuplicate(doc.id)}>Дублировать</button>
                            <button onClick={() => handleDelete(doc.id, doc.name)}>Удалить</button>
                        </div>
                    </div>
                ))}
            </div>

            {documents.length === 0 && (
                <div className="empty-state">
                    <p>У вас нет документов</p>
                    <button onClick={() => setShowCreateModal(true)}>Создать первый документ</button>
                </div>
            )}

            {showCreateModal && (
                <CreateDocumentModal onClose={() => setShowCreateModal(false)} onCreate={handleCreate} />
            )}

            {showRenameModal && (
                <RenameModal currentName={selectedDocName} onClose={() => setShowRenameModal(false)} onRename={handleRename} />
            )}
        </div>
    );
};

export default Dashboard;