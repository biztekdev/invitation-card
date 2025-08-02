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
          <div className="paper">
            <div className="container">
              <span className="title" ref={titleRef} style={{ marginTop: 0 }}></span>
              <span className="content mb-1" ref={content1Ref}></span>
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
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  borderRadius: '3px',
                  padding: '4px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                }}>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    required
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      height: '10px',
                      fontSize: '0.35rem',
                      fontFamily: '"Quicksand", sans-serif',
                      padding: '1px 2px',
                      margin: '0',
                      borderRadius: '1px',
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                      boxSizing: 'border-box',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                      color: '#494b40',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.8)',
                      marginBottom: '1px'
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
                      height: '10px',
                      fontSize: '0.35rem',
                      fontFamily: '"Quicksand", sans-serif',
                      padding: '1px 2px',
                      margin: '0',
                      borderRadius: '1px',
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                      boxSizing: 'border-box',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                      color: '#494b40',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.8)',
                      marginBottom: '1px'
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
                      height: '10px',
                      fontSize: '0.35rem',
                      fontFamily: '"Quicksand", sans-serif',
                      padding: '1px 2px',
                      margin: '0',
                      borderRadius: '1px',
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                      boxSizing: 'border-box',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                      color: '#494b40',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.8)',
                      marginBottom: '1px'
                    }}
                  />
                  
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isSubmitting}
                    ref={submitBtnRef}
                    style={{
                      margin: '0',
                      padding: '1px 4px',
                      width: '100%',
                      fontSize: '0.35rem',
                      fontFamily: '"Quicksand", sans-serif',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '1px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 1px 3px rgba(102, 126, 234, 0.4), inset 0 1px 1px rgba(255,255,255,0.3)',
                      outline: 'none',
                      opacity: isSubmitting ? 0.7 : 1,
                      textShadow: '0 1px 1px rgba(0,0,0,0.3)'
                    }}
                  >
                    {isSubmitting ? "Sending..." : "Send RSVP"}
                  </button>
                  
                  <style>{`
                    .join-form input::placeholder {
                      font-size: 0.35rem;
                      color: #888;
                      opacity: 1;
                      font-family: "Quicksand", sans-serif;
                      font-style: italic;
                    }
                    .join-form input:disabled {
                      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
                      cursor: not-allowed;
                      opacity: 0.6;
                      border-color: #ccc;
                    }
                    .join-form input:focus {
                      border-color: #667eea;
                      box-shadow: 0 0 0 1px rgba(102, 126, 234, 0.3), 0 1px 2px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.8);
                      transform: translateY(-1px);
                    }
                    .join-form input:hover:not(:disabled) {
                      border-color: #764ba2;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.8);
                      transform: translateY(-1px);
                    }
                    .submit-btn:hover:not(:disabled) {
                      transform: translateY(-1px);
                      box-shadow: 0 2px 4px rgba(102, 126, 234, 0.5), inset 0 1px 1px rgba(255,255,255,0.3);
                      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 50%, #e085e8 100%);
                    }
                    .submit-btn:active:not(:disabled) {
                      transform: translateY(0);
                      box-shadow: 0 1px 2px rgba(102, 126, 234, 0.4), inset 0 1px 1px rgba(255,255,255,0.3);
                    }
                  `}</style>
                   
                   {formSubmitted && (
                     <div className="success-overlay" style={{
                       position: 'absolute',
                       top: '50%',
                       left: '50%',
                       transform: 'translate(-50%, -50%)',
                       background: 'rgba(0, 0, 0, 0.9)',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       zIndex: 10000,
                       animation: 'fadeIn 0.5s ease-out',
                       borderRadius: '10px',
                       padding: '15px'
                     }}>
                       <div className="success-card" style={{
                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                         borderRadius: '15px',
                         padding: '20px',
                         textAlign: 'center',
                         color: 'white',
                         boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                         position: 'relative',
                         overflow: 'hidden',
                         animation: 'slideInUp 0.6s ease-out',
                         minWidth: '200px',
                         maxWidth: '250px'
                       }}>
                         {/* Floating Food Emojis */}
                         <div className="floating-food" style={{
                           position: 'absolute',
                           top: '5px',
                           left: '10px',
                           fontSize: '16px',
                           animation: 'float 3s ease-in-out infinite'
                         }}>🍕</div>
                         <div className="floating-food" style={{
                           position: 'absolute',
                           top: '8px',
                           right: '15px',
                           fontSize: '14px',
                           animation: 'float 3s ease-in-out infinite 0.5s'
                         }}>🍝</div>
                         <div className="floating-food" style={{
                           position: 'absolute',
                           bottom: '8px',
                           left: '10px',
                           fontSize: '12px',
                           animation: 'float 3s ease-in-out infinite 1s'
                         }}>🍷</div>
                         <div className="floating-food" style={{
                           position: 'absolute',
                           bottom: '10px',
                           right: '12px',
                           fontSize: '15px',
                           animation: 'float 3s ease-in-out infinite 1.5s'
                         }}>🍰</div>

                         {/* Sparkles */}
                         <div className="sparkle" style={{
                           position: 'absolute',
                           top: '15%',
                           left: '8%',
                           fontSize: '8px',
                           animation: 'sparkle 2s ease-in-out infinite'
                         }}>✨</div>
                         <div className="sparkle" style={{
                           position: 'absolute',
                           top: '25%',
                           right: '12%',
                           fontSize: '7px',
                           animation: 'sparkle 2s ease-in-out infinite 0.7s'
                         }}>⭐</div>
                         <div className="sparkle" style={{
                           position: 'absolute',
                           bottom: '25%',
                           left: '15%',
                           fontSize: '9px',
                           animation: 'sparkle 2s ease-in-out infinite 1.3s'
                         }}>💫</div>

                         {/* Main Content */}
                         <div style={{
                           fontSize: '24px',
                           marginBottom: '8px',
                           animation: 'bounce 1s ease-in-out'
                         }}>{isAlreadyInvited ? '🎊' : '🎉'}</div>
                         
                         <h2 style={{
                           fontSize: '0.9rem',
                           margin: '0 0 6px 0',
                           fontWeight: 'bold',
                           textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                         }}>
                           {isAlreadyInvited ? 'Welcome Back! 🎊' : 'You\'re Invited! 🎊'}
                         </h2>
                         
                         <p style={{
                           fontSize: '0.65rem',
                           margin: '0 0 8px 0',
                           opacity: 0.9,
                           lineHeight: '1.2'
                         }}>
                           {isAlreadyInvited 
                             ? (
                               <>
                                 You're already on our guest list!<br/>
                                 We're excited to see you again! 🍽️
                               </>
                             )
                             : (
                               <>
                                 Thank you for joining us!<br/>
                                 We can't wait to share this special dinner with you! 🍽️
                               </>
                             )
                           }
                         </p>
                         
                         <div style={{
                           fontSize: '0.6rem',
                           opacity: 0.8,
                           fontStyle: 'italic'
                         }}>
                           See you at Sugar Land! 🌟
                         </div>

                         {/* Progress Bar */}
                         <div style={{
                           width: '100%',
                           height: '3px',
                           background: 'rgba(255,255,255,0.3)',
                           borderRadius: '2px',
                           marginTop: '12px',
                           overflow: 'hidden'
                         }}>
                           <div style={{
                             width: '100%',
                             height: '100%',
                             background: 'linear-gradient(90deg, #ffd700, #ffed4e)',
                             borderRadius: '2px',
                             animation: 'progress 4s linear'
                           }}></div>
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
                         transform: translateY(50px) scale(0.8); 
                       }
                       to { 
                         opacity: 1; 
                         transform: translateY(0) scale(1); 
                       }
                     }
                     
                     @keyframes float {
                       0%, 100% { transform: translateY(0px) rotate(0deg); }
                       50% { transform: translateY(-10px) rotate(5deg); }
                     }
                     
                     @keyframes sparkle {
                       0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
                       50% { opacity: 1; transform: scale(1) rotate(180deg); }
                     }
                     
                     @keyframes bounce {
                       0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                       40% { transform: translateY(-10px); }
                       60% { transform: translateY(-5px); }
                     }
                     
                     @keyframes progress {
                       from { width: 0%; }
                       to { width: 100%; }
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
