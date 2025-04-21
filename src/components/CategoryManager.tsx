import React, { useState } from 'react';
import { Category } from '../types';

type CategoryManagerProps = {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  onClose: () => void;
};

export default function CategoryManager({
  categories,
  addCategory,
  updateCategory,
  deleteCategory,
  onClose,
}: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3498db');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    addCategory({
      name: newName.trim(),
      color: newColor,
    });
    
    setNewName('');
    setNewColor('#3498db');
  };

  const startEditing = (category: Category) => {
    setEditId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
  };

  const handleUpdateCategory = () => {
    if (!editId || !editName.trim()) return;
    
    updateCategory(editId, {
      name: editName.trim(),
      color: editColor,
    });
    
    setEditId(null);
  };

  return (
    <div className="overlay">
      <div className="modal">
        <h2>Manage Categories</h2>
        
        <form onSubmit={handleAddCategory} className="add-form">
          <input
            type="text"
            placeholder="New category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
          />
          <button type="submit">Add Category</button>
        </form>
        
        <div className="category-list">
          {categories.map((category) => (
            <div key={category.id} className="category-item">
              {editId === category.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                  />
                  <button onClick={handleUpdateCategory}>Save</button>
                  <button onClick={() => setEditId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <span 
                    className="color-dot" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="category-name">{category.name}</span>
                  <div className="actions">
                    <button onClick={() => startEditing(category)}>Edit</button>
                    <button onClick={() => deleteCategory(category.id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}