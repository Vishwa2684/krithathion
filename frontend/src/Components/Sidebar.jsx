// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   CDBSidebar,
//   CDBSidebarContent,
//   CDBSidebarFooter,
//   CDBSidebarHeader,
//   CDBSidebarMenu,
//   CDBSidebarMenuItem,
// } from 'cdbreact';
// import { auth } from '../config/config';
// import { onAuthStateChanged, signOut } from 'firebase/auth';
// import { NavLink } from 'react-router-dom';

// const Sidebar = ({ handleSidebarToggle }) => {
//   const [user, setUser] = useState(null);
//   const nav = useNavigate();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUser(user);
//       } else {
//         setUser(null);
//       }
//     });
//     return () =>{
//       unsubscribeFromEvents()
//       cancelNetworkRequests()
//     }
//   }, []);

//   const handleLogout = async () => {
//     await signOut(auth);
//     console.log(`logged out successfully`);
//     nav('/');
//   };

//   return (
//     <div style={{ display: 'flex', height: '100vh', overflow: 'scroll initial' }}>
//       <CDBSidebar textColor="#000" backgroundColor="#FFC765">
//         <CDBSidebarHeader prefix={<i className="fa fa-bars fa-large" onClick={handleSidebarToggle}></i>}>
//           <a href="/" className="text-decoration-none" style={{ color: 'inherit' }}>
//             SanjiLLM
//           </a>
//         </CDBSidebarHeader>

//         <CDBSidebarFooter style={{ textAlign: 'center' }}>
//           <div
//             className="sidebar-btn-wrapper"
//             style={{
//               borderTop: 'solid #000',
//               padding: '20px 5px',
//             }}
//           >
//             {user ? (
//               <div className="user-card">
//                 <img src={user.photoURL} alt="User Avatar" className="user-avatar" />
//                 <span className="user-name">{user.displayName}</span>
//                 <button className="logout-btn" onClick={handleLogout}>
//                   Logout
//                 </button>
//               </div>
//             ) : (
//               'Please log in'
//             )}
//           </div>
//         </CDBSidebarFooter>
//       </CDBSidebar>
//     </div>
//   );
// };

// export default Sidebar;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarFooter,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from 'cdbreact';
import { auth } from '../config/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ handleSidebarToggle }) => {
  const [user, setUser] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => {
      unsubscribe();
      // Assuming unsubscribeFromEvents() and cancelNetworkRequests() are custom functions
      // If not needed, remove these lines
      // unsubscribeFromEvents();
      // cancelNetworkRequests();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    console.log(`logged out successfully`);
    nav('/');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'scroll initial' }}>
      <CDBSidebar textColor="#000" backgroundColor="#FFC765">
        <CDBSidebarHeader prefix={<i className="fa fa-bars fa-large" onClick={handleSidebarToggle}></i>}>
          <a href="/" className="text-decoration-none" style={{ color: 'inherit' }}>
            SanjiLLM
          </a>
        </CDBSidebarHeader>

        <CDBSidebarContent>
          <CDBSidebarMenu>
            <NavLink exact to="/c/history" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="history">Saved Routes</CDBSidebarMenuItem>
            </NavLink>
            {/* Add other menu items here if needed */}
          </CDBSidebarMenu>
        </CDBSidebarContent>

        <CDBSidebarFooter style={{ textAlign: 'center' }}>
          <div
            className="sidebar-btn-wrapper"
            style={{
              borderTop: 'solid #000',
              padding: '20px 5px',
            }}
          >
            {user ? (
              <div className="user-card">
                <img src={user.photoURL} alt="User Avatar" className="user-avatar" />
                <span className="user-name">{user.displayName}</span>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              'Please log in'
            )}
          </div>
        </CDBSidebarFooter>
      </CDBSidebar>
    </div>
  );
};

export default Sidebar;
