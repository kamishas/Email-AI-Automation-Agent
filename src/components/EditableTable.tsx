import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Recipient } from '../context/CampaignContext';
import { Button } from './ui/button';

interface EditableTableProps {
  recipients: Recipient[];
  onUpdate: (id: string, updates: Partial<Recipient>) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function EditableTable({ recipients, onUpdate, onDelete, onAdd }: EditableTableProps) {
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleDoubleClick = (id: string, field: string, currentValue: string) => {
    setEditingCell({ id, field });
    setEditValue(currentValue);
  };

  const handleBlur = () => {
    if (editingCell) {
      onUpdate(editingCell.id, { [editingCell.field]: editValue });
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const columns = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'company', label: 'Company' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">
          Recipients ({recipients.length})
        </h3>
        <Button onClick={onAdd} size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recipients.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                  No recipients yet. Add some manually or upload a CSV file.
                </td>
              </tr>
            ) : (
              recipients.map((recipient) => (
                <tr key={recipient.id} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => {
                    const value = recipient[column.key as keyof Recipient] as string || '';
                    const isEditing =
                      editingCell?.id === recipient.id && editingCell?.field === column.key;

                    return (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-full px-3 py-1 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div
                            onDoubleClick={() =>
                              handleDoubleClick(recipient.id, column.key, value)
                            }
                            className="text-sm text-gray-900 cursor-text hover:bg-gray-100 px-3 py-1 rounded transition-colors"
                            title="Double-click to edit"
                          >
                            {value || (
                              <span className="text-gray-400 italic">Empty</span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => onDelete(recipient.id)}
                      className="inline-flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Hint */}
      {recipients.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-100 text-xs text-blue-700">
          💡 Tip: Double-click any cell to edit its value
        </div>
      )}
    </div>
  );
}
