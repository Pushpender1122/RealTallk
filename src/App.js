import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import TestPee from './components/pee';
// import Test from './components/user';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<TestPee />} />
        <Route path="/about" exact element={<div>About</div>} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
