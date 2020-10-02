import React from 'react';

import { connect } from 'react-redux';
import Card from './Card';

const CommunityCards = props => {
  const { pokerTable } = props;
  return (
    <div className="community-container">
      {pokerTable &&
        pokerTable.cards.map(card => {
          return <Card card={card} shown className="community-card" />;
        })}
    </div>
  );
};

const mapStateToProps = state => {
  return {
    pokerTable: state.pokerTable,
  };
};

export default connect(mapStateToProps, null)(CommunityCards);
