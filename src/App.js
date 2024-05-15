import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import TestPee from './components/pee';
import Chat from './components/chat';
import GetStart from './components/getStart';
// import Test from './components/user';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<GetStart />} />
        <Route path="/video" exact element={<TestPee />} />
        <Route path="/about" exact element={<div>About</div>} />
        <Route path="/chat" exact element={<Chat currentUser="User1" />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
