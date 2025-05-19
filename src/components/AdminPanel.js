import React, { useState } from "react";
import axios from "axios";

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Recursive function to update nested fields
const updateNestedField = (obj, keys, value) => {
  if (keys.length === 1) {
    obj[keys[0]] = value;
    return;
  }
  const [first, ...rest] = keys;
  if (!obj[first]) {
    obj[first] = isNaN(rest[0]) ? {} : [];
  }
  updateNestedField(obj[first], rest, value);
};

const AdminPanel = () => {
  const [formData, setFormData] = useState({
    slug: "",
    title: { en: "", hi: "" },
    subtitle: { en: "", hi: "" },
    image: "",
    units: [],
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nameParts = name.split(".");
    let updatedFormData = deepClone(formData);
    const finalValue = type === "checkbox" ? checked : value;
    updateNestedField(updatedFormData, nameParts, finalValue);
    setFormData(updatedFormData);
  };

  // Add a new unit
  const handleAddUnit = () => {
    setFormData((prev) => ({
      ...prev,
      units: [
        ...prev.units,
        {
          title: { en: "", hi: "" },
          subtitle: { en: "", hi: "" },
          image: "",
          steps: 0,
          lessons: [],
        },
      ],
    }));
  };

  // Add a new lesson to a unit
  const handleAddLesson = (unitIndex) => {
    setFormData((prev) => {
      const updatedUnits = deepClone(prev.units);
      updatedUnits[unitIndex].lessons.push({
        lessonId: `lesson-${updatedUnits[unitIndex].lessons.length + 1}`,
        questions: [],
      });
      return { ...prev, units: updatedUnits };
    });
  };

  // Add a new question to a lesson
  const handleAddQuestion = (unitIndex, lessonIndex) => {
    setFormData((prev) => {
      const updatedUnits = deepClone(prev.units);
      updatedUnits[unitIndex].lessons[lessonIndex].questions.push({
        type: "mcq",
        allowCustomAnswer: false,
        question: { en: "", hi: "" },
        options: {
          en: [{ text: "", image: "", audio: "" }],
          hi: [{ text: "", image: "", audio: "" }],
        },
        correct: { en: "", hi: "" },
        pages: { en: [], hi: [] },
      });
      return { ...prev, units: updatedUnits };
    });
  };

  // Add an option to a question
  const handleAddOption = (unitIndex, lessonIndex, questionIndex, lang) => {
    setFormData((prev) => {
      const updatedUnits = deepClone(prev.units);
      updatedUnits[unitIndex].lessons[lessonIndex].questions[questionIndex].options[lang].push({
        text: "",
        image: "",
        audio: "",
      });
      return { ...prev, units: updatedUnits };
    });
  };

  // Add a page to a book lesson
  const handleAddPage = (unitIndex, lessonIndex, lang) => {
    setFormData((prev) => {
      const updatedUnits = deepClone(prev.units);
      updatedUnits[unitIndex].lessons[lessonIndex].questions[0].pages[lang].push("");
      return { ...prev, units: updatedUnits };
    });
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/api/series", formData);
      alert("Series added successfully!");
    } catch (error) {
      alert("Error adding series");
      console.error(error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Admin Panel</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Slug:</label>
            <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="block p-2 border" />
          </div>

          <div>
            <label>Title (EN):</label>
            <input type="text" name="title.en" value={formData.title.en} onChange={handleChange} className="block p-2 border" />
            <label>Title (HI):</label>
            <input type="text" name="title.hi" value={formData.title.hi} onChange={handleChange} className="block p-2 border" />
          </div>

          <button type="button" onClick={handleAddUnit} className="my-4 px-4 py-2 bg-blue-600 text-white rounded">Add Unit</button>

          {formData.units.map((unit, unitIndex) => (
            <div key={unitIndex} className="border p-2 my-2">
              <h3>Unit {unitIndex + 1}</h3>
              <button onClick={() => handleAddLesson(unitIndex)} className="bg-green-500 text-white p-1">Add Lesson</button>
              
              {unit.lessons.map((lesson, lessonIndex) => (
                <div key={lessonIndex} className="border p-2 my-2">
                  <h4>Lesson {lessonIndex + 1}</h4>
                  <button onClick={() => handleAddQuestion(unitIndex, lessonIndex)} className="bg-yellow-500 text-white p-1">Add Question</button>

                  {lesson.questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="p-2">
                      <label>Question (EN):</label>
                      <input type="text" name={`units.${unitIndex}.lessons.${lessonIndex}.questions.${questionIndex}.question.en`} value={question.question.en} onChange={handleChange} className="block p-2 border" />
                      <label>Question (HI):</label>
                      <input type="text" name={`units.${unitIndex}.lessons.${lessonIndex}.questions.${questionIndex}.question.hi`} value={question.question.hi} onChange={handleChange} className="block p-2 border" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}

          <button type="submit" className="my-4 px-4 py-2 bg-green-600 text-white rounded">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
