import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees: string[];
  type: 'meeting' | 'site-visit' | 'deadline' | 'other';
}

const EventCard: React.FC<CalendarEvent> = ({
  title,
  startTime,
  endTime,
  location,
  attendees,
  type,
}) => {
  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'meeting':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'site-visit':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'deadline':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className={`p-3 rounded-md border ${getEventColor(type)} mb-2`}>
      <h3 className="font-medium">{title}</h3>
      <div className="mt-2 space-y-1">
        <div className="flex items-center text-sm">
          <Clock size={14} className="mr-1" />
          {startTime} - {endTime}
        </div>
        {location && (
          <div className="flex items-center text-sm">
            <MapPin size={14} className="mr-1" />
            {location}
          </div>
        )}
        {attendees.length > 0 && (
          <div className="flex items-center text-sm">
            <Users size={14} className="mr-1" />
            {attendees.length > 2
              ? `${attendees[0]}, ${attendees[1]} +${attendees.length - 2}`
              : attendees.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export const CalendarPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate calendar days for the current month
  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, []);

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth, getDaysInMonth]);
  const weekdays = useMemo(() => ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'], []);
  const monthNames = useMemo(() => [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ], []);

  const prevMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }, [currentMonth]);

  const nextMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }, [currentMonth]);

  const events: Record<string, CalendarEvent[]> = {};

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events[dateString] || [];
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendrier</h1>
          <p className="text-gray-600">Gérez vos rendez-vous et événements</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button variant="primary" leftIcon={<Plus size={16} />}>
            Nouvel Événement
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold mx-4">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="hidden sm:flex space-x-2">
            <Button variant="outline" size="sm">
              Aujourd'hui
            </Button>
            <Button variant="outline" size="sm">
              Mois
            </Button>
            <Button variant="outline" size="sm">
              Semaine
            </Button>
            <Button variant="outline" size="sm">
              Jour
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weekdays.map(day => (
            <div
              key={day}
              className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}

          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-[120px] bg-white p-2 ${
                day && isToday(day) ? 'bg-blue-50' : ''
              } ${!day ? 'bg-gray-50' : ''}`}
            >
              {day && (
                <>
                  <div
                    className={`text-sm font-medium ${
                      isToday(day) ? 'text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    {day.getDate()}
                  </div>
                  <div className="mt-1 overflow-y-auto max-h-[80px]">
                    {getEventsForDay(day).map(event => (
                      <EventCard key={event.id} {...event} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Événements à venir</h2>
        <div className="space-y-4">
          {Object.values(events)
            .flat()
            .slice(0, 4)
            .map(event => (
              <div key={event.id} className="flex items-start">
                <div className="flex-shrink-0 w-12 text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(event.date).getDate()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {monthNames[new Date(event.date).getMonth()].substring(0, 3)}
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <EventCard {...event} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
