const allowed = ["name", "email", "username"];
const pickSelfProfileFields = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Profile details are required" };
  }
  const forbidden = Object.keys(body).filter((key) => !allowed.includes(key));
  if (forbidden.length) return { error: "Only name, email, and username can be updated" };
  const fields = {};
  for (const key of allowed) {
    if (Object.hasOwn(body, key)) fields[key] = body[key];
  }
  if (!Object.keys(fields).length) return { error: "No profile fields to update" };
  if (fields.name !== undefined && (typeof fields.name !== "string" || !/^[A-Za-z\s]+$/.test(fields.name.trim()) || fields.name.trim().length > 50)) {
    return { error: "Name must contain letters and spaces and be up to 50 characters" };
  }
  if (fields.username !== undefined && (typeof fields.username !== "string" || !/^[A-Za-z0-9_]{8,}$/.test(fields.username.trim()))) {
    return { error: "Username must be at least 8 characters and contain only letters, numbers, or underscores" };
  }
  if (fields.email !== undefined && (typeof fields.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()))) {
    return { error: "Invalid email format" };
  }
  if (fields.name !== undefined) fields.name = fields.name.trim();
  if (fields.username !== undefined) fields.username = fields.username.trim();
  if (fields.email !== undefined) fields.email = fields.email.trim().toLowerCase();
  return { fields };
};
module.exports = { pickSelfProfileFields };
