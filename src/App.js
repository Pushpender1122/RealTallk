import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Chat from './components/chat';
import GetStart from './components/getStart';
import BothvideoChat from './components/bothvideoChat';
// import Test from './components/user';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<GetStart />} />
        <Route path="/about" exact element={<div>About</div>} />
        <Route path="/chat" exact element={<Chat />} />
        <Route path="/both" exact element={<BothvideoChat />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
