import React, { useState } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, useIonRouter, useIonAlert } from '@ionic/react';
import { arrowBackOutline, lockClosedOutline, cardOutline } from 'ionicons/icons';
import { useParams, useLocation } from 'react-router-dom';

const Pago: React.FC = () => {
  const router = useIonRouter();
  const [presentAlert] = useIonAlert();
  
  // Extraemos el ID de la cancha desde la URL (/cliente/pago/:id)
  const { id } = useParams<{ id: string }>();
  
  // Extraemos la fecha y el horario desde los parámetros de búsqueda (?fecha=...&horario=...)
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const fecha = queryParams.get('fecha') || '';
  const horario = queryParams.get('horario') || '';

  // Estados para el formulario de la tarjeta simulada
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTitular, setNombreTitular] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Función que procesa el pago simulado y guarda en PostgreSQL
  const procesarPagoYReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcesando(true);

    const token = localStorage.getItem('token');
    if (!token) {
      presentAlert({ header: 'Error', message: 'Sesión expirada.', buttons: ['OK'] });
      router.push('/login');
      return;
    }

    const [hora_inicio, hora_fin] = horario.split(' - ');

    try {
      // 1. Aquí harías la validación real con Transbank/Webpay. 
      // Para este proyecto, simulamos 1.5 segundos de carga bancaria.
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 2. Si el pago "pasó", guardamos la reserva en la base de datos
      const respuesta = await fetch('http://localhost:3000/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cancha_id: parseInt(id || '1', 10),
          fecha_reserva: fecha,
          hora_inicio: hora_inicio.trim(),
          hora_fin: hora_fin.trim()
        })
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        presentAlert({
          header: '¡Pago Exitoso!',
          message: 'Tu reserva ha sido confirmada y pagada correctamente.',
          buttons: [
            {
              text: 'Ver mis reservas',
              handler: () => {
                // Enviamos al usuario a ver su historial actualizado
                router.push('/cliente/perfil?seccion=reservas', 'root', 'replace');
              }
            }
          ]
        });
      } else {
        presentAlert({ header: 'Error', message: data.mensaje || 'Hubo un problema al crear la reserva.', buttons: ['OK'] });
      }
    } catch (error) {
      presentAlert({ header: 'Error de conexión', message: 'No se pudo contactar con el servidor.', buttons: ['OK'] });
    } finally {
      setProcesando(false);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#0055ff', color: 'white' } as React.CSSProperties}>          <IonButtons slot="start">
            <IonButton onClick={() => router.goBack()} style={{ color: 'white' }}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Confirmar Pago</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f4f5f8' } as React.CSSProperties}>        
        {/* Resumen de la reserva */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>Resumen de tu reserva</h2>
          <p style={{ margin: '4px 0', color: '#666' }}><strong>Fecha:</strong> {fecha}</p>
          <p style={{ margin: '4px 0', color: '#666' }}><strong>Horario:</strong> {horario}</p>
          <hr style={{ margin: '15px 0', borderTop: '1px solid #eee' }} />
          <h3 style={{ margin: 0, color: '#0055ff', display: 'flex', justifyContent: 'space-between' }}>
            <span>Total a pagar:</span>
            {/* Si quisieras el precio exacto, podrías pasarlo también por URL o consultarlo acá */}
            <span>Monto de la cancha</span> 
          </h3>
        </div>

        {/* Formulario de pago seguro */}
        <form onSubmit={procesarPagoYReserva} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', color: '#0055ff' }}>
            <IonIcon icon={lockClosedOutline} style={{ marginRight: '8px', fontSize: '20px' }} />
            <h2 style={{ margin: 0, fontSize: '18px' }}>Datos de la Tarjeta</h2>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '5px' }}>Número de Tarjeta</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '8px', padding: '0 10px' }}>
              <IonIcon icon={cardOutline} style={{ color: '#999', marginRight: '5px' }} />
              <input 
                type="text" 
                maxLength={16} 
                required 
                value={numeroTarjeta}
                onChange={(e) => setNumeroTarjeta(e.target.value.replace(/\D/g, ''))}
                placeholder="1234 5678 9101 1121" 
                style={{ width: '100%', border: 'none', padding: '12px 0', outline: 'none' }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '5px' }}>Nombre del Titular</label>
            <input 
              type="text" 
              required 
              value={nombreTitular}
              onChange={(e) => setNombreTitular(e.target.value)}
              placeholder="Ej: Bruno Medina" 
              style={{ width: '100%', border: '1px solid #ccc', borderRadius: '8px', padding: '12px 10px', outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '5px' }}>Vencimiento</label>
              <input 
                type="text" 
                maxLength={5} 
                required 
                value={vencimiento}
                onChange={(e) => setVencimiento(e.target.value)}
                placeholder="MM/AA" 
                style={{ width: '100%', border: '1px solid #ccc', borderRadius: '8px', padding: '12px 10px', outline: 'none', boxSizing: 'border-box' }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '5px' }}>CVV</label>
              <input 
                type="password" 
                maxLength={3} 
                required 
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                placeholder="123" 
                style={{ width: '100%', border: '1px solid #ccc', borderRadius: '8px', padding: '12px 10px', outline: 'none', boxSizing: 'border-box' }} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={procesando}
            style={{ 
              width: '100%', 
              background: procesando ? '#ccc' : '#0055ff', 
              color: 'white', 
              border: 'none', 
              padding: '16px', 
              borderRadius: '8px', 
              fontSize: '16px', 
              fontWeight: 'bold',
              cursor: procesando ? 'not-allowed' : 'pointer'
            }}>
            {procesando ? 'Procesando pago...' : 'PAGAR Y CONFIRMAR'}
          </button>
        </form>

      </IonContent>
    </IonPage>
  );
};

export default Pago;