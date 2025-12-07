import React, { useEffect, useRef } from 'react';

interface CombatLogProps {
  logs: string[];
  maxHeight?: string;
}

export const CombatLog: React.FC<CombatLogProps> = ({
  logs,
  maxHeight = 'max-h-64',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (log: string): string => {
    if (log.includes('атака') || log.includes('атак')) return 'text-red-400';
    if (log.includes('защита') || log.includes('защит')) return 'text-blue-400';
    if (log.includes('умение') || log.includes('Skill')) return 'text-purple-400';
    if (log.includes('исцел') || log.includes('Heal')) return 'text-green-400';
    if (log.includes('урон') || log.includes('Damage')) return 'text-red-500';
    if (log.includes('крит') || log.includes('Critical')) return 'text-yellow-400';
    return 'text-gray-300';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Battle Log</h3>
        <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
          {logs.length} actions
        </span>
      </div>

      <div
        ref={scrollRef}
        className={`${maxHeight} overflow-y-auto bg-gray-900 rounded p-4 space-y-2`}
      >
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-8 italic">Battle hasn't started yet...</p>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className="flex items-start gap-2"
            >
              <span className="text-gray-500 text-sm flex-shrink-0 mt-0.5">
                {String(index + 1).padStart(2, '0')}.
              </span>
              <p className={`text-sm ${getLogColor(log)} leading-relaxed flex-grow`}>
                {log}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Recent Actions Summary */}
      {logs.length > 0 && (
        <div className="mt-4 p-3 bg-gray-700 rounded text-sm text-gray-300">
          <p>📄 Latest: {logs[logs.length - 1]}</p>
        </div>
      )}
    </div>
  );
};
