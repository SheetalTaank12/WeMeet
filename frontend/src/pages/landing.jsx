import React from 'react'
import "../App.css"
import { Link } from "react-router-dom";
export default function LandingPage() {
  return (
    <div className='landingPageContainer'>
      <nav>
        <div className='navHeader'>
          <h2>WeMeet</h2>
        </div>
        <div className='navlist'>
          <Link to={"/demo123"} style={{textDecoration:"none", color:"white"}}>Join As Guest</Link>
          <Link to={"/auth"} style={{textDecoration:"none", color:"white"}}>Register</Link>
          <div role='button'>
            <Link to={"/auth"} style={{textDecoration:"none", color:"white"}}>Login</Link>
          </div>
        </div>
      </nav>

      <div className='landingMainContainer'>
        <div>
          <h1><span style={{color:"#FF9839"}}>Connect</span> with your loved Ones</h1>
          <p>Join our community and connect with friends and family anytime, anywhere.</p>
          <div role='button' style={{display:"flex", alignItems:"center", justifyContent:"center"}}>
            <Link to={"/auth"} >Get Started</Link>
          </div>
        </div>
        <div>
          <img src='/img2.webp' alt='/' />
        </div>
      </div>
    

   </div>
  )
}
