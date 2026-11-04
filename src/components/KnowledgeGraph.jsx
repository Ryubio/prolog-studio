import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Filter, 
  Search, 
  Info,
  Sparkles,
  Layers
} from 'lucide-react';

export default function KnowledgeGraph({ facts = [] }) {
  const svgRef = useRef(null);

  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterRelation, setFilterRelation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Viewport Pan & Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState(null);

  // Extract unique relation names
  const uniqueRelations = Array.from(new Set(facts.map(f => f.relation)));

  // Initialize Nodes and Links with guaranteed deterministic layout
  useEffect(() => {
    const nodeMap = new Map();
    const linksList = [];

    const filteredFacts = filterRelation === 'all'
      ? facts
      : facts.filter(f => f.relation === filterRelation);

    filteredFacts.forEach((fact, idx) => {
      if (!nodeMap.has(fact.from)) {
        nodeMap.set(fact.from, {
          id: fact.from,
          label: fact.from,
          connections: 0
        });
      }
      if (!nodeMap.has(fact.to)) {
        nodeMap.set(fact.to, {
          id: fact.to,
          label: fact.to,
          connections: 0
        });
      }

      nodeMap.get(fact.from).connections++;
      nodeMap.get(fact.to).connections++;

      linksList.push({
        id: `${fact.relation}_${fact.from}_${fact.to}_${idx}`,
        source: fact.from,
        target: fact.to,
        relation: fact.relation
      });
    });

    const nodesList = Array.from(nodeMap.values());
    const N = nodesList.length;

    // Arrange in a clean circular layout initially
    const radius = Math.min(220, Math.max(120, N * 28));
    nodesList.forEach((node, i) => {
      const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
      node.x = Math.round(Math.cos(angle) * radius);
      node.y = Math.round(Math.sin(angle) * radius);
      node.vx = 0;
      node.vy = 0;
    });

    // Run a quick simulation relaxation
    const nodeObjMap = new Map(nodesList.map(n => [n.id, n]));
    for (let step = 0; step < 80; step++) {
      // Repulsion
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const n1 = nodesList[i];
          const n2 = nodesList[j];
          let dx = n2.x - n1.x;
          let dy = n2.y - n1.y;
          let dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 180) {
            const force = (180 - dist) / dist * 0.2;
            n1.x -= dx * force;
            n1.y -= dy * force;
            n2.x += dx * force;
            n2.y += dy * force;
          }
        }
      }

      // Spring attraction along links
      linksList.forEach(l => {
        const s = nodeObjMap.get(l.source);
        const t = nodeObjMap.get(l.target);
        if (s && t) {
          let dx = t.x - s.x;
          let dy = t.y - s.y;
          let dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = 120;
          const force = (dist - targetDist) * 0.05;
          s.x += dx * force;
          s.y += dy * force;
          t.x -= dx * force;
          t.y -= dy * force;
        }
      });
    }

    setNodes(nodesList);
    setLinks(linksList);
    setSelectedNode(null);
  }, [facts, filterRelation]);

  // Helper to convert screen pointer to SVG coordinates
  const getSvgCoordinates = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    // Map to SVG viewport (centered at 0, 0 with pan & zoom)
    const svgX = (clientX - rect.width / 2 - pan.x) / zoom;
    const svgY = (clientY - rect.height / 2 - pan.y) / zoom;
    return { x: svgX, y: svgY, rawX: clientX, rawY: clientY };
  };

  // Node Drag Handlers
  const handleNodePointerDown = (e, node) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    setDraggingNodeId(node.id);
    setSelectedNode(node);
  };

  const handlePointerMove = (e) => {
    if (draggingNodeId) {
      const coords = getSvgCoordinates(e);
      setNodes(prev => prev.map(n => {
        if (n.id === draggingNodeId) {
          return { ...n, x: coords.x, y: coords.y };
        }
        return n;
      }));
    } else if (isPanning) {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      setPan({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y
      });
    }
  };

  const handlePointerUp = (e) => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
    }
    if (isPanning) {
      setIsPanning(false);
    }
  };

  // Background Pan Handlers
  const handleBackgroundPointerDown = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setIsPanning(true);
    setDragStart({
      x: e.clientX - rect.left - pan.x,
      y: e.clientY - rect.top - pan.y
    });
  };

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(z => Math.max(0.4, Math.min(3, z * factor)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  return (
    <div className="flex-1 flex flex-col h-full bg-prolog-bg select-none relative overflow-hidden">
      {/* Top Toolbar */}
      <div className="px-4 py-2.5 bg-prolog-panel border-b border-prolog-border flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-prolog-text font-semibold">
            <Network className="w-4 h-4 text-prolog-accent" />
            <span>İlişkisel Bilgi Grafiği</span>
            <span className="text-[10px] bg-prolog-card text-prolog-muted border border-prolog-border px-2 py-0.5 rounded-full">
              {nodes.length} Varlık · {links.length} İlişki
            </span>
          </div>

          {/* Relation Filter Dropdown */}
          {uniqueRelations.length > 0 && (
            <div className="flex items-center space-x-1 pl-3 border-l border-prolog-border">
              <Filter className="w-3 h-3 text-prolog-muted" />
              <select
                value={filterRelation}
                onChange={(e) => setFilterRelation(e.target.value)}
                className="bg-prolog-card text-prolog-text text-xs px-2 py-1 rounded-lg border border-prolog-border outline-none"
              >
                <option value="all">Tüm İlişkiler ({facts.length})</option>
                {uniqueRelations.map(rel => (
                  <option key={rel} value={rel}>{rel}/2</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Search & Zoom Controls */}
        <div className="flex items-center space-x-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-prolog-muted absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Varlık ara..."
              className="bg-prolog-card text-xs pl-7 pr-2 py-1 rounded-lg border border-prolog-border focus:border-prolog-accent text-prolog-text outline-none w-28 sm:w-36 transition-all"
            />
          </div>

          <div className="h-4 w-[1px] bg-prolog-border"></div>

          <button
            onClick={() => setZoom(z => Math.min(z + 0.2, 3))}
            className="p-1.5 bg-prolog-card hover:bg-prolog-hover text-prolog-text rounded-lg border border-prolog-border"
            title="Yakınlaştır"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))}
            className="p-1.5 bg-prolog-card hover:bg-prolog-hover text-prolog-text rounded-lg border border-prolog-border"
            title="Uzaklaştır"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 bg-prolog-card hover:bg-prolog-hover text-prolog-text rounded-lg border border-prolog-border"
            title="Görünümü Sıfırla"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing">
        {nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-prolog-muted">
            <Network className="w-12 h-12 mb-2 stroke-[1] text-prolog-muted/60" />
            <h4 className="text-sm font-medium text-prolog-text mb-1">Henüz Görselleştirilecek Gerçek Yok</h4>
            <p className="text-xs max-w-sm text-prolog-muted">
              Kodunuzda <code className="text-prolog-accent">parent(abraham, isaac).</code> veya <code className="text-prolog-accent">edge(a, b).</code> gibi 2 argümanlı gerçekler tanımladığınızda ilişkisel ağ burada otomatik çizilir.
            </p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            className="w-full h-full block"
            onPointerDown={handleBackgroundPointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
          >
            <defs>
              {/* Arrow Head Marker */}
              <marker
                id="arrowhead"
                viewBox="0 0 10 10"
                refX="28"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--accent-color)" opacity="0.8" />
              </marker>
              <marker
                id="arrowhead-highlight"
                viewBox="0 0 10 10"
                refX="28"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-variable)" />
              </marker>

              {/* Node Glow Filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Transform Group for Pan & Zoom */}
            <g transform={`translate(${pan.x + (svgRef.current ? svgRef.current.clientWidth / 2 : 400)}, ${pan.y + (svgRef.current ? svgRef.current.clientHeight / 2 : 300)}) scale(${zoom})`}>
              {/* Links (Edges) */}
              {links.map((link) => {
                const s = nodeMap.get(link.source);
                const t = nodeMap.get(link.target);
                if (!s || !t) return null;

                const isHighlighted = selectedNode && (selectedNode.id === s.id || selectedNode.id === t.id);
                const midX = (s.x + t.x) / 2;
                const midY = (s.y + t.y) / 2;

                return (
                  <g key={link.id} className="transition-all">
                    {/* Directed Line */}
                    <line
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={isHighlighted ? 'var(--color-variable)' : 'var(--accent-color)'}
                      strokeOpacity={isHighlighted ? 0.95 : 0.4}
                      strokeWidth={isHighlighted ? 2.5 : 1.5}
                      markerEnd={isHighlighted ? 'url(#arrowhead-highlight)' : 'url(#arrowhead)'}
                    />

                    {/* Edge Relation Label Badge */}
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-24"
                        y="-9"
                        width="48"
                        height="18"
                        rx="4"
                        fill="var(--bg-panel)"
                        stroke="var(--border-color)"
                        strokeWidth="1"
                        opacity="0.95"
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="9"
                        fontWeight="600"
                        fill={isHighlighted ? 'var(--color-variable)' : 'var(--text-muted)'}
                        fontFamily="Inter, sans-serif"
                      >
                        {link.relation}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => {
                const isSelected = selectedNode && selectedNode.id === node.id;
                const isSearched = searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());
                const isConnected = selectedNode && links.some(l => 
                  (l.source === selectedNode.id && l.target === node.id) || 
                  (l.target === selectedNode.id && l.source === node.id)
                );

                const radius = 22;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onPointerDown={(e) => handleNodePointerDown(e, node)}
                    className="cursor-pointer group"
                  >
                    {/* Highlight Ring */}
                    {(isSelected || isSearched) && (
                      <circle
                        r={radius + 6}
                        fill="none"
                        stroke={isSelected ? 'var(--accent-color)' : 'var(--color-variable)'}
                        strokeWidth="2.5"
                        strokeDasharray={isSelected ? '4 2' : 'none'}
                        className="animate-spin-slow"
                        opacity="0.8"
                      />
                    )}

                    {/* Node Circle */}
                    <circle
                      r={radius}
                      fill={
                        isSelected 
                          ? 'var(--accent-color)' 
                          : isSearched 
                            ? 'var(--color-variable)' 
                            : isConnected 
                              ? 'var(--bg-hover)' 
                              : 'var(--bg-card)'
                      }
                      stroke={
                        isSelected 
                          ? 'var(--text-main)' 
                          : isConnected 
                            ? 'var(--accent-color)' 
                            : 'var(--border-color)'
                      }
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      filter={isSelected ? 'url(#glow)' : undefined}
                      className="transition-colors group-hover:stroke-prolog-accent"
                    />

                    {/* Node Label Text */}
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="11"
                      fontWeight={isSelected ? '700' : '600'}
                      fill="var(--text-main)"
                      fontFamily="Inter, sans-serif"
                      className="pointer-events-none select-none"
                    >
                      {node.label.length > 9 ? node.label.substring(0, 8) + '…' : node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        )}

        {/* Selected Node Details Card Overlay */}
        {selectedNode && (
          <div className="absolute left-4 bottom-4 w-72 bg-prolog-panel/95 backdrop-blur-md border border-prolog-border rounded-xl p-3 shadow-2xl z-20 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-prolog-border">
              <span className="font-bold text-prolog-accent font-mono text-sm">{selectedNode.label}</span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-prolog-muted hover:text-prolog-text text-xs p-1"
              >
                ✕
              </button>
            </div>
            <div className="mt-2 space-y-1.5 max-h-44 overflow-y-auto">
              <div className="text-[11px] text-prolog-muted font-semibold">Bağlı Olduğu İlişkiler:</div>
              {links
                .filter(l => l.source === selectedNode.id || l.target === selectedNode.id)
                .map((l, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5 text-[11px] font-mono text-prolog-text bg-prolog-card p-1.5 rounded-lg border border-prolog-border">
                    <span className="text-prolog-accent font-semibold">{l.relation}</span>
                    <span className="text-prolog-muted">(</span>
                    <span className={l.source === selectedNode.id ? 'text-prolog-variable font-bold' : 'text-prolog-text'}>{l.source}</span>
                    <span className="text-prolog-muted">,</span>
                    <span className={l.target === selectedNode.id ? 'text-prolog-variable font-bold' : 'text-prolog-text'}>{l.target}</span>
                    <span className="text-prolog-muted">)</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
