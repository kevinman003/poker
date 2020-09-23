import React from 'react';

const Chips = props => {
  const { value, position } = props;

  return (
    <div className="chips-container">
      <div className={`top chip  chip-5`}></div>
      <div className={`chip  chip-1`}></div>
      <div className={`chip  chip-10`}></div>
      <div className={`chip  chip-25`}></div>
      <div className={`chip  chip-50`}></div>
      <div className={`chip chip-100`}></div>
    </div>
  );
};

export default Chips;
