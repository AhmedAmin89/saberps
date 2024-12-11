import { useState, useEffect } from 'react';
import { Item } from '../../types';
import { Search } from './Search';

interface ItemLookupProps {
  items: Item[];
  selectedItems: number[];
  onSelect: (item: Item) => void;
}

export function ItemLookup({ items, selectedItems, onSelect }: ItemLookupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);

  useEffect(() => {
    const filtered = items
      .filter(item => !selectedItems.includes(item.id))
      .filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    setFilteredItems(filtered);
  }, [items, selectedItems, searchQuery]);

  const formatPrice = (price: number | null | undefined): string => {
    if (typeof price !== 'number') return '$0.00';
    return `$${Number(price).toFixed(2)}`;
  };

  return (
    <div className="space-y-2">
      <Search
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search items..."
      />
      {searchQuery && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
          {filteredItems.length > 0 ? (
            <ul className="py-1">
              {filteredItems.map(item => (
                <li
                  key={item.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => onSelect(item)}
                >
                  <div className="flex justify-between items-center">
                    <span>{item.name}</span>
                    <span className="text-gray-500">
                      {formatPrice(item.item_price)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-2 text-gray-500">
              No items found
            </div>
          )}
        </div>
      )}
    </div>
  );
}