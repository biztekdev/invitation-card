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
  const [isFolded, setIsFolded] = useState(true);
  const [isGrown, setIsGrown] = useState(false);

  const titleRef = useRef<HTMLSpanElement>(null);
  const content1Ref = useRef<HTMLSpanElement>(null);
  const content2Ref = useRef<HTMLSpanElement>(null);

  const titleText = "Haroon Elahi";
  const content1Text = "Sent you an invitation for Dinner";
  const content2Text = "Sugar Land";
  const formHeadingText = "Dinner Invitation";

  const typeWriter = (element, text, speed, callback) => {
    if (!element) return;
    element.textContent = "";
    let i = 0;
    function typing() {
      if (i < text.length) {
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
  }, []);

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
      setShowForm(true);
      if (titleRef.current) titleRef.current.textContent = formHeadingText;
      if (content1Ref.current) content1Ref.current.style.display = "none";
      if (content2Ref.current) content2Ref.current.style.display = "none";
    }, 300);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formRef.current) {
      formRef.current.classList.add("form-animate-out");
    }
    if (submitBtnRef.current) {
      submitBtnRef.current.classList.add("submit-animate-out");
    }
    const form = e.target;
    const data = {
      fullName: form.fullName.value,
      email: form.email.value,
      phone: form.phone.value,
    };
    setTimeout(() => {
      fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to submit");
          setFormSubmitted(true);
          setTimeout(() => {
            setFormSubmitted(false);
            setShowForm(false);
            setIsGrown(false);
            setTimeout(() => {
              setIsFolded(true);
              if (titleRef.current) (titleRef.current as HTMLSpanElement).textContent = "";
              if (content1Ref.current) (content1Ref.current as HTMLSpanElement).textContent = "";
              if (content2Ref.current) (content2Ref.current as HTMLSpanElement).textContent = "";
              setShowButton(false);
            }, 600);
          }, 1200);
        })
        .catch(() => {
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
                  Join Us
                </button>
              )}
              {showForm && (
                <form className="join-form show-form" onSubmit={handleFormSubmit}>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    required
                    style={{ width: '100%', height: '13px', fontSize: '0.55rem', padding: '0 2px', marginBottom: '1px', borderRadius: '1px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    style={{ width: '100%', height: '13px', fontSize: '0.55rem', padding: '0 2px', marginBottom: '1px', borderRadius: '1px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    required
                    style={{ width: '100%', height: '13px', fontSize: '0.55rem', padding: '0 2px', marginBottom: '1px', borderRadius: '1px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  />
                  <style>{`
                    .join-form input::placeholder {
                      font-size: 0.55rem;
                      color: #888;
                      opacity: 1;
                    }
                  `}</style>
                  <button type="submit" className="submit-btn">
                    Submit
                  </button>
                  {formSubmitted && <div className="form-success">Thank you for joining!</div>}
                </form>
              )}
            </div>
          </div>
        </div>
        <div className="right"></div>
        <div className="bottom"></div>
      </div>
      <div className="instruction">Click the envelope to open</div>
      {/* Optional: Add animated shapes and sparkles here as components or static divs */}
    </>
  );
}
