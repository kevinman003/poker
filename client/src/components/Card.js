import React from 'react';

const Card = props => {
  const { card, className } = props;

  return (
    <div className={`card ${className}`}>
      <p>
        {card.value} {card.suit}
      </p>
    </div>
  );
};

export default Card;
