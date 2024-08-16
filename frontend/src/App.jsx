import Chat from './Chat.jsx';
import Register from './Register.jsx';
import SignIn from './SignIn.jsx';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from 'react';

function App() {
  return (
    <div className='App'>
      <Router>
        <Routes>
          <Route path='/' element={<SignIn />} />
          <Route path='/register' element={<Register />} />
          <Route path='/chat' element={<Chat />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;