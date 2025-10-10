import React from 'react'

interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge = ({ score }: ScoreBadgeProps) => {
  const getBadgeStyles = () => {
    if (score > 70) {
      return {
        text: 'Strong',
        bgColor: 'bg-badge-green',
        textColor: 'text-badge-green-text'
      };
    }
    if (score > 49) {
      return {
        text: 'Good Start',
        bgColor: 'bg-badge-yellow',
        textColor: 'text-badge-yellow-text'
      };
    }
    return {
      text: 'Needs work',
      bgColor: 'bg-badge-red',
      textColor: 'text-badge-red-text'
    };
  };

  const badge = getBadgeStyles();

  return (
    <span className={`${badge.bgColor} ${badge.textColor} text-xs font-medium px-3 py-1 rounded-full`}>
      {badge.text}
    </span>
  );
};

export default ScoreBadge;

