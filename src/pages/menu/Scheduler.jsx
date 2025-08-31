import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Toaster, toast } from "react-hot-toast";
import {
  PlusCircle,
  Edit,
  Trash2,
  X,
  RefreshCcw,
  ListOrdered,
  List,
} from "lucide-react";
import ClassSchedule from "../../../scheduler/classschedule";
import "../../styles/scheduler.css";

// --- Reusable Helper Components ---
const LoadingSpinner = ({ text }) => (
  <div className="loading-container">
    <div className="loading-spinner">
      <div></div>
    </div>
    <p>{text}</p>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="error-alert" role="alert">
    <strong className="error-title">An error occurred:</strong>
    <span className="error-message">{message}</span>
  </div>
);

// --- Schedule Generation Components ---
const ScheduleTable = ({ scheduleData }) => {
  if (!scheduleData || scheduleData.length === 0) {
    return null;
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
            {scheduleData.map((item, index) => (
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

// --- CRUD Management Components ---
const ManagementDashboard = ({ generatedData }) => {
  const [activeModel, setActiveModel] = useState("Section");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Dependencies for dropdowns
  const [courses, setCourses] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [years, setYears] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [timeslots, setTimeslots] = useState([]);
  const [students, setStudents] = useState([]);

  const API_URL = "/crud";

  const models = [
    {
      name: "Section",
      icon: ListOrdered,
      endpoint: "section",
      pk_fields: ["season_id", "year", "section_no", "course_id"],
    },
    {
      name: "Student Takes",
      icon: List,
      endpoint: "takes",
      pk_fields: ["season_id", "year", "section_no", "course_id", "student_id"],
    },
  ];

  const fetchDataFromEndpoint = async (endpoint) => {
    try {
      const response = await fetch(`${API_URL}/${endpoint}/`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
      return await response.json();
    } catch (err) {
      toast.error(`Failed to load ${endpoint}.`);
      return [];
    }
  };

  useEffect(() => {
    const fetchAllDependencies = async () => {
      setCourses(await fetchDataFromEndpoint("course"));
      setSeasons(await fetchDataFromEndpoint("season"));
      setYears(await fetchDataFromEndpoint("year"));
      setRooms(await fetchDataFromEndpoint("room"));
      setTimeslots(await fetchDataFromEndpoint("timeslot"));
      setStudents(await fetchDataFromEndpoint("student"));
    };
    fetchAllDependencies();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = models.find((m) => m.name === activeModel).endpoint;
      const result = await fetchDataFromEndpoint(endpoint);
      const filteredData = result.filter(
        (item) =>
          item.season_id === generatedData.seasonId &&
          item.year === generatedData.year
      );
      setData(filteredData);
    } catch (err) {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (generatedData.seasonId && generatedData.year) {
      fetchData();
    }
  }, [activeModel, generatedData]);

  const handleCreate = () => {
    setCurrentEditItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setCurrentEditItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsConfirmModal(true);
  };

  const getPKPath = (item, model) => {
    return model.pk_fields
      .map((key) => encodeURIComponent(item[key]))
      .join(",");
  };

  const handleDeleteConfirm = async () => {
    setIsConfirmModal(false);
    setLoading(true);
    try {
      const selectedModel = models.find((m) => m.name === activeModel);
      const pkPath = getPKPath(itemToDelete, selectedModel);
      const response = await fetch(
        `${API_URL}/${selectedModel.endpoint}/${pkPath}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to delete item");
      toast.success(`${activeModel} deleted successfully!`);
      fetchData();
    } catch (err) {
      toast.error("Failed to delete item.");
    } finally {
      setLoading(false);
    }
  };

  const selectedModel = models.find((m) => m.name === activeModel);
  const dataKeys = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="management-dashboard">
      <header className="dashboard-header">
        <h2 className="dashboard-title">Manage Generated Data</h2>
        <div className="button-group">
          {models.map((model) => (
            <button
              key={model.name}
              onClick={() => setActiveModel(model.name)}
              className={`refresh-button ${
                activeModel === model.name ? "active-model" : ""
              }`}
            >
              <model.icon size={18} className="button-icon" />
              {model.name}
            </button>
          ))}
          <button onClick={fetchData} className="refresh-button">
            <RefreshCcw size={18} className="button-icon" /> Refresh
          </button>
          <button onClick={handleCreate} className="add-button">
            <PlusCircle size={18} className="button-icon" /> Add New{" "}
            {activeModel}
          </button>
        </div>
      </header>

      {loading ? (
        <LoadingSpinner text={`Loading ${activeModel} data...`} />
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {dataKeys.map((key) => (
                    <th key={key}>{key.split("_").join(" ")}</th>
                  ))}
                  <th className="action-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item, index) => (
                    <tr key={index}>
                      {dataKeys.map((key) => (
                        <td key={key}>{String(item[key])}</td>
                      ))}
                      <td className="action-cell">
                        <button
                          onClick={() => handleEdit(item)}
                          className="action-button edit-button"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="action-button delete-button"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={dataKeys.length + 1}>
                      <div className="no-data-message">
                        No {activeModel} data found for this schedule.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {isModalOpen &&
        createPortal(
          <ManagementModal
            activeModel={activeModel}
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchData}
            currentEditItem={currentEditItem}
            models={models}
            API_URL={API_URL}
            getPKPath={getPKPath}
            courses={courses}
            seasons={seasons}
            years={years}
            rooms={rooms}
            timeslots={timeslots}
            students={students}
            generatedData={generatedData}
          />,
          document.body
        )}
      {isConfirmModalOpen &&
        createPortal(
          <ConfirmModal
            message={`Are you sure you want to delete this ${activeModel}?`}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setIsConfirmModal(false)}
          />,
          document.body
        )}
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [seasonId, setSeasonId] = useState("");
  const [year, setYear] = useState("");
  const [schedule, setSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateSchedule = async (e) => {
    e.preventDefault();
    if (!seasonId || !year) {
      setError("Please enter both Season ID and Year.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSchedule(null);
    try {
      const [choicesResponse, slotsResponse] = await Promise.all([
        fetch(`/api/student-choises?season_id=${seasonId}&year=${year}`, {
          credentials: "include",
        }),
        fetch(`/api/time-slot`, { credentials: "include" }),
      ]);

      const processResponse = async (res, name) => {
        if (!res.ok)
          throw new Error(`Fetch ${name} failed: Status ${res.status}`);
        if (!res.headers.get("content-type")?.includes("application/json"))
          throw new Error(`Expected JSON from ${name}`);
        return res.json();
      };

      const { choices } = await processResponse(
        choicesResponse,
        "student choices"
      );
      const { time_slots } = await processResponse(slotsResponse, "time slots");

      if (Object.keys(choices).length === 0)
        throw new Error(
          "No student choices found for the given Season and Year."
        );
      if (!time_slots || time_slots.length === 0)
        throw new Error("No time slots available.");

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
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="app-container">
        <Toaster position="top-right" />
        <div className="main-card">
          <header>
            <h1 className="header-title">Course Schedule Generator</h1>
            <p className="header-subtitle">
              Generate a conflict-free schedule and manage the resulting
              sections and enrollments.
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
                    type="number"
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
                    type="number"
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="submit-button"
                    style={{ marginTop: "auto" }}
                  >
                    {isLoading ? "Generating..." : "Generate Schedule"}
                  </button>
                </div>
              </div>
            </form>
            <div className="mt-8">
              {isLoading && <LoadingSpinner text="Generating schedule..." />}
              {error && <ErrorDisplay message={error} />}
              <ScheduleTable scheduleData={schedule} />
              {schedule && (
                <ManagementDashboard
                  generatedData={{
                    seasonId: parseInt(seasonId),
                    year: parseInt(year),
                  }}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// --- MODALS ---
function ManagementModal({
  activeModel,
  onClose,
  onSuccess,
  currentEditItem,
  models,
  API_URL,
  getPKPath,
  courses,
  seasons,
  years,
  rooms,
  timeslots,
  students,
  generatedData,
}) {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const selectedModel = models.find((m) => m.name === activeModel);

  const fieldsConfig = {
    Section: [
      {
        name: "season_id",
        type: "select",
        options: seasons,
        labelKey: "season_name",
        valueKey: "season_id",
      },
      {
        name: "year",
        type: "select",
        options: years,
        labelKey: "year",
        valueKey: "year",
      },
      { name: "section_no", type: "number" },
      {
        name: "course_id",
        type: "select",
        options: courses,
        labelKey: "title",
        valueKey: "course_id",
      },
      { name: "capacity", type: "number" },
      {
        name: "room_no",
        type: "select",
        options: rooms,
        labelKey: "room_no",
        valueKey: "room_no",
      },
      {
        name: "day",
        type: "select",
        options: [...new Set(timeslots.map((ts) => ts.day))].map((d) => ({
          day: d,
        })),
        labelKey: "day",
        valueKey: "day",
      },
      { name: "start_time", type: "text" },
      { name: "end_time", type: "text" },
    ],
    "Student Takes": [
      {
        name: "season_id",
        type: "select",
        options: seasons,
        labelKey: "season_name",
        valueKey: "season_id",
      },
      {
        name: "year",
        type: "select",
        options: years,
        labelKey: "year",
        valueKey: "year",
      },
      { name: "section_no", type: "number" },
      {
        name: "course_id",
        type: "select",
        options: courses,
        labelKey: "title",
        valueKey: "course_id",
      },
      {
        name: "student_id",
        type: "select",
        options: students,
        labelKey: "student_id",
        valueKey: "student_id",
      },
      { name: "grade", type: "number" },
      { name: "is_dropped", type: "boolean" },
    ],
  };
  const fields = fieldsConfig[activeModel] || [];

  useEffect(() => {
    if (currentEditItem) {
      // For Section, we need to map the time slot object to individual fields
      if (activeModel === "Section") {
        setFormData({
          ...currentEditItem,
          ...currentEditItem.schedule,
        });
      } else {
        setFormData(currentEditItem);
      }
    } else {
      const initialData = {};
      fields.forEach((field) => {
        if (field.name === "season_id")
          initialData[field.name] = generatedData.seasonId;
        else if (field.name === "year")
          initialData[field.name] = generatedData.year;
        else initialData[field.name] = field.type === "boolean" ? false : "";
      });
      setFormData(initialData);
    }
  }, [currentEditItem, activeModel, generatedData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const method = currentEditItem ? "PUT" : "POST";
    const pkPath = currentEditItem
      ? getPKPath(currentEditItem, selectedModel)
      : "";
    const url = `${API_URL}/${selectedModel.endpoint}/${pkPath}`;

    // Reconstruct the data to send for 'Section'
    const payload =
      activeModel === "Section"
        ? {
            season_id: formData.season_id,
            year: formData.year,
            section_no: formData.section_no,
            course_id: formData.course_id,
            capacity: formData.capacity,
            room_no: formData.room_no,
            day: formData.day,
            start_time: formData.start_time,
            end_time: formData.end_time,
          }
        : formData;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to save data");
      toast.success(`${activeModel} saved successfully!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to save data.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="modal-header">
          <h3>
            {currentEditItem ? "Edit" : "Create"} {activeModel}
          </h3>
          <button onClick={onClose} className="modal-close-button">
            <X size={24} />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="modal-form">
          {fields.map((field) => {
            const isPk = selectedModel.pk_fields.includes(field.name);
            const isDisabled = isPk && currentEditItem;
            return (
              <div key={field.name} className="form-group">
                <label className="input-label">
                  {field.name.split("_").join(" ")}
                </label>
                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    disabled={isDisabled}
                    className="form-input"
                  >
                    <option value="">Select...</option>
                    {field.options.map((opt, i) => (
                      <option key={i} value={opt[field.valueKey]}>
                        {opt[field.labelKey] || opt[field.valueKey]}
                      </option>
                    ))}
                  </select>
                ) : field.type === "boolean" ? (
                  <div className="checkbox-container">
                    <input
                      type="checkbox"
                      name={field.name}
                      checked={!!formData[field.name]}
                      onChange={handleChange}
                      disabled={isDisabled}
                      className="checkbox-field"
                    />
                  </div>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    disabled={isDisabled}
                    className="form-input"
                  />
                )}
              </div>
            );
          })}
          <div className="modal-actions">
            <button type="submit" className="submit-button" disabled={isSaving}>
              {isSaving ? "Saving..." : currentEditItem ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="confirm-modal-content">
        <p>{message}</p>
        <div className="confirm-button-group">
          <button onClick={onCancel} className="cancel-button">
            Cancel
          </button>
          <button onClick={onConfirm} className="confirm-button">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
