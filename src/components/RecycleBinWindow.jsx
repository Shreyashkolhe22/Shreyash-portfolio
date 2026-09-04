import { useState } from 'react';
import { recycleBin } from '../data/portfolio';
import { IconFile } from './Icons';

export default function RecycleBinWindow() {
  const [items, setItems] = useState(recycleBin);
  const [selected, setSelected] = useState(null);

  return (
    <div className="app app-bin">
      <div className="bin-toolbar">
        <span className="app-hint">{items.length} items</span>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => { setItems([]); setSelected(null); }}
          disabled={items.length === 0}
        >
          Empty Recycle Bin
        </button>
      </div>

      {items.length === 0 ? (
        <p className="bin-empty">
          Nothing left. Somewhere, a bug was quietly freed.
        </p>
      ) : (
        <ul className="bin-list">
          {items.map((f) => (
            <li key={f.name}>
              <button
                type="button"
                className={`bin-row${selected === f.name ? ' is-selected' : ''}`}
                onClick={() => setSelected(f.name)}
              >
                <IconFile width="16" height="16" />
                <span className="bin-name">{f.name}</span>
                <span className="bin-size">{f.size}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <p className="bin-note">
          {items.find((f) => f.name === selected)?.note}
        </p>
      )}
    </div>
  );
}
