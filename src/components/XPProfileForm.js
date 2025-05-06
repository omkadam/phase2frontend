import React, { useState } from "react";

const XPProfileForm = ({ userId, onClose, setHasProfile   }) => {
  const [form, setForm] = useState({ name: "", username: "", dob: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await fetch(`http://localhost:3001/api/user-profile/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    alert("Profile saved!");
    setHasProfile(true);     // ✅ this line is key
    onClose();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">🎉 Congrats on 100 XP!</h2>
      <p className="text-sm text-gray-600">Complete your profile to continue:</p>
      <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full border rounded px-3 py-2" />
      <input name="username" placeholder="Username" onChange={handleChange} className="w-full border rounded px-3 py-2" />
      <input name="dob" type="date" onChange={handleChange} className="w-full border rounded px-3 py-2" />
      <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded w-full">
        Submit
      </button>
    </div>
  );
};

export default XPProfileForm;
