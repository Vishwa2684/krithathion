// import React,{useState,useEffect} from 'react'
// import { auth ,db} from '../config/config';
// import {onAuthStateChanged} from 'firebase/auth'
// import {addDoc,serverTimestamp,
//         collection,onSnapshot,
//         query,orderBy,
//         where} from 'firebase/firestore'

// const History = () => {
//             const [itineraries, setItineraries] = useState([]);
          
//             useEffect(() => {
//               const fetchData = async () => {
//                 const q = query(collection(db, 'itineraries'), orderBy('createdAt', 'desc'));
//                 const unsubscribe = onSnapshot(q, (snapshot) => {
//                   const data = [];
//                   snapshot.forEach((doc) => {
//                     data.push({ id: doc.id, ...doc.data() });
//                   });
//                   setItineraries(data);
//                 });
          
//                 return () => unsubscribe();
//               };
          
//               fetchData();
//             }, []);
          
//             return (
//               <div>
//                 <h1>History</h1>
//                 <div>
//                   {itineraries.map((itinerary) => (
//                     <div key={itinerary.id}>
//                       <h3>{itinerary.title}</h3>
//                       <p>Duration: {itinerary.duration} days</p>
//                       <p>City: {itinerary.city}</p>
//                       {/* Add more details as per your itinerary structure */}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             );
//           };
          
// export default History;

// components/History.js

import React, { useState, useEffect } from 'react';
import { db } from '../config/config.js';
import { collection, getDocs } from 'firebase/firestore';

const History = () => {
  const [itineraries, setItineraries] = useState([]);

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const itinerariesCollection = collection(db, 'itineraries');
        const snapshot = await getDocs(itinerariesCollection);
        const itinerariesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItineraries(itinerariesData);
      } catch (error) {
        console.error('Error fetching itineraries:', error);
        // Handle error (e.g., show an error message)
      }
    };

    fetchItineraries();
  }, []);

  return (
    <div className="history-container">
      <h2>Itinerary History</h2>
      <div className="itinerary-list">
        {itineraries.map((itinerary) => (
          <div key={itinerary.id} className="itinerary-card">
            <h3>{itinerary.title}</h3>
            <p>City: {itinerary.city}</p>
            <p>Duration: {itinerary.duration} days</p>
            {/* Display other itinerary details as needed */}
            <p>Activities:</p>
            <ul>
              {itinerary.activities.map((activity, index) => (
                <li key={index}>{activity}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;

