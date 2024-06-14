import React, { useState, useRef, useEffect } from 'react';
import './Chatbox.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast, ToastContainer } from 'react-toastify';
import { IoSendSharp } from 'react-icons/io5';
import 'react-toastify/dist/ReactToastify.css';
import Button from 'react-bootstrap/Button';
import loadingSVG from '/loading.svg'

import { auth ,db} from '../../config/config';
import {onAuthStateChanged} from 'firebase/auth'
import {addDoc,serverTimestamp,
        collection,onSnapshot,
        query,orderBy,
        where} from 'firebase/firestore'

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


const MODEL_NAME = import.meta.env.VITE_MODEL;
const API_KEY = import.meta.env.VITE_MODEL_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const messagesCollection = collection(db, 'messages');
const iteriniaries = collection(db,'iteriniaries')

export default function Chatbox({open}) {
  const [prompt, setPrompt] = useState('');
  const [city, setCity] = useState('');
  const [duration, setDuration] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null)
  const [user,setUser] =useState(null)


  const handleChangeDuration = (e) => {
    const value = parseInt(e.target.value, 10);

    if (value >= 1 && value <= 28) {
      setDuration(value);
    } else if (e.target.value === '') {
      setDuration('');
    }
  };


  // const handleSaveItinerary = async () => {
  //   console.log('Clicked on itinerary');
    
  //   try {
  //     // Find the latest bot message
  //     const latestBotMessage = messages.find((message) => message.role === 'bot');
  //     if (!latestBotMessage) {
  //       toast.error('No itinerary generated yet');
  //       return;
  //     }
  
  //     // Construct the itinerary object to save
  //     const itineraryData = {
  //       title: `Trip to ${city}`,
  //       city: city,
  //       duration: duration,
  //       activities: [], // Placeholder for activities (to be populated based on requirements)
  //       botMessage: latestBotMessage.content, // Store the bot-generated itinerary message
  //       createdAt: serverTimestamp(),
  //       userId: user.uid,
  //     };
  
  //     // Add the itinerary to Firestore
  //     const docRef = await addDoc(collection(db, 'itineraries'), itineraryData);
  //     console.log('Itinerary saved with ID: ', docRef.id);
  
  //     // Optionally navigate to a success page or display a success message
  //     // navigate('/success'); // Example navigation to a success page
  //   } catch (error) {
  //     console.error('Error saving itinerary: ', error);
  //     toast.error('Error occurred while saving itinerary');
  //   }
  // };

  const handleSaveItinerary = async (botMessage, messageIndex) => {
    console.log('Clicked on itinerary', messageIndex);
    
    try {
      if (botMessage.role !== 'bot') {
        toast.error('Selected message is not an itinerary');
        return;
      }
  
      // Find the corresponding user message (assuming it's the message right before the bot message)
      const userMessageIndex = messageIndex - 1;
      const userMessage = userMessageIndex >= 0 ? messages[userMessageIndex] : null;
  
      // Extract city and duration from the user message (you might need to adjust this based on your actual data structure)
      const cityMatch = userMessage?.content.match(/trip to (.+?)\./);
      const durationMatch = userMessage?.content.match(/(\d+)-day itinerary/);
  
      const city = cityMatch ? cityMatch[1] : 'Unknown';
      const duration = durationMatch ? parseInt(durationMatch[1], 10) : 0;
  
      // Construct the itinerary object to save
      const itineraryData = {
        title: `Trip to ${city}`,
        city: city,
        duration: duration,
        activities: [], // Placeholder for activities (to be populated based on requirements)
        botMessage: botMessage.content, // Store the bot-generated itinerary message
        createdAt: serverTimestamp(),
        userId: user.uid,
      };
  
      // Add the itinerary to Firestore
      const docRef = await addDoc(collection(db, 'itineraries'), itineraryData);
      console.log('Itinerary saved with ID: ', docRef.id);
  
      toast.success('Itinerary saved successfully!');
    } catch (error) {
      console.error('Error saving itinerary: ', error);
      toast.error('Error occurred while saving itinerary');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const messagesQuery = query(messagesCollection, orderBy('createdAt', 'asc'),where('userId','==',user.uid));
        // Set up the listener for messages here
        const unsubscribeMessages = onSnapshot(messagesQuery, (querySnapshot) => {
          const fetchedMessages = [];
          querySnapshot.forEach((doc) => {
            fetchedMessages.push({ id: doc.id, ...doc.data() });
          });
          setMessages(fetchedMessages);
        });
  
        // Clean up the messages listener when the component unmounts
        return unsubscribeMessages;
      } else {
        setUser(null);
      }
    });
  
    // Clean up the auth listener when the component unmounts
    return unsubscribe;
  }, []);

  const action = async () => {
    // if (!prompt) {
    //   toast.error("Enter a prompt");
    //   return;
    // }
    if (!city || !duration) {
      console.log(duration)
      if(duration<1 || duration>28){
      toast.error("You can plan an iteriniary for 28 days (max)");

      }
      toast.error("Please enter both city and duration");
      return;
    }
  
    const generatedPrompt = `Create a ${duration}-day itinerary for a trip to ${city}. Include historical sites, sustainable travel options, and accommodation suggestions.`;
  
  
    setMessages((prevMessages) => [
      ...prevMessages,
      { content: `${city}:${duration} days`, role: "user" },
    ]);
    setLoading(true);
  
    try {
      const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      };
  
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        // Add other safety settings as needed
      ];
      
      // Initialize chat with context
      const contextMessage = "You are an AI-powered travel itinerary generator. Your task is to create detailed day-by-day itineraries based on the given city and duration. Focus on historical sites, sustainable travel options, and provide accommodation suggestions. Format your response as a list of activities for each day, ensuring a balanced and engaging travel plan.";

      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [],
      });
  
      const result = await chat.sendMessage(`${contextMessage}\n\n${generatedPrompt}`);
      const response = result.response;
      const msg = response.text();
  
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: `${msg}`, role: "bot" },
      ]);
  
      // Store the user's prompt and bot's response in Firestore
      await addDoc(messagesCollection, {
        content: prompt,
        role: "user",
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
  
      await addDoc(messagesCollection, {
        content: msg,
        role: "bot",
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
  
      setLoading(false);
      setPrompt("");
      inputRef.current.value = "";
    } catch (error) {
      console.error("Error occurred:", error);
      toast.error("Error occurred while processing your request");
      setLoading(false);
    }
  };
  return (
    <>
      <div className={`container`}>
      <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            transition: Bounce
            />

    <div className="messages-container">
  {messages.map((message, index) => (
    <div
      key={index}
      className={`message ${
        message.role === 'user' ? 'message-user' : 'message-bot'
      }`}
    >
      {message.role === 'bot' ? (
        <>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
          <div className="button-container">
            <Button onClick={() => handleSaveItinerary(message, index)}>
              Save itinerary
            </Button>
            
            {/* Add more buttons as needed */}
          </div>
        </>
      ) : (
        message.content
      )}
    </div>
  ))}
</div>

    <div className="search"  onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // Prevent the default form submission behavior
                  action();
                }}}>
        <input
          type="text"
          className="input-field"
          placeholder="Enter city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          type="number"
          className="input-field"
          placeholder="Duration (days)"
          value={duration}
          onChange={handleChangeDuration}
          min={1}
          max={28}
        />
        {loading ? (
          <div className="send-button">
            <img src={loadingSVG} alt="loading..." />
          </div>
        ) : (
          <Button className="send-button" onClick={action}>
            <IoSendSharp />
          </Button>
        )}
    </div>
      </div>
    </>
  );
}
