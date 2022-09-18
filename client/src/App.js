import { BrowserRouter } from 'react-router-dom';

import { useState } from 'react';
import './App.scss';
import AnimatedRoutes from './Components/AnimatedRoutes';
import Header from './Components/Header';
import Footer from './Components/Footer';
import SearchModal from './Components/SearchModal';

function App() {


  return (
    <>
      <div className="App">
        <BrowserRouter>
          <Header />
          <AnimatedRoutes />
          <Footer />
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
