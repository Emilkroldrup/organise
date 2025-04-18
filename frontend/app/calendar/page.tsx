"use client";
import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/redux/store";
import {
  fetchEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  setSelectedDate,
  setView,
  selectAllEvents,
  selectCalendarStatus,
  selectCalendarError,
  selectSelectedDate,
  selectView,
  clearError,
} from "@/redux/slices/calendarSlice";
import moment from "moment";
import { motion } from "framer-motion";
import { useError } from "@/components/GlobalErrorProvider";
import BigCalendar from "@/components/calendar/BigCalendar";

// Import styles for the calendar
import "react-big-calendar/lib/css/react-big-calendar.css";

// Define types for the event data
interface EventFormData {
  id?: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  is_all_day: boolean;
  color: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource?: {
    description?: string;
    location?: string;
    color?: string;
  };
}

export default function CalendarPage() {
  const dispatch = useAppDispatch();
  const events = useSelector(selectAllEvents);
  const status = useSelector(selectCalendarStatus);
  const error = useSelector(selectCalendarError);
  const selectedDate = useSelector(selectSelectedDate);
  const view = useSelector(selectView);
  const { showError } = useError();
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
    is_all_day: false,
    color: "#3174ad",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Format events for the calendar
  const formattedEvents = useMemo(() => {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      allDay: event.is_all_day,
      resource: {
        description: event.description ?? "",
        location: event.location ?? "",
        color: event.color ?? "#3174ad",
      },
    }));
  }, [events]);

  // Watch for errors and show them using the global error provider
  useEffect(() => {
    if (error) {
      showError(error);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  useEffect(() => {
    const startDate = moment().startOf('month').toISOString();
    const endDate = moment().endOf('month').toISOString();
    dispatch(fetchEvents({ start: startDate, end: endDate }));
  }, [dispatch]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setFormData({
      id: event.id,
      title: event.title,
      description: event.resource?.description ?? "",
      start_time: moment(event.start).format("YYYY-MM-DDTHH:mm"),
      end_time: moment(event.end).format("YYYY-MM-DDTHH:mm"),
      location: event.resource?.location ?? "",
      is_all_day: event.allDay,
      color: event.resource?.color ?? "#3174ad",
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setFormData({
      title: "",
      description: "",
      start_time: moment(start).format("YYYY-MM-DDTHH:mm"),
      end_time: moment(end).format("YYYY-MM-DDTHH:mm"),
      location: "",
      is_all_day: false,
      color: "#3174ad",
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleViewChange = (newView: string) => {
    dispatch(setView(newView as "day" | "week" | "month"));
  };

  const handleNavigate = (newDate: Date) => {
    dispatch(setSelectedDate(newDate.toISOString()));
    
    // Fetch events for the new date range
    const start = moment(newDate).startOf('month').toISOString();
    const end = moment(newDate).endOf('month').toISOString();
    dispatch(fetchEvents({ start, end }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form data
    const startTime = new Date(formData.start_time);
    const endTime = new Date(formData.end_time);
    
    if (startTime >= endTime) {
      showError("End time must be after start time");
      return;
    }
    
    const eventData = {
      ...formData,
      attendees: [], // Default empty array for attendees
    };
    
    if (isEditing && formData.id) {
      dispatch(updateEvent({
        id: formData.id,
        ...eventData
      }));
    } else {
      dispatch(addEvent(eventData));
    }
    
    setShowModal(false);
    resetForm();
  };

  const handleDeleteEvent = () => {
    if (formData.id) {
      dispatch(deleteEvent(formData.id));
      setShowModal(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      location: "",
      is_all_day: false,
      color: "#3174ad",
    });
    setIsEditing(false);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const style = {
      backgroundColor: event.resource?.color ?? "#3174ad",
      borderRadius: '5px',
      color: '#fff',
      border: 'none',
      display: 'block',
    };
    return {
      style
    };
  };

  return (
    <div className="flex flex-col w-full h-screen bg-gray-900 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Calendar</h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-all shadow-lg"
        >
          Add Event
        </motion.button>
      </div>

      {status === "loading" && (
        <div className="flex justify-center items-center h-40">
          <div className="text-white">Loading events...</div>
        </div>
      )}

      <div className="bg-gray-800 rounded-md p-5 shadow-lg border border-gray-700 flex-grow">
        <BigCalendar
          events={formattedEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "calc(100vh - 200px)" }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          onView={handleViewChange}
          onNavigate={handleNavigate}
          view={view}
          date={new Date(selectedDate)}
          eventPropGetter={eventStyleGetter}
          className="text-white"
        />
      </div>

      {/* Modal for adding/editing events */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-md p-6 shadow-lg border border-gray-700 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              {isEditing ? "Edit Event" : "Add New Event"}
            </h2>
            
            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="border border-gray-700 p-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="border border-gray-700 p-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white"
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_all_day"
                      checked={formData.is_all_day}
                      onChange={(e) => setFormData({...formData, is_all_day: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="is_all_day" className="text-sm font-medium text-gray-300">
                      All Day
                    </label>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-1">
                      Color
                    </label>
                    <input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="p-1 rounded w-full h-8 cursor-pointer"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start_time" className="block text-sm font-medium text-gray-300 mb-1">
                      Start Time
                    </label>
                    <input
                      id="start_time"
                      type="datetime-local"
                      required
                      value={formData.start_time}
                      onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                      className="border border-gray-700 p-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="end_time" className="block text-sm font-medium text-gray-300 mb-1">
                      End Time
                    </label>
                    <input
                      id="end_time"
                      type="datetime-local"
                      required
                      value={formData.end_time}
                      onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                      className="border border-gray-700 p-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="border border-gray-700 p-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white"
                  />
                </div>
                
                <div className="flex justify-between pt-4">
                  <div className="space-x-2">
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleDeleteEvent}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      {isEditing ? "Update" : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
