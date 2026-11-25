declare module '@firebase/app' {
  export function initializeApp(config?: any): any;
  export function getApps(): any[];
  export function getApp(): any;
}

declare module '@firebase/auth' {
  export interface User {
    uid: string;
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    phoneNumber?: string | null;
  }
  export interface ConfirmationResult {
    confirm: (verificationCode: string) => Promise<any>;
    verificationId: string;
  }
  export class RecaptchaVerifier {
    constructor(container: any, parameters?: any, app?: any);
    render(): Promise<number>;
    clear(): void;
    verify(): Promise<string>;
  }
  export function getAuth(app?: any): any;
  export function onAuthStateChanged(auth: any, callback: (user: User | null) => void): () => void;
  export function signInWithPopup(auth: any, provider: any): Promise<any>;
  export function signInWithPhoneNumber(auth: any, phoneNumber: string, applicationVerifier: any): Promise<ConfirmationResult>;
  export function updateProfile(user: any, profile: { displayName?: string | null; photoURL?: string | null }): Promise<void>;
  export function signInWithEmailAndPassword(auth: any, email: string, pass: string): Promise<any>;
  export function createUserWithEmailAndPassword(auth: any, email: string, pass: string): Promise<any>;
  export function signInAnonymously(auth: any): Promise<any>;
  export function signOut(auth: any): Promise<void>;
  export class GoogleAuthProvider {}
}

declare module '@firebase/firestore';
declare module '@firebase/analytics';

declare module 'firebase/app' {
  export function initializeApp(config?: any): any;
  export function getApps(): any[];
  export function getApp(): any;
}

declare module 'firebase/auth' {
  export interface User {
    uid: string;
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    phoneNumber?: string | null;
  }
  export interface ConfirmationResult {
    confirm: (verificationCode: string) => Promise<any>;
    verificationId: string;
  }
  export class RecaptchaVerifier {
    constructor(container: any, parameters?: any, app?: any);
    render(): Promise<number>;
    clear(): void;
    verify(): Promise<string>;
  }
  export function getAuth(app?: any): any;
  export function onAuthStateChanged(auth: any, callback: (user: User | null) => void): () => void;
  export function signInWithPopup(auth: any, provider: any): Promise<any>;
  export function signInWithPhoneNumber(auth: any, phoneNumber: string, applicationVerifier: any): Promise<ConfirmationResult>;
  export function updateProfile(user: any, profile: { displayName?: string | null; photoURL?: string | null }): Promise<void>;
  export function signInWithEmailAndPassword(auth: any, email: string, pass: string): Promise<any>;
  export function createUserWithEmailAndPassword(auth: any, email: string, pass: string): Promise<any>;
  export function signInAnonymously(auth: any): Promise<any>;
  export function signOut(auth: any): Promise<void>;
  export class GoogleAuthProvider {}
}

declare module 'firebase/firestore';
declare module 'firebase/analytics';




