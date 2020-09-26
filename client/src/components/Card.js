import React from 'react';

const Card = props => {
  const { card, className, shown } = props;
  const suitSymbol = {
    c: { symbol: '♣', color: 'black' },
    s: { symbol: '♠', color: 'black' },
    d: { symbol: '♦', color: 'red' },
    h: { symbol: '♥', color: 'red' },
  };
  const faceCards = {
    11: 'J',
    12: 'Q',
    13: 'K',
    14: 'A',
  };

  return shown ? (
    <div
      className={`card card-shown card-${suitSymbol[card.suit].color} ${
        className ? className : ''
      }`}
    >
      <p className="suit-top-left">{suitSymbol[card.suit].symbol}</p>
      <div className="card-value">
        {faceCards[card.value] ? faceCards[card.value] : card.value}
      </div>
      <p className="suit-bottom-right">{suitSymbol[card.suit].symbol}</p>
    </div>
  ) : (
    <div className="card card-hidden"></div>
  );
};

export default Card;
