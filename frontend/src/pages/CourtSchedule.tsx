import React, { useState } from 'react';
import { IonPage, IonContent, IonIcon, useIonRouter } from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import './CourtSchedule.css';

const SPORT_MASCOTS: Record<string, string> = {
  'futbol-7': '/Imagen Messi FaltaUno.png',
  'futbol-11': '/Imagen Cristiano FaltaUno.png',
  padel: '/Jugador Padel FaltaUno.png',
  tenis: '/Jugador Tenis FaltaUno.png',
  bask: '/LebronJames FaltaUno.png',
  voley: '/Jugador Voleybol FaltaUno.png',
  pingpong: '/Jugador PingPong FaltaUno.png',
};

interface CourtData {
  id: number;
  name: string;
  time: string;
  status: string;
}

const CourtSchedule: React.FC = () => {
  const router = useIonRouter();
  const { id } = useParams<{ id: string }>(); // Este es el ID de la cancha que viene de SearchCourts

  const [selectedDate, setSelectedDate] = useState('2026-09-20');
  const [selectedTime, setSelectedTime] = useState('12:00 - 13:00');

  const [tableData, setTableData] = useState<CourtData[]>([
    { id: 1, name: 'Cancha Principal', time: '12:00 - 13:00', status: 'Reservar' },
  ]);

  // Usamos un fallback por si el ID ahora es numérico para que no se rompa la imagen
  const sportId = parseInt(id || '1', 10) === 1 ? 'futbol-7' : 'padel'; 
  const mascotImage = SPORT_MASCOTS[sportId] || SPORT_MASCOTS['futbol-7'];

  const handleBuscar = () => {
    // Simulamos la disponibilidad por ahora para mantener tu diseño
    const newResults: CourtData[] = [1].map((courtNum) => ({
      id: courtNum,
      name: `Cancha Seleccionada`,
      time: selectedTime,
      status: 'Reservar',
    }));
    setTableData(newResults);
  };


  // --- Redirige al pago con los datos de la reserva ---
  const handleReservar = (court: CourtData) => {
    if (court.status !== 'Reservar') return;

    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Error: Debes iniciar sesión para reservar.');
      router.push('/login');
      return;
    }

    const cancha_id = parseInt(id || '1', 10);
    
    // Enviamos la fecha y el horario por la URL hacia la pasarela de pago
    router.push(`/cliente/pago/${cancha_id}?fecha=${selectedDate}&horario=${encodeURIComponent(court.time)}`);
  };

  const openDatePicker = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    try {
      if ('showPicker' in HTMLInputElement.prototype) {
        input.showPicker();
      }
    } catch {
      // Fallback silencioso
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="schedule-content">
        <button
          type="button"
          className="btn-back"
          onClick={() => router.push('/cliente/inicio')}
        >
          <IonIcon icon={arrowBackOutline} />
          Volver al Inicio
        </button>

        <div className="schedule-main-container">
          <div className="search-panel">
            <div className="search-field">
              <label htmlFor="schedule-date">Fecha</label>
              <input
                id="schedule-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                onClick={openDatePicker}
                aria-label="Seleccionar fecha"
                className="schedule-date-input"
              />
            </div>

            <div className="search-divider" />

            <div className="search-field">
              <label htmlFor="schedule-time">Hora</label>
              <select
                id="schedule-time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="schedule-time-select"
              >
                <option value="10:00 - 11:00">10:00 - 11:00</option>
                <option value="11:00 - 12:00">11:00 - 12:00</option>
                <option value="12:00 - 13:00">12:00 - 13:00</option>
                <option value="13:00 - 14:00">13:00 - 14:00</option>
                <option value="14:00 - 15:00">14:00 - 15:00</option>
                <option value="15:00 - 16:00">15:00 - 16:00</option>
                <option value="16:00 - 17:00">16:00 - 17:00</option>
              </select>
            </div>

            <button type="button" className="btn-buscar" onClick={handleBuscar}>
              Buscar
            </button>
          </div>

          <div className="table-container">
            <table className="courts-table">
              <thead>
                <tr>
                  <th>Cancha</th>
                  <th>Horario</th>
                  <th>Reserva</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((court) => (
                  <tr key={court.id}>
                    <td>{court.name}</td>
                    <td>{court.time}</td>
                    <td>
                      <button
                        type="button"
                        className={`status-badge ${
                          court.status === 'Ocupada' ? 'badge-ocupada' : 'badge-reservar'
                        }`}
                        disabled={court.status === 'Ocupada'}
                        onClick={() => handleReservar(court)}
                      >
                        {court.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`sport-mascot-container mascot-${sportId}`}>
          <img
            src={mascotImage}
            alt="Mascota del deporte"
            className="sport-mascot"
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CourtSchedule;