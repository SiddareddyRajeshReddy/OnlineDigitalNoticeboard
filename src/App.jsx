import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import NoticeBoard from '../frontend/components/noticeBoard'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex items-center w-screen my-10"> <img src="./nitLogo.png" className="w-[70px] mx-5 sm:mx-10" alt="" /> <div className="flex flex-col"><h1 className="sm:text-4xl font-bold mb-2">National Institute of Technology Sikkim</h1><p className="lg:text-lg opacity-90">Institute of National Importance</p></div></div>
      <div className="flex w-screen min-h-screen justify-center items-center">
        <NoticeBoard />
      </div>
    </>
  )
}

export default App