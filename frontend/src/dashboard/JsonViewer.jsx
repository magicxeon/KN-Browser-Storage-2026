import React, { useState } from 'react';

// Recursive JSON Tree component with dynamic collapsible toggles and syntax colors
function JsonViewer({ data, name = 'root', depth = 0 }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand up to level 2

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const getType = (val) => {
    if (val === null) return 'null';
    if (Array.isArray(val)) return 'array';
    return typeof val;
  };

  const type = getType(data);

  // Render Leaf Nodes
  if (type === 'string') {
    return (
      <div className="font-mono text-[10px] leading-relaxed pl-3 select-text">
        <span className="text-blue-400">{name}:</span>{' '}
        <span className="text-emerald-400">"{data}"</span>
      </div>
    );
  }

  if (type === 'number' || type === 'boolean') {
    return (
      <div className="font-mono text-[10px] leading-relaxed pl-3 select-text">
        <span className="text-blue-400">{name}:</span>{' '}
        <span className="text-amber-500 font-semibold">{String(data)}</span>
      </div>
    );
  }

  if (type === 'null') {
    return (
      <div className="font-mono text-[10px] leading-relaxed pl-3 select-text">
        <span className="text-blue-400">{name}:</span>{' '}
        <span className="text-rose-400 italic">null</span>
      </div>
    );
  }

  // Handle Object or Array Branch Nodes
  const isObject = type === 'object';
  const size = isObject ? Object.keys(data).length : data.length;
  const openingBracket = isObject ? '{' : '[';
  const closingBracket = isObject ? '}' : ']';

  if (size === 0) {
    return (
      <div className="font-mono text-[10px] leading-relaxed pl-3">
        <span className="text-blue-400">{name}:</span>{' '}
        <span className="text-gray-500">
          {openingBracket} {closingBracket} <span className="text-[8px] opacity-40 font-mono">(empty)</span>
        </span>
      </div>
    );
  }

  return (
    <div className="font-mono text-[10px] leading-relaxed">
      {/* Node header bar (trigger expand) */}
      <div 
        onClick={toggleExpand}
        className="cursor-pointer select-none hover:bg-white/5 px-1 rounded flex items-center space-x-1.5 inline-flex"
      >
        <span className="text-[7px] text-gray-500 font-mono transition-transform duration-200">
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className="text-blue-400 font-semibold">{name}:</span>{' '}
        <span className="text-gray-400 font-light">
          {openingBracket}{!isExpanded && ` ... ${size} items ... ${closingBracket}`}
        </span>
      </div>

      {/* Children renderer */}
      {isExpanded && (
        <div className="pl-4 border-l border-white/5 ml-1.5 space-y-1 my-0.5">
          {isObject ? (
            Object.entries(data).map(([k, v]) => (
              <JsonViewer key={k} data={v} name={k} depth={depth + 1} />
            ))
          ) : (
            data.map((item, idx) => (
              <JsonViewer key={idx} data={item} name={`[${idx}]`} depth={depth + 1} />
            ))
          )}
        </div>
      )}

      {isExpanded && (
        <div className="text-gray-400 font-light pl-2.5">
          {closingBracket}
        </div>
      )}
    </div>
  );
}

export default JsonViewer;
