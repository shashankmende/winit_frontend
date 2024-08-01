import './App.css';
import Home from './components/Home/home';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import AddProduct from './components/AddProduct';


function App() {
  return (
    <div className="App">
      
      <Router>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/addProduct' element={<AddProduct/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
