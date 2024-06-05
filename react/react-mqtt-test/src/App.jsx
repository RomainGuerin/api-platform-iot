import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import HomeView from './views/HomeView';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <HomeView />
      </div>
    </>
  )
}

export default App
