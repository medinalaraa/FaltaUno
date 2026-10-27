import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  useIonRouter,
} from '@ionic/react';
import './Login.css';

const Login: React.FC = () => {
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const router = useIonRouter();

  // Función única para iniciar sesión
  const handleLogin = async () => {
    if (!userEmail.trim() || !userPassword) {
      setErrorMsg('Debes completar todos los campos para iniciar sesión.');
      return;
    }

    setErrorMsg('');

    try {
      // 1. Petición POST a la ruta de login del servidor
      const respuesta = await fetch('http://localhost:3000/api/usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, password: userPassword }),
      });

      const data = await respuesta.json();

      // 2. Evaluar respuesta
      if (respuesta.ok) {
        // 3. Guardar el token y los datos de sesión reales que envía PostgreSQL
        localStorage.setItem('token', data.token); // Guardamos el JWT
        localStorage.setItem('userName', data.usuario.nombre);
        localStorage.setItem('userRol', data.usuario.rol);
        localStorage.setItem('userId', data.usuario.id.toString());
        localStorage.setItem('user_logged_in', 'true');

        // 4. Redirigir al inicio
        router.push('/cliente/inicio', 'root');
      } else {
        // Muestra el mensaje de error del backend (ej. "Correo o contraseña incorrectos")
        setErrorMsg(data.mensaje || 'Error al iniciar sesión.');
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      setErrorMsg('Error de conexión con el servidor. Verifica que el backend esté corriendo.');
    }
  };

  // Gestionar Enter y el botón mediante el formulario
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <IonPage>
      <IonContent className="ion-padding app-bg">
        <div className="login-container">

          
<div className="login-panel">
  <div className="login-header ion-text-center ion-margin-bottom">
    <img
      src="/Logo FaltaUno.png"
      alt="Logo FaltaUno"
      className="custom-logo"
    />

    <p className="subtitle">
      <span className="pregunta-destacada">
        ¿Falta uno para completar el equipo?
      </span>
      <br />
      Reserva tu cancha en segundos y sal a jugar.
    </p>
  </div>
</div>


          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            {errorMsg && (
              <div className="error-box" role="alert">
                {errorMsg}
              </div>
            )}

            <IonInput
              className="ion-margin-bottom custom-input"
              type="email"
              fill="solid"
              label="Correo electrónico"
              labelPlacement="floating"
              value={userEmail}
              onIonInput={(e) =>
                setUserEmail(e.detail.value ?? '')
              }
              autocomplete="email"
            />

            <div className="password-container">
              <IonInput
                className="custom-input password-input"
                type={showPassword ? 'text' : 'password'}
                fill="solid"
                label="Contraseña"
                labelPlacement="floating"
                value={userPassword}
                onIonInput={(e) =>
                  setUserPassword(e.detail.value ?? '')
                }
                autocomplete="current-password"
              />

              <img
                src={
                  showPassword
                    ? '/password visible.png'
                    : '/Password Invisible.png'
                }
                alt={
                  showPassword
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                }
                className="toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

            <IonButton
              expand="block"
              shape="round"
              className="ion-margin-top login-btn"
              type="submit"
            >
              INGRESAR
            </IonButton>

            <div className="register-prompt ion-text-center ion-margin-top">
              <p>
                ¿No tienes una cuenta?{' '}
                <span
                  className="link-text"
                  onClick={() => router.push('/registro')}
                >
                  Regístrate aquí
                </span>
              </p>
            </div>

          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
