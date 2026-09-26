// Async/await version (already async - rewritten for clarity)
import { ApiResponse, LoginData } from '../types';
export async function postData(sCommand: string, data: any): Promise<{
    success: boolean;
    received: any;
    timestamp: string;
}> {
    try {
        const response = await fetch('/api/' + sCommand, {
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

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Post failed:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    console.log('index.html loaded');
    const domBtnAbout = document.getElementById("showAbout");
    if (domBtnAbout) {
        domBtnAbout.onclick = async () => {
            document.getElementById('aboutModal')!.style.display = 'flex';
            try {
                const aFileList = await postData('fileList', 'Headlights');
                alert(aFileList);
            } catch (error) {
                alert(error)
            }
        }
    }
    const domCloseAbout = document.getElementById("closeAbout");
    if (domCloseAbout) {
        domCloseAbout.onclick = () => {
            document.getElementById('aboutModal')!.style.display = 'none';
        }
    }
    const domCloseAboutAndStart = document.getElementById("closeAboutAndStart");
    if (domCloseAboutAndStart) {
        domCloseAboutAndStart.onclick = () => {
            document.getElementById('aboutModal')!.style.display = 'none';
            const urlWithParams = new URL(location.origin + location.pathname + 'game.html');
            urlWithParams.searchParams.set('level', "1");
            window.open(urlWithParams, '_self');
        };
    }
    const domStartGame = document.getElementById("startGame");
    if (domStartGame) {
        domStartGame.onclick = () => {
            const urlWithParams = new URL(location.origin + location.pathname + 'levels.html');
            window.open(urlWithParams, '_self');
        };
    }
    const domLogin = document.getElementById("loginScreen")!;
    const domLoginForm = document.getElementById("loginForm");
    if (domLoginForm) {
        domLoginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const gmail = (document.getElementById("gmail") as HTMLInputElement).value.trim();
            const password = (document.getElementById("password") as HTMLInputElement).value;

            if (!password) {
                alert("Enter your password.");
                return;
            }

            handleLogin(gmail, password, true);
            domLogin.style.display = 'none';
        });
    }

    const domSignup = document.getElementById("signupScreen")!;
    const domSignupForm = document.getElementById("signupForm");
    if (domSignupForm) {
        domSignupForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const gmail = (document.getElementById("gmail") as HTMLInputElement).value.trim();
            const password = (document.getElementById("password") as HTMLInputElement).value;
            const confirmPassword = (document.getElementById("confirmPassword") as HTMLInputElement).value;

            if (!password) {
                alert("Enter your password.");
                return;
            }

            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            handleLogin(gmail, password, false);
            domSignup.style.display = 'none';
        });
    }

    const domRegisterGame = document.getElementById("loginButton");
    if (domRegisterGame) {
        domRegisterGame.onclick = () => {
            domLogin.style.display = '';
        };
    }
    const btnSignup = document.getElementById("signupButton");
    if (btnSignup) {
        btnSignup.onclick = () => {
            domSignup.style.display = '';
        };
    }

});
/*
// НОВАЯ ФУНКЦИЯ: закрыть модал и вернуться на title screen
function CloseAbout() {
    document.getElementById('aboutModal').style.display = 'none';
    showScreen('titleScreen');
}

function closeAboutAndStart() {
    document.getElementById('aboutModal').style.display = 'none';
    startGame();
}


*/

async function handleLogin(gmail: string, password: string, bSignedUp: boolean): Promise<void> {
    console.log("Login info:", gmail, password);
    
    // Создаем строку с данными
    const dataString = password;
    
    // Используем TextEncoder для конвертации в ArrayBuffer (браузерный аналог Buffer)
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(dataString);
        
    // uploadFile должен принимать Uint8Array вместо Buffer
    const result = await login(uint8Array, gmail, bSignedUp) as ApiResponse;
    console.log(result);
    
    if (result.success) {
        console.log("Login successful!");
        // Здесь можно добавить переход на следующую страницу или другую логику успеха
    } else {
        console.error("Login failed!");
        
        // Показываем пользователю выбор
        const tryAgain = confirm(
            bSignedUp 
                ? "Login failed. Would you like to try again?"
                : "Registration failed. Would you like to try again?"
        );
        
        if (tryAgain) {
            // Очищаем поля и показываем нужную форму снова
            const domLogin = document.getElementById("loginScreen")!;
            const domSignup = document.getElementById("signupScreen")!;
            
            // Скрываем обе формы
            domLogin.style.display = 'none';
            domSignup.style.display = 'none';
            
            // Показываем ту, которая была активна
            if (bSignedUp) {
                domLogin.style.display = '';
            } else {
                domSignup.style.display = '';
            }
            
            // Очищаем поля ввода
            (document.getElementById("gmail") as HTMLInputElement).value = "";
            (document.getElementById("password") as HTMLInputElement).value = "";
            const confirmPasswordInput = document.getElementById("confirmPassword") as HTMLInputElement;
            if (confirmPasswordInput) {
                confirmPasswordInput.value = "";
            }
        } else {
            // Пользователь не хочет пробовать снова
            const domLogin = document.getElementById("loginScreen")!;
            const domSignup = document.getElementById("signupScreen")!;
            
            // Скрываем обе формы
            domLogin.style.display = 'none';
            domSignup.style.display = 'none';
            
            // Предлагаем создать новый аккаунт (если пытались войти) или войти (если регистрировались)
            const switchAction = confirm(
                bSignedUp
                    ? "Would you like to create a new account instead?"
                    : "Would you like to login with an existing account instead?"
            );
            
            if (switchAction) {
                if (bSignedUp) {
                    // Была попытка входа → переключаем на регистрацию
                    domSignup.style.display = '';
                } else {
                    // Была попытка регистрации → переключаем на вход
                    domLogin.style.display = '';
                }
                
                // Очищаем поля
                (document.getElementById("gmail") as HTMLInputElement).value = "";
                (document.getElementById("password") as HTMLInputElement).value = "";
                const confirmPasswordInput = document.getElementById("confirmPassword") as HTMLInputElement;
                if (confirmPasswordInput) {
                    confirmPasswordInput.value = "";
                }
            }
        }
    }
}

async function uploadFile(fileBuffer: Uint8Array, fileName: string, mimeType: string): Promise<any> {
    // Конвертируем Uint8Array в base64 строку
    const fileBase64 = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
    
    const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            file: fileBase64,  // ← теперь это строка
            fileName: fileName,
            mimeType: mimeType,
        }),
    });

    return response.json();
}

async function login(password: Uint8Array, login: string, bSignedUp: boolean): Promise<any> {
    // Конвертируем Uint8Array в base64 строку
    const passBase64 = btoa(String.fromCharCode(...new Uint8Array(password)));
    let sCommand = bSignedUp ? 'login' : 'signup';
    const data: LoginData = {
        password: passBase64,
        userId: login
    };
    const response = await fetch(`/api/${sCommand}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    return response.json();
}

async function signup(password: Uint8Array, fileName: string): Promise<any> {
    // Конвертируем Uint8Array в base64 строку
    const fileBase64 = btoa(String.fromCharCode(...new Uint8Array(password)));
    
    const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            file: fileBase64,  // ← теперь это строка
            fileName: fileName,
        }),
    });

    return response.json();
}