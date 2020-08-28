import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './styles/App.scss';
import Table from './components/Table';

function App() {
  return (
    <Router>
      <Route path="/" component={Table} />
    </Router>
  );
}

export default App;
