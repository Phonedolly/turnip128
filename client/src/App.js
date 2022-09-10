import { BrowserRouter } from 'react-router-dom';

import { useState } from 'react';
import './App.scss';
import AnimatedRoutes from './Components/AnimatedRoutes';
import Header from './Components/Header';
import Footer from './Components/Footer';
import SearchModal from './Components/SearchModal';

function App() {
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);

  const openSearchModal = () => {
    setSearchModalOpen(true)
    document.body.style.cssText = `
    position: fixed; 
    top: -${window.scrollY}px;
    overflow-y: scroll;
    width: 100%;`;
  }
  const closeSearchModal = () => {
    setSearchModalOpen(false);
    document.body.style.cssText = '';
    window.scrollTo(0, parseInt(window.scrollY || '0', 10) * -1);
  }

  return (
    <>
      <div className="App">
        <BrowserRouter>
          <Header openSearchModal={openSearchModal} />
          <SearchModal isModalOpen={isSearchModalOpen} closeModal={closeSearchModal} />
          <AnimatedRoutes />
          <Footer />
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
