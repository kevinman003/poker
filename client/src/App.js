import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './styles/App.scss';
import TablePage from './components/TablePage';

const App = () => {
  return (
    <Router>
      <Route path="/" component={TablePage} />
    </Router>
  );
};

export default App;
