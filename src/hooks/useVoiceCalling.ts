'use client'

import { useState, useEffect, useRef } from 'react'
import { Device, Call } from '@twilio/voice-sdk'

interface CallState {
  isConnected: boolean
  isConnecting: boolean
  isMuted: boolean
  activeCall: Call | null
  deviceReady: boolean
  error: string | null
}

export function useVoiceCalling(identity: string) {
  const [device, setDevice] = useState<Device | null>(null)
  const [deviceInitialized, setDeviceInitialized] = useState(false)
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isConnecting: false,
    isMuted: false,
    activeCall: null,
    deviceReady: false,
    error: null
  })

  // Initialize device manually on user interaction
  const initializeDevice = async () => {
    if (deviceInitialized || device) return

    try {
      console.log('Initializing Twilio Device for identity:', identity)
      setDeviceInitialized(true)
      
      // Get access token from our API
      const response = await fetch('/api/twilio/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity })
      })

      const result = await response.json()
      console.log('Token API response:', { success: result.success, hasToken: !!result.token })
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get access token')
      }

      // Create and setup device
      console.log('Creating Twilio Device with token...')
      const twilioDevice = new Device(result.token, {
        logLevel: 1
      })
      
      console.log('Device created, setting up event listeners...')

      // Device event listeners
      twilioDevice.on('ready', () => {
        console.log('Twilio Device ready')
        setCallState(prev => ({ ...prev, deviceReady: true, error: null }))
      })

      twilioDevice.on('registered', () => {
        console.log('Twilio Device registered')
        setCallState(prev => ({ ...prev, deviceReady: true, error: null }))
      })

      twilioDevice.on('error', (error) => {
        console.error('Twilio Device error:', error)
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          explanation: error.explanation,
          causes: error.causes,
          stack: error.stack
        })
        setCallState(prev => ({ 
          ...prev, 
          error: `${error.message} (Code: ${error.code})`, 
          deviceReady: false 
        }))
      })

      twilioDevice.on('incoming', (call) => {
        console.log('Incoming call received:', call)
        setCallState(prev => ({ ...prev, activeCall: call }))
        
        // Set up call event listeners
        setupCallListeners(call)
      })

      twilioDevice.on('disconnect', () => {
        console.log('Twilio Device disconnected')
        setCallState(prev => ({ 
          ...prev, 
          deviceReady: false, 
          isConnected: false,
          activeCall: null 
        }))
      })

      // Register the device to receive calls
      await twilioDevice.register()
      setDevice(twilioDevice)

    } catch (error) {
      console.error('Failed to initialize Twilio Device:', error)
      setCallState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Device initialization failed',
        deviceReady: false 
      }))
      setDeviceInitialized(false)
    }
  }

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (device) {
        console.log('Cleaning up Twilio Device')
        device.destroy()
      }
    }
  }, [device])

  const setupCallListeners = (call: Call) => {
    call.on('accept', () => {
      console.log('Call accepted')
      setCallState(prev => ({ 
        ...prev, 
        isConnected: true, 
        isConnecting: false,
        activeCall: call 
      }))
    })

    call.on('disconnect', () => {
      console.log('Call disconnected')
      setCallState(prev => ({ 
        ...prev, 
        isConnected: false, 
        isConnecting: false,
        activeCall: null,
        isMuted: false
      }))
    })

    call.on('cancel', () => {
      console.log('Call cancelled')
      setCallState(prev => ({ 
        ...prev, 
        isConnected: false, 
        isConnecting: false,
        activeCall: null 
      }))
    })
  }

  const makeCall = async (phoneNumber: string, fromNumber: string) => {
    // Initialize device on first use (requires user interaction)
    if (!device && !deviceInitialized) {
      await initializeDevice()
    }

    if (!device || !callState.deviceReady) {
      throw new Error('Device not ready')
    }

    try {
      setCallState(prev => ({ ...prev, isConnecting: true, error: null }))
      
      const call = await device.connect({
        params: {
          To: phoneNumber,
          From: fromNumber
        }
      })

      setupCallListeners(call)
      setCallState(prev => ({ ...prev, activeCall: call }))

      return call
    } catch (error) {
      console.error('Failed to make call:', error)
      setCallState(prev => ({ 
        ...prev, 
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Call failed'
      }))
      throw error
    }
  }

  const hangUp = () => {
    if (callState.activeCall) {
      callState.activeCall.disconnect()
    }
  }

  const mute = () => {
    if (callState.activeCall) {
      callState.activeCall.mute(!callState.isMuted)
      setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }))
    }
  }

  const acceptCall = () => {
    if (callState.activeCall) {
      callState.activeCall.accept()
    }
  }

  const rejectCall = () => {
    if (callState.activeCall) {
      callState.activeCall.reject()
      setCallState(prev => ({ ...prev, activeCall: null }))
    }
  }

  return {
    device,
    callState,
    makeCall,
    hangUp,
    mute,
    acceptCall,
    rejectCall,
    initializeDevice
  }
}