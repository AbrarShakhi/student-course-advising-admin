import React, { useState, useMemo } from "react";
import ClassSchedule from "../../../scheduler/classschedule";
import "../../styles/scheduler.css";

// --- Helper Components ---

const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p className="loading-text">Generating Schedule...</p>
    <p className="loading-subtext">This may take a moment.</p>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="error-alert" role="alert">
    <strong className="error-title">An error occurred:</strong>
    <span className="error-message">{message}</span>
  </div>
);

const ScheduleTable = ({ scheduleData }) => {
  const sortedData = scheduleData.sort((a, b) => {
    if (a.course > b.course) return 1;
    if (a.course < b.course) return -1;
    return a.section - b.section;
  });

  if (!sortedData || sortedData.length === 0) {
    return (
      <div className="no-schedule-message">
        <p>No schedule generated. Please provide valid inputs and try again.</p>
      </div>
    );
  }

  return (
    <div className="schedule-table-container">
      <h2 className="schedule-title">Generated Class Schedule</h2>
      <div className="table-responsive">
        <table className="schedule-table">
          <thead>
            <tr>
              <th scope="col">Course Name</th>
              <th scope="col">Section</th>
              <th scope="col">Day</th>
              <th scope="col">Start Time</th>
              <th scope="col">End Time</th>
              <th scope="col">Enrolled</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr key={index}>
                <td className="course-name">{item.course}</td>
                <td>{item.section}</td>
                <td>{item.schedule.day}</td>
                <td>{item.schedule.start_time}</td>
                <td>{item.schedule.end_time}</td>
                <td className="enrolled-count">{item.studentCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [seasonId, setSeasonId] = useState("");
  const [year, setYear] = useState("");
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateSchedule = async (e) => {
    e.preventDefault();
    if (!seasonId || !year) {
      setError("Please enter both Season ID and Year.");
      return;
    }

    setLoading(true);
    setError("");
    setSchedule(null);

    try {
      const [choicesResponse, slotsResponse] = await Promise.all([
        fetch(
          `http://localhost:5000/api/student-choises?season_id=${seasonId}&year=${year}`,
          { credentials: "include" }
        ),
        fetch(`http://localhost:5000/api/time-slot`, {
          credentials: "include",
        }),
      ]);

      const processResponse = async (response, endpointName) => {
        if (!response.ok) {
          throw new Error(
            `Failed to fetch ${endpointName}: Server responded with status ${response.status}. Check backend logs.`
          );
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const responseText = await response.text();
          console.error(
            `Unexpected response format from ${endpointName}:`,
            responseText
          );
          throw new Error(
            `Expected JSON from ${endpointName}, but received a different format. This often indicates a server error.`
          );
        }
        return response.json();
      };

      const { choices } = await processResponse(
        choicesResponse,
        "student choices"
      );
      const { time_slots } = await processResponse(slotsResponse, "time slots");

      if (Object.keys(choices).length === 0) {
        throw new Error(
          "No student choice data found for the given Season ID and Year."
        );
      }
      if (!time_slots || time_slots.length === 0) {
        throw new Error("No time slots available from the server.");
      }

      const scheduler = new ClassSchedule(choices);
      scheduler.make_section(30);
      const finalSchedule = scheduler.make_schedule(time_slots, 100, 30);

      const scheduleArray = Object.entries(finalSchedule).flatMap(
        ([course, sections]) =>
          sections.map((section, index) => ({
            course,
            section: index + 1,
            schedule: section.schedule,
            studentCount: section.students.length,
          }))
      );

      setSchedule(scheduleArray);
    } catch (err) {
      console.error("Scheduling failed:", err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="app-container">
        <div className="main-card">
          <header>
            <h1 className="header-title">Course Schedule Generator</h1>
            <p className="header-subtitle">
              Using a genetic algorithm to find an optimal, conflict-free class
              schedule.
            </p>
          </header>
          <main>
            <form onSubmit={handleGenerateSchedule}>
              <div className="form-container">
                <div className="form-group">
                  <label htmlFor="season_id" className="input-label">
                    Season ID
                  </label>
                  <input
                    type="text"
                    id="season_id"
                    value={seasonId}
                    onChange={(e) => setSeasonId(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="year" className="input-label">
                    Year
                  </label>
                  <input
                    type="text"
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? "Processing..." : "Generate Schedule"}
                </button>
              </div>
            </form>

            <div className="mt-8">
              {loading && <LoadingSpinner />}
              {error && <ErrorDisplay message={error} />}
              {schedule && <ScheduleTable scheduleData={schedule} />}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
