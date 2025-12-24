
export enum WorkflowStep {
  LOGIN = 'LOGIN',
  CHECK_IN = 'CHECK_IN',
  OTP_START = 'OTP_START',
  SETUP = 'SETUP',
  OTP_COMPLETE = 'OTP_COMPLETE',
  SUMMARY = 'SUMMARY'
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface EventState {
  vendorId: string | null;
  checkIn: {
    photo: string | null;
    location: GeolocationData | null;
    timestamp: number | null;
  };
  setup: {
    prePhoto: string | null;
    preNotes: string;
    postPhoto: string | null;
    postNotes: string;
  };
  startTime: number | null;
  endTime: number | null;
}
