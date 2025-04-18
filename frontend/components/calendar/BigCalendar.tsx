"use client";
import { useState } from "react";
import moment from "moment";

// Define event interface to match what we're using
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

// Props interface with proper typing
export interface BigCalendarProps {
  events: CalendarEvent[];
  style?: React.CSSProperties;
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  selectable?: boolean;
  onView?: (view: string) => void;
  onNavigate?: (date: Date) => void;
  view?: string;
  date?: Date;
  eventPropGetter?: (event: CalendarEvent) => { style: React.CSSProperties };
  className?: string;
  // These props are kept for API compatibility but not used in our implementation
  startAccessor?: string;
  endAccessor?: string;
}

// Extract day cell component to reduce nesting levels
const DayCell = ({
  day,
  dayEvents,
  dayId,
  isToday,
  onDayClick,
  onDayKeyDown,
  onEventClick,
  onEventKeyDown,
  eventPropGetter,
}: {
  day: { date: moment.Moment; isCurrentMonth: boolean };
  dayEvents: CalendarEvent[];
  dayId: string;
  isToday: boolean;
  onDayClick: (date: moment.Moment) => void;
  onDayKeyDown: (e: React.KeyboardEvent, date: moment.Moment) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEventKeyDown: (e: React.KeyboardEvent, event: CalendarEvent) => void;
  eventPropGetter?: (event: CalendarEvent) => { style: React.CSSProperties };
}) => {
  const eventsText = dayEvents.length > 0 ? `, ${dayEvents.length} events` : "";
  const ariaLabel = `${day.date.format("MMMM D, YYYY")}${eventsText}`;

  return (
    <button
      type="button"
      key={dayId}
      aria-label={ariaLabel}
      onClick={() => onDayClick(day.date)}
      onKeyDown={(e) => onDayKeyDown(e, day.date)}
      className={`
        p-1 border hover:bg-gray-700 cursor-pointer overflow-hidden flex flex-col text-left w-full h-full
        ${
          day.isCurrentMonth
            ? "border-gray-600 text-white"
            : "border-gray-800 text-gray-500"
        }
        ${isToday ? "bg-blue-900 bg-opacity-20" : ""}
      `}
    >
      <div className="text-xs mb-1">{day.date.format("D")}</div>
      <div className="flex-grow overflow-y-auto space-y-1">
        {dayEvents.map((event) => {
          // Use eventPropGetter if provided or default style
          const eventStyle = eventPropGetter
            ? eventPropGetter(event).style
            : { backgroundColor: event.resource?.color ?? "#3174ad" };

          return (
            <button
              type="button"
              key={`${dayId}-event-${event.id}`}
              aria-label={`Event: ${event.title}`}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event);
              }}
              onKeyDown={(e) => onEventKeyDown(e, event)}
              className="text-xs p-1 rounded truncate block w-full text-left"
              style={eventStyle}
            >
              {event.title}
            </button>
          );
        })}
      </div>
    </button>
  );
};

// A simple custom calendar component
const BigCalendar = (props: BigCalendarProps) => {
  // Set up state for the current month view
  const [currentDate, setCurrentDate] = useState(
    props.date ? moment(props.date) : moment()
  );
  const [currentView, setCurrentView] = useState(props.view ?? "month");

  // Get events for the current view
  const visibleEvents = props.events.filter((event) => {
    const eventDate = moment(event.start);
    return (
      eventDate.month() === currentDate.month() &&
      eventDate.year() === currentDate.year()
    );
  });

  // Helper to generate days for the month view
  const generateMonthDays = () => {
    const startOfMonth = currentDate.clone().startOf("month");
    const startDay = startOfMonth.day(); // 0 is Sunday

    // Create an array for all days in the month view (including padding from previous/next months)
    const days = [];

    // Add days from previous month for padding
    const prevMonth = currentDate.clone().subtract(1, "month");
    const daysInPrevMonth = prevMonth.daysInMonth();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: moment([
          prevMonth.year(),
          prevMonth.month(),
          daysInPrevMonth - i,
        ]),
        isCurrentMonth: false,
      });
    }

    // Add days of current month
    const daysInMonth = currentDate.daysInMonth();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: moment([currentDate.year(), currentDate.month(), i]),
        isCurrentMonth: true,
      });
    }

    // Add days from next month to fill the grid
    const remainingDays = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: moment([currentDate.year(), currentDate.month() + 1, i]),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  // Get events for a specific day
  const getEventsForDate = (date: moment.Moment) => {
    return visibleEvents.filter((event) => {
      const eventStart = moment(event.start).startOf("day");
      const eventEnd = moment(event.end).startOf("day");
      const dayDate = date.startOf("day");

      return (
        dayDate.isSame(eventStart) ||
        (dayDate.isAfter(eventStart) && dayDate.isBefore(eventEnd)) ||
        dayDate.isSame(eventEnd)
      );
    });
  };

  // Handle navigation
  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    let newDate;
    if (action === "PREV") {
      newDate = currentDate.clone().subtract(1, "month");
    } else if (action === "NEXT") {
      newDate = currentDate.clone().add(1, "month");
    } else {
      newDate = moment();
    }

    setCurrentDate(newDate);
    if (props.onNavigate) {
      props.onNavigate(newDate.toDate());
    }
  };

  // Handle view change
  const handleViewChange = (view: string) => {
    setCurrentView(view);
    if (props.onView) {
      props.onView(view);
    }
  };

  // Handle day click for slot selection
  const handleDayClick = (date: moment.Moment) => {
    if (props.onSelectSlot && props.selectable) {
      const start = date.toDate();
      const end = date.clone().add(1, "hour").toDate();
      props.onSelectSlot({ start, end });
    }
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    if (props.onSelectEvent) {
      props.onSelectEvent(event);
    }
  };

  // Handle keyboard navigation for accessibility
  const handleDayKeyDown = (e: React.KeyboardEvent, date: moment.Moment) => {
    if (e.key === "Enter" || e.key === " ") {
      handleDayClick(date);
    }
  };

  // Handle keyboard event selection for accessibility
  const handleEventKeyDown = (e: React.KeyboardEvent, event: CalendarEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.stopPropagation();
      handleEventClick(event);
    }
  };

  // Render the month view
  const renderMonthView = () => {
    const days = generateMonthDays();
    const weeks = [];

    // Split days into weeks
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="flex flex-col h-full">
        {/* Day headers */}
        <div className="grid grid-cols-7 text-center font-medium py-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-gray-200">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex-grow grid grid-rows-6 gap-1">
          {weeks.map((week, weekIndex) => {
            const weekId = `week-${currentDate.format("YYYY-MM")}-${
              weekIndex + 1
            }`;
            return (
              <div key={weekId} className="grid grid-cols-7 gap-1 h-full">
                {week.map((day) => {
                  const dayId = `day-${day.date.format("YYYY-MM-DD")}`;
                  const dayEvents = getEventsForDate(day.date);
                  const isToday = day.date.isSame(moment(), "day");

                  return (
                    <DayCell
                      key={dayId}
                      day={day}
                      dayEvents={dayEvents}
                      dayId={dayId}
                      isToday={isToday}
                      onDayClick={handleDayClick}
                      onDayKeyDown={handleDayKeyDown}
                      onEventClick={handleEventClick}
                      onEventKeyDown={handleEventKeyDown}
                      eventPropGetter={props.eventPropGetter}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render week view (placeholder - you can implement this later)
  const renderWeekView = () => (
    <div className="p-4 text-center text-white">
      Week view is not implemented in this simple calendar.
      <div className="mt-2">
        <button
          onClick={() => handleViewChange("month")}
          className="bg-blue-600 p-2 rounded"
        >
          Back to Month View
        </button>
      </div>
    </div>
  );

  // Render day view (placeholder - you can implement this later)
  const renderDayView = () => (
    <div className="p-4 text-center text-white">
      Day view is not implemented in this simple calendar.
      <div className="mt-2">
        <button
          onClick={() => handleViewChange("month")}
          className="bg-blue-600 p-2 rounded"
        >
          Back to Month View
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`flex flex-col ${props.className ?? ""}`}
      style={props.style ?? { height: "500px" }}
    >
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-3 p-2 bg-gray-800">
        <div className="flex space-x-2">
          <button
            onClick={() => handleNavigate("PREV")}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
          >
            &lt;
          </button>
          <button
            onClick={() => handleNavigate("TODAY")}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded text-white"
          >
            Today
          </button>
          <button
            onClick={() => handleNavigate("NEXT")}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
          >
            &gt;
          </button>
        </div>

        <h2 className="text-xl font-bold text-white">
          {currentDate.format("MMMM YYYY")}
        </h2>

        <div className="flex space-x-2">
          <button
            onClick={() => handleViewChange("month")}
            className={`px-3 py-1 rounded ${
              currentView === "month"
                ? "bg-blue-600"
                : "bg-gray-700 hover:bg-gray-600"
            } text-white`}
          >
            Month
          </button>
          <button
            onClick={() => handleViewChange("week")}
            className={`px-3 py-1 rounded ${
              currentView === "week"
                ? "bg-blue-600"
                : "bg-gray-700 hover:bg-gray-600"
            } text-white`}
          >
            Week
          </button>
          <button
            onClick={() => handleViewChange("day")}
            className={`px-3 py-1 rounded ${
              currentView === "day"
                ? "bg-blue-600"
                : "bg-gray-700 hover:bg-gray-600"
            } text-white`}
          >
            Day
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-grow overflow-auto">
        {currentView === "month" && renderMonthView()}
        {currentView === "week" && renderWeekView()}
        {currentView === "day" && renderDayView()}
      </div>
    </div>
  );
};

export default BigCalendar;
