import React from 'react';

const CardAction = props => {
  const { handleCheckCall, handleFold, handleRaise } = props;
  const [raise, setRaise] = React.useState(0);
  const [display, setDisplay] = React.useState({
    check: 'check  call',
    fold: 'check\nfold',
    raise: 'raise',
  });

  return (
    <div className="card-actions">
      <div class="action-button" id="fold" onClick={handleFold}>
        <p>{display.fold} </p>
      </div>
      <div class="action-button" id="checkCall" onClick={handleCheckCall}>
        {display.check}
      </div>
      <div
        class="action-button"
        id="raise"
        onClick={e => handleRaise(e, raise)}
      >
        {display.raise}
      </div>
      <div className="raise-choose">
        <input type="range" min="1" max="100" value="50" class="raise-slider" />
        <input
          class="raise-input"
          onChange={e => setRaise(e.target.value)}
          type="text"
        />
      </div>
    </div>
  );
};

export default CardAction;
