import { ApiResponse, LoginData } from '../types';

export async function postData(
  sCommand: string,
  data: any
): Promise<{
  success: boolean;
  received: any;
  timestamp: string;
}> {
  try {
    const response = await fetch(`/api/${sCommand}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Post failed:', error);
    throw error;
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

function textToBase64(text: string): string {
  const encoder = new TextEncoder();
  return bytesToBase64(encoder.encode(text));
}

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id) as T | null;

  if (!element) {
    throw new Error(`Element not found: #${id}`);
  }

  return element;
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('index.html loaded');

  const domBtnAbout = document.getElementById('showAbout');

  if (domBtnAbout) {
    domBtnAbout.onclick = async () => {
      getRequiredElement<HTMLElement>('aboutModal').style.display = 'flex';

      try {
        const aFileList = await postData('fileList', 'Headlights');
        alert(JSON.stringify(aFileList, null, 2));
      } catch (error) {
        alert(`Failed to load file list: ${error}`);
      }
    };
  }

  const domCloseAbout = document.getElementById('closeAbout');

  if (domCloseAbout) {
    domCloseAbout.onclick = () => {
      getRequiredElement<HTMLElement>('aboutModal').style.display = 'none';
    };
  }

  const domCloseAboutAndStart = document.getElementById('closeAboutAndStart');

  if (domCloseAboutAndStart) {
    domCloseAboutAndStart.onclick = () => {
      getRequiredElement<HTMLElement>('aboutModal').style.display = 'none';

      const urlWithParams = new URL(
        location.origin + location.pathname + 'game.html'
      );
      urlWithParams.searchParams.set('level', '1');
      window.open(urlWithParams, '_self');
    };
  }

  const domStartGame = document.getElementById('startGame');

  if (domStartGame) {
    domStartGame.onclick = () => {
      const urlWithParams = new URL(
        location.origin + location.pathname + 'levels.html'
      );
      window.open(urlWithParams, '_self');
    };
  }

  const domLogin = getRequiredElement<HTMLElement>('loginScreen');
  const domSignup = getRequiredElement<HTMLElement>('signupScreen');

  const domLoginForm = document.getElementById('loginForm');

  if (domLoginForm) {
    domLoginForm.addEventListener('submit', event => {
      event.preventDefault();

      const gmail = getRequiredElement<HTMLInputElement>('loginGmail').value.trim();
      const password = getRequiredElement<HTMLInputElement>('loginPassword').value;

      if (!password) {
        alert('Enter your password.');
        return;
      }

      handleAuth(gmail, password, false);
      domLogin.style.display = 'none';
    });
  }

  const domSignupForm = document.getElementById('signupForm');

  if (domSignupForm) {
    domSignupForm.addEventListener('submit', event => {
      event.preventDefault();

      const gmail = getRequiredElement<HTMLInputElement>('signupGmail').value.trim();
      const password = getRequiredElement<HTMLInputElement>('signupPassword').value;
      const confirmPassword = getRequiredElement<HTMLInputElement>('confirmPassword').value;

      if (!password) {
        alert('Enter your password.');
        return;
      }

      if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
      }

      handleAuth(gmail, password, true);
      domSignup.style.display = 'none';
    });
  }

  const domRegisterGame = document.getElementById('loginButton');

  if (domRegisterGame) {
    domRegisterGame.onclick = () => {
      domLogin.style.display = '';
    };
  }

  const btnSignup = document.getElementById('signupButton');

  if (btnSignup) {
    btnSignup.onclick = () => {
      domSignup.style.display = '';
    };
  }
});

async function handleAuth(
  gmail: string,
  password: string,
  isSignup: boolean
): Promise<void> {
  console.log('Auth attempt:', {
    gmail,
    mode: isSignup ? 'signup' : 'login',
  });

  try {
    const result = await sendAuthRequest(password, gmail, isSignup) as ApiResponse;
    console.log('Auth result:', result);

    if (result.success) {
      console.log(isSignup ? 'Signup successful!' : 'Login successful!');
      function ShowCurUserName(){
        
      }
      return;
    }

    showAuthFailure(isSignup);
  } catch (error) {
    console.error('Auth request failed:', error);
    showAuthFailure(isSignup);
  }
}

async function sendAuthRequest(
  password: string,
  userId: string,
  isSignup: boolean
): Promise<any> {
  const endpoint = isSignup ? '/api/signup' : '/api/login';

  const payload: LoginData = {
    password: textToBase64(password),
    userId,
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

function showAuthFailure(isSignup: boolean): void {
  const domLogin = getRequiredElement<HTMLElement>('loginScreen');
  const domSignup = getRequiredElement<HTMLElement>('signupScreen');

  const tryAgain = confirm(
    isSignup
      ? 'Registration failed. Would you like to try again?'
      : 'Login failed. Would you like to try again?'
  );

  domLogin.style.display = 'none';
  domSignup.style.display = 'none';

  if (tryAgain) {
    if (isSignup) {
      domSignup.style.display = '';
    } else {
      domLogin.style.display = '';
    }

    clearAuthForms();
    return;
  }

  const switchAction = confirm(
    isSignup
      ? 'Would you like to login with an existing account instead?'
      : 'Would you like to create a new account instead?'
  );

  if (switchAction) {
    if (isSignup) {
      domLogin.style.display = '';
    } else {
      domSignup.style.display = '';
    }
  }

  clearAuthForms();
}

function clearAuthForms(): void {
  const loginGmail = document.getElementById('loginGmail') as HTMLInputElement | null;
  const loginPassword = document.getElementById('loginPassword') as HTMLInputElement | null;
  const confirmPassword = document.getElementById('confirmPassword') as HTMLInputElement | null;

  if (loginGmail) loginGmail.value = '';
  if (loginPassword) loginPassword.value = '';
  if (confirmPassword) confirmPassword.value = '';
}

async function uploadFile(
  fileBuffer: Uint8Array,
  fileName: string,
  mimeType: string
): Promise<any> {
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file: bytesToBase64(new Uint8Array(fileBuffer)),
      fileName,
      mimeType,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}