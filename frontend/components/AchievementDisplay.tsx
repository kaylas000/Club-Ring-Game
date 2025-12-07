import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ACHIEVEMENTS = {
  first_combat: { name: '⚔️ First Battle', color: 'from-yellow-500 to-yellow-600' },
  level_10: { name: '📈 Level 10', color: 'from-purple-500 to-purple-600' },
  ten_wins: { name: '🏆 Ten Wins', color: 'from-blue-500 to-blue-600' },
  legendary_damage: { name: '💥 Legendary Damage', color: 'from-red-500 to-red-600' },
  perfect_match: { name: '✨ Perfect Battle', color: 'from-green-500 to-green-600' },
};

export const AchievementDisplay: React.FC<{ playerId: string }> = ({ playerId }) => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await axios.get(`/api/game/achievements/${playerId}`);
        setAchievements(response.data);
      } catch (error) {
        console.error('Error loading achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [playerId]);

  if (loading) {
    return <div className="text-white">Loading achievements...</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">🎖️ Achievements</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(ACHIEVEMENTS).map(([key, achievement]: any) => {
          const earned = achievements.some(a => a.achievementId === key);
          
          return (
            <div
              key={key}
              className={`bg-gradient-to-r ${achievement.color} p-4 rounded-lg ${
                !earned && 'opacity-50 grayscale'
              } transition`}
            >
              <h3 className="font-bold text-white mb-2">{achievement.name}</h3>
              {earned && (
                <p className="text-sm text-gray-100">✅ Unlocked</p>
              )}
              {!earned && (
                <p className="text-sm text-gray-200">🔒 Locked</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
