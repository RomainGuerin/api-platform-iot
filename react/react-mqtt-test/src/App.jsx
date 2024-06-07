import './App.css';
import GameProvider from './models/GameContext';
import HomeView from './views/HomeView';

function App() {
  return (
    <>
      <GameProvider>
        <HomeView />
      </GameProvider>
    </>
  )
}

export default App
