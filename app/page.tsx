"use client";

import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import styles from "./Invitation.module.css"; // Externalize your styles to this CSS module if needed

export default function InvitationPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const [showButton, setShowButton] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFolded, setIsFolded] = useState(true);
  const [isGrown, setIsGrown] = useState(false);
  const [isAlreadyInvited, setIsAlreadyInvited] = useState(false);
  const [cachedEmail, setCachedEmail] = useState<string | null>(null);

  const titleRef = useRef<HTMLSpanElement>(null);
  const content1Ref = useRef<HTMLSpanElement>(null);
  const content2Ref = useRef<HTMLSpanElement>(null);

  const titleText = "Haroon Elahi";
  const content1Text = "Sent you an invitation for Dinner";
  const content2Text = "Sugar Land";
  const formHeadingText = "Dinner Invitation";

  // Check for cached invitation on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('invitation_email');
    if (savedEmail) {
      setCachedEmail(savedEmail);
      checkUserInvitation(savedEmail);
    }
  }, []);

  const checkUserInvitation = async (email: string) => {
    try {
      const response = await fetch(`/api/invitations?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.alreadyInvited) {
          setIsAlreadyInvited(true);
        }
      }
    } catch (error) {
      console.error('Error checking invitation:', error);
    }
  };

  const typeWriter = (element: HTMLSpanElement | null, text: string, speed: number, callback?: () => void) => {
    if (!element) return;
    element.textContent = "";
    let i = 0;
    function typing() {
      if (i < text.length && element) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typing, speed);
      } else if (callback) {
        callback();
      }
    }
    typing();
  };

  const startTypewriter = () => {
    // Always show the initial invitation message first
    typeWriter(titleRef.current, titleText, 30, () => {
      setTimeout(() => {
        typeWriter(content1Ref.current, content1Text, 15, () => {
          setTimeout(() => {
            typeWriter(content2Ref.current, content2Text, 20, () => {
              setShowButton(true);
            });
          }, 300);
        });
      }, 200);
    });
  };

  useEffect(() => {
    setTimeout(() => setIsFolded(false), 500);
    setTimeout(() => setIsGrown(true), 1000);
    setTimeout(startTypewriter, 2000);
  }, []); // Remove isAlreadyInvited dependency to always show initial message

  const handleEnvelopeClick = () => {
    if (showForm) return;
    if (isFolded) {
      setTimeout(() => setIsGrown(true), 1000);
      setTimeout(() => {
        setIsFolded(false);
        setTimeout(startTypewriter, 2000);
      }, 0);
    }
  };

  const handleJoinClick = () => {
    setShowButton(false);
    setTimeout(() => {
      if (isAlreadyInvited) {
        // For already invited users, show their info instead of form
        setShowForm(false);
        if (titleRef.current) titleRef.current.textContent = "You're Already Invited!";
        if (content1Ref.current) {
          content1Ref.current.style.display = "inline";
          content1Ref.current.textContent = `Welcome back, ${cachedEmail}!`;
        }
        if (content2Ref.current) {
          content2Ref.current.style.display = "inline";
          content2Ref.current.textContent = "You're on our guest list! 🎉";
        }
      } else {
        // For new users, show the form
        setShowForm(true);
        if (titleRef.current) titleRef.current.textContent = formHeadingText;
        if (content1Ref.current) content1Ref.current.style.display = "none";
        if (content2Ref.current) content2Ref.current.style.display = "none";
      }
    }, 300);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (formRef.current) {
      formRef.current.classList.add("form-animate-out");
    }
    if (submitBtnRef.current) {
      submitBtnRef.current.classList.add("submit-animate-out");
    }
    const form = e.target as HTMLFormElement;
    const data = {
      fullName: (form.elements.namedItem('fullName') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
    };
    setTimeout(() => {
      fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .then((response) => {
          setIsSubmitting(false);
          
          // Cache the email regardless of whether user was already invited
          localStorage.setItem('invitation_email', data.email);
          setCachedEmail(data.email);
          
          if (response.alreadyInvited) {
            // User was already invited
            setIsAlreadyInvited(true);
            setFormSubmitted(true);
            setTimeout(() => {
              setFormSubmitted(false);
              // First, shrink the paper back to envelope size
              setIsGrown(false);
              // Wait for paper to shrink, then hide form and fold envelope
              setTimeout(() => {
                setShowForm(false);
                // Reset text content to initial invitation
                if (titleRef.current) (titleRef.current as HTMLSpanElement).textContent = "";
                if (content1Ref.current) {
                  (content1Ref.current as HTMLSpanElement).textContent = "";
                  (content1Ref.current as HTMLSpanElement).style.display = "inline";
                }
                if (content2Ref.current) {
                  (content2Ref.current as HTMLSpanElement).textContent = "";
                  (content2Ref.current as HTMLSpanElement).style.display = "inline";
                }
                setShowButton(false);
                // Finally fold the envelope
                setTimeout(() => {
                  setIsFolded(true);
                }, 300);
              }, 1000); // Wait for paper shrink animation
            }, 4000); // Show success message for 4 seconds
          } else {
            // New user successfully invited
            setFormSubmitted(true);
            setTimeout(() => {
              setFormSubmitted(false);
              // First, shrink the paper back to envelope size
              setIsGrown(false);
              // Wait for paper to shrink, then hide form and fold envelope
              setTimeout(() => {
                setShowForm(false);
                // Reset text content
                if (titleRef.current) (titleRef.current as HTMLSpanElement).textContent = "";
                if (content1Ref.current) {
                  (content1Ref.current as HTMLSpanElement).textContent = "";
                  (content1Ref.current as HTMLSpanElement).style.display = "inline";
                }
                if (content2Ref.current) {
                  (content2Ref.current as HTMLSpanElement).textContent = "";
                  (content2Ref.current as HTMLSpanElement).style.display = "inline";
                }
                setShowButton(false);
                // Finally fold the envelope
                setTimeout(() => {
                  setIsFolded(true);
                }, 300);
              }, 1000); // Wait for paper shrink animation
            }, 4000); // Show success message for 4 seconds
          }
        })
        .catch(() => {
          setIsSubmitting(false);
          alert("There was an error submitting the form. Please try again.");
        });
    }, 350); // Wait for animation
  };

  return (
    <>
      <Head>
        <title>Wedding Invitation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      {/* Animated Background Elements */}
      <div className="animated-shape shape1"></div>
      <div className="animated-shape shape2"></div>
      <div className="animated-shape shape3"></div>
      <div className="animated-shape shape4"></div>
      <div className="animated-shape shape5"></div>
      <div className="animated-shape shape6"></div>
      
      <div className="sparkle s1">✨</div>
      <div className="sparkle s2">⭐</div>
      <div className="sparkle s3">💫</div>
      <div className="sparkle s4">✨</div>
      <div className="sparkle s5">⭐</div>
      <div className="sparkle s6">💫</div>
      <div className="sparkle s7">✨</div>
      <div className="sparkle s8">⭐</div>
      
      <div className="particle particle-1"></div>
      <div className="particle particle-2"></div>
      <div className="particle particle-3"></div>
      <div className="particle particle-4"></div>
      <div className="particle particle-5"></div>
      <div className="particle particle-6"></div>
      <div className="particle particle-7"></div>
      <div className="particle particle-8"></div>
      <div className="particle particle-9"></div>
      
      <div className={`envelope ${isFolded ? "fold" : ""} ${isGrown ? "grow" : ""}`} onClick={handleEnvelopeClick}>
        <div className="top"></div>
        <div className="left"></div>
        <div className="back">
          <div className={`paper ${showForm ? 'form-active' : ''}`}>
            <div className="container">
              <span className="title" ref={titleRef} style={{ marginTop: 0 }}></span>
              <span className="content mb-1 responsive1" ref={content1Ref}></span>
              <span className="content" ref={content2Ref}></span>
              {showButton && (
                <button className="join-btn show-btn" onClick={handleJoinClick}>
                  {isAlreadyInvited ? "View Details" : "Join Us"}
                </button>
              )}
              {showForm && (
                <form className="join-form show-form" onSubmit={handleFormSubmit} ref={formRef} style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    required
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      height: 'min(12px, 2.5vh, 10px)',
                      fontSize: 'min(0.35rem, 1.8vw, 0.3rem)',
                      fontFamily: '"Quicksand", sans-serif',
                      padding: 'min(2px, 0.5vh, 1px) min(6px, 1.5vw, 4px)',
                      margin: '0 0 min(3px, 0.8vh, 2px) 0',
                      borderRadius: '12px',
                      border: 'none',
                      boxSizing: 'border-box',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                      color: '#494b40',
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                    onFocus={(e) => {
                      e.target.style.transform = 'scale(1.02)';
                    }}
                    onBlur={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                  
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    required
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      height: 'min(12px, 2.5vh, 10px)',
                      fontSize: 'min(0.35rem, 1.8vw, 0.3rem)',
                      fontFamily: '"Quicksand", sans-serif',
                      padding: 'min(2px, 0.5vh, 1px) min(6px, 1.5vw, 4px)',
                      margin: '0 0 min(3px, 0.8vh, 2px) 0',
                      borderRadius: '12px',
                      border: 'none',
                      boxSizing: 'border-box',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                      color: '#494b40',
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                    onFocus={(e) => {
                      e.target.style.transform = 'scale(1.02)';
                    }}
                    onBlur={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                  
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    required
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      height: 'min(12px, 2.5vh, 10px)',
                      fontSize: 'min(0.35rem, 1.8vw, 0.3rem)',
                      fontFamily: '"Quicksand", sans-serif',
                      padding: 'min(2px, 0.5vh, 1px) min(6px, 1.5vw, 4px)',
                      margin: '0 0 min(3px, 0.8vh, 2px) 0',
                      borderRadius: '12px',
                      border: 'none',
                      boxSizing: 'border-box',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                      color: '#494b40',
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                    onFocus={(e) => {
                      e.target.style.transform = 'scale(1.02)';
                    }}
                    onBlur={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                  
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isSubmitting}
                    ref={submitBtnRef}
                    style={{
                      margin: 'min(3px, 0.8vh, 2px) 0 0 0',
                      padding: 'min(3px, 0.8vh, 2px) min(8px, 2vw, 6px)',
                      width: '100%',
                      height: 'min(14px, 3vh, 12px)',
                      fontSize: 'min(0.35rem, 1.8vw, 0.3rem)',
                      fontFamily: '"Quicksand", sans-serif',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      outline: 'none',
                      opacity: isSubmitting ? 0.7 : 1,
                      textShadow: '0 1px 1px rgba(0,0,0,0.3)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        (e.target as HTMLButtonElement).style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {isSubmitting ? "Sending..." : "Send RSVP"}
                  </button>
                  
                  <style>{`
                    .join-form input::placeholder {
                      font-size: 0.35rem;
                      color: #999;
                      opacity: 1;
                      font-family: "Quicksand", sans-serif;
                      font-style: normal;
                      font-weight: 400;
                      transition: all 0.3s ease;
                    }
                    .join-form input:disabled {
                      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                      cursor: not-allowed;
                      opacity: 0.6;
                      border-color: #dee2e6;
                      color: #6c757d;
                    }
                    .join-form input:focus {
                      border-color: #667eea;
                      border-width: 2px;
                      box-shadow: 
                        0 0 0 3px rgba(102, 126, 234, 0.3),
                        0 0 20px rgba(102, 126, 234, 0.4),
                        0 0 40px rgba(102, 126, 234, 0.2),
                        inset 0 1px 1px rgba(255,255,255,0.8);
                      background: linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(240,248,255,0.95) 100%);
                      transform: translateY(-2px) scale(1.02);
                      animation: focusGlow 2s ease-in-out infinite;
                    }
                    .join-form input:hover:not(:disabled) {
                      border-color: #764ba2;
                      border-width: 1.5px;
                      box-shadow: 
                        0 2px 8px rgba(118, 75, 162, 0.3),
                        0 0 15px rgba(118, 75, 162, 0.2),
                        inset 0 1px 1px rgba(255,255,255,0.8);
                      transform: translateY(-1px) scale(1.01);
                      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .join-form input:focus::placeholder {
                      color: #667eea;
                      opacity: 0.8;
                      transform: translateX(2px);
                      animation: placeholderPulse 1.5s ease-in-out infinite;
                    }
                    .join-form input:focus::before {
                      content: '';
                      position: absolute;
                      top: -2px;
                      left: -2px;
                      right: -2px;
                      bottom: -2px;
                      background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #667eea);
                      border-radius: 3px;
                      z-index: -1;
                      animation: borderRotate 3s linear infinite;
                    }
                    .submit-btn:hover:not(:disabled) {
                      transform: translateY(-2px) scale(1.05);
                      box-shadow: 
                        0 4px 12px rgba(102, 126, 234, 0.6),
                        0 0 25px rgba(102, 126, 234, 0.4),
                        inset 0 1px 1px rgba(255,255,255,0.3);
                      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 50%, #e085e8 100%);
                      animation: buttonPulse 1.5s ease-in-out infinite;
                    }
                    .submit-btn:active:not(:disabled) {
                      transform: translateY(0) scale(0.98);
                      box-shadow: 0 1px 3px rgba(102, 126, 234, 0.4), inset 0 1px 1px rgba(255,255,255,0.3);
                    }
                    .submit-btn:focus {
                      outline: 3px solid rgba(102, 126, 234, 0.4);
                      outline-offset: 2px;
                      box-shadow: 
                        0 0 0 4px rgba(102, 126, 234, 0.2),
                        0 0 20px rgba(102, 126, 234, 0.5);
                    }
                    
                    @keyframes focusGlow {
                      0%, 100% {
                        box-shadow: 
                          0 0 0 3px rgba(102, 126, 234, 0.3),
                          0 0 20px rgba(102, 126, 234, 0.4),
                          0 0 40px rgba(102, 126, 234, 0.2),
                          inset 0 1px 1px rgba(255,255,255,0.8);
                      }
                      50% {
                        box-shadow: 
                          0 0 0 3px rgba(102, 126, 234, 0.5),
                          0 0 30px rgba(102, 126, 234, 0.6),
                          0 0 60px rgba(102, 126, 234, 0.3),
                          inset 0 1px 1px rgba(255,255,255,0.8);
                      }
                    }
                    
                    @keyframes placeholderPulse {
                      0%, 100% {
                        opacity: 0.8;
                        transform: translateX(2px);
                      }
                      50% {
                        opacity: 1;
                        transform: translateX(4px);
                      }
                    }
                    
                    @keyframes borderRotate {
                      0% {
                        background-position: 0% 50%;
                      }
                      50% {
                        background-position: 100% 50%;
                      }
                      100% {
                        background-position: 0% 50%;
                      }
                    }
                    
                    @keyframes buttonPulse {
                      0%, 100% {
                        transform: translateY(-2px) scale(1.05);
                        box-shadow: 
                          0 4px 12px rgba(102, 126, 234, 0.6),
                          0 0 25px rgba(102, 126, 234, 0.4),
                          inset 0 1px 1px rgba(255,255,255,0.3);
                      }
                      50% {
                        transform: translateY(-3px) scale(1.08);
                        box-shadow: 
                          0 6px 16px rgba(102, 126, 234, 0.8),
                          0 0 35px rgba(102, 126, 234, 0.6),
                          inset 0 1px 1px rgba(255,255,255,0.3);
                      }
                    }
                    
                    /* Extraordinary particle effects for focused inputs */
                    .join-form input:focus::after {
                      content: '✨';
                      position: absolute;
                      top: -8px;
                      right: -8px;
                      font-size: 8px;
                      animation: sparkleFloat 2s ease-in-out infinite;
                      pointer-events: none;
                    }
                    
                    @keyframes sparkleFloat {
                      0%, 100% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 0;
                      }
                      25% {
                        transform: translateY(-10px) rotate(90deg);
                        opacity: 1;
                      }
                      50% {
                        transform: translateY(-20px) rotate(180deg);
                        opacity: 0.8;
                      }
                      75% {
                        transform: translateY(-10px) rotate(270deg);
                        opacity: 1;
                      }
                    }
                  `}</style>
                   
                   {formSubmitted && (
                     <div className="success-overlay" style={{
                       position: 'absolute',
                       top: '0',
                       left: '0',
                       right: '0',
                       bottom: '0',
                       background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       zIndex: 1000,
                       animation: 'fadeIn 0.6s ease-out',
                       borderRadius: 'inherit',
                       padding: '0',
                       backdropFilter: 'blur(8px)',
                       WebkitBackdropFilter: 'blur(8px)'
                     }}>
                       <div className="success-card" style={{
                         background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                         borderRadius: 'inherit',
                         padding: 'min(12px, 2.5vw)',
                         textAlign: 'center',
                         color: '#494b40',
                         boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 4px 16px rgba(102, 126, 234, 0.3)',
                         position: 'relative',
                         overflow: 'hidden',
                         animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                         width: '100%',
                         height: '100%',
                         maxWidth: 'none',
                         maxHeight: 'none',
                         border: '1px solid rgba(255, 255, 255, 0.3)',
                         backdropFilter: 'blur(12px)',
                         WebkitBackdropFilter: 'blur(12px)',
                         display: 'flex',
                         flexDirection: 'column',
                         justifyContent: 'center'
                       }}>
                         {/* Animated Background Pattern */}
                         <div style={{
                           position: 'absolute',
                           top: '-50%',
                           left: '-50%',
                           width: '200%',
                           height: '200%',
                           background: 'radial-gradient(circle, rgba(102, 126, 234, 0.06) 0%, transparent 70%)',
                           animation: 'rotate 25s linear infinite',
                           zIndex: 0
                         }}></div>

                         {/* Floating Celebration Elements - Smaller */}
                         <div style={{
                           position: 'absolute',
                           top: 'min(6px, 1.5vw)',
                           left: 'min(8px, 2vw)',
                           fontSize: 'min(12px, 3vw)',
                           animation: 'float 5s ease-in-out infinite',
                           zIndex: 1,
                           opacity: 0.8
                         }}>🎊</div>
                         <div style={{
                           position: 'absolute',
                           top: 'min(4px, 1vw)',
                           right: 'min(10px, 2.5vw)',
                           fontSize: 'min(10px, 2.5vw)',
                           animation: 'float 5s ease-in-out infinite 1.2s',
                           zIndex: 1,
                           opacity: 0.7
                         }}>✨</div>
                         <div style={{
                           position: 'absolute',
                           bottom: 'min(6px, 1.5vw)',
                           left: 'min(6px, 1.5vw)',
                           fontSize: 'min(9px, 2.2vw)',
                           animation: 'float 5s ease-in-out infinite 2.4s',
                           zIndex: 1,
                           opacity: 0.6
                         }}>⭐</div>
                         <div style={{
                           position: 'absolute',
                           bottom: 'min(4px, 1vw)',
                           right: 'min(8px, 2vw)',
                           fontSize: 'min(10px, 2.5vw)',
                           animation: 'float 5s ease-in-out infinite 3.6s',
                           zIndex: 1,
                           opacity: 0.7
                         }}>🎉</div>

                         {/* Main Content Container */}
                         <div style={{
                           position: 'relative',
                           zIndex: 2,
                           flex: 1,
                           display: 'flex',
                           flexDirection: 'column',
                           justifyContent: 'center',
                           alignItems: 'center',
                           padding: 'min(2px, 0.5vw)',
                           minHeight: 0
                         }}>
                           {/* Success Icon */}
                           <div style={{
                             fontSize: 'min(14px, 3.5vw)',
                             marginBottom: 'min(4px, 1vw)',
                             animation: 'bounceIn 1.2s ease-out',
                             filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                             lineHeight: 1
                           }}>
                             {isAlreadyInvited ? '🎊' : '🎉'}
                           </div>
                           
                           {/* Main Title */}
                           <h2 style={{
                             fontSize: 'min(0.45rem, 2.5vw)',
                             margin: '0 0 min(3px, 0.8vw) 0',
                             fontWeight: '700',
                             color: '#494b40',
                             textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                             animation: 'slideInDown 0.8s ease-out 0.2s both',
                             fontFamily: '"Quicksand", sans-serif',
                             letterSpacing: '0.1px',
                             lineHeight: '1.1'
                           }}>
                             {isAlreadyInvited ? 'Welcome Back!' : 'You\'re Invited!'}
                           </h2>
                           
                           {/* Message */}
                           <p style={{
                             fontSize: 'min(0.32rem, 1.8vw)',
                             margin: '0 0 min(4px, 1vw) 0',
                             color: '#6f7261',
                             lineHeight: '1.2',
                             animation: 'slideInUp 0.8s ease-out 0.4s both',
                             fontFamily: '"Quicksand", sans-serif',
                             fontWeight: '500',
                             maxWidth: '96%',
                             padding: '0 min(1px, 0.3vw)'
                           }}>
                             {isAlreadyInvited 
                               ? (
                                 <>
                                   You're already on our guest list!<br/>
                                   <span style={{ 
                                     color: '#667eea', 
                                     fontWeight: '600',
                                     fontSize: 'min(0.28rem, 1.6vw)'
                                   }}>We're excited to see you again!</span>
                                 </>
                               )
                               : (
                                 <>
                                   Thank you for joining us!<br/>
                                   <span style={{ 
                                     color: '#667eea', 
                                     fontWeight: '600',
                                     fontSize: 'min(0.28rem, 1.6vw)'
                                   }}>We can't wait to share this special dinner with you!</span>
                                 </>
                               )
                             }
                           </p>
                           
                           {/* Location */}
                           <div style={{
                             fontSize: 'min(0.26rem, 1.5vw)',
                             color: '#808375',
                             fontStyle: 'italic',
                             fontWeight: '600',
                             animation: 'slideInUp 0.8s ease-out 0.6s both',
                             fontFamily: '"Quicksand", sans-serif',
                             textShadow: '0 1px 1px rgba(0,0,0,0.05)',
                             marginBottom: 'min(6px, 1.5vw)',
                             lineHeight: '1.1'
                           }}>
                             See you at Sugar Land! 🌟
                           </div>

                           {/* Progress Bar */}
                           <div style={{
                             width: '75%',
                             height: 'min(1.5px, 0.4vw)',
                             background: 'rgba(102, 126, 234, 0.1)',
                             borderRadius: 'min(1px, 0.2vw)',
                             overflow: 'hidden',
                             animation: 'slideInUp 0.8s ease-out 0.8s both',
                             boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.1)',
                             maxWidth: 'min(80px, 50vw)'
                           }}>
                             <div style={{
                               width: '100%',
                               height: '100%',
                               background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                               borderRadius: 'min(1px, 0.2vw)',
                               animation: 'progress 4s ease-out',
                               boxShadow: '0 1px 1px rgba(102, 126, 234, 0.2)'
                             }}></div>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}
                   
                   <style>{`
                     @keyframes fadeIn {
                       from { opacity: 0; }
                       to { opacity: 1; }
                     }
                     
                     @keyframes slideInUp {
                       from { 
                         opacity: 0; 
                         transform: translateY(15px) scale(0.98); 
                       }
                       to { 
                         opacity: 1; 
                         transform: translateY(0) scale(1); 
                       }
                     }
                     
                     @keyframes slideInDown {
                       from { 
                         opacity: 0; 
                         transform: translateY(-15px) scale(0.98); 
                       }
                       to { 
                         opacity: 1; 
                         transform: translateY(0) scale(1); 
                       }
                     }
                     
                     @keyframes bounceIn {
                       0% { 
                         opacity: 0; 
                         transform: scale(0.3) rotate(180deg); 
                       }
                       50% { 
                         opacity: 1; 
                         transform: scale(1.02) rotate(90deg); 
                       }
                       70% { 
                         transform: scale(0.98) rotate(180deg); 
                       }
                       100% { 
                         opacity: 1; 
                         transform: scale(1) rotate(360deg); 
                       }
                     }
                     
                     @keyframes float {
                       0%, 100% { 
                         transform: translateY(0px) rotate(0deg) scale(1); 
                         opacity: 0.6;
                       }
                       25% { 
                         transform: translateY(-4px) rotate(2deg) scale(1.02); 
                         opacity: 0.8;
                       }
                       50% { 
                         transform: translateY(-8px) rotate(0deg) scale(0.98); 
                         opacity: 0.7;
                       }
                       75% { 
                         transform: translateY(-4px) rotate(-2deg) scale(1.01); 
                         opacity: 0.8;
                       }
                     }
                     
                     @keyframes rotate {
                       from { transform: rotate(0deg); }
                       to { transform: rotate(360deg); }
                     }
                     
                     @keyframes progress {
                       from { 
                         width: 0%; 
                         opacity: 0.5;
                       }
                       50% { 
                         opacity: 0.9;
                       }
                       to { 
                         width: 100%; 
                         opacity: 0.7;
                       }
                     }
                     
                     /* Mobile-specific adjustments */
                     @media (max-width: 768px) {
                       .success-card {
                         padding: min(8px, 2vw) !important;
                       }
                     }
                     
                     @media (max-width: 480px) {
                       .success-card {
                         padding: min(6px, 1.5vw) !important;
                       }
                     }
                     
                     @media (max-width: 360px) {
                       .success-card {
                         padding: min(4px, 1vw) !important;
                       }
                     }
                   `}</style>
                </form>
              )}
            </div>
          </div>
        </div>
        <div className="right"></div>
        <div className="bottom"></div>
      </div>
      <div className="instruction">Click the envelope to open</div>
    </>
  );
}
