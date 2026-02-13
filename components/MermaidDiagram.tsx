
import React, { useEffect, useRef } from 'react';

interface MermaidDiagramProps {
  chart: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      // Clear previous content
      ref.current.removeAttribute('data-processed');
      ref.current.innerHTML = chart;
      
      try {
        // @ts-ignore - mermaid is loaded globally via script tag
        window.mermaid?.contentLoaded();
        // Alternative if contentLoaded isn't enough:
        // @ts-ignore
        window.mermaid?.init(undefined, ref.current);
      } catch (e) {
        console.error('Mermaid render error:', e);
      }
    }
  }, [chart]);

  useEffect(() => {
    // @ts-ignore
    window.mermaid?.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'Inter',
      flowchart: { useMaxWidth: true, htmlLabels: true }
    });
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm overflow-x-auto flex justify-center">
      <div className="mermaid" ref={ref}>
        {chart}
      </div>
    </div>
  );
};

export default MermaidDiagram;
