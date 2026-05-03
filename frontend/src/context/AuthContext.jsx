const login = async (email, password) => {
  try {
    const res = await api.post("/api/auth/login", {
      email,
      password,
    });

    console.log("LOGIN RESPONSE:", res.data);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);

    return res.data.user;
  } catch (err) {
    console.log("LOGIN ERROR:", err.response?.data || err.message);
    throw err;
  }
};

const signup = async (name, email, password) => {
  try {
    const res = await api.post("/api/auth/register", {
      name,
      email,
      password,
    });

    console.log("SIGNUP RESPONSE:", res.data);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);

    return res.data.user;
  } catch (err) {
    console.log("SIGNUP ERROR:", err.response?.data || err.message);
    throw err;
  }
};