import React,{useState} from 'react'
import './Login.css'
import { ToastContainer,toast } from 'react-toastify'
import {auth} from '../../config/config'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword,GoogleAuthProvider,signInWithPopup } from 'firebase/auth'

const provider = new GoogleAuthProvider()

export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate()

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);
    
    const handleLogin = async(e)=>{
        e.preventDefault()
        try{
            const userCred = await signInWithEmailAndPassword(auth,email,password)
        if(userCred.user){
            toast('Login successful')
            navigate('/c')
        }else{
            toast.error('Invalid email or password')
        }
    }catch(error){
        toast.error('Invalid email or password')
    }
    }

    const handleGoogleSignup = async () =>{
        try{
            const userCred = await signInWithPopup(auth,provider)
            if(userCred.user){
                toast('Login successful')
                navigate('/c')
            }else{
                toast.error('Invalid email or password')
            }
        }catch(error){
            toast.error('Invalid email or password')
        }
    }

  return (
    <div className='container'>

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
            
            
            <form onSubmit={handleLogin} className='form-group'>
                <h2>Log In</h2>
                <input type="email" placeholder="Email" value={email} onChange={handleEmailChange} className='email' id='email'/>
                <input type="password" placeholder="Password" value={password} onChange={handlePasswordChange} className='password' id='password'/>
                <button className='btn-group' type="submit">Log In </button>
                <button className='google-btn' onClick={handleGoogleSignup}>Log in with Google</button>

            </form>
        </div>
  )
}
