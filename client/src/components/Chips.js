import React from 'react';
import { connect } from 'react-redux';

const lowestValues = [1, 5, 10, 25, 50, 100];
const blindMult5 = [0.5, 2, 5, 20, 100, 200];
const blindMult10 = [0.5, 2.5, 5, 25, 50, 250];

const Chips = props => {
  const { pokerTable, value, position } = props;
  const [chipValues, setChipValues] = React.useState([]);
  const [totalChips, setTotalChips] = React.useState([]);

  React.useEffect(() => {
    if (pokerTable) {
      findChipValues(pokerTable.blind);
    }
  }, [pokerTable]);

  React.useEffect(() => {
    const result = [];
    let index = chipValues.length - 1;
    let chips = value;
    while (chips) {
      const currChip = chipValues[index];
      const num = Math.floor(chips / currChip);
      chips %= currChip;
      for (let i = 0; i < num; i++) {
        result.unshift(currChip);
      }
      index -= 1;
    }
    setTotalChips(result);
    console.log('result:', result);
  }, [chipValues]);

  const findChipValues = blind => {
    let values = [];
    if (blind < 10) {
      values = lowestValues;
    } else if ((blind / 2) % 10 === 5) {
      values = blindMult5.map(mult => blind * mult);
    } else {
      values = blindMult10.map(mult => blind * mult);
    }
    setChipValues(values);
  };

  return (
    <div className={`chips-container chip-position-${position}`}>
      {totalChips.map(chip => {
        const index = chipValues.findIndex(value => value === chip) + 1;
        return <div className={`chip-${index}`}></div>;
      })}
      <p className="chip-label"> {value} </p>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    pokerTable: state.pokerTable,
  };
};

export default connect(mapStateToProps, null)(Chips);
