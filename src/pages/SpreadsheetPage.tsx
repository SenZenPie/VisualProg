import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setCurrentDocId, setCurrentDocument, setDocumentsList } from '../store/slices/documentsSlice';
import { setCells } from '../store/slices/spreadsheetSlice';
import { getDocumentById, getDocumentsList } from '../services/storageService';
import type { Cell } from '../types/spreadsheet';
import Spreadsheet from '../components/SpreadSheet/SpreadSheet';

const SpreadsheetPage = () => {
    const { documentId } = useParams<{ documentId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!documentId) {
            navigate('/dashboard');
            return;
        }

        const doc = getDocumentById(documentId);
        
        if (!doc) {
            navigate('/dashboard');
            return;
        }

        const docs = getDocumentsList();
        dispatch(setDocumentsList(docs));
        dispatch(setCurrentDocument(doc));
        dispatch(setCurrentDocId(documentId));
        
        if (doc.cells && doc.cells.length > 0) {
            dispatch(setCells(doc.cells));
        } else {
            const initCells = (rows: number, cols: number): Cell[][] => {
                const newCells: Cell[][] = [];
                for (let i = 0; i < rows; i++) {
                    newCells[i] = [];
                    for (let j = 0; j < cols; j++) {
                        newCells[i][j] = {
                            value: null,
                            formattedValue: '',
                            formula: null,
                            style: {
                                bold: false,
                                italic: false,
                                underline: false,
                                textColor: '#000000',
                                bgColor: '#ffffff',
                                align: 'left'
                            }
                        };
                    }
                }
                return newCells;
            };
            dispatch(setCells(initCells(doc.rows, doc.cols)));
        }
        
        setLoading(false);
    }, [documentId, navigate, dispatch]);

    if (loading) {
        return <div>Загрузка...</div>;
    }

    return <Spreadsheet />;
};

export default SpreadsheetPage;