import Chat from './Chat.jsx';
import Register from './Register.jsx';
import SignIn from './SignIn.jsx';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import AuthRoute from './AuthRoute.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

function App() {

  return (
    <div className='App'>
      <Router>
        <Routes>
          <Route
            path='/'
            element={<AuthRoute element={<SignIn />} />}
          />
          <Route
            path='/signin'
            element={<AuthRoute element={<SignIn />} />}
          />
          <Route
            path='/register'
            element={<AuthRoute element={<Register />} />}
          />
          <Route
            path='/chat'
            element={<ProtectedRoute element={<Chat />} />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
