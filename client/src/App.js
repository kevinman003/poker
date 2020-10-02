import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import './styles/App.scss';
import TablePage from './components/TablePage';

const makeid = length => {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

function App() {
  return (
    <Router>
      <Route path="/" exact>
        <Redirect to={`/?table=${makeid(4)}`} />
      </Route>
      <Route path="/" component={TablePage} />
    </Router>
  );
}

export default App;
