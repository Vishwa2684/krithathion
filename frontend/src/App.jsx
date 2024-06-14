import './App.css'
import Chatbox from './Components/Chatbox/Chatbox.jsx'
import SideBar from './Components/Sidebar'
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
function App() {

  const [open,setOpen] =useState(true)
  console.log(`in app: ${open}`)

  const handleSidebarToggle = () => {
       setOpen(!open);
     };

  return (
    <>
    <div className='app-container'>
      <div className='sidebar'>
        <SideBar handleSidebarToggle={handleSidebarToggle} open={open}/>
      </div>

      <div className={`chat${open?'-open':'-closed'}`}>
        <Chatbox open={open}/>
      </div>
    </div>
    </>
  )
}

export default App

