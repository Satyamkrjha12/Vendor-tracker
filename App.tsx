
import React, { useState, useEffect } from 'react';
import { WorkflowStep, EventState, GeolocationData } from './types';
import Layout from './components/Layout';
import ProgressBar from './components/ProgressBar';
import { getCurrentLocation, fileToBase64, generateOTP } from './utils/helpers';

const App: React.FC = () => {
  const [step, setStep] = useState<WorkflowStep>(WorkflowStep.LOGIN);
  const [vendorName, setVendorName] = useState('');
  const [eventData, setEventData] = useState<EventState>({
    vendorId: null,
    checkIn: { photo: null, location: null, timestamp: null },
    setup: { prePhoto: null, preNotes: '', postPhoto: null, postNotes: '' },
    startTime: null,
    endTime: null,
  });

  const [mockOTP, setMockOTP] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Authentication Mock
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (vendorName.trim()) {
      setEventData(prev => ({ ...prev, vendorId: vendorName }));
      setStep(WorkflowStep.CHECK_IN);
    }
  };

  // Step 1: Check-in logic
  const handleCheckIn = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const location = await getCurrentLocation();
      const photoBase64 = await fileToBase64(file);
      
      setEventData(prev => ({
        ...prev,
        checkIn: {
          photo: photoBase64,
          location: location,
          timestamp: Date.now(),
        }
      }));

      // Auto-trigger OTP for next step
      const otp = generateOTP();
      setMockOTP(otp);
      setStep(WorkflowStep.OTP_START);
    } catch (err) {
      setError('Could not access location. Please enable GPS permissions.');
    } finally {
      setIsProcessing(false);
    }
  };

  // OTP Verification logic (Shared for Start and Completion)
  const handleVerifyOTP = () => {
    if (otpInput === mockOTP) {
      if (step === WorkflowStep.OTP_START) {
        setEventData(prev => ({ ...prev, startTime: Date.now() }));
        setStep(WorkflowStep.SETUP);
      } else {
        setEventData(prev => ({ ...prev, endTime: Date.now() }));
        setStep(WorkflowStep.SUMMARY);
      }
      setOtpInput('');
      setError(null);
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  // Setup Progress logic
  const handleSetupUpdate = async (type: 'pre' | 'post', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    setEventData(prev => ({
      ...prev,
      setup: {
        ...prev.setup,
        [type === 'pre' ? 'prePhoto' : 'postPhoto']: base64
      }
    }));
  };

  const handleFinishSetup = () => {
    if (!eventData.setup.prePhoto || !eventData.setup.postPhoto) {
      setError('Please upload both pre-setup and post-setup photos.');
      return;
    }
    const otp = generateOTP();
    setMockOTP(otp);
    setStep(WorkflowStep.OTP_COMPLETE);
    setError(null);
  };

  // Render Logic
  const renderStep = () => {
    switch (step) {
      case WorkflowStep.LOGIN:
        return (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-indigo-700 text-sm mb-4">
              Welcome to Zappy Vendor Tracking. Please enter your vendor name to begin your assignment.
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vendor Name / ID</label>
              <input 
                type="text" 
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. John Doe - Floral"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">
              Sign In
            </button>
          </form>
        );

      case WorkflowStep.CHECK_IN:
        return (
          <div className="space-y-6">
            <div className="text-center p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Check-in at Event Location</h3>
              <p className="text-slate-500 text-sm mb-6">Take a photo of the venue upon arrival to start your session.</p>
              
              <label className={`block w-full py-3 px-4 rounded-lg font-bold text-center cursor-pointer transition-all ${isProcessing ? 'bg-slate-300 text-slate-500 pointer-events-none' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                {isProcessing ? 'Processing Location...' : 'Capture Photo & Check-in'}
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCheckIn} disabled={isProcessing} />
              </label>
            </div>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          </div>
        );

      case WorkflowStep.OTP_START:
      case WorkflowStep.OTP_COMPLETE:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800 font-medium mb-1">Customer Mock Trigger:</p>
              <p className="text-2xl font-mono font-bold text-amber-600 tracking-widest">{mockOTP}</p>
              <p className="text-xs text-amber-700 mt-2 italic">* In a real app, this would be sent to the customer's phone.</p>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {step === WorkflowStep.OTP_START ? "Verify Event Start" : "Verify Event Completion"}
              </h3>
              <p className="text-slate-500 text-sm mb-6">Enter the 4-digit code provided by the customer.</p>
              
              <div className="flex flex-col gap-4">
                <input 
                  type="text" 
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="0 0 0 0"
                  className="w-full text-center text-3xl font-bold tracking-[1rem] p-4 border-b-2 border-indigo-600 outline-none focus:bg-indigo-50 transition-colors"
                />
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <button 
                  onClick={handleVerifyOTP}
                  className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 mt-4"
                >
                  Confirm & Proceed
                </button>
              </div>
            </div>
          </div>
        );

      case WorkflowStep.SETUP:
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 border-b pb-2">1. Pre-Setup Status</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="relative group aspect-video bg-slate-100 rounded-lg overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center">
                  {eventData.setup.prePhoto ? (
                    <img src={eventData.setup.prePhoto} className="w-full h-full object-cover" />
                  ) : (
                    <label className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium">
                      + Add Pre-Setup Photo
                      <input type="file" className="hidden" onChange={(e) => handleSetupUpdate('pre', e)} />
                    </label>
                  )}
                </div>
                <textarea 
                  placeholder="Add optional notes for pre-setup..."
                  className="w-full p-3 text-sm border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={eventData.setup.preNotes}
                  onChange={(e) => setEventData(prev => ({ ...prev, setup: { ...prev.setup, preNotes: e.target.value } }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 border-b pb-2">2. Post-Setup Status</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="relative group aspect-video bg-slate-100 rounded-lg overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center">
                  {eventData.setup.postPhoto ? (
                    <img src={eventData.setup.postPhoto} className="w-full h-full object-cover" />
                  ) : (
                    <label className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium">
                      + Add Post-Setup Photo
                      <input type="file" className="hidden" onChange={(e) => handleSetupUpdate('post', e)} />
                    </label>
                  )}
                </div>
                <textarea 
                  placeholder="Add optional notes for post-setup..."
                  className="w-full p-3 text-sm border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={eventData.setup.postNotes}
                  onChange={(e) => setEventData(prev => ({ ...prev, setup: { ...prev.setup, postNotes: e.target.value } }))}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <button 
              onClick={handleFinishSetup}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 shadow-lg"
            >
              Ready for Handover
            </button>
          </div>
        );

      case WorkflowStep.SUMMARY:
        return (
          <div className="space-y-6">
            <div className="bg-green-100 border border-green-200 rounded-xl p-6 text-center text-green-800">
              <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Event Completed!</h3>
              <p className="text-sm opacity-90">All tracker data has been synced to Zappy servers.</p>
            </div>

            <div className="bg-white border rounded-lg p-4 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-700 border-b pb-1">Tracker Summary</h4>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Vendor:</span>
                <span className="font-medium">{eventData.vendorId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Check-in:</span>
                <span className="font-medium">{new Date(eventData.checkIn.timestamp || 0).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Location:</span>
                <span className="font-medium text-xs">
                  {eventData.checkIn.location?.latitude.toFixed(4)}, {eventData.checkIn.location?.longitude.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Duration:</span>
                <span className="font-medium">
                  {eventData.startTime && eventData.endTime 
                    ? Math.round((eventData.endTime - eventData.startTime) / 60000) 
                    : 0} mins
                </span>
              </div>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg hover:bg-slate-900"
            >
              Start New Assignment
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const getPageTitle = () => {
    switch(step) {
      case WorkflowStep.LOGIN: return "Sign In";
      case WorkflowStep.CHECK_IN: return "1. Check-In";
      case WorkflowStep.OTP_START: return "2. Start Event";
      case WorkflowStep.SETUP: return "3. Progress";
      case WorkflowStep.OTP_COMPLETE: return "4. Closing";
      case WorkflowStep.SUMMARY: return "Success";
      default: return "Tracker";
    }
  };

  return (
    <Layout 
      title={getPageTitle()} 
      onLogout={() => setStep(WorkflowStep.LOGIN)}
      showLogout={step !== WorkflowStep.LOGIN && step !== WorkflowStep.SUMMARY}
    >
      {step !== WorkflowStep.LOGIN && step !== WorkflowStep.SUMMARY && (
        <ProgressBar currentStep={step} />
      )}
      {renderStep()}
    </Layout>
  );
};

export default App;
