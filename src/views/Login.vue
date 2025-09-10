
<template>
    <ion-page>
        <ion-content class=" login-content">
            <div class="login-container">
            <!-- Logo -->
            <div class="logo-container">
                <div class="logo-box">
                    <img src="/src/assets/utilityboxlogo.png" alt="UtilityBox Logo" class="logo-image" />
                </div>
            </div>

            <!-- Form Inputs -->
            <div class="form-container">
            <!-- Email Input -->
            <ion-item class="input-item">
            <ion-input
                v-model="email"
                type="email"
                placeholder="Email"
                fill="solid"
                class="custom-input"
            ></ion-input>
            </ion-item>

            <!-- Password Input -->
            <ion-item class="input-item">
            <ion-input
                v-model="password"
                type="password"
                placeholder="Password"
                fill="solid"
                class="custom-input"
            ></ion-input>
            </ion-item>

            <!-- Confirm Password Input (only for sign up) -->
            <ion-item v-if="!isLogin" class="input-item">
            <ion-input
                v-model="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                fill="solid"
                class="custom-input"
            ></ion-input>
            </ion-item>

            <!-- Login/Sign Up Button -->
            <ion-button
            expand="block"
            class="login-button"
            @click="handleSubmit"
            >
            {{ isLogin ? 'LOGIN' : 'SIGN UP' }}
            </ion-button>
            </div>

        <!-- Bottom Links -->
        <div class="bottom-links">
            <template v-if="isLogin">
                <ion-button
                    fill="clear"
                    class="link-button left-link"
                    @click="handleForgotPassword"
                >
                Forgot<br />Password
                </ion-button>
                <ion-button
                    fill="clear"
                    class="link-button right-link"
                    @click="toggleMode"
                >
                Sign Up
                </ion-button>
            </template>
            <template v-else>
                <ion-button
                    fill="clear"
                    class="link-button left-link"
                    @click="toggleMode"
                >
                Back to<br />Login
                </ion-button>
                <div class="link-text">
                    Create<br />Account
                </div>
            </template>
            </div>
        </div>
        </ion-content>
    </ion-page>
</template>

<script>
import {
    IonPage,
    IonContent,
    IonInput,
    IonItem,
    IonButton,
    alertController,
    toastController
} from '@ionic/vue';
import { ref } from 'vue';

export default {
    name: 'LoginSignupPage',
    components: {
        IonPage,
        IonContent,
        IonInput,
        IonItem,
        IonButton,
    },
    setup() {
        const isLogin = ref(true);
        const email = ref('');
        const password = ref('');
        const confirmPassword = ref('');
        const mobileno = ref('');
        const lastname = ref('');

        const handleSubmit = async () => {
            if (!email.value || !password.value) {
            const toast = await toastController.create({
                message: 'Please fill in all fields',
                duration: 2000,
                color: 'danger'
            });
            await toast.present();
            return;
            }

            if (!isLogin.value) {
            // SIGN UP
            if (password.value !== confirmPassword.value) {
                const toast = await toastController.create({
                message: 'Passwords do not match',
                duration: 2000,
                color: 'danger'
                });
                await toast.present();
                return;
            }

            const registerData = {
                email: email.value,
                mobileno: mobileno.value,
                password: password.value,
                lname: lastname.value,
                streetname: '', // optional
                stateid: ''     // optional
            };

            try {
                const response = await fetch(
                'https://srwv0srmfl.execute-api.us-west-2.amazonaws.com/Prod/UserRegister',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registerData)
                }
                );

                const result = await response.json();
                console.log('register response:', result);

                if (result.res) {
                const toast = await toastController.create({
                    message: 'Signup successful! Please check your email to verify.',
                    duration: 3000,
                    color: 'success'
                });
                await toast.present();

                // auto-login shortcut (optional)
                localStorage.setItem('userId', result.details);
                localStorage.setItem('email', email.value);
                window.location.href = '/tabs/home';
                } else if (result.details === 'email already exists') {
                const toast = await toastController.create({
                    message: 'Email already exists. Please login or reset password.',
                    duration: 3000,
                    color: 'warning'
                });
                await toast.present();
                } else {
                const toast = await toastController.create({
                    message: 'Signup failed. Please contact support.',
                    duration: 3000,
                    color: 'danger'
                });
                await toast.present();
                }
            } catch (err) {
                console.error('Register error:', err);
                const toast = await toastController.create({
                message: 'Network or server error',
                duration: 3000,
                color: 'danger'
                });
                await toast.present();
            }

            } else {
            // LOGIN (already working)
            const loginData = {
                email: email.value,
                password: password.value
            };

            try {
                const response = await fetch(
                'https://srwv0srmfl.execute-api.us-west-2.amazonaws.com/Prod/UserLogin',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginData)
                }
                );
                const result = await response.json();
                console.log('login response:', result);

                if (result.res) {
                localStorage.setItem('userId', result.details);
                localStorage.setItem('email', email.value);
                const toast = await toastController.create({
                    message: 'Login successful',
                    duration: 2000,
                    color: 'success'
                });
                await toast.present();
                window.location.href = '/tabs/home';
                } else {
                const toast = await toastController.create({
                    message: 'Login failed. Check your credentials.',
                    duration: 2500,
                    color: 'danger'
                });
                await toast.present();
                }
            } catch (error) {
                console.error('Login error:', error);
                const toast = await toastController.create({
                message: 'Network or server error',
                duration: 2500,
                color: 'danger'
                });
                await toast.present();
            }
            }

            password.value = '';
            confirmPassword.value = '';
        };

        const handleForgotPassword = async () => {
            const alert = await alertController.create({
            header: 'Reset Password',
            message: 'Enter your email to reset your password',
            inputs: [
                {
                name: 'email',
                type: 'email',
                placeholder: 'Email',
                value: email.value
                }
            ],
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                text: 'Send',
                handler: async (data) => {
                    try {
                    const response = await fetch(
                        'https://srwv0srmfl.execute-api.us-west-2.amazonaws.com/Prod/UserForgotPassword',
                        {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: data.email })
                        }
                    );
                    const result = await response.json();
                    console.log('forgot password response:', result);

                    const toast = await toastController.create({
                        message: result.res
                        ? 'Password reset instructions sent to your email.'
                        : 'Error: ' + (result.details || 'Failed to send reset email.'),
                        duration: 3000,
                        color: result.res ? 'success' : 'danger'
                    });
                    await toast.present();
                    } catch (err) {
                    console.error('Forgot password error:', err);
                    const toast = await toastController.create({
                        message: 'Network or server error',
                        duration: 3000,
                        color: 'danger'
                    });
                    await toast.present();
                    }
                }
                }
            ]
            });
            await alert.present();
        };

        const toggleMode = () => {
            isLogin.value = !isLogin.value;
            confirmPassword.value = '';
        };

        return {
            isLogin,
            email,
            password,
            confirmPassword,
            mobileno,
            lastname,
            handleSubmit,
            handleForgotPassword,
            toggleMode
        };
    }


};
</script>

<style scoped>
.login-content {
    --background: linear-gradient(180deg, #7b2c7e 0%, #5a1a5d 100%);
}

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem 1.5rem;
}

.logo-container {
    margin-bottom: 2rem;
}

.logo-box {
    /* background: white; */
    padding: 0.75rem 1rem;
    border-radius: 8px;
    /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); */
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.logo-squares {
    display: flex;
    gap: 0.25rem;
}

.square {
    width: 1rem;
    height: 1rem;
    border-radius: 2px;
}

.square.orange {
    background: #ff6b35;
}

.square.blue {
    background: #4a90e2;
}

.logo-text {
    font-weight: bold;
    font-size: 0.9rem;
    color: #333;
}

.form-container {
    width: 100%;
    max-width: 320px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.input-item {
    --background: white;
    --border-radius: 8px;
    --padding-start: 0;
    --padding-end: 0;
    --inner-padding-start: 1rem;
    --inner-padding-end: 1rem;
    --min-height: 50px;
    margin-bottom: 0.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.custom-input {
    --color: #333;
    --placeholder-color: #999;
    --padding-start: 0;
    --padding-end: 0;
}

.login-button {
    background: none;
    --background: orange; 
    --color: white ;
    --border-radius: 25px;
    --padding-top: 0.75rem;
    --padding-bottom: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin-top: 0.5rem;
    /* box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
    transition: all 0.3s ease;*/
}

.login-button:hover {
    --background: #ff8c42 
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
}

.bottom-links {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 320px;
    margin-top: 2rem;
    }

.link-button {
    --color: white;
    --color-hover: #ff6b35;
    font-size: 0.9rem;
    text-transform: none;
    transition: color 0.3s ease;
}

.link-button:hover {
    --color: #ff6b35;
}

.left-link {
    text-align: left;
}

.right-link {
    text-align: right;
}

.link-text {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    text-align: right;
    line-height: 1.3;
}

/* Remove default ion-item styling */
ion-item {
    --border-width: 0;
    --highlight-height: 0;
    --show-full-highlight: 0;
    --show-inset-highlight: 0;
}
</style>