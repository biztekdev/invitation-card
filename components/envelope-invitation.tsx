"use client"

import type React from "react"

import { useState, useEffect, useRef, type FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function EnvelopeInvitation() {
  const [isFolded, setIsFolded] = useState(true)
  const [isGrowing, setIsGrowing] = useState(false)
  const [showJoinButton, setShowJoinButton] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const titleElRef = useRef<HTMLSpanElement>(null)
  const content1ElRef = useRef<HTMLSpanElement>(null)
  const content2ElRef = useRef<HTMLSpanElement>(null)

  const titleText = "Haroon Elahi"
  const content1Text = "Sent you an invitation for Dinner"
  const content2Text = "Sugar Land"
  const formHeadingText = "Dinner Invitation"

  // Typewriter effect function
  const typeWriter = (element: HTMLSpanElement | null, text: string, speed: number, callback?: () => void) => {
    if (!element) return
    element.textContent = ""
    let i = 0
    const typing = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i)
        i++
        setTimeout(typing, speed)
      } else if (callback) {
        callback()
      }
    }
    typing()
  }

  const startTypewriter = () => {
    setShowJoinButton(false)
    setShowJoinForm(false)
    if (titleElRef.current) {
      titleElRef.current.style.display = ""
      titleElRef.current.classList.remove("dinner-heading")
    }
    if (content1ElRef.current) content1ElRef.current.style.display = ""
    if (content2ElRef.current) content2ElRef.current.style.display = ""

    typeWriter(titleElRef.current, titleText, 30, () => {
      setTimeout(() => {
        typeWriter(content1ElRef.current, content1Text, 15, () => {
          setTimeout(() => {
            typeWriter(content2ElRef.current, content2Text, 20, () => {
              setShowJoinButton(true)
            })
          }, 300)
        })
      }, 200)
    })
  }

  useEffect(() => {
    // Initial animation on page load
    setTimeout(() => {
      setIsFolded(false)
      setTimeout(() => {
        setIsGrowing(true)
        setTimeout(startTypewriter, 2000) // Wait for grow animation to finish
      }, 1000)
    }, 500)
  }, [])

  const handleEnvelopeClick = () => {
    if (showJoinForm) {
      return // Do nothing if form is visible
    }

    if (isFolded) {
      // Opening: unfold and grow
      setTimeout(() => {
        setIsGrowing(true)
      }, 1000)
      setTimeout(() => {
        setIsFolded(false)
        setTimeout(startTypewriter, 2000) // Wait for grow animation to finish
      }, 0)
    }
    // Do nothing if already open (paper out)
  }

  const handleJoinUsClick = () => {
    setShowJoinButton(false)
    setTimeout(() => {
      setShowJoinForm(true)
      if (titleElRef.current) {
        titleElRef.current.style.display = "inline"
        titleElRef.current.textContent = formHeadingText
        titleElRef.current.classList.add("dinner-heading")
      }
      if (content1ElRef.current) content1ElRef.current.style.display = "none"
      if (content2ElRef.current) content2ElRef.current.style.display = "none"
    }, 300)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowSuccessMessage(true)
        setTimeout(() => {
          setShowSuccessMessage(false)
          setShowJoinForm(false)
          setIsGrowing(false) // Start closing animation: shrink
          setTimeout(() => {
            setIsFolded(true) // Then fold
            setTimeout(() => {
              // Clear text after fold
              if (titleElRef.current) titleElRef.current.textContent = ""
              if (content1ElRef.current) content1ElRef.current.textContent = ""
              if (content2ElRef.current) content2ElRef.current.textContent = ""
              // Reset form and button for next open
              setFormData({ fullName: "", email: "", phone: "" })
              setShowJoinButton(false) // Hide button until next open
              // Restore all headings for next open
              if (titleElRef.current) titleElRef.current.style.display = ""
              if (titleElRef.current) titleElRef.current.classList.remove("dinner-heading")
              if (content1ElRef.current) content1ElRef.current.style.display = ""
              if (content2ElRef.current) content2ElRef.current.style.display = ""
            }, 800) // Wait for fold animation
          }, 600) // Wait for shrink animation
        }, 1200) // Show success for a moment
      } else {
        alert("Failed to save invitation. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`envelope ${isFolded ? "fold" : ""} ${isGrowing ? "grow" : ""}`} onClick={handleEnvelopeClick}>
      <div className="top" />
      <div className="left" />
      <div className="back">
        <div className="paper">
          {/* Flower SVG */}
          <svg
            className="flower"
            fill="currentColor"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1734.895 1618.8842"
          >
            <g>
              <path
                d="M916.2031,784.8441c5.7766,6.8604,17.9761-0.7037,26.3514-27.7475l-0.0005-0.0012
                c-25.0283,3.897-30.7019,15.9928-28.9068,24.0389c9.6053-1.8325,9.6407-10.1573,13.7802-13.1749
                C927.5275,773.495,925.7661,780.6723,916.2031,784.8441z"
              />
              <path
                d="M810.6777,798.8173c3.053-8.4327-9.5975-15.2159-37.2057-8.9472l-0.0008,0.001
                c15.889,19.7267,29.2011,18.5922,35.2717,13.0146c-6.3896-7.4022-13.6168-3.2705-18.2999-5.3466
                C795.1869,794.6846,802.2833,792.6213,810.6777,798.8173z"
              />
            </g>
          </svg>
          <div className="container">
            <span className="title" ref={titleElRef} />
            <span className="content mb-1" ref={content1ElRef} />
            <span className="content" ref={content2ElRef} />

            {showJoinButton && (
              <Button id="join-btn" className="join-btn show-btn" onClick={handleJoinUsClick}>
                Join Us
              </Button>
            )}

            {showJoinForm && (
              <form id="join-form" className="join-form show-form" onSubmit={handleFormSubmit}>
                <Input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Full Name"
                  required
                  value={formData.fullName}
                  onChange={handleFormChange}
                  disabled={isSubmitting}
                />
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={handleFormChange}
                  disabled={isSubmitting}
                />
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Phone Number"
                  required
                  value={formData.phone}
                  onChange={handleFormChange}
                  disabled={isSubmitting}
                />
                <Button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
                {showSuccessMessage && (
                  <div id="form-success" className="form-success">
                    Thank you for joining!
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
      <div className="right" />
      <div className="bottom" />
    </div>
  )
}
