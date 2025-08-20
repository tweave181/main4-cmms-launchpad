import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
  id?: string;
  className?: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart, id = 'mermaid-chart', className = '' }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });

    // Render the chart
    if (chartRef.current) {
      chartRef.current.innerHTML = '';
      mermaid.render(id, chart).then(({ svg }) => {
        if (chartRef.current) {
          chartRef.current.innerHTML = svg;
        }
      });
    }
  }, [chart, id]);

  return <div ref={chartRef} className={className} />;
};

export default Mermaid;