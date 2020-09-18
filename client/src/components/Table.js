import React, { useState, useEffect } from 'react';

import Seat from './Seat';

const Table = () => {
  return (
    <div className="tableContainer">
      <div className="table">
        <div className="table-middle"></div>
        <Seat />
      </div>
    </div>
  );
};

export default Table;
