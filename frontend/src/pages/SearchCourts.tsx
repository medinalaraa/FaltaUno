import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonButtons,
  useIonRouter,
  IonIcon,
} from '@ionic/react';

import {
  menuOutline,
  personOutline,
  tennisballOutline,
  cardOutline,
  globeOutline,
  shieldCheckmarkOutline,
  logOutOutline,
} from 'ionicons/icons';

import './SearchCourts.css';

// 1. Interfaz para los datos que vienen de PostgreSQL
interface CanchaDB {
  id: number;
  nombre: string;
  tipo_deporte: string;
  precio_hora: number;
}

// 2. Función para mapear el deporte de la BD con tus imágenes locales y descripciones
const obtenerVisualesCancha = (tipoDeporte: string) => {
  switch (tipoDeporte) {
    case 'Fútbol 7': return { image: '/recuadro futbol 7.jpg', desc: 'Canchas de pasto sintético iluminadas' };
    case 'Fútbol 11': return { image: '/recuadro futbol 11.jpg', desc: 'Canchas oficiales de grass profesional' };
    case 'Pádel': return { image: '/recuadro padel.jpg', desc: 'Canchas de vidrio con blindex' };
    case 'Tenis': return { image: '/recuadro tenis.jpg', desc: 'Superficie de arcilla y rápida' };
    case 'Básquetbol': return { image: '/recuadro basquetball.jpg', desc: 'Gimnasio techado profesional' };
    case 'Voleibol': return { image: '/recuadro voleyball.jpg', desc: 'Canchas de arena profesional' };
    case 'Mesas de Ping Pong': return { image: '/recuadro pingpong.jpg', desc: 'Salón indoor climatizado' };
    default: return { image: '/placeholder-cancha.jpg', desc: 'Recinto deportivo' };
  }
};

const SearchCourts: React.FC = () => {
  const [userName, setUserName] = useState('Usuario');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // 3. Estado para guardar las canchas de la base de datos
  const [canchas, setCanchas] = useState<CanchaDB[]>([]);

  const router = useIonRouter();

  useEffect(() => {
    // Verificar sesión
    const logged = localStorage.getItem('user_logged_in') === 'true';
    setIsLoggedIn(logged);
    if (logged) {
      const storedName = localStorage.getItem('userName') || 'Usuario';
      setUserName(storedName);
    } else {
      setUserName('Usuario');
    }

    // 4. Fetch para obtener las canchas desde Node.js/PostgreSQL
    const fetchCanchas = async () => {
      try {
        const respuesta = await fetch('http://localhost:3000/api/canchas');
        if (respuesta.ok) {
          const data = await respuesta.json();
          setCanchas(data);
        }
      } catch (error) {
        console.error("Error al conectar con el backend:", error);
      }
    };

    fetchCanchas();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('user_logged_in');
    localStorage.removeItem('userName');
    localStorage.removeItem('token'); // Aseguramos borrar el token JWT también
    localStorage.removeItem('userId');
    localStorage.removeItem('userRol');
    setIsLoggedIn(false);
    setUserName('Usuario');
    setIsSidebarOpen(false);
    router.push('/login', 'root', 'replace');
  };

  const handleSelectCategory = (canchaId: number) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
    } else {
      // Pasamos el ID real de la base de datos a la siguiente vista
      router.push(`/cliente/horarios/${canchaId}`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
        setShowAuthModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <IonPage>
      {/* ENCABEZADO */}
      <IonHeader translucent={true} className="header-custom-grande">
        <IonToolbar className="translucent-toolbar">
          {isLoggedIn && (
            <IonButtons slot="start">
              <button
                type="button"
                className="btn-hamburger"
                aria-label={isSidebarOpen ? 'Cerrar menú de perfil' : 'Abrir menú de perfil'}
                aria-expanded={isSidebarOpen}
                onClick={toggleSidebar}
              >
                <IonIcon icon={menuOutline} />
              </button>
            </IonButtons>
          )}

          <div className="toolbar-logo-container">
            <img src="/FaltaUno-Inicio.png" alt="FaltaUno Inicio" className="toolbar-logo-img" />
          </div>

          <IonButtons slot="end" className="header-auth-buttons">
            {!isLoggedIn && (
              <>
                <button type="button" className="btn-header-login" onClick={() => router.push('/login')}>
                  Iniciar Sesión
                </button>
                <button type="button" className="btn-header-register" onClick={() => router.push('/registro')}>
                  REGISTRARSE
                </button>
              </>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding content-main-bg">
        <div className="welcome-section">
          <h2>¡Hola, {userName}! 👋</h2>
          <p>¿Qué deporte jugamos hoy? Selecciona una categoría para ver los horarios.</p>
        </div>

        {/* 5. TARJETAS DINÁMICAS DESDE POSTGRESQL */}
        <div className="categories-grid">
          {canchas.map((cancha) => {
            const visuales = obtenerVisualesCancha(cancha.tipo_deporte);
            
            return (
              <IonCard
                key={cancha.id}
                className="category-card"
                button
                onClick={() => handleSelectCategory(cancha.id)}
              >
                <div className="card-image-container">
                  <img src={visuales.image} alt={cancha.tipo_deporte} className="category-bg-image" />
                  <div className="card-gradient-overlay" />
                  <IonCardHeader className="card-header-absolute">
                    <IonCardTitle className="card-title-white">{cancha.tipo_deporte}</IonCardTitle>
                  </IonCardHeader>
                </div>
                <IonCardContent className="card-content-custom">
                  <p style={{ fontWeight: 'bold', color: '#0055ff' }}>{cancha.nombre}</p>
                  <p>{visuales.desc}</p>
                  <p style={{ marginTop: '8px' }}>Valor: ${cancha.precio_hora} / hora</p>
                  <IonButton
                    fill="solid"
                    color="light"
                    expand="block"
                    size="small"
                    className="ion-margin-top btn-ver-horarios"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleSelectCategory(cancha.id);
                    }}
                  >
                    VER HORARIOS
                  </IonButton>
                </IonCardContent>
              </IonCard>
            );
          })}
        </div>

        {/* MODAL PARA USUARIOS SIN SESIÓN */}
        {showAuthModal && (
          <div className="auth-modal-backdrop" onClick={() => setShowAuthModal(false)}>
            <div
              className="auth-modal-box"
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="auth-modal-icon-wrapper">
                <img src="/Simbolo error FaltaUno.png" alt="Alerta" className="auth-error-icon" />
              </div>
              <h2 id="auth-modal-title" className="auth-modal-title">¡Inicia Sesión Para Continuar!</h2>
              <p className="auth-modal-message">
                Debes iniciar sesión o registrarte para poder reservar tu cancha y asegurar tu horario.
              </p>
              <div className="auth-modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowAuthModal(false)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-modal-login"
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push('/login');
                  }}
                >
                  Inicia Sesión
                </button>
              </div>
            </div>
          </div>
        )}

        {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} aria-hidden="true" />}

        {/* MENÚ LATERAL DE PERFIL */}
        <aside
          className={`custom-sidebar ${isSidebarOpen ? 'open' : ''}`}
          aria-label="Menú de perfil"
          aria-hidden={!isSidebarOpen}
        >
          <h3 className="sidebar-title">MI PERFIL</h3>
          <div className="sidebar-menu-list">
            <button
              type="button"
              className="sidebar-item active"
              onClick={() => {
                closeSidebar();
                router.push('/cliente/perfil'); 
              }}
              tabIndex={isSidebarOpen ? 0 : -1}
            >
              <IonIcon icon={personOutline} />
              <span>Datos Personales</span>
            </button>

            <button
              type="button"
              className="sidebar-item"
              onClick={() => {
                closeSidebar();
                router.push('/cliente/perfil?seccion=reservas');
              }}
              tabIndex={isSidebarOpen ? 0 : -1}
            >
              <IonIcon icon={tennisballOutline} />
              <span>Mis Reservas</span>
            </button>

            <button
              type="button"
              className="sidebar-item"
              onClick={() => {
                closeSidebar();
                router.push('/cliente/perfil?seccion=pagos');
              }}
              tabIndex={isSidebarOpen ? 0 : -1}
            >
              <IonIcon icon={cardOutline} />
              <span>Métodos de Pago</span>
            </button>

            <button
              type="button"
              className="sidebar-item"
              onClick={() => {
                closeSidebar();
                router.push('/cliente/perfil?seccion=preferencias');
              }}
              tabIndex={isSidebarOpen ? 0 : -1}
            >
              <IonIcon icon={globeOutline} />
              <span>Preferencias Regionales</span>
            </button>

            <button
              type="button"
              className="sidebar-item"
              onClick={() => {
                closeSidebar();
                router.push('/cliente/perfil?seccion=seguridad');
              }}
              tabIndex={isSidebarOpen ? 0 : -1}
            >
              <IonIcon icon={shieldCheckmarkOutline} />
              <span>Seguridad</span>
            </button>

            <hr className="sidebar-divider" />

            <button
              type="button"
              className="sidebar-btn-logout"
              onClick={handleLogout}
              tabIndex={isSidebarOpen ? 0 : -1}
            >
              <IonIcon icon={logOutOutline} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>
      </IonContent>
    </IonPage>
  );
};

export default SearchCourts;