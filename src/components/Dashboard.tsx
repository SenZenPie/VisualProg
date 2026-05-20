import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setDocumentsList, setCurrentDocId, addDocument, updateDocumentInList, removeDocument } from '../store/slices/documentsSlice';
import { openCreateModal, openRenameModal, closeCreateModal, closeRenameModal } from '../store/slices/uiSlice';
import { getDocumentsList, createDocument, updateDocument, deleteDocument, duplicateDocument } from '../services/storageService';
import CreateDocumentModal from './CreateDocumentModal';
import RenameModal from './RenameModal';

const Dashboard = () => {
    const dispatch = useAppDispatch();
    const documents = useAppSelector((state) => state.documents.list);
    const showCreateModal = useAppSelector((state) => state.ui.showCreateModal);
    const showRenameModal = useAppSelector((state) => state.ui.showRenameModal);
    const selectedDocId = useAppSelector((state) => state.ui.selectedDocId);
    const selectedDocName = useAppSelector((state) => state.ui.selectedDocName);

    const loadDocuments = () => {
        const docs = getDocumentsList();
        dispatch(setDocumentsList(docs));
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    const handleCreate = (name: string, rows: number, cols: number) => {
        const newDoc = createDocument(name, rows, cols);
        const preview = newDoc.preview || [['', '', ''], ['', '', ''], ['', '', '']];
        dispatch(addDocument({
            id: newDoc.id,
            name: newDoc.name,
            createdAt: newDoc.createdAt,
            updatedAt: newDoc.updatedAt,
            preview: preview
        }));
        dispatch(setCurrentDocId(newDoc.id));
        dispatch(closeCreateModal());
    };

    const handleRename = (newName: string) => {
        if (selectedDocId) {
            updateDocument(selectedDocId, { name: newName });
            dispatch(updateDocumentInList({ id: selectedDocId, name: newName }));
            dispatch(closeRenameModal());
        }
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Удалить документ "${name}"?`)) {
            deleteDocument(id);
            dispatch(removeDocument(id));
        }
    };

    const handleDuplicate = (id: string) => {
        const newDoc = duplicateDocument(id);
        if (newDoc) {
            const preview = newDoc.preview || [['', '', ''], ['', '', ''], ['', '', '']];
            dispatch(addDocument({
                id: newDoc.id,
                name: newDoc.name,
                createdAt: newDoc.createdAt,
                updatedAt: newDoc.updatedAt,
                preview: preview
            }));
        }
    };

    const handleOpenDocument = (id: string) => {
        dispatch(setCurrentDocId(id));
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ru-RU');
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Мои документы</h1>
                <button className="create-btn" onClick={() => dispatch(openCreateModal())}>
                    + Новый документ
                </button>
            </div>
            
            <div className="documents-grid">
                {documents.map(doc => {
                    const preview = doc.preview || [['', '', ''], ['', '', ''], ['', '', '']];
                    return (
                        <div key={doc.id} className="document-card" onDoubleClick={() => handleOpenDocument(doc.id)}>
                            <div className="document-preview">
                                <table>
                                    <tbody>
                                        {preview.slice(0, 3).map((row, i) => (
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
                                <button onClick={() => handleOpenDocument(doc.id)}>Открыть</button>
                                <button onClick={() => dispatch(openRenameModal({ id: doc.id, name: doc.name }))}>Переименовать</button>
                                <button onClick={() => handleDuplicate(doc.id)}>Дублировать</button>
                                <button onClick={() => handleDelete(doc.id, doc.name)}>Удалить</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {documents.length === 0 && (
                <div className="empty-state">
                    <p>У вас нет документов</p>
                    <button onClick={() => dispatch(openCreateModal())}>Создать первый документ</button>
                </div>
            )}

            {showCreateModal && (
                <CreateDocumentModal 
                    onClose={() => dispatch(closeCreateModal())} 
                    onCreate={handleCreate} 
                />
            )}

            {showRenameModal && (
                <RenameModal 
                    currentName={selectedDocName} 
                    onClose={() => dispatch(closeRenameModal())} 
                    onRename={handleRename} 
                />
            )}
        </div>
    );
};

export default Dashboard;