import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Toaster, toast } from "react-hot-toast";
import {
  Users,
  Building,
  GraduationCap,
  BookOpen,
  PlusCircle,
  Edit,
  Trash2,
  X,
  RefreshCcw,
  Wallet,
  House,
  Calendar,
  Clock,
  ListOrdered,
  List,
  Tag,
} from "lucide-react";
import "../../styles/dashboard.css";

// This is the main Dashboard component that manages the state and data flow
export default function Dashboard() {
  const [activeModel, setActiveModel] = useState("Student");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [creditParts, setCreditParts] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [years, setYears] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [timeslots, setTimeslots] = useState([]);
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const API_URL = "http://localhost:5000/crud";

  // Updated models array with Offers model
  const models = [
    {
      name: "Student",
      icon: GraduationCap,
      endpoint: "student",
      pk_fields: ["student_id"],
    },
    {
      name: "Department",
      icon: Building,
      endpoint: "department",
      pk_fields: ["dept_id"],
    },
    {
      name: "Course",
      icon: BookOpen,
      endpoint: "course",
      pk_fields: ["course_id"],
    },
    {
      name: "Faculty",
      icon: Users,
      endpoint: "faculty",
      pk_fields: ["faculty_short_id"],
    },
    {
      name: "Credit Partition",
      icon: Wallet,
      endpoint: "credit_part",
      pk_fields: ["credit_id"],
    },
    { name: "Room", icon: House, endpoint: "room", pk_fields: ["room_no"] },
    {
      name: "Season",
      icon: Calendar,
      endpoint: "season",
      pk_fields: ["season_id"],
    },
    { name: "Year", icon: Calendar, endpoint: "year", pk_fields: ["year"] },
    {
      name: "Timeslot",
      icon: Clock,
      endpoint: "timeslot",
      pk_fields: ["day", "start_time", "end_time"],
    },
    {
      name: "Section",
      icon: ListOrdered,
      endpoint: "section",
      pk_fields: ["season_id", "year", "section_no", "course_id"],
    },
    {
      name: "Offers",
      icon: Tag,
      endpoint: "offers",
      pk_fields: [
        "season_id",
        "year",
        "section_no",
        "course_id",
        "faculty_short_id",
      ],
    },
    {
      name: "University",
      icon: Building,
      endpoint: "university",
      pk_fields: ["option"],
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
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint} data`);
      }
      return await response.json();
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      toast.error(`Failed to load ${endpoint}.`);
      return [];
    }
  };

  // Fetch all necessary data for dropdowns and dependencies on initial load
  useEffect(() => {
    const fetchAllDependencies = async () => {
      setDepartments(await fetchDataFromEndpoint("department"));
      setCourses(await fetchDataFromEndpoint("course"));
      setCreditParts(await fetchDataFromEndpoint("credit_part"));
      setSeasons(await fetchDataFromEndpoint("season"));
      setYears(await fetchDataFromEndpoint("year"));
      setRooms(await fetchDataFromEndpoint("room"));
      setTimeslots(await fetchDataFromEndpoint("timeslot"));
      setStudents(await fetchDataFromEndpoint("student"));
      setSections(await fetchDataFromEndpoint("section"));
      setFaculty(await fetchDataFromEndpoint("faculty"));
    };
    fetchAllDependencies();
  }, []);

  // Fetch data for the active model whenever it changes
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = models.find((m) => m.name === activeModel).endpoint;
      const result = await fetchDataFromEndpoint(endpoint);
      setData(result);
    } catch (err) {
      setError("Failed to load data. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeModel]);

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

  // Helper function to build the delete URL for composite keys
  const getDeleteUrl = (item, model) => {
    const endpoint = model.endpoint;
    const pk_fields = model.pk_fields;
    const pkPath = pk_fields
      .map((key) => {
        // Convert numeric primary key parts to strings for the URL path
        if (
          (model.name === "Section" || model.name === "Offers") &&
          (key === "season_id" || key === "year" || key === "section_no")
        ) {
          return encodeURIComponent(String(item[key]));
        }
        return encodeURIComponent(item[key]);
      })
      .join("/");
    return `${API_URL}/${endpoint}/${pkPath}`;
  };

  const handleDeleteConfirm = async () => {
    setIsConfirmModal(false);
    try {
      setLoading(true);
      const selectedModel = models.find((m) => m.name === activeModel);
      const deleteUrl = getDeleteUrl(itemToDelete, selectedModel);

      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      toast.success(`${activeModel} deleted successfully!`);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete item.");
      setLoading(false);
    }
  };

  const selectedModel = models.find((m) => m.name === activeModel);
  const dataKeys = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <>
      <Toaster position="top-right" />
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h2 className="dashboard-title">{activeModel} Management</h2>
          <div className="button-group">
            {models.map((model) => (
              <button
                key={model.name}
                onClick={() => {
                  setActiveModel(model.name);
                  setData([]);
                }}
                className={`refresh-button ${
                  activeModel === model.name ? "active-model" : ""
                }`}
              >
                <model.icon size={18} className="button-icon" />
                {model.name}
              </button>
            ))}
            <button onClick={fetchData} className="refresh-button">
              <RefreshCcw size={18} className="button-icon" />
              Refresh
            </button>
            <button onClick={handleCreate} className="add-button">
              <PlusCircle size={18} className="button-icon" />
              Add New {activeModel}
            </button>
          </div>
        </header>
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">
              <div></div>
            </div>
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
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
                        {dataKeys.map((key) => {
                          let displayValue = String(item[key]);
                          if (key === "curr_season") {
                            const season = seasons.find(
                              (s) => s.season_id === item[key]
                            );
                            displayValue = season
                              ? season.season_name
                              : displayValue;
                          } else if (key === "curr_year") {
                            const year = years.find(
                              (y) => y.year === item[key]
                            );
                            displayValue = year ? year.year : displayValue;
                          } else if (key === "is_advising") {
                            displayValue = item[key] ? "Yes" : "No";
                          } else if (
                            key === "credit_id" &&
                            activeModel === "University"
                          ) {
                            const creditPart = creditParts.find(
                              (cp) => cp.credit_id === item[key]
                            );
                            displayValue = creditPart
                              ? `ID: ${creditPart.credit_id} (Credits: ${creditPart.min_cred}-${creditPart.max_cred})`
                              : displayValue;
                          }
                          return <td key={key}>{displayValue}</td>;
                        })}
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
                          No {activeModel} data available.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isModalOpen && (
          <Modal
            activeModel={activeModel}
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchData}
            currentEditItem={currentEditItem}
            models={models}
            departments={departments}
            courses={courses}
            creditParts={creditParts}
            seasons={seasons}
            years={years}
            rooms={rooms}
            timeslots={timeslots}
            students={students}
            sections={sections}
            faculty={faculty}
            API_URL={API_URL}
          />
        )}

        {isConfirmModalOpen && (
          <ConfirmModal
            message={`Are you sure you want to delete this ${activeModel}?`}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setIsConfirmModal(false)}
          />
        )}
      </div>
    </>
  );
}

// Reusable modal for CRUD operations
function Modal({
  activeModel,
  onClose,
  onSuccess,
  currentEditItem,
  models,
  departments,
  courses,
  creditParts,
  seasons,
  years,
  rooms,
  timeslots,
  students,
  sections,
  faculty,
  API_URL,
}) {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const selectedModel = models.find((m) => m.name === activeModel);
  let fields;
  switch (activeModel) {
    case "Student":
      fields = [
        { name: "student_id", type: "text" },
        { name: "first_name", type: "text" },
        { name: "last_name", type: "text" },
        { name: "mobile_no", type: "tel" },
        { name: "email", type: "email" },
        { name: "address", type: "text" },
        { name: "gardian_name", type: "text" },
        { name: "gardian_phone", type: "tel" },
        { name: "dept_id", type: "select" },
      ];
      break;
    case "Department":
      fields = [
        { name: "dept_id", type: "text" },
        { name: "dept_short_name", type: "text" },
        { name: "long_name", type: "text" },
      ];
      break;
    case "Course":
      fields = [
        { name: "course_id", type: "text" },
        { name: "title", type: "text" },
        { name: "credit", type: "number" },
        { name: "need_credit", type: "number" },
        { name: "amount", type: "number" },
        { name: "prerequisite_id", type: "select", options: courses },
        { name: "extra_course_id", type: "select", options: courses },
        { name: "dept_id", type: "select" },
      ];
      break;
    case "Faculty":
      fields = [
        { name: "faculty_short_id", type: "text" },
        { name: "first_name", type: "text" },
        { name: "last_name", type: "text" },
        { name: "fac_email", type: "email" },
        { name: "room_no", type: "text" },
        { name: "dept_id", type: "select" },
      ];
      break;
    case "Credit Partition":
      fields = [
        { name: "credit_id", type: "text" },
        { name: "min_cred", type: "number" },
        { name: "max_cred", type: "number" },
      ];
      break;
    case "Room":
      fields = [
        { name: "room_no", type: "text" },
        { name: "building", type: "text" },
      ];
      break;
    case "Season":
      fields = [
        { name: "season_id", type: "text" },
        { name: "season_name", type: "text" },
      ];
      break;
    case "Year":
      fields = [{ name: "year", type: "number" }];
      break;
    case "Timeslot":
      fields = [
        { name: "day", type: "text" },
        { name: "start_time", type: "text" },
        { name: "end_time", type: "text" },
      ];
      break;
    case "Section":
      fields = [
        { name: "season_id", type: "select" },
        { name: "year", type: "select" },
        { name: "section_no", type: "number" },
        { name: "course_id", type: "select" },
        { name: "capacity", type: "number" },
        { name: "room_no", type: "select" },
        { name: "day", type: "select" },
        { name: "start_time", type: "select" },
        { name: "end_time", type: "select" },
      ];
      break;
    case "Offers":
      fields = [
        { name: "season_id", type: "select" },
        { name: "year", type: "select" },
        { name: "section_no", type: "number" },
        { name: "course_id", type: "select" },
        { name: "faculty_short_id", type: "select" },
      ];
      break;
    case "University":
      fields = [
        { name: "option", type: "number" },
        { name: "is_advising", type: "boolean" },
        { name: "curr_season", type: "select" },
        { name: "curr_year", type: "select" },
        { name: "credit_id", type: "select" },
        { name: "min_cred_need", type: "number" },
        { name: "max_cred_need", type: "number" },
      ];
      break;
    case "Student Takes":
      fields = [
        { name: "season_id", type: "select" },
        { name: "year", type: "select" },
        { name: "section_no", type: "number" },
        { name: "course_id", type: "select" },
        { name: "student_id", type: "select" },
        { name: "grade", type: "number" },
        { name: "is_dropped", type: "boolean" },
      ];
      break;
    default:
      fields = [];
  }

  useEffect(() => {
    if (currentEditItem) {
      setFormData(currentEditItem);
    } else {
      const initialData = {};
      fields.forEach((field) => {
        if (field.type === "boolean") {
          initialData[field.name] = false;
        } else {
          initialData[field.name] = "";
        }
      });
      setFormData(initialData);
    }
  }, [currentEditItem, activeModel]);

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
    const endpoint = selectedModel.endpoint;
    const pk_fields = selectedModel.pk_fields;

    let url;
    let method;

    if (currentEditItem) {
      const pkPath = pk_fields
        .map((key) => encodeURIComponent(currentEditItem[key]))
        .join("/");
      url = `${API_URL}/${endpoint}/${pkPath}`;
      method = "PUT";
    } else {
      url = `${API_URL}/${endpoint}/`;
      method = "POST";
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      toast.success(`${activeModel} saved successfully!`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving data:", err);
      toast.error("Failed to save data.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (field) => {
    const value = formData[field.name] || "";
    const isPk = selectedModel.pk_fields.includes(field.name);
    const isDisabled = isPk && currentEditItem;

    if (field.type === "select") {
      let options = [];
      let labelKey;

      switch (field.name) {
        case "dept_id":
          options = departments;
          labelKey = "dept_short_name";
          break;
        case "course_id":
          options = courses;
          labelKey = "title";
          break;
        case "prerequisite_id":
          options = courses;
          labelKey = "title";
          break;
        case "extra_course_id":
          options = courses;
          labelKey = "title";
          break;
        case "credit_id":
          options = creditParts;
          // Special handling to display min/max credits in the option label
          return (
            <select
              key={field.name}
              name={field.name}
              value={value}
              onChange={handleChange}
              disabled={isDisabled}
              className="input-field"
            >
              <option value="">Select Credit Partition</option>
              {options.map((option, index) => (
                <option key={index} value={option.credit_id}>
                  ID: {option.credit_id} (Credits: {option.min_cred}-
                  {option.max_cred})
                </option>
              ))}
            </select>
          );
        case "season_id":
        case "curr_season":
          options = seasons;
          labelKey = "season_name";
          break;
        case "year":
        case "curr_year":
          options = years;
          labelKey = "year";
          break;
        case "room_no":
          options = rooms;
          labelKey = "room_no";
          break;
        case "day":
          options = timeslots.map((ts) => ts.day);
          options = [...new Set(options)];
          break;
        case "start_time":
        case "end_time":
          options = timeslots.map((ts) => ts[field.name]);
          options = [...new Set(options)];
          break;
        case "student_id":
          options = students;
          labelKey = "student_id";
          break;
        case "section_no":
          options = sections;
          labelKey = "section_no";
          break;
        case "faculty_short_id":
          options = faculty;
          labelKey = "faculty_short_id";
          break;
        default:
          break;
      }

      return (
        <select
          key={field.name}
          name={field.name}
          value={value}
          onChange={handleChange}
          disabled={isDisabled}
          className="input-field"
        >
          <option value="">
            {options.length > 0
              ? `Select ${field.name.split("_").join(" ")}`
              : "Loading..."}
          </option>
          {options.map((option, index) => (
            <option key={index} value={labelKey ? option["course_id"] : option}>
              {labelKey ? option[labelKey] : option}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "boolean") {
      return (
        <div key={field.name} className="checkbox-container">
          <label htmlFor={field.name}>{field.label || field.name}</label>
          <input
            type="checkbox"
            id={field.name}
            name={field.name}
            checked={!!formData[field.name]}
            onChange={handleChange}
            className="checkbox-field"
            disabled={isDisabled}
          />
        </div>
      );
    }

    return (
      <input
        key={field.name}
        type={field.type}
        name={field.name}
        placeholder={field.label || field.name}
        value={value}
        onChange={handleChange}
        disabled={isDisabled}
        className="input-field"
      />
    );
  };

  return createPortal(
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
          {fields.map(renderField)}
          <div className="modal-actions">
            <button type="submit" className="submit-button" disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="loading-spinner"></div>
                  Saving...
                </>
              ) : currentEditItem ? (
                "Update"
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// Reusable modal for confirmation dialogs
function ConfirmModal({ message, onConfirm, onCancel }) {
  return createPortal(
    <div className="modal-overlay">
      <div className="confirm-modal-content">
        <p>{message}</p>
        <div className="confirm-button-group">
          <button onClick={onConfirm} className="confirm-button">
            Confirm
          </button>
          <button onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
