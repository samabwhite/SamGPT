import Chat from './Chat.jsx';
import Register from './Register.jsx';
import SignIn from './SignIn.jsx';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';

function App() {
  const loggedIn = useSelector(state => Boolean(state.session.userId));

  return (
    <div className='App'>
      <Router>
        <Routes>
          <Route
            path='/'
            element={loggedIn ? <Navigate to="/chat" replace /> : <SignIn />}
          />
          <Route
            path='/signin'
            element={loggedIn ? <Navigate to="/chat" replace /> : <SignIn />}
          />
          <Route
            path='/register'
            element={loggedIn ? <Navigate to="/chat" replace /> : <Register />}
          />
          <Route
            path='/chat'
            element={loggedIn ? <Chat /> : <Navigate to="/" replace />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
