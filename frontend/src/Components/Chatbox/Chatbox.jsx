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

export default function Chatbox({open}) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null)
  const [user,setUser] =useState(null)

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
    if (!prompt) {
      toast.error("Enter a prompt");
      return;
    }
  
    setMessages((prevMessages) => [
      ...prevMessages,
      { content: prompt, role: "user" },
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
      const contextMessage = "You are an AI-powered travel assistant designed to provide comprehensive travel planning and recommendations, with a focus on historical importance, sustainable travel, and accommodation suggestions. Your primary tasks include generating location histories, recommending travel itineraries, and suggesting sustainable travel plans while providing useful links for room booking. You only provide reply related to this context.";

      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [],
      });
  
      const result = await chat.sendMessage(`${contextMessage}\n\n${prompt}`);
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
         {/* {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role === 'user' ? 'message-user' : 'message-bot'}`}
            >
              {message.content}
            </div>
          ))}*/}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role === "user" ? "message-user" : "message-bot"}`}
            >
              {message.role === "bot" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} children={message.content} />
              ) : (
                message.content
              )}
            </div>
            ))}
        </div>
        <div className="search">
          <div className="textarea-container">
            <textarea
              ref={inputRef}
              className="textarea"
              id="search"
              placeholder="Ask about travel or places..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.shiftKey) {
                  setPrompt((prevPrompt) => prevPrompt + '');
                } else if (e.key === 'Enter') {
                  e.preventDefault(); // Prevent the default form submission behavior
                  action();
                }
              }}
            />
          </div>
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
